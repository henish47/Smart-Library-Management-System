# Library Management System

A college-level, full-stack **Library Management System** built with **Java Servlets + JDBC + MySQL** backend and a modern **React (Vite) + Tailwind CSS** frontend.

Designed with a clean layered architecture, manual non-Maven dependency management, ACID-compliant JDBC transactions, and cloud-ready deployments on **Render** (Backend Docker Container) and **Vercel** (Frontend SPA).

---

## 🎯 Project Overview

The **Library Management System** provides an intuitive web platform to automate everyday library operations:
1. **Catalog Management**: Add, view, edit, search, and delete books in the catalog.
2. **Student Directory**: Register, search, view, edit, and manage college students.
3. **Category Classification**: Organize books by academic departments and subjects.
4. **Issue Books**: Borrow available books with automated inventory validation.
5. **Return Books**: Process returns and instantly restore shelf inventory.
6. **Circulation Audit Logs**: Real-time tracking of all borrowing and return transactions.
7. **Interactive Dashboard**: Live summary metrics (Total Books, Total Students, Active Loans, Available Stock).

---

## 🛠️ Technology Stack

### Frontend
- **React 18** (Vite build tool)
- **Tailwind CSS** (Clean, responsive styling)
- **Axios** (Session-aware HTTP API client with `withCredentials: true`)
- **React Router DOM v6** (Client-side routing with Vercel SPA rewrite support)
- **Lucide React** (Modern iconography)

### Backend
- **Java 17 LTS**
- **Java Servlets** (Servlet 4.0 / `javax.servlet.*`)
- **JDBC (Java Database Connectivity)** using `PreparedStatement` & `ResultSet`
- **Apache Tomcat 9** (Servlet container)
- **Google Gson 2.10.1** (JSON parsing and serialization)
- **Multi-Stage Dockerfile** (Debian Temurin JDK 17 $\rightarrow$ Tomcat 9 with dynamic `$PORT`)

### Database & Cloud Services
- **MySQL 8.0+** (`library_management` schema)
- **Aiven Cloud MySQL** (Default cloud database with SSL encryption)
- **Render** (Dockerized production backend)
- **Vercel** (Production frontend hosting)

> **Strictly Avoided / No Unnecessary Frameworks:**
> No Maven, No Spring Boot, No Hibernate, No JSP, No Firebase, No external auth, No fine/penalty calculations.

---

## 🏛️ System Architecture

```text
       ┌────────────────────────────────────────────────────────┐
       │                React Frontend (Vite)                   │
       │   Local: localhost:5173  │  Production: Vercel SPA     │
       └──────────────────────────┬─────────────────────────────┘
                                  │
                                  │ Axios JSON Requests
                                  │ (withCredentials: true for Session)
                                  ▼
       ┌────────────────────────────────────────────────────────┐
       │             Java Servlet API Layer (Tomcat 9)          │
       │   Local: localhost:8080  │  Production: Render Docker  │
       │                                                        │
       │  • CorsFilter        • AuthServlet     • BookServlet   │
       │  • DashboardServlet  • StudentServlet  • CategoryServlet│
       │  • IssuedBookServlet                                   │
       └──────────────────────────┬─────────────────────────────┘
                                  │
                                  │ Data Access Object (DAO Layer)
                                  ▼
       ┌────────────────────────────────────────────────────────┐
       │                 JDBC & DBConnection Layer              │
       │    • PreparedStatement  • Transaction (commit/rollback)│
       │    • Externalized properties via db.properties         │
       └──────────────────────────┬─────────────────────────────┘
                                  │
                                  │ SSL Encrypted TCP (Port 24579/3306)
                                  ▼
       ┌────────────────────────────────────────────────────────┐
       │             MySQL Database (library_management)        │
       │   Cloud: Aiven MySQL (SSL)  │  Localhost: MySQL 8.0+   │
       └────────────────────────────────────────────────────────┘
```

---

## 🌐 Live Cloud Deployment

