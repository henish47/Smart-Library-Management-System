package com.library.servlet;

import com.google.gson.JsonObject;
import com.library.dao.IssuedBookDAO;
import com.library.exception.ResourceNotFoundException;
import com.library.exception.ValidationException;
import com.library.model.IssuedBook;
import com.library.util.JsonUtil;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.Date;
import java.time.LocalDate;
import java.util.List;

/**
 * Servlet handling Book Borrowing & Return Endpoints:
 * GET  /api/issued-books (supports ?id=1, ?studentId=1, ?status=ISSUED)
 * POST /api/issued-books/issue
 * POST /api/issued-books/return
 *
 * NOTE: As per project requirements, NO fine calculation is implemented.
 */
@WebServlet(name = "IssuedBookServlet", urlPatterns = {"/api/issued-books", "/api/issued-books/*"})
public class IssuedBookServlet extends BaseServlet {

    private final IssuedBookDAO issuedBookDAO = new IssuedBookDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        try {
            Integer id = parseIntegerParam(req, "id");
            Integer studentId = parseIntegerParam(req, "studentId");
            String status = req.getParameter("status");

            if (id != null) {
                // Get single transaction by ID
                IssuedBook record = issuedBookDAO.getIssuedBookById(id);
                if (record == null) {
                    throw new ResourceNotFoundException("Issued transaction record with ID " + id + " not found.");
                }
                sendSuccess(resp, HttpServletResponse.SC_OK, "Issued book record retrieved successfully", record);
            } else if (studentId != null) {
                // Get student issue history
                List<IssuedBook> history = issuedBookDAO.getStudentIssueHistory(studentId);
                sendSuccess(resp, HttpServletResponse.SC_OK, "Student issue history retrieved (" + history.size() + " records)", history);
            } else {
                // Get all issued transactions (optionally filtered by status)
                List<IssuedBook> list = issuedBookDAO.getAllIssuedBooks(status);
                sendSuccess(resp, HttpServletResponse.SC_OK, "Issued book records retrieved successfully", list);
            }
        } catch (Exception e) {
            handleException(resp, e);
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        try {
            String pathInfo = req.getPathInfo(); // e.g. "/issue" or "/return"
            String actionParam = req.getParameter("action"); // or query ?action=issue

            if ((pathInfo != null && pathInfo.endsWith("/return")) || "return".equalsIgnoreCase(actionParam)) {
                handleReturnBook(req, resp);
            } else if ((pathInfo != null && pathInfo.endsWith("/issue")) || "issue".equalsIgnoreCase(actionParam) || pathInfo == null || pathInfo.equals("/")) {
                handleIssueBook(req, resp);
            } else {
                throw new ValidationException("Unknown action endpoint. Use /api/issued-books/issue or /api/issued-books/return");
            }
        } catch (Exception e) {
            handleException(resp, e);
        }
    }

    /**
     * Handles POST /api/issued-books/issue
     */
    private void handleIssueBook(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String body = readRequestBody(req);
        if (body == null || body.trim().isEmpty()) {
            throw new ValidationException("Request body with issue parameters is required.");
        }

        JsonObject json = JsonUtil.fromJson(body, JsonObject.class);
        if (json == null) {
            throw new ValidationException("Invalid JSON request body.");
        }

        if (!json.has("studentId") || json.get("studentId").isJsonNull()) {
            throw new ValidationException("Parameter 'studentId' is required.");
        }
        if (!json.has("bookId") || json.get("bookId").isJsonNull()) {
            throw new ValidationException("Parameter 'bookId' is required.");
        }

        int studentId = json.get("studentId").getAsInt();
        int bookId = json.get("bookId").getAsInt();

        if (studentId <= 0) throw new ValidationException("A valid positive studentId is required.");
        if (bookId <= 0) throw new ValidationException("A valid positive bookId is required.");

        Date issueDate;
        if (json.has("issueDate") && !json.get("issueDate").isJsonNull() && !json.get("issueDate").getAsString().trim().isEmpty()) {
            try {
                issueDate = Date.valueOf(json.get("issueDate").getAsString().trim());
            } catch (IllegalArgumentException e) {
                throw new ValidationException("Invalid issueDate format. Expected 'YYYY-MM-DD'.");
            }
        } else {
            issueDate = Date.valueOf(LocalDate.now());
        }

        Date dueDate;
        if (json.has("dueDate") && !json.get("dueDate").isJsonNull() && !json.get("dueDate").getAsString().trim().isEmpty()) {
            try {
                dueDate = Date.valueOf(json.get("dueDate").getAsString().trim());
            } catch (IllegalArgumentException e) {
                throw new ValidationException("Invalid dueDate format. Expected 'YYYY-MM-DD'.");
            }
        } else {
            // Default loan duration: 14 days
            dueDate = Date.valueOf(issueDate.toLocalDate().plusDays(14));
        }

        if (dueDate.before(issueDate)) {
            throw new ValidationException("Due date (" + dueDate + ") cannot be before issue date (" + issueDate + ").");
        }

        int generatedId = issuedBookDAO.issueBook(studentId, bookId, issueDate, dueDate);
        IssuedBook createdRecord = issuedBookDAO.getIssuedBookById(generatedId);

        sendSuccess(resp, HttpServletResponse.SC_CREATED, "Book issued successfully", createdRecord);
    }

    /**
     * Handles POST /api/issued-books/return
     */
    private void handleReturnBook(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String body = readRequestBody(req);
        if (body == null || body.trim().isEmpty()) {
            throw new ValidationException("Request body with return parameters is required.");
        }

        JsonObject json = JsonUtil.fromJson(body, JsonObject.class);
        if (json == null) {
            throw new ValidationException("Invalid JSON request body.");
        }

        // Support either 'issueId' or 'id'
        int issueId = 0;
        if (json.has("issueId") && !json.get("issueId").isJsonNull()) {
            issueId = json.get("issueId").getAsInt();
        } else if (json.has("id") && !json.get("id").isJsonNull()) {
            issueId = json.get("id").getAsInt();
        } else {
            throw new ValidationException("Parameter 'issueId' (or 'id') is required.");
        }

        if (issueId <= 0) {
            throw new ValidationException("A valid positive issueId is required.");
        }

        Date returnDate;
        if (json.has("returnDate") && !json.get("returnDate").isJsonNull() && !json.get("returnDate").getAsString().trim().isEmpty()) {
            try {
                returnDate = Date.valueOf(json.get("returnDate").getAsString().trim());
            } catch (IllegalArgumentException e) {
                throw new ValidationException("Invalid returnDate format. Expected 'YYYY-MM-DD'.");
            }
        } else {
            returnDate = Date.valueOf(LocalDate.now());
        }

        boolean success = issuedBookDAO.returnBook(issueId, returnDate);
        if (success) {
            IssuedBook updatedRecord = issuedBookDAO.getIssuedBookById(issueId);
            sendSuccess(resp, HttpServletResponse.SC_OK, "Book returned successfully", updatedRecord);
        } else {
            throw new ResourceNotFoundException("Issued transaction with ID " + issueId + " could not be updated.");
        }
    }
}
