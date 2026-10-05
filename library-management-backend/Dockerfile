# ==============================================================================
# Smart Library Management System - Dockerfile (Production Tomcat 9 + JDK 17)
# ==============================================================================
# Multi-stage Docker build:
# Stage 1: Compiles Java Servlet backend from source into standard WAR package
# Stage 2: Deploys WAR as ROOT.war to Apache Tomcat 9 with dynamic $PORT support
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Build & Package WAR
# ------------------------------------------------------------------------------
FROM eclipse-temurin:17-jdk AS builder

WORKDIR /app

# Copy source code, libraries, and web assets
COPY src/ ./src/
COPY WebContent/ ./WebContent/
COPY lib-compile/ ./lib-compile/

# Create build output directories
RUN mkdir -p build/WEB-INF/classes dist

# Compile Java source files using compile-time Servlet API & runtime JARs
RUN javac -encoding UTF-8 \
    -cp "WebContent/WEB-INF/lib/*:lib-compile/*" \
    -d build/WEB-INF/classes \
    src/com/library/exception/*.java \
    src/com/library/model/*.java \
    src/com/library/dao/*.java \
    src/com/library/util/*.java \
    src/com/library/servlet/*.java

# Copy db.properties and WebContent assets into build folder
RUN cp src/db.properties build/WEB-INF/classes/db.properties && \
    cp -r WebContent/* build/

# Package into standard WAR archive
RUN cd build && jar -cvf ../dist/library-management.war *

# ------------------------------------------------------------------------------
# Stage 2: Production Apache Tomcat 9 Runtime
# ------------------------------------------------------------------------------
FROM tomcat:9.0-jdk17-temurin

# Remove default Tomcat web applications
RUN rm -rf /usr/local/tomcat/webapps/*

# Deploy compiled WAR as ROOT.war for direct root context routing (e.g. /api/books)
COPY --from=builder /app/dist/library-management.war /usr/local/tomcat/webapps/ROOT.war

# Default HTTP port (Render, Railway, Fly.io, etc. override via PORT environment variable)
ENV PORT=8080
EXPOSE 8080

# Configure Tomcat to dynamically bind to the $PORT environment variable and run
CMD ["sh", "-c", "sed -i \"s/port=\\\"8080\\\"/port=\\\"${PORT:-8080}\\\"/g\" /usr/local/tomcat/conf/server.xml && catalina.sh run"]
