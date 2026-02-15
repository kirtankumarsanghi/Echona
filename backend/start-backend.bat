@echo off
title ECHONA Backend Server
color 0A
echo.
echo ╔════════════════════════════════════════════╗
echo ║      Starting ECHONA Backend Server       ║
echo ╚════════════════════════════════════════════╝
echo.

cd /d "%~dp0"

REM Kill any existing process on port 5000
echo Checking for existing server on port 5000...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5000" ^| find "LISTENING"') do (
    if not "%%a"=="0" if not "%%a"=="4" (
        echo Found process %%a, killing it...
        taskkill /F /PID %%a > nul 2>&1
    )
)
timeout /t 1 /nobreak > nul
echo.

:START
echo [%TIME%] Starting backend server...
node server.js

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Server crashed with error code %ERRORLEVEL%
    echo 🔄 Restarting in 3 seconds...
    echo.
    timeout /t 3 /nobreak > nul
    goto START
) else (
    echo.
    echo ✅ Server stopped gracefully
    pause
)
