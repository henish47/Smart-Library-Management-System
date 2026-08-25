package com.library.dao;

import com.library.exception.DatabaseException;
import com.library.model.Student;
import com.library.util.DBConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Data Access Object for Student entity.
 * Implements JDBC operations with PreparedStatement for student management.
 */
public class StudentDAO {

    private static final Logger LOGGER = Logger.getLogger(StudentDAO.class.getName());

    /**
     * Adds a new student record to the database.
     *
     * @param student Student model
     * @return Generated Student ID
     * @throws DatabaseException if SQL insert fails
     */
    public int addStudent(Student student) throws DatabaseException {
        String sql = "INSERT INTO students (enrollment_no, name, department, semester, email, phone) " +
                     "VALUES (?, ?, ?, ?, ?, ?)";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            ps.setString(1, student.getEnrollmentNo());
            ps.setString(2, student.getName());
            ps.setString(3, student.getDepartment());
            ps.setInt(4, student.getSemester());
            ps.setString(5, student.getEmail());
            ps.setString(6, student.getPhone());

            int affectedRows = ps.executeUpdate();
            if (affectedRows == 0) {
                throw new DatabaseException("Creating student failed, no rows affected.");
            }

            try (ResultSet rs = ps.getGeneratedKeys()) {
                if (rs.next()) {
                    int generatedId = rs.getInt(1);
                    student.setId(generatedId);
                    return generatedId;
                } else {
                    throw new DatabaseException("Creating student failed, no ID obtained.");
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error inserting student: " + student.getEnrollmentNo(), e);
            throw new DatabaseException("Failed to add student: " + e.getMessage(), e);
        }
    }

    /**
     * Retrieves all registered students ordered by ID descending.
     *
     * @return List of Student models
     * @throws DatabaseException if query fails
     */
    public List<Student> getAllStudents() throws DatabaseException {
        String sql = "SELECT id, enrollment_no, name, department, semester, email, phone, created_at " +
                     "FROM students ORDER BY id DESC";
        List<Student> students = new ArrayList<>();

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                students.add(extractStudentFromResultSet(rs));
            }
            return students;
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error fetching all students", e);
            throw new DatabaseException("Failed to retrieve students: " + e.getMessage(), e);
        }
    }

    /**
     * Finds a student by primary key ID.
     *
     * @param id Student ID
     * @return Student if found, or null
     * @throws DatabaseException if query fails
     */
    public Student getStudentById(int id) throws DatabaseException {
        String sql = "SELECT id, enrollment_no, name, department, semester, email, phone, created_at " +
                     "FROM students WHERE id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return extractStudentFromResultSet(rs);
                }
            }
            return null;
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error fetching student by ID: " + id, e);
            throw new DatabaseException("Failed to retrieve student: " + e.getMessage(), e);
        }
    }

    /**
     * Finds a student by unique enrollment number.
     *
     * @param enrollmentNo Student Enrollment No
     * @return Student if found, or null
     * @throws DatabaseException if query fails
     */
    public Student getStudentByEnrollmentNo(String enrollmentNo) throws DatabaseException {
        String sql = "SELECT id, enrollment_no, name, department, semester, email, phone, created_at " +
                     "FROM students WHERE LOWER(TRIM(enrollment_no)) = LOWER(TRIM(?))";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, enrollmentNo);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return extractStudentFromResultSet(rs);
                }
            }
            return null;
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error fetching student by enrollment: " + enrollmentNo, e);
            throw new DatabaseException("Failed to retrieve student by enrollment: " + e.getMessage(), e);
        }
    }

    /**
     * Updates an existing student record.
     *
     * @param student Student model with updated fields
     * @return true if updated, false if not found
     * @throws DatabaseException if update fails
     */
    public boolean updateStudent(Student student) throws DatabaseException {
        String sql = "UPDATE students SET enrollment_no = ?, name = ?, department = ?, " +
                     "semester = ?, email = ?, phone = ? WHERE id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, student.getEnrollmentNo());
            ps.setString(2, student.getName());
            ps.setString(3, student.getDepartment());
            ps.setInt(4, student.getSemester());
            ps.setString(5, student.getEmail());
            ps.setString(6, student.getPhone());
            ps.setInt(7, student.getId());

            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error updating student ID: " + student.getId(), e);
            throw new DatabaseException("Failed to update student: " + e.getMessage(), e);
        }
    }

    /**
     * Deletes a student by ID.
     *
     * @param id Student ID
     * @return true if deleted, false if not found
     * @throws DatabaseException if delete fails
     */
    public boolean deleteStudent(int id) throws DatabaseException {
        String sql = "DELETE FROM students WHERE id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, id);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error deleting student ID: " + id, e);
            if (e.getErrorCode() == 1451) {
                throw new DatabaseException("Cannot delete student because active or past issue records are linked to this student.", e);
            }
            throw new DatabaseException("Failed to delete student: " + e.getMessage(), e);
        }
    }

    /**
     * Searches students by matching keyword with enrollment_no, name, department, or email.
     *
     * @param query Search keyword
     * @return List of matching students
     * @throws DatabaseException if query fails
     */
    public List<Student> searchStudents(String query) throws DatabaseException {
        String sql = "SELECT id, enrollment_no, name, department, semester, email, phone, created_at " +
                     "FROM students " +
                     "WHERE LOWER(enrollment_no) LIKE ? " +
                     "   OR LOWER(name) LIKE ? " +
                     "   OR LOWER(department) LIKE ? " +
                     "   OR LOWER(email) LIKE ? " +
                     "ORDER BY name ASC";

        List<Student> students = new ArrayList<>();
        String pattern = "%" + (query == null ? "" : query.trim().toLowerCase()) + "%";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            for (int i = 1; i <= 4; i++) {
                ps.setString(i, pattern);
            }

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    students.add(extractStudentFromResultSet(rs));
                }
            }
            return students;
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error searching students with query: " + query, e);
            throw new DatabaseException("Failed to search students: " + e.getMessage(), e);
        }
    }

    /**
     * Checks if an enrollment number is already registered for another student.
     *
     * @param enrollmentNo Enrollment number
     * @param excludeId Student ID to exclude (0 for new student)
     * @return true if duplicate exists, false otherwise
     */
    public boolean isEnrollmentExists(String enrollmentNo, int excludeId) throws DatabaseException {
        String sql = "SELECT COUNT(*) FROM students WHERE LOWER(TRIM(enrollment_no)) = LOWER(TRIM(?)) AND id != ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, enrollmentNo);
            ps.setInt(2, excludeId);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt(1) > 0;
                }
            }
            return false;
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error checking duplicate enrollment: " + enrollmentNo, e);
            throw new DatabaseException("Failed to verify enrollment number uniqueness: " + e.getMessage(), e);
        }
    }

    /**
     * Checks if a student has any currently unreturned (ISSUED) books.
     *
     * @param studentId Student ID
     * @return true if student has active book loans
     */
    public boolean hasActiveIssuedBooks(int studentId) throws DatabaseException {
        String sql = "SELECT COUNT(*) FROM issued_books WHERE student_id = ? AND status = 'ISSUED'";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, studentId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt(1) > 0;
                }
            }
            return false;
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error checking active issues for student ID: " + studentId, e);
            throw new DatabaseException("Failed to check student active loans: " + e.getMessage(), e);
        }
    }

    private Student extractStudentFromResultSet(ResultSet rs) throws SQLException {
        return new Student(
                rs.getInt("id"),
                rs.getString("enrollment_no"),
                rs.getString("name"),
                rs.getString("department"),
                rs.getInt("semester"),
                rs.getString("email"),
                rs.getString("phone"),
                rs.getTimestamp("created_at")
        );
    }
}
