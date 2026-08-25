package com.library.model;

import java.io.Serializable;
import java.sql.Date;
import java.util.Objects;

/**
 * Model representing a book borrowing / issue transaction.
 * Contains both foreign keys and joined student/book fields for API responses.
 */
public class IssuedBook implements Serializable {

    private static final long serialVersionUID = 1L;

    private int id;
    private int studentId;
    private String studentName;
    private String studentEnrollment;
    private int bookId;
    private String bookTitle;
    private String bookIsbn;
    private Date issueDate;
    private Date dueDate;
    private Date returnDate;
    private String status; // 'ISSUED' or 'RETURNED'

    // Default Constructor
    public IssuedBook() {
    }

    // Constructor for creating new issue transaction
    public IssuedBook(int studentId, int bookId, Date issueDate, Date dueDate) {
        this.studentId = studentId;
        this.bookId = bookId;
        this.issueDate = issueDate;
        this.dueDate = dueDate;
        this.status = "ISSUED";
    }

    // Full Constructor with joined details
    public IssuedBook(int id, int studentId, String studentName, String studentEnrollment,
                      int bookId, String bookTitle, String bookIsbn,
                      Date issueDate, Date dueDate, Date returnDate, String status) {
        this.id = id;
        this.studentId = studentId;
        this.studentName = studentName;
        this.studentEnrollment = studentEnrollment;
        this.bookId = bookId;
        this.bookTitle = bookTitle;
        this.bookIsbn = bookIsbn;
        this.issueDate = issueDate;
        this.dueDate = dueDate;
        this.returnDate = returnDate;
        this.status = status;
    }

    // Getters and Setters
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getStudentId() {
        return studentId;
    }

    public void setStudentId(int studentId) {
        this.studentId = studentId;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getStudentEnrollment() {
        return studentEnrollment;
    }

    public void setStudentEnrollment(String studentEnrollment) {
        this.studentEnrollment = studentEnrollment;
    }

    public int getBookId() {
        return bookId;
    }

    public void setBookId(int bookId) {
        this.bookId = bookId;
    }

    public String getBookTitle() {
        return bookTitle;
    }

    public void setBookTitle(String bookTitle) {
        this.bookTitle = bookTitle;
    }

    public String getBookIsbn() {
        return bookIsbn;
    }

    public void setBookIsbn(String bookIsbn) {
        this.bookIsbn = bookIsbn;
    }

    public Date getIssueDate() {
        return issueDate;
    }

    public void setIssueDate(Date issueDate) {
        this.issueDate = issueDate;
    }

    public Date getDueDate() {
        return dueDate;
    }

    public void setDueDate(Date dueDate) {
        this.dueDate = dueDate;
    }

    public Date getReturnDate() {
        return returnDate;
    }

    public void setReturnDate(Date returnDate) {
        this.returnDate = returnDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        IssuedBook that = (IssuedBook) o;
        return id == that.id;
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "IssuedBook{" +
                "id=" + id +
                ", studentId=" + studentId +
                ", studentName='" + studentName + '\'' +
                ", studentEnrollment='" + studentEnrollment + '\'' +
                ", bookId=" + bookId +
                ", bookTitle='" + bookTitle + '\'' +
                ", bookIsbn='" + bookIsbn + '\'' +
                ", issueDate=" + issueDate +
                ", dueDate=" + dueDate +
                ", returnDate=" + returnDate +
                ", status='" + status + '\'' +
                '}';
    }
}
