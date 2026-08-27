package com.library.dao;

import com.library.exception.DatabaseException;
import com.library.model.Admin;
import com.library.util.DBConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Data Access Object for Admin / User entity.
 * Handles user registration, credential authentication, and profile lookups using JDBC.
 */
public class AdminDAO {

    private static final Logger LOGGER = Logger.getLogger(AdminDAO.class.getName());

    /**
     * Registers a new administrator.
     *
     * @param admin Admin model containing username, password, name, and email
     * @return Generated Admin ID
     * @throws DatabaseException if insert fails
     */
    public int register(Admin admin) throws DatabaseException {
        String sql = "INSERT INTO admin (username, password, name, email) VALUES (?, ?, ?, ?)";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            ps.setString(1, admin.getUsername().trim());
            ps.setString(2, admin.getPassword());
            ps.setString(3, admin.getName().trim());
            ps.setString(4, admin.getEmail() != null ? admin.getEmail().trim() : null);

            int affectedRows = ps.executeUpdate();
            if (affectedRows == 0) {
                throw new DatabaseException("Creating admin failed, no rows affected.");
            }

            try (ResultSet rs = ps.getGeneratedKeys()) {
                if (rs.next()) {
                    int generatedId = rs.getInt(1);
                    admin.setId(generatedId);
                    return generatedId;
                } else {
                    throw new DatabaseException("Creating admin failed, no ID obtained.");
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error registering admin: " + admin.getUsername(), e);
            throw new DatabaseException("Failed to register admin: " + e.getMessage(), e);
        }
    }

    /**
     * Authenticates an admin by username and password.
     *
     * @param username Username
     * @param password Password
     * @return Admin if valid credentials, otherwise null
     * @throws DatabaseException if query fails
     */
    public Admin authenticate(String username, String password) throws DatabaseException {
        String sql = "SELECT id, username, password, name, email, created_at FROM admin WHERE LOWER(username) = LOWER(?) AND password = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, username.trim());
            ps.setString(2, password);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return extractAdminFromResultSet(rs);
                }
            }
            return null;
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error authenticating admin: " + username, e);
            throw new DatabaseException("Database error during authentication: " + e.getMessage(), e);
        }
    }

    /**
     * Retrieves an admin by ID.
     *
     * @param id Admin ID
     * @return Admin or null
     */
    public Admin getById(int id) throws DatabaseException {
        String sql = "SELECT id, username, password, name, email, created_at FROM admin WHERE id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, id);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return extractAdminFromResultSet(rs);
                }
            }
            return null;
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error finding admin by ID: " + id, e);
            throw new DatabaseException("Database error finding admin: " + e.getMessage(), e);
        }
    }

    /**
     * Retrieves an admin by username.
     *
     * @param username Username
     * @return Admin or null
     */
    public Admin getByUsername(String username) throws DatabaseException {
        String sql = "SELECT id, username, password, name, email, created_at FROM admin WHERE LOWER(username) = LOWER(?)";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, username.trim());

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return extractAdminFromResultSet(rs);
                }
            }
            return null;
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error finding admin by username: " + username, e);
            throw new DatabaseException("Database error finding admin: " + e.getMessage(), e);
        }
    }

    /**
     * Checks if a username is already taken.
     *
     * @param username Username to check
     * @return true if exists, false otherwise
     */
    public boolean isUsernameExists(String username) throws DatabaseException {
        String sql = "SELECT COUNT(*) FROM admin WHERE LOWER(TRIM(username)) = LOWER(TRIM(?))";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, username);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt(1) > 0;
                }
            }
            return false;
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error checking username uniqueness: " + username, e);
            throw new DatabaseException("Database error checking username: " + e.getMessage(), e);
        }
    }

    private Admin extractAdminFromResultSet(ResultSet rs) throws SQLException {
        return new Admin(
                rs.getInt("id"),
                rs.getString("username"),
                rs.getString("password"),
                rs.getString("name"),
                rs.getString("email"),
                rs.getTimestamp("created_at")
        );
    }
}
