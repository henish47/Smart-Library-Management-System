package com.library.exception;

/**
 * Custom exception thrown when a requested resource (Book, Student, Category,
 * or IssuedBook) is not found in the database.
 * Handled by the servlet layer to return HTTP 404 Not Found responses.
 */
public class ResourceNotFoundException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    public ResourceNotFoundException(String message) {
        super(message);
    }

    public ResourceNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
