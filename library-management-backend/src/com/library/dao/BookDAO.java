package com.library.dao;

import com.library.exception.DatabaseException;
import com.library.model.Book;
import com.library.util.DBConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Data Access Object for Book entity.
 * Implements full CRUD, multi-criteria search, ISBN uniqueness check, and quantity updates.
 */
public class BookDAO {

    private static final Logger LOGGER = Logger.getLogger(BookDAO.class.getName());

    private static final String BASE_SELECT =
            "SELECT b.id, b.title, b.author, b.isbn, b.category_id, c.name AS category_name, " +
            "b.publisher, b.edition, b.quantity, b.available_quantity, b.shelf_no, b.created_at " +
            "FROM books b " +
            "LEFT JOIN categories c ON b.category_id = c.id ";

    /**
     * Adds a new book to the database.
     *
     * @param book Book model
     * @return Generated Book ID
     * @throws DatabaseException if insert fails
     */
    public int addBook(Book book) throws DatabaseException {
        String sql = "INSERT INTO books (title, author, isbn, category_id, publisher, edition, quantity, available_quantity, shelf_no) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            ps.setString(1, book.getTitle());
            ps.setString(2, book.getAuthor());
            ps.setString(3, book.getIsbn());
            ps.setInt(4, book.getCategoryId());
            ps.setString(5, book.getPublisher());
            ps.setString(6, book.getEdition());
            ps.setInt(7, book.getQuantity());
            ps.setInt(8, book.getAvailableQuantity());
            ps.setString(9, book.getShelfNo());

            int affectedRows = ps.executeUpdate();
            if (affectedRows == 0) {
                throw new DatabaseException("Creating book failed, no rows affected.");
            }

            try (ResultSet rs = ps.getGeneratedKeys()) {
                if (rs.next()) {
                    int generatedId = rs.getInt(1);
                    book.setId(generatedId);
                    return generatedId;
                } else {
                    throw new DatabaseException("Creating book failed, no ID obtained.");
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error inserting book: " + book.getTitle(), e);
            throw new DatabaseException("Failed to add book: " + e.getMessage(), e);
        }
    }

    /**
     * Retrieves all books from the database ordered by creation date descending.
     *
     * @return List of Book models with category names joined
     * @throws DatabaseException if query fails
     */
    public List<Book> getAllBooks() throws DatabaseException {
        String sql = BASE_SELECT + "ORDER BY b.id DESC";
        List<Book> books = new ArrayList<>();

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                books.add(extractBookFromResultSet(rs));
            }
            return books;
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error fetching all books", e);
            throw new DatabaseException("Failed to retrieve books: " + e.getMessage(), e);
        }
    }

    /**
     * Retrieves a single book by its primary key ID.
     *
     * @param id Book ID
     * @return Book model or null if not found
     * @throws DatabaseException if query fails
     */
    public Book getBookById(int id) throws DatabaseException {
        String sql = BASE_SELECT + "WHERE b.id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return extractBookFromResultSet(rs);
                }
            }
            return null;
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error fetching book by ID: " + id, e);
            throw new DatabaseException("Failed to retrieve book: " + e.getMessage(), e);
        }
    }

    /**
     * Updates an existing book record.
     *
     * @param book Book model with updated data
     * @return true if updated, false if book not found
     * @throws DatabaseException if update fails
     */
    public boolean updateBook(Book book) throws DatabaseException {
        String sql = "UPDATE books SET title = ?, author = ?, isbn = ?, category_id = ?, " +
                     "publisher = ?, edition = ?, quantity = ?, available_quantity = ?, shelf_no = ? " +
                     "WHERE id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, book.getTitle());
            ps.setString(2, book.getAuthor());
            ps.setString(3, book.getIsbn());
            ps.setInt(4, book.getCategoryId());
            ps.setString(5, book.getPublisher());
            ps.setString(6, book.getEdition());
            ps.setInt(7, book.getQuantity());
            ps.setInt(8, book.getAvailableQuantity());
            ps.setString(9, book.getShelfNo());
            ps.setInt(10, book.getId());

            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error updating book ID: " + book.getId(), e);
            throw new DatabaseException("Failed to update book: " + e.getMessage(), e);
        }
    }

    /**
     * Deletes a book by ID.
     *
     * @param id Book ID
     * @return true if deleted, false if not found
     * @throws DatabaseException if delete fails
     */
    public boolean deleteBook(int id) throws DatabaseException {
        String sql = "DELETE FROM books WHERE id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, id);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error deleting book ID: " + id, e);
            if (e.getErrorCode() == 1451) {
                throw new DatabaseException("Cannot delete book because active or past issue records are linked to it.", e);
            }
            throw new DatabaseException("Failed to delete book: " + e.getMessage(), e);
        }
    }

    /**
     * Searches books matching a keyword across title, author, isbn, shelf number, or category name.
     *
     * @param query Search keyword
     * @return List of matching books
     * @throws DatabaseException if query fails
     */
    public List<Book> searchBooks(String query) throws DatabaseException {
        String sql = BASE_SELECT +
                     "WHERE LOWER(b.title) LIKE ? " +
                     "   OR LOWER(b.author) LIKE ? " +
                     "   OR LOWER(b.isbn) LIKE ? " +
                     "   OR LOWER(b.shelf_no) LIKE ? " +
                     "   OR LOWER(c.name) LIKE ? " +
                     "ORDER BY b.title ASC";

        List<Book> books = new ArrayList<>();
        String pattern = "%" + (query == null ? "" : query.trim().toLowerCase()) + "%";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            for (int i = 1; i <= 5; i++) {
                ps.setString(i, pattern);
            }

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    books.add(extractBookFromResultSet(rs));
                }
            }
            return books;
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error searching books with query: " + query, e);
            throw new DatabaseException("Failed to search books: " + e.getMessage(), e);
        }
    }

    /**
     * Checks if an ISBN already exists in the system (excluding a given book ID).
     *
     * @param isbn ISBN string
     * @param excludeId Book ID to exclude (0 for new books)
     * @return true if duplicate exists, false otherwise
     */
    public boolean isIsbnExists(String isbn, int excludeId) throws DatabaseException {
        String sql = "SELECT COUNT(*) FROM books WHERE LOWER(TRIM(isbn)) = LOWER(TRIM(?)) AND id != ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, isbn);
            ps.setInt(2, excludeId);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt(1) > 0;
                }
            }
            return false;
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error checking duplicate ISBN: " + isbn, e);
            throw new DatabaseException("Failed to verify ISBN uniqueness: " + e.getMessage(), e);
        }
    }

    /**
     * Checks if a book is currently borrowed (has active ISSUED status).
     *
     * @param bookId Book ID
     * @return true if currently issued copies exist
     */
    public boolean hasActiveBorrowers(int bookId) throws DatabaseException {
        String sql = "SELECT COUNT(*) FROM issued_books WHERE book_id = ? AND status = 'ISSUED'";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, bookId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt(1) > 0;
                }
            }
            return false;
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error checking active borrowers for book ID: " + bookId, e);
            throw new DatabaseException("Failed to check book borrow status: " + e.getMessage(), e);
        }
    }

    /**
     * Helper method to map ResultSet row to Book model.
     */
    private Book extractBookFromResultSet(ResultSet rs) throws SQLException {
        return new Book(
                rs.getInt("id"),
                rs.getString("title"),
                rs.getString("author"),
                rs.getString("isbn"),
                rs.getInt("category_id"),
                rs.getString("category_name"),
                rs.getString("publisher"),
                rs.getString("edition"),
                rs.getInt("quantity"),
                rs.getInt("available_quantity"),
                rs.getString("shelf_no"),
                rs.getTimestamp("created_at")
        );
    }
}
