package com.library.exception;

/**
 * Custom exception thrown when client input fails backend validation rules.
 * Handled by the servlet layer to return HTTP 400 Bad Request responses.
 */
public class ValidationException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    public ValidationException(String message) {
        super(message);
    }

    public ValidationException(String message, Throwable cause) {
        super(message, cause);
    }
}
