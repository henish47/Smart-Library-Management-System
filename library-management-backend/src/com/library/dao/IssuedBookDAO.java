package com.library.dao;

import com.library.exception.DatabaseException;
import com.library.exception.ResourceNotFoundException;
import com.library.exception.ValidationException;
import com.library.model.IssuedBook;
import com.library.util.DBConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Data Access Object for IssuedBook borrowing and returning operations.
 * Utilizes atomic JDBC Transactions (setAutoCommit(false), commit, rollback)
 * to maintain strict data consistency between books stock and issue logs.
 *
 * NOTE: As per project specifications, NO fine management is included.
 */
public class IssuedBookDAO {

    private static final Logger LOGGER = Logger.getLogger(IssuedBookDAO.class.getName());

    private static final String BASE_JOIN_QUERY =
            "SELECT i.id, i.student_id, s.name AS student_name, s.enrollment_no AS student_enrollment, " +
            "       i.book_id, b.title AS book_title, b.isbn AS book_isbn, " +
            "       i.issue_date, i.due_date, i.return_date, i.status " +
            "FROM issued_books i " +
            "JOIN students s ON i.student_id = s.id " +
            "JOIN books b ON i.book_id = b.id ";

    /**
     * Issues a book to a student using an atomic JDBC Transaction.
     * 1. Checks if student exists.
     * 2. Checks if book exists and has available quantity > 0.
     * 3. Inserts borrowing record into issued_books.
     * 4. Decrements book available_quantity by 1.
     * 5. Commits transaction or rolls back on any error.
     *
     * @param studentId ID of the borrowing student
     * @param bookId    ID of the book to borrow
     * @param issueDate Date the book is borrowed
     * @param dueDate   Date the book must be returned
     * @return Generated issue transaction ID
     */
    public int issueBook(int studentId, int bookId, Date issueDate, Date dueDate)
            throws ResourceNotFoundException, ValidationException, DatabaseException {

        Connection conn = null;
        try {
            conn = DBConnection.getConnection();
            conn.setAutoCommit(false); // Begin transaction

            // 1. Verify Student exists
            String checkStudentSql = "SELECT id, name FROM students WHERE id = ?";
            try (PreparedStatement psStudent = conn.prepareStatement(checkStudentSql)) {
                psStudent.setInt(1, studentId);
                try (ResultSet rsStudent = psStudent.executeQuery()) {
                    if (!rsStudent.next()) {
                        conn.rollback();
                        throw new ResourceNotFoundException("Student with ID " + studentId + " does not exist.");
                    }
                }
            }

            // 2. Verify Book exists and check available quantity with row locking (FOR UPDATE)
            String checkBookSql = "SELECT id, title, available_quantity FROM books WHERE id = ? FOR UPDATE";
            String bookTitle = "";
            int availableQuantity = 0;

            try (PreparedStatement psBook = conn.prepareStatement(checkBookSql)) {
                psBook.setInt(1, bookId);
                try (ResultSet rsBook = psBook.executeQuery()) {
                    if (!rsBook.next()) {
                        conn.rollback();
                        throw new ResourceNotFoundException("Book with ID " + bookId + " does not exist.");
                    }
                    bookTitle = rsBook.getString("title");
                    availableQuantity = rsBook.getInt("available_quantity");
                }
            }

            if (availableQuantity <= 0) {
                conn.rollback();
                throw new ValidationException("Book '" + bookTitle + "' is currently out of stock (available: 0).");
            }

            // 3. Insert Issue Record
            String insertSql = "INSERT INTO issued_books (student_id, book_id, issue_date, due_date, status) VALUES (?, ?, ?, ?, 'ISSUED')";
            int generatedIssueId = 0;

            try (PreparedStatement psInsert = conn.prepareStatement(insertSql, Statement.RETURN_GENERATED_KEYS)) {
                psInsert.setInt(1, studentId);
                psInsert.setInt(2, bookId);
                psInsert.setDate(3, issueDate);
                psInsert.setDate(4, dueDate);

                int affected = psInsert.executeUpdate();
                if (affected == 0) {
                    conn.rollback();
                    throw new DatabaseException("Failed to insert issue record, no rows affected.");
                }

                try (ResultSet rsKeys = psInsert.getGeneratedKeys()) {
                    if (rsKeys.next()) {
                        generatedIssueId = rsKeys.getInt(1);
                    } else {
                        conn.rollback();
                        throw new DatabaseException("Failed to obtain ID for issued record.");
                    }
                }
            }

            // 4. Decrease available_quantity by 1
            String updateStockSql = "UPDATE books SET available_quantity = available_quantity - 1 WHERE id = ? AND available_quantity > 0";
            try (PreparedStatement psUpdate = conn.prepareStatement(updateStockSql)) {
                psUpdate.setInt(1, bookId);
                int updatedRows = psUpdate.executeUpdate();
                if (updatedRows == 0) {
                    conn.rollback();
                    throw new DatabaseException("Failed to decrement book inventory. Book may have become unavailable.");
                }
            }

            // 5. Commit Transaction
            conn.commit();
            LOGGER.info("Book ID " + bookId + " successfully issued to Student ID " + studentId + " (Issue ID: " + generatedIssueId + ")");
            return generatedIssueId;

        } catch (SQLException e) {
            if (conn != null) {
                try {
                    conn.rollback();
                    LOGGER.log(Level.WARNING, "Transaction rolled back during issueBook", e);
                } catch (SQLException ex) {
                    LOGGER.log(Level.SEVERE, "Rollback failed during issueBook", ex);
                }
            }
            throw new DatabaseException("Database error during book issue transaction: " + e.getMessage(), e);
        } finally {
            if (conn != null) {
                try {
                    conn.setAutoCommit(true);
                    conn.close();
                } catch (SQLException e) {
                    LOGGER.log(Level.WARNING, "Error closing connection after issueBook", e);
                }
            }
        }
    }

