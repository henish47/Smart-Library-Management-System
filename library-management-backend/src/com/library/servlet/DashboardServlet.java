package com.library.servlet;

import com.library.dao.IssuedBookDAO;
import com.library.exception.DatabaseException;
import com.library.model.IssuedBook;
import com.library.util.DBConnection;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Simple Dashboard Servlet for College AJT Mini Project.
 * Returns only 4 key statistics + recent transactions.
 * GET /api/dashboard
 */
@WebServlet(name = "DashboardServlet", urlPatterns = {"/api/dashboard", "/api/dashboard/*"})
public class DashboardServlet extends BaseServlet {

    private static final Logger LOGGER = Logger.getLogger(DashboardServlet.class.getName());
    private final IssuedBookDAO issuedBookDAO = new IssuedBookDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        try {
            Map<String, Object> stats = new HashMap<>();

            try (Connection conn = DBConnection.getConnection()) {
                // 1. Total Books & Available Books
                String bookSql = "SELECT COALESCE(SUM(quantity), 0) AS total_qty, " +
                                 "       COALESCE(SUM(available_quantity), 0) AS avail_qty " +
                                 "FROM books";
                try (PreparedStatement ps = conn.prepareStatement(bookSql);
                     ResultSet rs = ps.executeQuery()) {
                    if (rs.next()) {
                        stats.put("totalBooks", rs.getInt("total_qty"));
                        stats.put("availableBooks", rs.getInt("avail_qty"));
                    }
                }

                // 2. Total Students
                String studentSql = "SELECT COUNT(id) FROM students";
                try (PreparedStatement ps = conn.prepareStatement(studentSql);
                     ResultSet rs = ps.executeQuery()) {
                    if (rs.next()) {
                        stats.put("totalStudents", rs.getInt(1));
                    }
                }

                // 3. Issued Books Count
                String issuedSql = "SELECT COUNT(id) FROM issued_books WHERE status = 'ISSUED'";
                try (PreparedStatement ps = conn.prepareStatement(issuedSql);
                     ResultSet rs = ps.executeQuery()) {
                    if (rs.next()) {
                        stats.put("issuedBooks", rs.getInt(1));
                    }
                }

            } catch (SQLException e) {
                LOGGER.log(Level.SEVERE, "Error fetching simple dashboard statistics", e);
                throw new DatabaseException("Failed to load dashboard metrics: " + e.getMessage(), e);
            }

            // 4. Recent Transactions (latest 5)
            List<IssuedBook> allIssued = issuedBookDAO.getAllIssuedBooks(null);
            List<IssuedBook> recent = new ArrayList<>();
            for (int i = 0; i < Math.min(5, allIssued.size()); i++) {
                recent.add(allIssued.get(i));
            }
            stats.put("recentTransactions", recent);

            sendSuccess(resp, HttpServletResponse.SC_OK, "Dashboard statistics retrieved successfully", stats);

        } catch (Exception e) {
            handleException(resp, e);
        }
    }
}
