@echo off
echo ================================================
echo Comic Reader Site - Database Setup
echo ================================================
echo.
echo Connecting to Aiven MySQL Database...
echo Host: web-welpweb.l.aivencloud.com:13658
echo Database: defaultdb
echo.

REM Change to the Comic directory
cd /d "%~dp0Comic"

REM Run the SQL setup script
echo Running database setup script...
mysql -h web-welpweb.l.aivencloud.com -P 13658 -u avnadmin -pAVNS_WRR4qdO4pISviLaP54c defaultdb < database_setup_users.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ================================================
    echo Database setup completed successfully!
    echo ================================================
    echo.
    echo Tables created:
    echo - users
    echo - manga
    echo - chapters
    echo - followers
    echo - feed_posts
    echo - comments
    echo.
    echo Sample data inserted:
    echo - User: the_lemonking
    echo - Manga: SnakeFace, One Piece, Naruto, Bleach, Attack on Titan
    echo - Chapters for SnakeFace
    echo.
) else (
    echo.
    echo ================================================
    echo ERROR: Database setup failed!
    echo ================================================
    echo.
    echo Please check:
    echo 1. MySQL client is installed
    echo 2. Network connection to Aiven
    echo 3. Database credentials are correct
    echo.
)

pause

