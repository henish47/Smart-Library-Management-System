-- ============================================================================
-- SMART LIBRARY MANAGEMENT SYSTEM - DATABASE SCHEMA & SAMPLE DATA
-- College AJT Mini Project
-- Database: MySQL 8.0+
-- Description: Complete schema with tables, constraints, foreign keys, 
--              indexes, and realistic sample data.
-- ============================================================================

-- 1. DATABASE CREATION
DROP DATABASE IF EXISTS library_management;
CREATE DATABASE library_management 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE library_management;

-- Disable foreign key checks during schema setup
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------------------------------------------------------
-- 2. TABLE DEFINITIONS
-- ----------------------------------------------------------------------------

-- Table: admin
-- Stores system administrator login credentials and profile details.
DROP TABLE IF EXISTS admin;
CREATE TABLE admin (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: categories
-- Stores book genres/categories for catalog classification.
DROP TABLE IF EXISTS categories;
CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) UNIQUE NOT NULL,
    description VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: books
-- Stores library book inventory, shelf location, and stock availability.
DROP TABLE IF EXISTS books;
CREATE TABLE books (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    author VARCHAR(150) NOT NULL,
    isbn VARCHAR(50) UNIQUE NOT NULL,
    category_id INT NOT NULL,
    publisher VARCHAR(150),
    edition VARCHAR(50),
    quantity INT NOT NULL DEFAULT 1,
    available_quantity INT NOT NULL DEFAULT 1,
    shelf_no VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_books_category 
        FOREIGN KEY (category_id) REFERENCES categories(id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    CONSTRAINT chk_book_quantity 
        CHECK (quantity >= 0),
    CONSTRAINT chk_book_available_quantity 
        CHECK (available_quantity >= 0 AND available_quantity <= quantity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: students
-- Stores registered college student information.
DROP TABLE IF EXISTS students;
CREATE TABLE students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    enrollment_no VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    department VARCHAR(100),
    semester INT,
    email VARCHAR(100),
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_student_semester 
        CHECK (semester BETWEEN 1 AND 8)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: issued_books
-- Stores book borrowing transactions.
-- NOTE: No fine calculation is implemented in this system as per requirements.
DROP TABLE IF EXISTS issued_books;
CREATE TABLE issued_books (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    book_id INT NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    return_date DATE NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ISSUED',
    CONSTRAINT fk_issued_student 
        FOREIGN KEY (student_id) REFERENCES students(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    CONSTRAINT fk_issued_book 
        FOREIGN KEY (book_id) REFERENCES books(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    CONSTRAINT chk_issued_status 
        CHECK (status IN ('ISSUED', 'RETURNED'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ----------------------------------------------------------------------------
-- 3. INDEXES FOR QUERY OPTIMIZATION
-- ----------------------------------------------------------------------------
CREATE INDEX idx_books_title ON books(title);
CREATE INDEX idx_books_author ON books(author);
CREATE INDEX idx_books_category ON books(category_id);
CREATE INDEX idx_students_name ON students(name);
CREATE INDEX idx_students_dept ON students(department);
CREATE INDEX idx_issued_status ON issued_books(status);
CREATE INDEX idx_issued_student ON issued_books(student_id);
CREATE INDEX idx_issued_book ON issued_books(book_id);

-- ----------------------------------------------------------------------------
-- 4. REALISTIC SAMPLE DATA INSERTION
-- ----------------------------------------------------------------------------

-- 4.1 Sample Admin
INSERT INTO admin (username, password, name, email) VALUES
('admin', 'admin123', 'Library Administrator', 'admin@smartlibrary.edu');

-- 4.2 Sample Categories
INSERT INTO categories (name, description) VALUES
('Computer Science & Engineering', 'Software engineering, algorithms, AI, web development, and cloud computing'),
('Information Technology', 'Networking, cybersecurity, database management, and distributed systems'),
('Electronics & Communication', 'Digital electronics, signal processing, VLSI, and embedded systems'),
('Mechanical Engineering', 'Thermodynamics, fluid mechanics, robotics, and machine design'),
('Civil Engineering', 'Structural engineering, surveying, geotechnical, and construction management'),
('Applied Mathematics', 'Calculus, linear algebra, discrete mathematics, and numerical methods'),
('Physics & Materials', 'Quantum physics, optics, semiconductor physics, and mechanics'),
('Management & Humanities', 'Business administration, communication skills, and professional ethics');

-- 4.3 Sample Books
INSERT INTO books (title, author, isbn, category_id, publisher, edition, quantity, available_quantity, shelf_no) VALUES
('Java: The Complete Reference', 'Herbert Schildt', '978-1260440232', 1, 'McGraw-Hill Education', '11th Edition', 10, 8, 'CS-R1-S1'),
('Effective Java', 'Joshua Bloch', '978-0134685991', 1, 'Addison-Wesley Professional', '3rd Edition', 5, 4, 'CS-R1-S2'),
('Introduction to Algorithms', 'Thomas H. Cormen, Charles E. Leiserson', '978-0262033848', 1, 'MIT Press', '3rd Edition', 8, 7, 'CS-R2-S1'),
('Clean Code: A Handbook of Agile Software Craftsmanship', 'Robert C. Martin', '978-0132350884', 1, 'Prentice Hall', '1st Edition', 6, 5, 'CS-R2-S2'),
('Database System Concepts', 'Abraham Silberschatz, Henry Korth', '978-0078022159', 2, 'McGraw-Hill', '7th Edition', 7, 7, 'IT-R1-S1'),
('Computer Networking: A Top-Down Approach', 'James Kurose, Keith Ross', '978-0133594140', 2, 'Pearson', '7th Edition', 6, 5, 'IT-R1-S2'),
('Microelectronic Circuits', 'Adel S. Sedra, Kenneth C. Smith', '978-0199339136', 3, 'Oxford University Press', '7th Edition', 5, 5, 'EC-R1-S1'),
('Signals and Systems', 'Alan V. Oppenheim, Alan S. Willsky', '978-0138147570', 3, 'Prentice Hall', '2nd Edition', 4, 4, 'EC-R1-S2'),
('Shigley\'s Mechanical Engineering Design', 'Richard Budynas, Keith Nisbett', '978-0073398204', 4, 'McGraw-Hill Education', '10th Edition', 5, 5, 'ME-R1-S1'),
('Advanced Engineering Mathematics', 'Erwin Kreyszig', '978-0470458365', 6, 'Wiley', '10th Edition', 8, 8, 'MATH-R1-S1');

-- 4.4 Sample Students
INSERT INTO students (enrollment_no, name, department, semester, email, phone) VALUES
('210010116001', 'Aarav Patel', 'Computer Engineering', 5, 'aarav.patel@college.edu', '9876543210'),
('210010116002', 'Diya Sharma', 'Computer Engineering', 5, 'diya.sharma@college.edu', '9876543211'),
('210010116003', 'Rohan Mehta', 'Information Technology', 3, 'rohan.mehta@college.edu', '9876543212'),
('210010116004', 'Ananya Iyer', 'Electronics & Communication', 6, 'ananya.iyer@college.edu', '9876543213'),
('210010116005', 'Vikram Singh', 'Mechanical Engineering', 4, 'vikram.singh@college.edu', '9876543214'),
('210010116006', 'Pooja Verma', 'Computer Engineering', 7, 'pooja.verma@college.edu', '9876543215');

-- 4.5 Sample Issued Books (Transactions)
-- Student 1 (Aarav) borrowed Java Complete Reference (Book 1) - Still ISSUED
INSERT INTO issued_books (student_id, book_id, issue_date, due_date, return_date, status) VALUES
(1, 1, '2026-08-10', '2026-08-24', NULL, 'ISSUED');

-- Student 2 (Diya) borrowed Effective Java (Book 2) - Still ISSUED
INSERT INTO issued_books (student_id, book_id, issue_date, due_date, return_date, status) VALUES
(2, 2, '2026-08-12', '2026-08-26', NULL, 'ISSUED');

-- Student 3 (Rohan) borrowed Algorithms (Book 3) - Still ISSUED
INSERT INTO issued_books (student_id, book_id, issue_date, due_date, return_date, status) VALUES
(3, 3, '2026-08-15', '2026-08-29', NULL, 'ISSUED');

-- Student 1 (Aarav) borrowed Clean Code (Book 4) - Still ISSUED
INSERT INTO issued_books (student_id, book_id, issue_date, due_date, return_date, status) VALUES
(1, 4, '2026-08-18', '2026-09-01', NULL, 'ISSUED');

-- Student 4 (Ananya) borrowed Computer Networking (Book 6) - Still ISSUED
INSERT INTO issued_books (student_id, book_id, issue_date, due_date, return_date, status) VALUES
(4, 6, '2026-08-20', '2026-09-03', NULL, 'ISSUED');

-- Student 5 (Vikram) previously borrowed Java Complete Reference (Book 1) and RETURNED it
INSERT INTO issued_books (student_id, book_id, issue_date, due_date, return_date, status) VALUES
(5, 1, '2026-07-01', '2026-07-15', '2026-07-14', 'RETURNED');

-- ----------------------------------------------------------------------------
-- 5. VERIFICATION QUERY
-- ----------------------------------------------------------------------------
-- SELECT 'Database initialized successfully!' AS status;
