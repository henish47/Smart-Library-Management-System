package com.library.servlet;

import com.library.dao.CategoryDAO;
import com.library.exception.ResourceNotFoundException;
import com.library.exception.ValidationException;
import com.library.model.Category;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;

/**
 * Servlet handling Category CRUD endpoints:
 * GET    /api/categories
 * GET    /api/categories?id=1
 * POST   /api/categories
 * PUT    /api/categories
 * DELETE /api/categories?id=1
 */
@WebServlet(name = "CategoryServlet", urlPatterns = {"/api/categories", "/api/categories/*"})
public class CategoryServlet extends BaseServlet {

    private final CategoryDAO categoryDAO = new CategoryDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        try {
            Integer id = parseIntegerParam(req, "id");
            if (id != null) {
                // Fetch single category
                Category category = categoryDAO.getCategoryById(id);
                if (category == null) {
                    throw new ResourceNotFoundException("Category with ID " + id + " not found.");
                }
                sendSuccess(resp, HttpServletResponse.SC_OK, "Category retrieved successfully", category);
            } else {
                // Fetch all categories
                List<Category> list = categoryDAO.getAllCategories();
                sendSuccess(resp, HttpServletResponse.SC_OK, "Categories retrieved successfully", list);
            }
        } catch (Exception e) {
            handleException(resp, e);
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        try {
            Category category = parseJsonBody(req, Category.class);

            // Validation
            validateCategory(category, false);

            // Check duplicate name
            if (categoryDAO.isCategoryNameExists(category.getName(), 0)) {
                sendError(resp, HttpServletResponse.SC_CONFLICT, "A category with the name '" + category.getName() + "' already exists.");
                return;
            }

            int generatedId = categoryDAO.addCategory(category);
            category.setId(generatedId);

            sendSuccess(resp, HttpServletResponse.SC_CREATED, "Category created successfully", category);
        } catch (Exception e) {
            handleException(resp, e);
        }
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        try {
            Category category = parseJsonBody(req, Category.class);

            // Validation
            validateCategory(category, true);

            // Check existence
            Category existing = categoryDAO.getCategoryById(category.getId());
            if (existing == null) {
                throw new ResourceNotFoundException("Category with ID " + category.getId() + " not found.");
            }

            // Check duplicate name on other records
            if (categoryDAO.isCategoryNameExists(category.getName(), category.getId())) {
                sendError(resp, HttpServletResponse.SC_CONFLICT, "Another category with name '" + category.getName() + "' already exists.");
                return;
            }

            boolean updated = categoryDAO.updateCategory(category);
            if (updated) {
                sendSuccess(resp, HttpServletResponse.SC_OK, "Category updated successfully", category);
            } else {
                throw new ResourceNotFoundException("Category with ID " + category.getId() + " could not be updated.");
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
                throw new ValidationException("A valid Category ID must be provided in the 'id' parameter.");
            }

            Category existing = categoryDAO.getCategoryById(id);
            if (existing == null) {
                throw new ResourceNotFoundException("Category with ID " + id + " not found.");
            }

            boolean deleted = categoryDAO.deleteCategory(id);
            if (deleted) {
                sendSuccess(resp, HttpServletResponse.SC_OK, "Category deleted successfully");
            } else {
                throw new ResourceNotFoundException("Category with ID " + id + " could not be deleted.");
            }
        } catch (Exception e) {
            handleException(resp, e);
        }
    }

    private void validateCategory(Category category, boolean isUpdate) {
        if (category == null) {
            throw new ValidationException("Category data is missing.");
        }
        if (isUpdate && category.getId() <= 0) {
            throw new ValidationException("A valid Category ID is required for updates.");
        }
        if (category.getName() == null || category.getName().trim().isEmpty()) {
            throw new ValidationException("Category name is required and cannot be empty.");
        }
        if (category.getName().length() > 100) {
            throw new ValidationException("Category name cannot exceed 100 characters.");
        }
        if (category.getDescription() != null && category.getDescription().length() > 255) {
            throw new ValidationException("Category description cannot exceed 255 characters.");
        }
        // Normalize fields
        category.setName(category.getName().trim());
        if (category.getDescription() != null) {
            category.setDescription(category.getDescription().trim());
        }
    }
}
