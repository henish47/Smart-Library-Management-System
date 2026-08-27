package com.library.servlet;

import com.google.gson.JsonSyntaxException;
import com.library.exception.DatabaseException;
import com.library.exception.ResourceNotFoundException;
import com.library.exception.ValidationException;
import com.library.util.ApiResponse;
import com.library.util.JsonUtil;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.IOException;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Base Abstract Servlet providing common HTTP utility functions,
 * JSON reading/writing, and centralized exception handling.
 */
public abstract class BaseServlet extends HttpServlet {

    private static final Logger LOGGER = Logger.getLogger(BaseServlet.class.getName());

    @Override
    protected void doOptions(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        String origin = req.getHeader("Origin");
        if (origin != null && !origin.trim().isEmpty()) {
            resp.setHeader("Access-Control-Allow-Origin", origin);
        } else {
            resp.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
        }
        resp.setHeader("Access-Control-Allow-Credentials", "true");
        resp.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        resp.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept, X-Requested-With, Origin");
        resp.setStatus(HttpServletResponse.SC_OK);
    }

    /**
     * Retrieves the currently logged-in user from HttpSession, if any.
     */
    protected com.library.model.Admin getAuthenticatedUser(HttpServletRequest req) {
        javax.servlet.http.HttpSession session = req.getSession(false);
        if (session != null) {
            return (com.library.model.Admin) session.getAttribute("user");
        }
        return null;
    }

    /**
     * Checks if the current request is authenticated.
     */
    protected boolean isAuthenticated(HttpServletRequest req) {
        return getAuthenticatedUser(req) != null;
    }

    /**
     * Reads the full JSON request payload from the request body.
     */
    protected String readRequestBody(HttpServletRequest req) throws IOException {
        StringBuilder sb = new StringBuilder();
        req.setCharacterEncoding("UTF-8");
        try (BufferedReader reader = req.getReader()) {
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }
        }
        return sb.toString();
    }

    /**
     * Parses request body into the specified Java model class.
     */
    protected <T> T parseJsonBody(HttpServletRequest req, Class<T> clazz) throws IOException, ValidationException {
        String body = readRequestBody(req);
        if (body == null || body.trim().isEmpty()) {
            throw new ValidationException("Request body cannot be empty.");
        }
        try {
            T obj = JsonUtil.fromJson(body, clazz);
            if (obj == null) {
                throw new ValidationException("Invalid JSON payload.");
            }
            return obj;
        } catch (JsonSyntaxException e) {
            throw new ValidationException("Malformed JSON syntax in request body: " + e.getMessage());
        }
    }

    /**
     * Sends a JSON response with status code and generic data object.
     */
    protected void sendJsonResponse(HttpServletResponse resp, int statusCode, Object data) throws IOException {
        resp.setContentType("application/json;charset=UTF-8");
        resp.setStatus(statusCode);
        String json = JsonUtil.toJson(data);
        resp.getWriter().write(json);
        resp.getWriter().flush();
    }

    /**
     * Sends a standardized success JSON response.
     */
    protected void sendSuccess(HttpServletResponse resp, int statusCode, String message, Object data) throws IOException {
        ApiResponse<Object> apiResponse = new ApiResponse<>(true, message, data);
        sendJsonResponse(resp, statusCode, apiResponse);
    }

    /**
     * Sends a standardized success JSON response without data payload.
     */
    protected void sendSuccess(HttpServletResponse resp, int statusCode, String message) throws IOException {
        sendSuccess(resp, statusCode, message, null);
    }

    /**
     * Sends a standardized error JSON response.
     */
    protected void sendError(HttpServletResponse resp, int statusCode, String message) throws IOException {
        ApiResponse<Object> apiResponse = new ApiResponse<>(false, message, null);
        sendJsonResponse(resp, statusCode, apiResponse);
    }

    /**
     * Centralized exception handler that translates domain exceptions into
     * proper HTTP status codes and sanitized JSON error messages.
     */
    protected void handleException(HttpServletResponse resp, Exception e) {
        try {
            if (e instanceof ValidationException) {
                LOGGER.log(Level.WARNING, "Validation Error: " + e.getMessage());
                sendError(resp, HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
            } else if (e instanceof ResourceNotFoundException) {
                LOGGER.log(Level.WARNING, "Resource Not Found: " + e.getMessage());
                sendError(resp, HttpServletResponse.SC_NOT_FOUND, e.getMessage());
            } else if (e instanceof DatabaseException) {
                LOGGER.log(Level.SEVERE, "Database Error: " + e.getMessage(), e);
                String msg = e.getMessage();
                if (msg != null && (msg.toLowerCase().contains("duplicate") || msg.toLowerCase().contains("cannot delete") || msg.toLowerCase().contains("constraint"))) {
                    sendError(resp, HttpServletResponse.SC_CONFLICT, msg);
                } else {
                    sendError(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "A database error occurred. Please check system logs.");
                }
            } else if (e instanceof NumberFormatException) {
                LOGGER.log(Level.WARNING, "Invalid Number Format: " + e.getMessage());
                sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Invalid numeric parameter provided.");
            } else {
                LOGGER.log(Level.SEVERE, "Unhandled Internal Server Error", e);
                sendError(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "An unexpected server error occurred.");
            }
        } catch (IOException ioException) {
            LOGGER.log(Level.SEVERE, "Failed to write error response", ioException);
        }
    }

    /**
     * Safely parses an integer parameter from request query parameters.
     * Returns null if parameter is absent.
     */
    protected Integer parseIntegerParam(HttpServletRequest req, String paramName) {
        String val = req.getParameter(paramName);
        if (val != null && !val.trim().isEmpty()) {
            try {
                return Integer.parseInt(val.trim());
            } catch (NumberFormatException e) {
                throw new ValidationException("Parameter '" + paramName + "' must be a valid integer.");
            }
        }
        return null;
    }
}
