@echo off
title ECHONA - Stop All Servers
color 0C

echo.
echo ╔═══════════════════════════════════════════════════╗
echo ║         Stopping All ECHONA Servers              ║
echo ╚═══════════════════════════════════════════════════╝
echo.

echo Stopping processes on port 5001 (Backend)...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5001" ^| find "LISTENING"') do (
    if not "%%a"=="0" if not "%%a"=="4" (
        echo   Killing PID %%a
        taskkill /F /PID %%a > nul 2>&1
    )
)

echo Stopping processes on port 3000 (Frontend)...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING"') do (
    if not "%%a"=="0" if not "%%a"=="4" (
        echo   Killing PID %%a
        taskkill /F /PID %%a > nul 2>&1
    )
)

echo.
echo ✅ All ECHONA servers have been stopped!
echo.
timeout /t 2 /nobreak > nul