    /**
     * Returns an issued book using an atomic JDBC Transaction.
     * 1. Finds issued record and verifies status is 'ISSUED'.
     * 2. Sets return_date and updates status to 'RETURNED'.
     * 3. Increments book available_quantity by 1 (up to total quantity).
     * 4. Commits transaction or rolls back on any error.
     *
     * @param issueId    ID of the issued_books record
     * @param returnDate Date the book was returned
     * @return true if successfully returned
     */
    public boolean returnBook(int issueId, Date returnDate)
            throws ResourceNotFoundException, ValidationException, DatabaseException {

        Connection conn = null;
        try {
            conn = DBConnection.getConnection();
            conn.setAutoCommit(false); // Begin transaction

            // 1. Find the issued transaction with row lock
            String findSql = "SELECT id, book_id, status FROM issued_books WHERE id = ? FOR UPDATE";
            int bookId = 0;
            String currentStatus = null;

            try (PreparedStatement psFind = conn.prepareStatement(findSql)) {
                psFind.setInt(1, issueId);
                try (ResultSet rs = psFind.executeQuery()) {
                    if (!rs.next()) {
                        conn.rollback();
                        throw new ResourceNotFoundException("Issued transaction record with ID " + issueId + " not found.");
                    }
                    bookId = rs.getInt("book_id");
                    currentStatus = rs.getString("status");
                }
            }

            if (!"ISSUED".equalsIgnoreCase(currentStatus)) {
                conn.rollback();
                throw new ValidationException("Book has already been returned or transaction is not in ISSUED status.");
            }

            // 2. Update the issued transaction record
            String updateIssueSql = "UPDATE issued_books SET return_date = ?, status = 'RETURNED' WHERE id = ? AND status = 'ISSUED'";
            try (PreparedStatement psUpdateIssue = conn.prepareStatement(updateIssueSql)) {
                psUpdateIssue.setDate(1, returnDate);
                psUpdateIssue.setInt(2, issueId);

                int affected = psUpdateIssue.executeUpdate();
                if (affected == 0) {
                    conn.rollback();
                    throw new DatabaseException("Failed to update issued record status to RETURNED.");
                }
            }

            // 3. Increase available_quantity by 1
            String updateBookSql = "UPDATE books SET available_quantity = available_quantity + 1 WHERE id = ? AND available_quantity < quantity";
            try (PreparedStatement psUpdateBook = conn.prepareStatement(updateBookSql)) {
                psUpdateBook.setInt(1, bookId);
                int updatedRows = psUpdateBook.executeUpdate();
                if (updatedRows == 0) {
                    conn.rollback();
                    throw new DatabaseException("Failed to increment book available quantity.");
                }
            }

            // 4. Commit Transaction
            conn.commit();
            LOGGER.info("Issued record ID " + issueId + " (Book ID: " + bookId + ") successfully marked as RETURNED");
            return true;

        } catch (SQLException e) {
            if (conn != null) {
                try {
                    conn.rollback();
                    LOGGER.log(Level.WARNING, "Transaction rolled back during returnBook", e);
                } catch (SQLException ex) {
                    LOGGER.log(Level.SEVERE, "Rollback failed during returnBook", ex);
                }
            }
            throw new DatabaseException("Database error during book return transaction: " + e.getMessage(), e);
        } finally {
            if (conn != null) {
                try {
                    conn.setAutoCommit(true);
                    conn.close();
                } catch (SQLException e) {
                    LOGGER.log(Level.WARNING, "Error closing connection after returnBook", e);
                }
            }
        }
    }

