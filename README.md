# Smart Library Management System (AJT Mini Project)

A simple, basic, college-level full-stack **Smart Library Management System** designed for **Advanced Java Technology (AJT)** Semester 3.

---

## 🎯 Project Overview

This project provides a clean and straightforward web application to manage a college library. It allows library administrators to:
1. **Manage Books**: Add, view, edit, and delete books in the catalog.
2. **Manage Students**: Register, view, edit, and manage college students.
3. **Manage Categories**: Classify books into academic genres/branches.
4. **Issue Books**: Loan available books to registered students.
5. **Return Books**: Accept returned books and automatically restore shelf stock.
6. **Track Transactions**: View complete borrowing and return audit logs.
7. **View Dashboard**: Live overview of Total Books, Total Students, Issued Books, and Available Books.

---

## 🛠️ Technology Stack

### Frontend
- **React JS** (Vite)
- **Tailwind CSS** (Simple, clean styling)
- **Axios** (HTTP API requests with session credentials)
- **React Router DOM** (Simple page routing)

### Backend
- **Java 17 LTS**
- **Java Servlets** (Servlet 4.0 / `javax.servlet.*`)
- **JDBC** (Standard `PreparedStatement` & `ResultSet`)
- **MySQL 8.0+** (`library_management` database)
- **Apache Tomcat 9.x** (Servlet container)
- **Google Gson 2.10.1** (JSON serialization)

> **Strictly Removed / Avoided:**
> No Maven, No Spring Boot, No Hibernate, No JSP, No Firebase, No external auth, No fine/penalty calculations.

---

## 🏛️ Simple Full-Stack Data Flow

```text
React Frontend (localhost:5173)
       │
       ▼ (Axios JSON Requests + Session Cookies)
Java Servlets (Apache Tomcat 9 / port 8080)
       │
       ▼ (Business Logic & Validation)
DAO Layer (JDBC PreparedStatements)
       │
       ▼ (Atomic SQL Queries)
MySQL Database (library_management)
```

---

## 🗄️ Database Structure (5 Simple Tables)

Database Name: `library_management`

1. **`admin`**: System administrator login
   - `id`, `name`, `username`, `email`, `password`
2. **`categories`**: Book subject categories
   - `id`, `name`, `description`
3. **`books`**: Physical book inventory
   - `id`, `title`, `author`, `isbn`, `category_id`, `quantity`, `available_quantity`, `shelf_no`
4. **`students`**: Registered college students
   - `id`, `enrollment_no`, `name`, `department`, `semester`, `email`, `phone`
5. **`issued_books`**: Circulation transactions
   - `id`, `student_id`, `book_id`, `issue_date`, `due_date`, `return_date`, `status` (`ISSUED` / `RETURNED`)

---

## 🚀 How to Run the Project

### Step 1: Database Setup
1. Open MySQL Workbench or MySQL CLI.
2. Execute the database script:
   ```bash
   mysql -u root -p < library-management-backend/database/library_management.sql
   ```

### Step 2: Backend Configuration & Run
1. Verify MySQL password in `library-management-backend/src/db.properties`:
   ```properties
   db.driver=com.mysql.cj.jdbc.Driver
   db.url=jdbc:mysql://localhost:3306/library_management?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC&characterEncoding=UTF-8
   db.username=root
   db.password=
   ```
2. Compile and package the WAR file using the Windows batch script:
   ```cmd
   cd library-management-backend
   build.bat
   ```
3. Deploy `dist/library-management.war` to Apache Tomcat 9's `webapps/` folder and start Tomcat (`bin/startup.bat`).
4. Backend API Base URL: `http://localhost:8080/library-management/api`

### Step 3: Frontend Setup & Run
1. Open a terminal in `frontend/`:
   ```cmd
   cd frontend
   npm install
   npm run dev
   ```
2. Open your browser at: `http://localhost:5173`

---

## 🔑 Default Login Credentials

- **Username**: `admin`
- **Password**: `admin123`

---

## 📖 Key Modules Explained for AJT Viva

| Module | What it does | Key Backend Class |
| :--- | :--- | :--- |
| **Authentication** | Handles admin register, login, logout, and `HttpSession` checking | `AuthServlet.java`, `AdminDAO.java` |
| **Dashboard** | Fetches 4 summary statistics (Total Books, Total Students, Issued Books, Available Books) | `DashboardServlet.java` |
| **Books CRUD** | Add, View, Edit, Delete books, and search by title/author/ISBN | `BookServlet.java`, `BookDAO.java` |
| **Students CRUD** | Register, View, Edit, Delete students, and search by name/enrollment | `StudentServlet.java`, `StudentDAO.java` |
| **Categories CRUD**| Manage subject categories with safety check | `CategoryServlet.java`, `CategoryDAO.java` |
| **Issue Book** | Validates stock, inserts `issued_books` record, decrements `available_quantity` | `IssuedBookServlet.java`, `IssuedBookDAO.java` |
| **Return Book** | Sets `return_date`, sets `status='RETURNED'`, increments `available_quantity` | `IssuedBookServlet.java`, `IssuedBookDAO.java` |
| **Transactions** | Complete audit trail of all issued and returned loans with status filter | `IssuedBookServlet.java` |

---

## 💡 Top AJT Viva Questions & Answers

1. **Why use PreparedStatement instead of Statement?**
   - `PreparedStatement` pre-compiles SQL queries, prevents SQL Injection attacks, and handles parameterized data types safely.
2. **How does user authentication work here?**
   - When the user logs in, `AuthServlet` validates credentials via `AdminDAO` against MySQL and creates an `HttpSession` storing the admin object. On subsequent requests, `req.getSession(false)` checks if the session is active.
3. **How does Book Issue maintain accurate inventory?**
   - In `IssuedBookDAO.issueBook()`, we use a JDBC transaction (`conn.setAutoCommit(false)`). We insert the loan record and decrement `books.available_quantity` by 1. If any step fails, we perform `conn.rollback()` to avoid inconsistencies.
