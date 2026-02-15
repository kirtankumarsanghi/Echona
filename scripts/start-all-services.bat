@echo off
REM ========================================
REM ECHONA - Start All Services (Batch)
REM ========================================
title ECHONA - Starting Services
color 0B

echo ========================================
echo ECHONA - Starting All Services
echo ========================================
echo.

REM Run the PowerShell script
powershell.exe -ExecutionPolicy Bypass -File "%~dp0start-all-services.ps1"

pause
