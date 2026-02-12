@echo off
title ECHONA - Full Stack Startup
color 0B

echo.
echo ╔═══════════════════════════════════════════════════╗
echo ║           ECHONA Application Startup             ║
echo ║      Starting Backend + Frontend Servers         ║
echo ╚═══════════════════════════════════════════════════╝
echo.

REM Kill any existing servers first
echo Stopping any existing servers...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5001" ^| find "LISTENING"') do (
    if not "%%a"=="0" if not "%%a"=="4" (
        taskkill /F /PID %%a > nul 2>&1
    )
)
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING"') do (
    if not "%%a"=="0" if not "%%a"=="4" (
        taskkill /F /PID %%a > nul 2>&1
    )
)
timeout /t 1 /nobreak > nul

REM Start Backend Server
echo [1/2] Starting Backend Server on port 5001...
start "ECHONA Backend" /MIN cmd /c "cd backend && node server-simple.js"
timeout /t 3 /nobreak > nul

REM Check if backend is running
echo [2/2] Starting Frontend Server on port 3000...
cd frontend
start "ECHONA Frontend" cmd /c "npm run dev"

echo.
echo ╔═══════════════════════════════════════════════════╗
echo ║             ✅ ECHONA is starting!               ║
echo ╠═══════════════════════════════════════════════════╣
echo ║  Backend:  http://localhost:5001                 ║
echo ║  Frontend: http://localhost:3000                 ║
echo ║                                                   ║
echo ║  Wait a few seconds, then open your browser to:  ║
echo ║  👉 http://localhost:3000                        ║
echo ╚═══════════════════════════════════════════════════╝
echo.
echo Press any key to exit this window...
pause > nul
