@echo off
REM ============================================================================
REM Smart Library Management System - Build & Packaging Script (Non-Maven)
REM Uses Java 17, Apache Tomcat Servlet API, JDBC, MySQL, and Gson
REM ============================================================================

echo [1/4] Cleaning previous build output...
if exist "build" rmdir /s /q "build"
if exist "dist" rmdir /s /q "dist"

mkdir "build\WEB-INF\classes"
mkdir "dist"

echo [2/4] Compiling Java source files...
REM Include application runtime JARs + compile-only Servlet API
set CLASSPATH=WebContent\WEB-INF\lib\*;lib-compile\*
if defined TOMCAT_HOME (
    set CLASSPATH=%CLASSPATH%;%TOMCAT_HOME%\lib\*
)
if defined CATALINA_HOME (
    set CLASSPATH=%CLASSPATH%;%CATALINA_HOME%\lib\*
)

set JAVA_FILES=src\com\library\exception\*.java src\com\library\model\*.java src\com\library\dao\*.java src\com\library\util\*.java src\com\library\servlet\*.java

javac -encoding UTF-8 -cp "%CLASSPATH%" -d "build\WEB-INF\classes" %JAVA_FILES%
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Compilation failed! Please ensure Java 17 JDK is in PATH.
    exit /b %ERRORLEVEL%
)

echo [3/4] Copying resources and web assets...
copy "src\db.properties" "build\WEB-INF\classes\db.properties" >nul
xcopy /s /e /y "WebContent\*" "build\" >nul

echo [4/4] Generating WAR package: dist\library-management.war...
cd build
jar -cvf "..\dist\library-management.war" * >nul
cd ..

echo ============================================================================
echo SUCCESS: Generated dist\library-management.war
echo Runtime JARs inside WEB-INF/lib:
echo   - mysql-connector-j-8.0.33.jar
echo   - gson-2.10.1.jar
echo (Servlet API is provided by Tomcat at runtime)
echo Deploy dist\library-management.war directly to Apache Tomcat webapps/
echo ============================================================================
