package com.library.servlet;

import com.library.dao.StudentDAO;
import com.library.exception.ResourceNotFoundException;
import com.library.exception.ValidationException;
import com.library.model.Student;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import java.util.regex.Pattern;

/**
 * Servlet handling Student CRUD endpoints:
 * GET    /api/students
 * GET    /api/students?id=1
 * GET    /api/students?search=keyword
 * POST   /api/students
 * PUT    /api/students
 * DELETE /api/students?id=1
 */
@WebServlet(name = "StudentServlet", urlPatterns = {"/api/students", "/api/students/*"})
public class StudentServlet extends BaseServlet {

    private final StudentDAO studentDAO = new StudentDAO();
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$");

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        try {
            Integer id = parseIntegerParam(req, "id");
            String search = req.getParameter("search");

            if (id != null) {
                // Get single student by ID
                Student student = studentDAO.getStudentById(id);
                if (student == null) {
                    throw new ResourceNotFoundException("Student with ID " + id + " not found.");
                }
                sendSuccess(resp, HttpServletResponse.SC_OK, "Student retrieved successfully", student);
            } else if (search != null && !search.trim().isEmpty()) {
                // Search students by keyword
                List<Student> searchResults = studentDAO.searchStudents(search.trim());
                sendSuccess(resp, HttpServletResponse.SC_OK, "Students search completed (" + searchResults.size() + " matches found)", searchResults);
            } else {
                // Get all students
                List<Student> allStudents = studentDAO.getAllStudents();
                sendSuccess(resp, HttpServletResponse.SC_OK, "Students retrieved successfully", allStudents);
            }
        } catch (Exception e) {
            handleException(resp, e);
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        try {
            Student student = parseJsonBody(req, Student.class);

            // Validation
            validateStudent(student, false);

            // Check duplicate enrollment number
            if (studentDAO.isEnrollmentExists(student.getEnrollmentNo(), 0)) {
                sendError(resp, HttpServletResponse.SC_CONFLICT, "A student with Enrollment No '" + student.getEnrollmentNo() + "' is already registered.");
                return;
            }

            int generatedId = studentDAO.addStudent(student);
            student.setId(generatedId);

            sendSuccess(resp, HttpServletResponse.SC_CREATED, "Student registered successfully", student);
        } catch (Exception e) {
            handleException(resp, e);
        }
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        try {
            Student student = parseJsonBody(req, Student.class);

            // Validation
            validateStudent(student, true);

            // Check student existence
            Student existing = studentDAO.getStudentById(student.getId());
            if (existing == null) {
                throw new ResourceNotFoundException("Student with ID " + student.getId() + " not found.");
            }

            // Check duplicate enrollment number for other students
            if (studentDAO.isEnrollmentExists(student.getEnrollmentNo(), student.getId())) {
                sendError(resp, HttpServletResponse.SC_CONFLICT, "Another student is already registered with Enrollment No '" + student.getEnrollmentNo() + "'.");
                return;
            }

            boolean updated = studentDAO.updateStudent(student);
            if (updated) {
                sendSuccess(resp, HttpServletResponse.SC_OK, "Student updated successfully", student);
            } else {
                throw new ResourceNotFoundException("Student with ID " + student.getId() + " could not be updated.");
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
                throw new ValidationException("A valid Student ID must be provided in the 'id' parameter.");
            }

            Student existing = studentDAO.getStudentById(id);
            if (existing == null) {
                throw new ResourceNotFoundException("Student with ID " + id + " not found.");
            }

            // Verify if student has active book loans
            if (studentDAO.hasActiveIssuedBooks(id)) {
                sendError(resp, HttpServletResponse.SC_CONFLICT, "Cannot delete student '" + existing.getName() + "' because they have active borrowed books that must be returned first.");
                return;
            }

            boolean deleted = studentDAO.deleteStudent(id);
            if (deleted) {
                sendSuccess(resp, HttpServletResponse.SC_OK, "Student deleted successfully");
            } else {
                throw new ResourceNotFoundException("Student with ID " + id + " could not be deleted.");
            }
        } catch (Exception e) {
            handleException(resp, e);
        }
    }

    private void validateStudent(Student student, boolean isUpdate) {
        if (student == null) {
            throw new ValidationException("Student data is required.");
        }
        if (isUpdate && student.getId() <= 0) {
            throw new ValidationException("A valid Student ID is required for updates.");
        }
        if (student.getEnrollmentNo() == null || student.getEnrollmentNo().trim().isEmpty()) {
            throw new ValidationException("Enrollment number is required.");
        }
        if (student.getName() == null || student.getName().trim().isEmpty()) {
            throw new ValidationException("Student name is required.");
        }
        if (student.getSemester() < 1 || student.getSemester() > 8) {
            throw new ValidationException("Semester must be between 1 and 8.");
        }
        if (student.getEmail() != null && !student.getEmail().trim().isEmpty()) {
            if (!EMAIL_PATTERN.matcher(student.getEmail().trim()).matches()) {
                throw new ValidationException("Invalid email format provided: " + student.getEmail());
            }
            if (student.getEmail().length() > 100) {
                throw new ValidationException("Email cannot exceed 100 characters.");
            }
        }
        if (student.getPhone() != null && !student.getPhone().trim().isEmpty()) {
            if (student.getPhone().length() > 20) {
                throw new ValidationException("Phone number cannot exceed 20 characters.");
            }
        }

        // Trim values
        student.setEnrollmentNo(student.getEnrollmentNo().trim());
        student.setName(student.getName().trim());
        if (student.getDepartment() != null) student.setDepartment(student.getDepartment().trim());
        if (student.getEmail() != null) student.setEmail(student.getEmail().trim());
        if (student.getPhone() != null) student.setPhone(student.getPhone().trim());
    }
}
