@echo off
REM ========================================
REM ECHONA - Stop All Services (Batch)
REM ========================================
title ECHONA - Stopping Services
color 0C

echo ========================================
echo ECHONA - Stopping All Services
echo ========================================
echo.

REM Run the PowerShell script
powershell.exe -ExecutionPolicy Bypass -File "%~dp0stop-all-services.ps1"

pause
