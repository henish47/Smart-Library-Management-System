package com.library.servlet;

import com.google.gson.JsonObject;
import com.library.dao.AdminDAO;
import com.library.exception.ValidationException;
import com.library.model.Admin;
import com.library.util.JsonUtil;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * Servlet handling Authentication endpoints:
 * POST /api/auth/register
 * POST /api/auth/login
 * POST /api/auth/logout
 * GET  /api/auth/session
 */
@WebServlet(name = "AuthServlet", urlPatterns = {"/api/auth", "/api/auth/*"})
public class AuthServlet extends BaseServlet {

    private final AdminDAO adminDAO = new AdminDAO();
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$");

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        try {
            String pathInfo = req.getPathInfo();
            if (pathInfo != null && pathInfo.endsWith("/session")) {
                handleSessionCheck(req, resp);
            } else {
                handleSessionCheck(req, resp);
            }
        } catch (Exception e) {
            handleException(resp, e);
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        try {
            String pathInfo = req.getPathInfo();
            if (pathInfo != null && pathInfo.endsWith("/register")) {
                handleRegister(req, resp);
            } else if (pathInfo != null && pathInfo.endsWith("/login")) {
                handleLogin(req, resp);
            } else if (pathInfo != null && pathInfo.endsWith("/logout")) {
                handleLogout(req, resp);
            } else {
                throw new ValidationException("Unknown authentication endpoint.");
            }
        } catch (Exception e) {
            handleException(resp, e);
        }
    }

    /**
     * Handles POST /api/auth/register
     */
    private void handleRegister(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String body = readRequestBody(req);
        if (body == null || body.trim().isEmpty()) {
            throw new ValidationException("Registration payload is required.");
        }

        JsonObject json = JsonUtil.fromJson(body, JsonObject.class);
        if (json == null) {
            throw new ValidationException("Invalid JSON payload.");
        }

        String name = json.has("name") && !json.get("name").isJsonNull() ? json.get("name").getAsString().trim() : "";
        String username = json.has("username") && !json.get("username").isJsonNull() ? json.get("username").getAsString().trim() : "";
        String email = json.has("email") && !json.get("email").isJsonNull() ? json.get("email").getAsString().trim() : "";
        String password = json.has("password") && !json.get("password").isJsonNull() ? json.get("password").getAsString() : "";

        // Validations
        if (name.isEmpty()) throw new ValidationException("Name is required.");
        if (username.isEmpty()) throw new ValidationException("Username is required.");
        if (username.length() < 3) throw new ValidationException("Username must be at least 3 characters.");
        if (password.isEmpty()) throw new ValidationException("Password is required.");
        if (password.length() < 4) throw new ValidationException("Password must be at least 4 characters.");
        if (!email.isEmpty() && !EMAIL_PATTERN.matcher(email).matches()) {
            throw new ValidationException("Invalid email format provided.");
        }

        // Check if username already exists
        if (adminDAO.isUsernameExists(username)) {
            sendError(resp, HttpServletResponse.SC_CONFLICT, "Username already exists. Please choose a different username.");
            return;
        }

        Admin newAdmin = new Admin(username, password, name, email);
        int generatedId = adminDAO.register(newAdmin);
        newAdmin.setId(generatedId);

        // Success response without password
        sendSuccess(resp, HttpServletResponse.SC_CREATED, "Registration successful", null);
    }

    /**
     * Handles POST /api/auth/login
     */
    private void handleLogin(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String body = readRequestBody(req);
        if (body == null || body.trim().isEmpty()) {
            throw new ValidationException("Login payload is required.");
        }

        JsonObject json = JsonUtil.fromJson(body, JsonObject.class);
        if (json == null) {
            throw new ValidationException("Invalid JSON payload.");
        }

        String username = json.has("username") && !json.get("username").isJsonNull() ? json.get("username").getAsString().trim() : "";
        String password = json.has("password") && !json.get("password").isJsonNull() ? json.get("password").getAsString() : "";

        if (username.isEmpty()) throw new ValidationException("Username is required.");
        if (password.isEmpty()) throw new ValidationException("Password is required.");

        Admin admin = adminDAO.authenticate(username, password);
        if (admin == null) {
            sendError(resp, HttpServletResponse.SC_UNAUTHORIZED, "Invalid username or password.");
            return;
        }

        // Create HttpSession
        HttpSession session = req.getSession(true);
        session.setAttribute("user", admin);

        // Return sanitized profile (never return password)
        Map<String, Object> userData = new HashMap<>();
        userData.put("id", admin.getId());
        userData.put("username", admin.getUsername());
        userData.put("name", admin.getName());
        userData.put("email", admin.getEmail());

        sendSuccess(resp, HttpServletResponse.SC_OK, "Login successful", userData);
    }

    /**
     * Handles POST /api/auth/logout
     */
    private void handleLogout(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        HttpSession session = req.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        sendSuccess(resp, HttpServletResponse.SC_OK, "Logged out successfully");
    }

    /**
     * Handles GET /api/auth/session
     */
    private void handleSessionCheck(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        HttpSession session = req.getSession(false);
        if (session != null) {
            Admin admin = (Admin) session.getAttribute("user");
            if (admin != null) {
                Map<String, Object> userData = new HashMap<>();
                userData.put("id", admin.getId());
                userData.put("username", admin.getUsername());
                userData.put("name", admin.getName());
                userData.put("email", admin.getEmail());

                sendSuccess(resp, HttpServletResponse.SC_OK, "Authenticated", userData);
                return;
            }
        }
        sendError(resp, HttpServletResponse.SC_UNAUTHORIZED, "Not authenticated");
    }
}
