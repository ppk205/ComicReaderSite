@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
title ComicReaderSite - Project Runner

:: ============================================================
::  CẤU HÌNH - Chỉnh sửa đường dẫn Tomcat nếu cần
:: ============================================================
set TOMCAT_HOME=C:\Program Files\Apache Software Foundation\Tomcat 10.1
set PROJECT_ROOT=%~dp0
set BACKEND_DIR=%PROJECT_ROOT%Comic
set FRONTEND_DIR=%PROJECT_ROOT%ComicReaderSite

:: ── Load environment variables from Comic\.env ──────────────────────────────
if exist "%BACKEND_DIR%\.env" (
    echo [ENV] Loading environment variables from Comic\.env ...
    for /f "usebackq tokens=1,* delims==" %%A in ("%BACKEND_DIR%\.env") do (
        set line=%%A
        if not "!line:~0,1!"=="#" if not "%%A"=="" (
            set "%%A=%%B"
        )
    )
) else (
    echo [CANH BAO] Khong tim thay Comic\.env
    echo           Sao chep Comic\.env.example thanh Comic\.env va dien thong tin.
    echo           Backend se khong khoi dong duoc neu thieu bien moi truong.
    echo.
)

:MENU
cls
echo ╔══════════════════════════════════════════════════════╗
echo ║           ComicReaderSite - Project Runner           ║
echo ║              (Chay truc tiep, khong Docker)          ║
echo ╚══════════════════════════════════════════════════════╝
echo.
echo  [1] Chay ca Frontend va Backend (2 cua so moi)
echo  [2] Chay Frontend thoi  (Next.js - npm run dev)
echo  [3] Build + Deploy Backend len Tomcat
echo  [4] Khoi dong Tomcat
echo  [5] Dung Tomcat
echo  [6] Kiem tra cau hinh (Java, Node, Maven, Tomcat)
echo  [7] Thoat
echo.
set /p choice="  Chon tuy chon (1-7): "

if "%choice%"=="1" goto RUN_ALL
if "%choice%"=="2" goto RUN_FRONTEND
if "%choice%"=="3" goto BUILD_BACKEND
if "%choice%"=="4" goto START_TOMCAT
if "%choice%"=="5" goto STOP_TOMCAT
if "%choice%"=="6" goto CHECK_ENV
if "%choice%"=="7" goto EXIT
echo  Lua chon khong hop le. Vui long thu lai.
timeout /t 2 >nul
goto MENU

:: ============================================================
:RUN_ALL
:: ============================================================
cls
echo [*] Dang khoi dong Frontend va Backend...
echo.

:: Khoi dong Frontend trong cua so moi
start "ComicReaderSite - Frontend" cmd /k "cd /d "%FRONTEND_DIR%" && echo [Frontend] Dang khoi dong... && npm run dev"

:: Build va deploy backend
call :DO_BUILD_BACKEND
if %errorlevel% neq 0 (
    echo [LOI] Build backend that bai!
    pause
    goto MENU
)

:: Khoi dong Tomcat
call :DO_START_TOMCAT

echo.
echo [OK] He thong da khoi dong!
echo      Frontend : http://localhost:3000
echo      Backend  : http://localhost:8080
echo.
pause
goto MENU

:: ============================================================
:RUN_FRONTEND
:: ============================================================
cls
echo [*] Chay Frontend (Next.js dev server)...
echo [*] URL: http://localhost:3000
echo [*] Nhan Ctrl+C de dung.
echo.
cd /d "%FRONTEND_DIR%"
npm run dev
cd /d "%PROJECT_ROOT%"
goto MENU

:: ============================================================
:BUILD_BACKEND
:: ============================================================
cls
call :DO_BUILD_BACKEND
if %errorlevel%==0 (
    echo.
    echo [OK] Build va deploy backend thanh cong!
    echo      WAR da copy vao Tomcat webapps\ROOT.war
) else (
    echo.
    echo [LOI] Build that bai. Kiem tra log Maven phia tren.
)
echo.
pause
goto MENU

:DO_BUILD_BACKEND
echo [*] Dang build Backend (Maven)...
cd /d "%BACKEND_DIR%"
call mvn clean package -DskipTests -q
if %errorlevel% neq 0 (
    cd /d "%PROJECT_ROOT%"
    exit /b 1
)
echo [*] Copy WAR vao Tomcat...
if not exist "%TOMCAT_HOME%\webapps" (
    echo [LOI] Khong tim thay Tomcat tai: %TOMCAT_HOME%
    echo       Vui long chinh lai bien TOMCAT_HOME trong file bat nay.
    cd /d "%PROJECT_ROOT%"
    exit /b 1
)
:: Xoa webapps cu, copy WAR moi
if exist "%TOMCAT_HOME%\webapps\ROOT" rmdir /s /q "%TOMCAT_HOME%\webapps\ROOT"
if exist "%TOMCAT_HOME%\webapps\ROOT.war" del /q "%TOMCAT_HOME%\webapps\ROOT.war"
copy /y "target\Comic.war" "%TOMCAT_HOME%\webapps\ROOT.war" >nul
cd /d "%PROJECT_ROOT%"
exit /b 0

:: ============================================================
:START_TOMCAT
:: ============================================================
cls
call :DO_START_TOMCAT
pause
goto MENU

:DO_START_TOMCAT
echo [*] Dang khoi dong Tomcat...
if not exist "%TOMCAT_HOME%\bin\startup.bat" (
    echo [LOI] Khong tim thay Tomcat tai: %TOMCAT_HOME%
    echo       Vui long chinh lai bien TOMCAT_HOME trong file bat nay.
    exit /b 1
)
:: Pass DB credentials as JVM system properties so persistence.xml can read them
set "JAVA_OPTS=-DDB_URL=%DB_URL% -DDB_USER=%DB_USER% -DDB_PASSWORD=%DB_PASSWORD%"
call "%TOMCAT_HOME%\bin\startup.bat"
echo [OK] Tomcat da khoi dong: http://localhost:8080
exit /b 0

:: ============================================================
:STOP_TOMCAT
:: ============================================================
cls
echo [*] Dang dung Tomcat...
if not exist "%TOMCAT_HOME%\bin\shutdown.bat" (
    echo [LOI] Khong tim thay Tomcat tai: %TOMCAT_HOME%
    pause
    goto MENU
)
call "%TOMCAT_HOME%\bin\shutdown.bat"
echo [OK] Da dung Tomcat.
pause
goto MENU

:: ============================================================
:CHECK_ENV
:: ============================================================
cls
echo [*] Kiem tra moi truong...
echo.
echo --- Java ---
java -version 2>&1
echo.
echo --- Maven ---
mvn -version 2>&1
echo.
echo --- Node.js ---
node -v 2>&1
echo.
echo --- npm ---
npm -v 2>&1
echo.
echo --- Tomcat ---
if exist "%TOMCAT_HOME%\bin\startup.bat" (
    echo OK: Tim thay Tomcat tai %TOMCAT_HOME%
) else (
    echo CANH BAO: Khong tim thay Tomcat tai %TOMCAT_HOME%
    echo           Chinh lai bien TOMCAT_HOME dau file bat nay.
)
echo.
pause
goto MENU

:: ============================================================
:EXIT
:: ============================================================
cls
echo  Tam biet!
timeout /t 1 >nul
exit
