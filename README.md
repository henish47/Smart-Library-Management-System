# Smart Library Management System

> **College AJT Mini Project - Smart Library Management System**

A complete full-stack **Smart Library Management System** developed using a clean layered architecture:
- **Backend**: Java 17, Java Servlets (`javax.servlet.*`), JDBC, MySQL, Apache Tomcat 9, Google Gson (No Maven, No Spring Boot, No Hibernate)
- **Frontend**: React 18, Vite, Tailwind CSS, Axios, React Router DOM, Lucide Icons
- **Database**: MySQL 8.0+ (`library_management`)

---

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [Technology Stack](#-technology-stack)
3. [Architecture & Data Flow](#-architecture--data-flow)
4. [Database Setup](#-database-setup)
5. [Backend Setup & Execution](#-backend-setup--execution)
6. [Frontend Setup & Execution](#-frontend-setup--execution)
7. [Authentication Flow](#-authentication-flow)
8. [REST API Endpoints Reference](#-rest-api-endpoints-reference)
9. [Key Features & User Interface](#-key-features--user-interface)
10. [Strict Project Constraints Compliance](#-strict-project-constraints-compliance)
11. [Testing & Verification Guide](#-testing--verification-guide)

---

## 🌟 Project Overview

The **Smart Library Management System** manages library catalog inventory, student memberships, genre classifications, and circulation workflows (issuing and returning books) with real-time stock management and audit logging.

### Key Highlights
- **100% Free & Local Stack**: Zero paid services, zero external authentication, zero cloud databases.
- **Session-Based Authentication**: Simple, secure `HttpSession` authentication stored in MySQL `admin` table.
- **Atomic JDBC Transactions**: `setAutoCommit(false)`, `commit()`, and `rollback()` for book issue and return operations to maintain strict inventory consistency.
- **Responsive Modern UI**: Built with React and Tailwind CSS featuring dashboards, modals, search filters, loan history, and client-side CSV exports.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS 3, Axios, React Router DOM 6, Lucide Icons |
| **Backend** | Java 17 LTS, Java Servlets (Servlet 4.0 / `javax.servlet.*`), JDBC, Google Gson 2.10.1 |
| **Database** | MySQL 8.0+ (InnoDB Engine with ACID Transactions) |
| **Web Server** | Apache Tomcat 9.x |
| **Build & Deploy**| Windows `build.bat` for WAR packaging, `npm run dev` / `npm run build` for React |

---

## 🏛️ Architecture & Data Flow

```text
React Single Page App (Browser)
   │
   │  [HTTP / JSON + Session Cookies (withCredentials)]
   ▼
CorsFilter (CORS & Preflight Handling)
   │
   ▼
Java Servlet Layer (AuthServlet, BookServlet, StudentServlet, CategoryServlet, IssuedBookServlet, DashboardServlet)
   │
   │  [Input Validation & Business Logic]
   ▼
DAO Layer (AdminDAO, BookDAO, StudentDAO, CategoryDAO, IssuedBookDAO)
   │
   │  [PreparedStatement & Atomic Transactions (commit/rollback)]
   ▼
MySQL Database (library_management)
```

---

## 🗄️ Database Setup

### Step 1: Execute SQL Script in MySQL Workbench / CLI
```bash
mysql -u root -p < library-management-backend/database/library_management.sql
```
*Or in MySQL Workbench:*
1. Go to **File** > **Open SQL Script...**
2. Choose [`library-management-backend/database/library_management.sql`](library-management-backend/database/library_management.sql).
3. Click the **⚡ (Execute)** icon.

### Core Tables:
1. `admin`: Administrator accounts (`id`, `username`, `password`, `name`, `email`, `created_at`)
2. `categories`: Book subject disciplines (`id`, `name`, `description`)
3. `books`: Catalog inventory (`id`, `title`, `author`, `isbn`, `category_id`, `publisher`, `edition`, `quantity`, `available_quantity`, `shelf_no`)
4. `students`: Student directory (`id`, `enrollment_no`, `name`, `department`, `semester`, `email`, `phone`)
5. `issued_books`: Borrowing transactions (`id`, `student_id`, `book_id`, `issue_date`, `due_date`, `return_date`, `status`)

---

## ⚙️ Backend Setup & Execution

### 1. Database Configuration
Edit [`library-management-backend/src/db.properties`](library-management-backend/src/db.properties):
```properties
db.driver=com.mysql.cj.jdbc.Driver
db.url=jdbc:mysql://localhost:3306/library_management?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC&characterEncoding=UTF-8
db.username=root
db.password=your_mysql_password
```
*(If MySQL has no password, leave `db.password=` empty).*

### 2. Build WAR Package
Run [`build.bat`](library-management-backend/build.bat) inside `library-management-backend`:
```cmd
cd library-management-backend
build.bat
```
* This compiles all Java source files and generates `dist/library-management.war`.

### 3. Deploy on Apache Tomcat 9
- **Option A (Standalone Tomcat)**: Copy `dist/library-management.war` into Tomcat's `webapps/` folder and execute `bin/startup.bat`.
- **Option B (IDE Deployment)**: Import `library-management-backend` in Eclipse IDE (Dynamic Web Project) or IntelliJ IDEA Ultimate and run on Tomcat 9.
- **Backend Base URL**: `http://localhost:8080/library-management/api`

---

## 💻 Frontend Setup & Execution

1. Open a terminal in the `frontend/` directory:
   ```cmd
   cd frontend
   ```
2. Install npm dependencies (if not already installed):
   ```cmd
   npm install
   ```
3. Start the Vite React development server:
   ```cmd
   npm run dev
   ```
4. Open your browser at:
   ```text
   http://localhost:5173
   ```

---

## 🔐 Authentication Flow

1. **Register**: `POST /api/auth/register` (creates administrator in `admin` table; passwords are never exposed in API responses).
2. **Login**: `POST /api/auth/login` (authenticates credentials and binds `Admin` to an active `HttpSession`).
3. **Session Check**: `GET /api/auth/session` (called on React startup to automatically restore authenticated state).
4. **Logout**: `POST /api/auth/logout` (invalidates `HttpSession` and redirects to `/login`).

---

## 📡 REST API Endpoints Reference

### 1. Authentication (`/api/auth`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new admin account |
| `POST` | `/api/auth/login` | Sign in with username & password |
| `POST` | `/api/auth/logout` | Invalidate current session |
| `GET` | `/api/auth/session` | Check active login session |

### 2. Dashboard (`/api/dashboard`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/dashboard` | Aggregated counts, category breakdown & recent 5 transactions |

### 3. Books (`/api/books`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/books` | Get all books (or single book with `?id=1`) |
| `GET` | `/api/books?search=keyword`| Search books across title, author, ISBN, shelf |
| `POST` | `/api/books` | Add a new book |
| `PUT` | `/api/books` | Update book details |
| `DELETE`| `/api/books?id=1` | Delete a book (validates active loans) |

### 4. Students (`/api/students`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/students` | Get all students (or single student with `?id=1`) |
| `GET` | `/api/students?search=query`| Search by enrollment no, name, branch, email |
| `POST` | `/api/students` | Register student |
| `PUT` | `/api/students` | Update student profile |
| `DELETE`| `/api/students?id=1` | Delete student (validates active loans) |

### 5. Categories (`/api/categories`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/categories` | Get all categories |
| `POST` | `/api/categories` | Create category |
| `PUT` | `/api/categories` | Update category |
| `DELETE`| `/api/categories?id=1` | Delete category (checks book dependencies) |

### 6. Issued Books / Transactions (`/api/issued-books`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/issued-books` | Get all loans (supports `?status=ISSUED` or `?status=RETURNED`) |
| `GET` | `/api/issued-books?studentId=1` | Get issue history of a student |
| `POST` | `/api/issued-books/issue` | Borrow book (decrements stock by 1) |
| `POST` | `/api/issued-books/return`| Return book (increments stock by 1) |

---

## 🖥️ Key Features & User Interface

1. **Dashboard**: Real-time KPI metric cards, quick-action shortcuts, category distribution progress bars, and latest transactions.
2. **Books Inventory**: Table catalog with live search, category filter, stock status indicators, add/edit/delete modals.
3. **Students Directory**: Student directory with search, profile modal, and student borrowing history modal.
4. **Categories**: Subject discipline manager with book reference protection.
5. **Issue Book**: Workflow to pick student, pick available book, set due date, and issue in a transaction.
6. **Return Book**: Desk showing unreturned loans with 1-click return confirmation.
7. **Transactions**: Full circulation audit log with status filters (All / Issued / Returned) and search.
8. **Reports & CSV Export**: Tabbed reporting on inventory, borrowers, students, and circulation with 1-click client-side CSV downloads.
9. **Profile**: Administrator profile card with system environment and technical specifications.

---

## 🚫 Strict Project Constraints Compliance

- **No Fine / Overdue Calculation**: Only records dates, status (`ISSUED`/`RETURNED`), and available quantities.
- **No Spring Boot / Hibernate**: Pure Java Servlets + JDBC + PreparedStatement.
- **No Maven**: Built cleanly via standard Dynamic Web Project and `build.bat`.
- **No Paid or External Services**: Runs 100% locally.

---

## 🧪 Testing & Verification Guide

### Default Admin Credentials:
- **Username**: `admin`
- **Password**: `admin123`

### Sample Test Steps:
1. **Login**: Open `http://localhost:5173`, sign in with `admin` / `admin123`.
2. **Dashboard**: Verify live stats loaded from MySQL.
3. **Add Book**: Navigate to Books $\rightarrow$ Click **Add New Book** $\rightarrow$ Fill details $\rightarrow$ Save.
4. **Issue Book**: Navigate to **Issue Book** $\rightarrow$ Select Student and Book $\rightarrow$ Click **Confirm & Issue**.
5. **Check Inventory**: Verify the book's available quantity decreased by 1.
6. **Return Book**: Navigate to **Return Book** $\rightarrow$ Click **Return Book** $\rightarrow$ Confirm.
7. **Export Reports**: Navigate to **Reports** $\rightarrow$ Click **Export to CSV** to download a CSV spreadsheet.
