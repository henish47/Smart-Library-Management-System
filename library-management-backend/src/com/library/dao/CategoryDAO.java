package com.library.dao;

import com.library.exception.DatabaseException;
import com.library.model.Category;
import com.library.util.DBConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Data Access Object for Category entity.
 * Implements JDBC CRUD operations using PreparedStatement and try-with-resources.
 */
public class CategoryDAO {

    private static final Logger LOGGER = Logger.getLogger(CategoryDAO.class.getName());

    /**
     * Inserts a new category into the database.
     *
     * @param category Category to insert
     * @return Generated Category ID
     * @throws DatabaseException if SQL operation fails
     */
    public int addCategory(Category category) throws DatabaseException {
        String sql = "INSERT INTO categories (name, description) VALUES (?, ?)";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            ps.setString(1, category.getName());
            ps.setString(2, category.getDescription());

            int affectedRows = ps.executeUpdate();
            if (affectedRows == 0) {
                throw new DatabaseException("Creating category failed, no rows affected.");
            }

            try (ResultSet rs = ps.getGeneratedKeys()) {
                if (rs.next()) {
                    int generatedId = rs.getInt(1);
                    category.setId(generatedId);
                    return generatedId;
                } else {
                    throw new DatabaseException("Creating category failed, no ID obtained.");
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error inserting category: " + category.getName(), e);
            throw new DatabaseException("Failed to add category: " + e.getMessage(), e);
        }
    }

    /**
     * Retrieves all categories from the database sorted by name.
     *
     * @return List of Category objects
     * @throws DatabaseException if SQL operation fails
     */
    public List<Category> getAllCategories() throws DatabaseException {
        String sql = "SELECT id, name, description FROM categories ORDER BY name ASC";
        List<Category> categories = new ArrayList<>();

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                Category c = new Category(
                        rs.getInt("id"),
                        rs.getString("name"),
                        rs.getString("description")
                );
                categories.add(c);
            }
            return categories;
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error fetching all categories", e);
            throw new DatabaseException("Failed to retrieve categories: " + e.getMessage(), e);
        }
    }

    /**
     * Finds a single category by its primary key ID.
     *
     * @param id Category ID
     * @return Category if found, or null
     * @throws DatabaseException if SQL operation fails
     */
    public Category getCategoryById(int id) throws DatabaseException {
        String sql = "SELECT id, name, description FROM categories WHERE id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return new Category(
                            rs.getInt("id"),
                            rs.getString("name"),
                            rs.getString("description")
                    );
                }
            }
            return null;
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error fetching category by ID: " + id, e);
            throw new DatabaseException("Failed to retrieve category: " + e.getMessage(), e);
        }
    }

    /**
     * Updates an existing category's details.
     *
     * @param category Category with updated details
     * @return true if updated, false if not found
     * @throws DatabaseException if SQL operation fails
     */
    public boolean updateCategory(Category category) throws DatabaseException {
        String sql = "UPDATE categories SET name = ?, description = ? WHERE id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, category.getName());
            ps.setString(2, category.getDescription());
            ps.setInt(3, category.getId());

            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error updating category ID: " + category.getId(), e);
            throw new DatabaseException("Failed to update category: " + e.getMessage(), e);
        }
    }

    /**
     * Deletes a category by its ID.
     *
     * @param id Category ID
     * @return true if deleted, false if not found
     * @throws DatabaseException if SQL operation fails (e.g. foreign key constraint)
     */
    public boolean deleteCategory(int id) throws DatabaseException {
        String sql = "DELETE FROM categories WHERE id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, id);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error deleting category ID: " + id, e);
            if (e.getErrorCode() == 1451) {
                throw new DatabaseException("Cannot delete category because it contains books. Please delete or reassign associated books first.", e);
            }
            throw new DatabaseException("Failed to delete category: " + e.getMessage(), e);
        }
    }

    /**
     * Checks if a category name already exists (excluding a specified ID).
     *
     * @param name Category name
     * @param excludeId Category ID to exclude from check (0 for new categories)
     * @return true if name already exists, false otherwise
     */
    public boolean isCategoryNameExists(String name, int excludeId) throws DatabaseException {
        String sql = "SELECT COUNT(*) FROM categories WHERE LOWER(TRIM(name)) = LOWER(TRIM(?)) AND id != ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, name);
            ps.setInt(2, excludeId);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt(1) > 0;
                }
            }
            return false;
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error checking duplicate category name: " + name, e);
            throw new DatabaseException("Failed to check category name uniqueness: " + e.getMessage(), e);
        }
    }
}