    /**
     * Retrieves all issued book transactions, optionally filtered by status ('ISSUED' / 'RETURNED').
     *
     * @param statusFilter Filter status or null for all records
     * @return List of IssuedBook objects with joined student and book details
     */
    public List<IssuedBook> getAllIssuedBooks(String statusFilter) throws DatabaseException {
        StringBuilder sql = new StringBuilder(BASE_JOIN_QUERY);
        boolean hasFilter = statusFilter != null && !statusFilter.trim().isEmpty();

        if (hasFilter) {
            sql.append("WHERE i.status = ? ");
        }
        sql.append("ORDER BY i.id DESC");

        List<IssuedBook> list = new ArrayList<>();

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql.toString())) {

            if (hasFilter) {
                ps.setString(1, statusFilter.trim().toUpperCase());
            }

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(extractIssuedBookFromResultSet(rs));
                }
            }
            return list;
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error retrieving issued books", e);
            throw new DatabaseException("Failed to retrieve issued books: " + e.getMessage(), e);
        }
    }

    /**
     * Finds a single issued transaction by ID.
     *
     * @param id Issued Transaction ID
     * @return IssuedBook or null
     */
    public IssuedBook getIssuedBookById(int id) throws DatabaseException {
        String sql = BASE_JOIN_QUERY + "WHERE i.id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return extractIssuedBookFromResultSet(rs);
                }
            }
            return null;
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error fetching issued book by ID: " + id, e);
            throw new DatabaseException("Failed to retrieve issued book record: " + e.getMessage(), e);
        }
    }

    /**
     * Retrieves the entire issue/borrowing history for a specific student.
     *
     * @param studentId Student ID
     * @return List of IssuedBook records for this student
     */
    public List<IssuedBook> getStudentIssueHistory(int studentId) throws DatabaseException {
        String sql = BASE_JOIN_QUERY + "WHERE i.student_id = ? ORDER BY i.id DESC";
        List<IssuedBook> list = new ArrayList<>();

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, studentId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(extractIssuedBookFromResultSet(rs));
                }
            }
            return list;
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error fetching issue history for student ID: " + studentId, e);
            throw new DatabaseException("Failed to retrieve student issue history: " + e.getMessage(), e);
        }
    }

    private IssuedBook extractIssuedBookFromResultSet(ResultSet rs) throws SQLException {
        return new IssuedBook(
                rs.getInt("id"),
                rs.getInt("student_id"),
                rs.getString("student_name"),
                rs.getString("student_enrollment"),
                rs.getInt("book_id"),
                rs.getString("book_title"),
                rs.getString("book_isbn"),
                rs.getDate("issue_date"),
                rs.getDate("due_date"),
                rs.getDate("return_date"),
                rs.getString("status")
        );
    }
}
