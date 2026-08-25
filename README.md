# Smart Library Management System

> **College AJT Mini Project - Smart Library Management System**

A full-featured Library Management System designed with a layered architecture:
- **Backend**: Java Servlets, JDBC, MySQL, Apache Tomcat (Standard Dynamic Web Application)
- **Database**: MySQL 8.0+ (`library_management`)
- **Frontend**: React JS (Stage 2 implementation)

---

## 📁 Repository Structure

```text
Smart-Library-Management-System/
├── README.md                                  # Root Project Overview
├── .gitignore                                 # Git Ignore Rules
└── library-management-backend/                # Java Servlet Backend
    ├── build.bat                              # 1-Click Build & WAR Packaging Script
    ├── README.md                              # Backend & API Documentation
    ├── database/
    │   └── library_management.sql             # MySQL Schema & Realistic Sample Data
    ├── docs/
    │   └── database-design.md                 # ER Diagrams & Schema Specs
    ├── WebContent/                            # Web Application Root
    │   └── WEB-INF/
    │       ├── web.xml                        # Servlet Declarations & CORS Filter
    │       └── lib/                           # Manually Managed Dependencies
    │           ├── gson-2.10.1.jar            # Google Gson JSON Library
    │           └── mysql-connector-j-8.0.33.jar# MySQL JDBC Driver
    └── src/
        ├── db.properties                      # Database Configuration
        └── com/library/                       # Java Source Files (MVC/DAO Architecture)
            ├── model/                         # POJOs (Book, Student, Category, IssuedBook)
            ├── dao/                           # JDBC DAOs (PreparedStatement & Transactions)
            ├── servlet/                       # REST Servlets & CorsFilter
            ├── util/                          # DBConnection, ApiResponse, JsonUtil
            └── exception/                     # Custom Exception Classes
```

---

## 🚀 Getting Started

### 1. Database Setup
Execute `library-management-backend/database/library_management.sql` in MySQL Workbench or via terminal:
```bash
mysql -u root -p < library-management-backend/database/library_management.sql
```

### 2. Configure Database Credentials
Edit `library-management-backend/src/db.properties`:
```properties
db.driver=com.mysql.cj.jdbc.Driver
db.url=jdbc:mysql://localhost:3306/library_management?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC&characterEncoding=UTF-8
db.username=root
db.password=your_mysql_password
```

### 3. Run Backend on Apache Tomcat
- **In Eclipse / IntelliJ**: Import `library-management-backend` and Run on **Apache Tomcat 9.0**.
- **Standalone Tomcat**: Run `build.bat` inside `library-management-backend` and deploy the generated `dist/library-management.war` to Tomcat's `webapps/` folder.

---

## 📚 API Endpoints Summary

- **Books**: `GET /api/books`, `POST /api/books`, `PUT /api/books`, `DELETE /api/books?id=1`
- **Students**: `GET /api/students`, `POST /api/students`, `PUT /api/students`, `DELETE /api/students?id=1`
- **Categories**: `GET /api/categories`, `POST /api/categories`, `PUT /api/categories`, `DELETE /api/categories?id=1`
- **Borrow / Return**: `GET /api/issued-books`, `POST /api/issued-books/issue`, `POST /api/issued-books/return`

For detailed API docs, check [`library-management-backend/README.md`](library-management-backend/README.md).
