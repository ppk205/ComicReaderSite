@echo off
echo Starting Comic Reader Dashboard...
echo.
echo Backend Configuration:
echo - Expected URL: http://localhost:8080
echo - Make sure Tomcat is running with CORS enabled
echo.
echo User Accounts for Testing:
echo - admin/admin (Full permissions)
echo - moderator/moderator (Content moderation)  
echo - editor/editor (Content creation)
echo - reader/reader (Read only - no dashboard access)
echo.
echo Starting development server...
npm run dev