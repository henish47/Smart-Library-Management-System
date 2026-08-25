package com.library.exception;

/**
 * Custom exception thrown when a database or JDBC operation fails.
 * Wraps SQLExceptions or connection failures to prevent leaking raw SQL
 * to the presentation/servlet layer.
 */
public class DatabaseException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    public DatabaseException(String message) {
        super(message);
    }

    public DatabaseException(String message, Throwable cause) {
        super(message, cause);
    }
}
