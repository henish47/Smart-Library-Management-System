package com.library.servlet;

import com.library.dao.BookDAO;
import com.library.dao.CategoryDAO;
import com.library.exception.ResourceNotFoundException;
import com.library.exception.ValidationException;
import com.library.model.Book;
import com.library.model.Category;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;

/**
 * Servlet handling Book CRUD endpoints:
 * GET    /api/books
 * GET    /api/books?id=1
 * GET    /api/books?search=keyword
 * POST   /api/books
 * PUT    /api/books
 * DELETE /api/books?id=1
 */
@WebServlet(name = "BookServlet", urlPatterns = {"/api/books", "/api/books/*"})
public class BookServlet extends BaseServlet {

    private final BookDAO bookDAO = new BookDAO();
    private final CategoryDAO categoryDAO = new CategoryDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        try {
            Integer id = parseIntegerParam(req, "id");
            String search = req.getParameter("search");

            if (id != null) {
                // Get single book by ID
                Book book = bookDAO.getBookById(id);
                if (book == null) {
                    throw new ResourceNotFoundException("Book with ID " + id + " not found.");
                }
                sendSuccess(resp, HttpServletResponse.SC_OK, "Book retrieved successfully", book);
            } else if (search != null && !search.trim().isEmpty()) {
                // Search books by keyword
                List<Book> searchResults = bookDAO.searchBooks(search.trim());
                sendSuccess(resp, HttpServletResponse.SC_OK, "Books search completed (" + searchResults.size() + " matches found)", searchResults);
            } else {
                // Get all books
                List<Book> allBooks = bookDAO.getAllBooks();
                sendSuccess(resp, HttpServletResponse.SC_OK, "Books retrieved successfully", allBooks);
            }
        } catch (Exception e) {
            handleException(resp, e);
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        try {
            Book book = parseJsonBody(req, Book.class);

            // Validation
            validateBook(book, false);

            // Check if Category exists
            Category category = categoryDAO.getCategoryById(book.getCategoryId());
            if (category == null) {
                throw new ValidationException("Category with ID " + book.getCategoryId() + " does not exist.");
            }

            // Check duplicate ISBN
            if (bookDAO.isIsbnExists(book.getIsbn(), 0)) {
                sendError(resp, HttpServletResponse.SC_CONFLICT, "A book with ISBN '" + book.getIsbn() + "' already exists.");
                return;
            }

            int generatedId = bookDAO.addBook(book);
            book.setId(generatedId);
            book.setCategoryName(category.getName());

            sendSuccess(resp, HttpServletResponse.SC_CREATED, "Book added successfully", book);
        } catch (Exception e) {
            handleException(resp, e);
        }
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        try {
            Book book = parseJsonBody(req, Book.class);

            // Validation
            validateBook(book, true);

            // Check existence
            Book existing = bookDAO.getBookById(book.getId());
            if (existing == null) {
                throw new ResourceNotFoundException("Book with ID " + book.getId() + " not found.");
            }

            // Check if Category exists
            Category category = categoryDAO.getCategoryById(book.getCategoryId());
            if (category == null) {
                throw new ValidationException("Category with ID " + book.getCategoryId() + " does not exist.");
            }

            // Check duplicate ISBN on other books
            if (bookDAO.isIsbnExists(book.getIsbn(), book.getId())) {
                sendError(resp, HttpServletResponse.SC_CONFLICT, "Another book with ISBN '" + book.getIsbn() + "' already exists.");
                return;
            }

            boolean updated = bookDAO.updateBook(book);
            if (updated) {
                book.setCategoryName(category.getName());
                sendSuccess(resp, HttpServletResponse.SC_OK, "Book updated successfully", book);
            } else {
                throw new ResourceNotFoundException("Book with ID " + book.getId() + " could not be updated.");
            }
        } catch (Exception e) {
            handleException(resp, e);
        }
    }

    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        try {
            Integer id = parseIntegerParam(req, "id");
            if (id == null || id <= 0) {
                throw new ValidationException("A valid Book ID must be provided in the 'id' parameter.");
            }

            Book existing = bookDAO.getBookById(id);
            if (existing == null) {
                throw new ResourceNotFoundException("Book with ID " + id + " not found.");
            }

            // Verify if copies are currently borrowed
            if (bookDAO.hasActiveBorrowers(id)) {
                sendError(resp, HttpServletResponse.SC_CONFLICT, "Cannot delete book '" + existing.getTitle() + "' because active borrow transactions are pending return.");
                return;
            }

            boolean deleted = bookDAO.deleteBook(id);
            if (deleted) {
                sendSuccess(resp, HttpServletResponse.SC_OK, "Book deleted successfully");
            } else {
                throw new ResourceNotFoundException("Book with ID " + id + " could not be deleted.");
            }
        } catch (Exception e) {
            handleException(resp, e);
        }
    }

    private void validateBook(Book book, boolean isUpdate) {
        if (book == null) {
            throw new ValidationException("Book data is required.");
        }
        if (isUpdate && book.getId() <= 0) {
            throw new ValidationException("A valid Book ID is required for updates.");
        }
        if (book.getTitle() == null || book.getTitle().trim().isEmpty()) {
            throw new ValidationException("Book title is required.");
        }
        if (book.getAuthor() == null || book.getAuthor().trim().isEmpty()) {
            throw new ValidationException("Author name is required.");
        }
        if (book.getIsbn() == null || book.getIsbn().trim().isEmpty()) {
            throw new ValidationException("ISBN is required.");
        }
        if (book.getCategoryId() <= 0) {
            throw new ValidationException("A valid category_id is required.");
        }
        if (book.getQuantity() < 0) {
            throw new ValidationException("Total quantity cannot be negative.");
        }
        // If availableQuantity is not explicitly set, initialize it to total quantity
        if (book.getAvailableQuantity() == 0 && !isUpdate && book.getQuantity() > 0) {
            book.setAvailableQuantity(book.getQuantity());
        }
        if (book.getAvailableQuantity() < 0) {
            throw new ValidationException("Available quantity cannot be negative.");
        }
        if (book.getAvailableQuantity() > book.getQuantity()) {
            throw new ValidationException("Available quantity (" + book.getAvailableQuantity() + ") cannot exceed total quantity (" + book.getQuantity() + ").");
        }

        // Field length validations
        if (book.getTitle().length() > 200) throw new ValidationException("Title exceeds 200 characters.");
        if (book.getAuthor().length() > 150) throw new ValidationException("Author exceeds 150 characters.");
        if (book.getIsbn().length() > 50) throw new ValidationException("ISBN exceeds 50 characters.");

        // Trim values
        book.setTitle(book.getTitle().trim());
        book.setAuthor(book.getAuthor().trim());
        book.setIsbn(book.getIsbn().trim());
        if (book.getPublisher() != null) book.setPublisher(book.getPublisher().trim());
        if (book.getEdition() != null) book.setEdition(book.getEdition().trim());
        if (book.getShelfNo() != null) book.setShelfNo(book.getShelfNo().trim());
    }
}
