@echo off
echo Starting Comic Reader Site with Admin Dashboard...
echo.

echo Starting Spring Boot Backend...
cd /d "d:\phuc\Code Project\ComicReaderSite\Comic"
start cmd /k "./mvnw spring-boot:run"

echo Waiting for backend to start...
timeout /t 10 /nobreak > nul

echo Starting Next.js Frontend...
cd /d "d:\phuc\Code Project\ComicReaderSite\ComicReaderSite"
start cmd /k "npm run dev"

echo.
echo Both services are starting...
echo Backend (Spring Boot): http://localhost:8080
echo Frontend (Next.js): http://localhost:3000
echo Admin Dashboard: http://localhost:3000/admin
echo.
echo Press any key to exit...
pause > nul