| Service | Platform | URL |
| :--- | :--- | :--- |
| **Backend API** | Render | `https://smart-library-management-system-6p3k.onrender.com/api` |
| **Test Endpoint** | Render | `https://smart-library-management-system-6p3k.onrender.com/api/books` |
| **Database** | Aiven Cloud | MySQL 8.0 with `sslMode=REQUIRED` on port `24579` |
| **Frontend** | Vercel | Configured with `vercel.json` SPA rewrites |

---

## 🗄️ Database Design (5 Tables)

Database Name: `library_management`

1. **`admin`**: System administrator accounts
   - `id`, `name`, `username`, `email`, `password`, `created_at`
2. **`categories`**: Book subject categories
   - `id`, `name`, `description`
3. **`books`**: Physical book inventory
   - `id`, `title`, `author`, `isbn`, `category_id`, `publisher`, `edition`, `quantity`, `available_quantity`, `shelf_no`, `created_at`
4. **`students`**: Registered college students
   - `id`, `enrollment_no`, `name`, `department`, `semester`, `email`, `phone`, `created_at`
5. **`issued_books`**: Circulation transactions
   - `id`, `student_id`, `book_id`, `issue_date`, `due_date`, `return_date`, `status` (`ISSUED` / `RETURNED`)

---

## 🚀 How to Run Locally

### Prerequisites
- **Java 17 JDK** installed and added to `PATH`
- **Node.js** (v18+) and **npm**
- **Apache Tomcat 9.x** (or deploy via Docker)
- **MySQL 8.0+** (or use the configured Aiven Cloud database)

---

### Step 1: Database Setup
If using **Localhost MySQL**:
1. Open MySQL Command Line or Workbench:
   ```bash
   mysql -u root -p < library-management-backend/database/library_management.sql
   ```

If using **Aiven Cloud MySQL**:
The schema and sample records are already provisioned in the cloud database.

---

### Step 2: Backend Setup & Run

1. Configure `library-management-backend/src/db.properties`:

   **For Aiven Cloud MySQL (Default):**
   ```properties
   db.driver=com.mysql.cj.jdbc.Driver
   db.url=jdbc:mysql://mysql-20ee2aab-henish-smart-library-2026.b.aivencloud.com:24579/library_management?sslMode=REQUIRED
   db.username=avnadmin
   db.password=YOUR_AIVEN_PASSWORD
   ```

   **For Localhost MySQL:**
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
   *This compiles all source files with Java 17 and packages `dist/library-management.war`.*

3. **Deploy to Tomcat**:
   - Copy `dist/library-management.war` into your Tomcat `webapps/` folder.
   - Start Tomcat via `bin/startup.bat`.
   - Local API Base URL: `http://localhost:8080/library-management/api`

---

### Step 3: Frontend Setup & Run

1. Navigate to `frontend/`:
   ```bash
   cd frontend
   npm install
   ```

2. Configure environment variables in `frontend/.env.development` or `frontend/.env.production`:
   ```env
   # Connect to local backend:
   # VITE_API_URL=http://localhost:8080/library-management/api

   # Connect to live Render cloud backend:
   VITE_API_URL=https://smart-library-management-system-6p3k.onrender.com/api
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser at: `http://localhost:5173`

---

## 🐳 Docker Deployment (Render / Cloud Containers)

