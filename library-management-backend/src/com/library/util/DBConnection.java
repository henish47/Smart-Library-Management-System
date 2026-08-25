package com.library.util;

import com.library.exception.DatabaseException;

import java.io.InputStream;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Properties;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Centralized Database Connection Manager for the Smart Library Management System.
 * Loads configuration from 'db.properties' with support for environment variable
 * overrides and safe defaults.
 */
public class DBConnection {

    private static final Logger LOGGER = Logger.getLogger(DBConnection.class.getName());

    private static final String DEFAULT_DRIVER = "com.mysql.cj.jdbc.Driver";
    private static final String DEFAULT_URL = "jdbc:mysql://localhost:3306/library_management?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC&characterEncoding=UTF-8";
    private static final String DEFAULT_USERNAME = "root";
    private static final String DEFAULT_PASSWORD = "root";

    private static String dbDriver = DEFAULT_DRIVER;
    private static String dbUrl = DEFAULT_URL;
    private static String dbUsername = DEFAULT_USERNAME;
    private static String dbPassword = DEFAULT_PASSWORD;

    static {
        loadConfiguration();
        loadDriver();
    }

    /**
     * Loads database configuration from classpath 'db.properties', file locations, or environment variables.
     */
    private static void loadConfiguration() {
        Properties props = new Properties();
        boolean loaded = false;

        // 1. Try ClassLoader
        try (InputStream in = DBConnection.class.getClassLoader().getResourceAsStream("db.properties")) {
            if (in != null) {
                props.load(in);
                loaded = true;
                LOGGER.info("Database configuration loaded from ClassLoader resource 'db.properties'");
            }
        } catch (Exception ignored) {}

        // 2. Try Class root resource
        if (!loaded) {
            try (InputStream in = DBConnection.class.getResourceAsStream("/db.properties")) {
                if (in != null) {
                    props.load(in);
                    loaded = true;
                    LOGGER.info("Database configuration loaded from Class root '/db.properties'");
                }
            } catch (Exception ignored) {}
        }

        // 3. Try File system fallbacks
        if (!loaded) {
            String[] fallbackPaths = {"src/db.properties", "WebContent/WEB-INF/classes/db.properties", "db.properties"};
            for (String path : fallbackPaths) {
                java.io.File file = new java.io.File(path);
                if (file.exists()) {
                    try (InputStream in = new java.io.FileInputStream(file)) {
                        props.load(in);
                        loaded = true;
                        LOGGER.info("Database configuration loaded from file path: " + file.getAbsolutePath());
                        break;
                    } catch (Exception ignored) {}
                }
            }
        }

        if (loaded) {
            dbDriver = props.getProperty("db.driver", DEFAULT_DRIVER).trim();
            dbUrl = props.getProperty("db.url", DEFAULT_URL).trim();
            dbUsername = props.getProperty("db.username", DEFAULT_USERNAME).trim();
            dbPassword = props.getProperty("db.password", DEFAULT_PASSWORD).trim();
        } else {
            LOGGER.warning("db.properties not found. Using default configurations / environment variables.");
        }

        // Allow environment variables to override properties if present
        String envUrl = System.getenv("DB_URL");
        if (envUrl != null && !envUrl.trim().isEmpty()) {
            dbUrl = envUrl.trim();
        }

        String envUser = System.getenv("DB_USERNAME");
        if (envUser != null && !envUser.trim().isEmpty()) {
            dbUsername = envUser.trim();
        }

        String envPass = System.getenv("DB_PASSWORD");
        if (envPass != null) {
            dbPassword = envPass.trim();
        }
    }

    /**
     * Registers MySQL JDBC Driver.
     */
    private static void loadDriver() {
        try {
            Class.forName(dbDriver);
            LOGGER.info("MySQL JDBC Driver registered successfully: " + dbDriver);
        } catch (ClassNotFoundException e) {
            LOGGER.log(Level.SEVERE, "MySQL JDBC Driver not found: " + dbDriver, e);
            throw new DatabaseException("MySQL JDBC Driver not found. Please verify mysql-connector-java is on the classpath.", e);
        }
    }

    /**
     * Obtains a new active JDBC Connection to the MySQL database.
     *
     * @return Connection object
     * @throws DatabaseException if connection fails
     */
    public static Connection getConnection() throws DatabaseException {
        try {
            return DriverManager.getConnection(dbUrl, dbUsername, dbPassword);
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Failed to establish database connection to: " + dbUrl, e);
            throw new DatabaseException("Unable to connect to the database. Please check MySQL server status and credentials.", e);
        }
    }

    /**
     * Tests if the database connection can be established.
     *
     * @return true if connection succeeds, false otherwise
     */
    public static boolean testConnection() {
        try (Connection conn = getConnection()) {
            return conn != null && !conn.isClosed();
        } catch (Exception e) {
            LOGGER.log(Level.WARNING, "Database connection test failed: " + e.getMessage());
            return false;
        }
    }

    // Getters for configuration (useful for diagnostics/testing)
    public static String getDbUrl() {
        return dbUrl;
    }

    public static String getDbUsername() {
        return dbUsername;
    }

    /**
     * Helper to set custom credentials at runtime (useful for unit testing).
     */
    public static void setCustomConfig(String url, String username, String password) {
        dbUrl = url;
        dbUsername = username;
        dbPassword = password;
    }
}
