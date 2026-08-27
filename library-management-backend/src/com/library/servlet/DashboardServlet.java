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
 * Servlet providing real aggregated statistics and recent transactions
 * for the Dashboard page.
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
                                 "       COALESCE(SUM(available_quantity), 0) AS avail_qty, " +
                                 "       COUNT(id) AS total_titles FROM books";
                try (PreparedStatement ps = conn.prepareStatement(bookSql);
                     ResultSet rs = ps.executeQuery()) {
                    if (rs.next()) {
                        stats.put("totalBooks", rs.getInt("total_qty"));
                        stats.put("availableBooks", rs.getInt("avail_qty"));
                        stats.put("totalTitles", rs.getInt("total_titles"));
                    }
                }

                // 2. Total Issued Books & Returned Books
                String issuedSql = "SELECT " +
                                   "  SUM(CASE WHEN status = 'ISSUED' THEN 1 ELSE 0 END) AS issued_count, " +
                                   "  SUM(CASE WHEN status = 'RETURNED' THEN 1 ELSE 0 END) AS returned_count, " +
                                   "  COUNT(id) AS total_transactions " +
                                   "FROM issued_books";
                try (PreparedStatement ps = conn.prepareStatement(issuedSql);
                     ResultSet rs = ps.executeQuery()) {
                    if (rs.next()) {
                        stats.put("issuedBooks", rs.getInt("issued_count"));
                        stats.put("returnedBooks", rs.getInt("returned_count"));
                        stats.put("totalTransactions", rs.getInt("total_transactions"));
                    }
                }

                // 3. Total Students
                String studentSql = "SELECT COUNT(id) FROM students";
                try (PreparedStatement ps = conn.prepareStatement(studentSql);
                     ResultSet rs = ps.executeQuery()) {
                    if (rs.next()) {
                        stats.put("totalStudents", rs.getInt(1));
                    }
                }

                // 4. Total Categories
                String categorySql = "SELECT COUNT(id) FROM categories";
                try (PreparedStatement ps = conn.prepareStatement(categorySql);
                     ResultSet rs = ps.executeQuery()) {
                    if (rs.next()) {
                        stats.put("totalCategories", rs.getInt(1));
                    }
                }

                // 5. Category Distribution (Category Name & Book Copies Count)
                String distSql = "SELECT c.name, COALESCE(SUM(b.quantity), 0) AS book_count, COUNT(b.id) AS title_count " +
                                 "FROM categories c " +
                                 "LEFT JOIN books b ON c.id = b.category_id " +
                                 "GROUP BY c.id, c.name " +
                                 "ORDER BY book_count DESC";
                List<Map<String, Object>> categoryStats = new ArrayList<>();
                try (PreparedStatement ps = conn.prepareStatement(distSql);
                     ResultSet rs = ps.executeQuery()) {
                    while (rs.next()) {
                        Map<String, Object> catMap = new HashMap<>();
                        catMap.put("name", rs.getString("name"));
                        catMap.put("bookCount", rs.getInt("book_count"));
                        catMap.put("titleCount", rs.getInt("title_count"));
                        categoryStats.add(catMap);
                    }
                }
                stats.put("categoryDistribution", categoryStats);

            } catch (SQLException e) {
                LOGGER.log(Level.SEVERE, "Error calculating dashboard statistics", e);
                throw new DatabaseException("Failed to load dashboard metrics: " + e.getMessage(), e);
            }

            // 6. Recent 5 Transactions
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