A multi-stage [Dockerfile](file:///e:/MU/SEM-3/AJT/LibraryManagementSystem/library-management-backend/Dockerfile) is provided for deploying the Java backend to Render, Railway, or Fly.io:

```dockerfile
# Stage 1: Compile Java 17 Servlets and package WAR
FROM eclipse-temurin:17-jdk AS builder
WORKDIR /app
COPY src/ ./src/
COPY WebContent/ ./WebContent/
COPY lib-compile/ ./lib-compile/
RUN mkdir -p build/WEB-INF/classes dist
RUN javac -encoding UTF-8 -cp "WebContent/WEB-INF/lib/*:lib-compile/*" -d build/WEB-INF/classes ...
RUN cd build && jar -cvf ../dist/library-management.war *

# Stage 2: Production Apache Tomcat 9 Runtime
FROM tomcat:9.0-jdk17-temurin
RUN rm -rf /usr/local/tomcat/webapps/*
COPY --from=builder /app/dist/library-management.war /usr/local/tomcat/webapps/ROOT.war
ENV PORT=8080
EXPOSE 8080
CMD ["sh", "-c", "sed -i \"s/port=\\\"8080\\\"/port=\\\"${PORT:-8080}\\\"/g\" /usr/local/tomcat/conf/server.xml && catalina.sh run"]
```

### Key Deployment Features:
- **Root Context (`ROOT.war`)**: Directly exposes API endpoints at `/api/...` without context path prefixes.
- **Dynamic Port Injection**: Reads the cloud provider's `$PORT` environment variable and patches Tomcat's `server.xml` before starting `catalina.sh run`.
- **Environment Variable Overrides**: Database credentials can be overridden at runtime via `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD`.

---

## ⚡ Vercel Deployment (Frontend SPA)

For single-page applications hosted on Vercel, [frontend/vercel.json](file:///e:/MU/SEM-3/AJT/LibraryManagementSystem/frontend/vercel.json) redirects all direct browser requests and page refreshes to `/index.html`:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```
This ensures direct URLs (such as `/books`, `/students`, `/dashboard`) do not produce `404: NOT_FOUND` errors on refresh.

---

## 📖 Key Modules & Backend Architecture

| Module | Purpose | Key Backend Classes |
| :--- | :--- | :--- |
| **Authentication** | Registration, login, logout, and `HttpSession` validation | `AuthServlet.java`, `AdminDAO.java` |
| **Dashboard** | Fetches live metrics (Total Books, Students, Issued, Available) | `DashboardServlet.java` |
| **Books Catalog** | Full CRUD + search by title, author, and ISBN | `BookServlet.java`, `BookDAO.java` |
| **Student Directory** | Full CRUD + search by student name and enrollment number | `StudentServlet.java`, `StudentDAO.java` |
| **Categories** | Classification of book genres with deletion safety checks | `CategoryServlet.java`, `CategoryDAO.java` |
| **Issue Book** | Validates stock, creates loan record, decrements `available_quantity` | `IssuedBookServlet.java`, `IssuedBookDAO.java` |
| **Return Book** | Sets `return_date`, sets `status='RETURNED'`, increments stock | `IssuedBookServlet.java`, `IssuedBookDAO.java` |
| **Transactions** | Complete borrowing audit trail with status filters (`ALL`, `ISSUED`, `RETURNED`) | `IssuedBookServlet.java` |

---

## 💡 Top AJT Viva Questions & Answers

### 1. Why use `PreparedStatement` instead of `Statement`?
`PreparedStatement` pre-compiles SQL queries on the database server, drastically improving performance for repeated queries. Crucially, it parameterizes inputs using placeholders (`?`), completely preventing **SQL Injection attacks** and safely handling special characters and data types.

### 2. How does session authentication work between React and Java Servlets?
When the user logs in, `AuthServlet` validates credentials against MySQL using `AdminDAO`. Upon success, it calls `request.getSession(true)` to create an `HttpSession` storing the authenticated user object. Tomcat returns a session cookie (`JSESSIONID`). The React frontend sends requests using Axios configured with `withCredentials: true`, which automatically attaches the cookie. On protected endpoints, `req.getSession(false)` checks if the session is active.

### 3. How does CORS work with session cookies?
In [CorsFilter.java](file:///e:/MU/SEM-3/AJT/LibraryManagementSystem/library-management-backend/src/com/library/servlet/CorsFilter.java), we dynamically reflect the requesting client origin (`Access-Control-Allow-Origin: <origin>`) and enable `Access-Control-Allow-Credentials: true`. Standard CORS specifications prohibit using `*` (wildcard) when credentials are included, so reflecting the requesting origin ensures seamless authentication across localhost, Render, and Vercel.

### 4. How does Book Issue maintain atomic inventory consistency?
In `IssuedBookDAO.issueBook()`, we use a **JDBC transaction**:
```java
conn.setAutoCommit(false);
// 1. Insert loan record into issued_books
// 2. Decrement available_quantity in books table
conn.commit();
```
If an exception occurs during either operation, `conn.rollback()` is executed in the `catch` block to guarantee that inventory is never decremented without a corresponding issue record.
