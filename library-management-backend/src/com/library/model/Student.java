package com.library.model;

import java.io.Serializable;
import java.sql.Timestamp;
import java.util.Objects;

/**
 * Model representing a student in the library management system.
 */
public class Student implements Serializable {

    private static final long serialVersionUID = 1L;

    private int id;
    private String enrollmentNo;
    private String name;
    private String department;
    private int semester;
    private String email;
    private String phone;
    private Timestamp createdAt;

    // Default Constructor
    public Student() {
    }

    // Constructor for creating new student
    public Student(String enrollmentNo, String name, String department,
                   int semester, String email, String phone) {
        this.enrollmentNo = enrollmentNo;
        this.name = name;
        this.department = department;
        this.semester = semester;
        this.email = email;
        this.phone = phone;
    }

    // Full Parameterized Constructor
    public Student(int id, String enrollmentNo, String name, String department,
                   int semester, String email, String phone, Timestamp createdAt) {
        this.id = id;
        this.enrollmentNo = enrollmentNo;
        this.name = name;
        this.department = department;
        this.semester = semester;
        this.email = email;
        this.phone = phone;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getEnrollmentNo() {
        return enrollmentNo;
    }

    public void setEnrollmentNo(String enrollmentNo) {
        this.enrollmentNo = enrollmentNo;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public int getSemester() {
        return semester;
    }

    public void setSemester(int semester) {
        this.semester = semester;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Student student = (Student) o;
        return id == student.id && Objects.equals(enrollmentNo, student.enrollmentNo);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, enrollmentNo);
    }

    @Override
    public String toString() {
        return "Student{" +
                "id=" + id +
                ", enrollmentNo='" + enrollmentNo + '\'' +
                ", name='" + name + '\'' +
                ", department='" + department + '\'' +
                ", semester=" + semester +
                ", email='" + email + '\'' +
                ", phone='" + phone + '\'' +
                ", createdAt=" + createdAt +
                '}';
    }
}
