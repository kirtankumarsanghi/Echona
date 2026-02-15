@echo off
REM ECHONA PRO - Complete Startup Script (Batch Version)
REM This batch file will execute the PowerShell startup script

title ECHONA PRO - Starting Application

echo.
echo =====================================================
echo    ECHONA PRO - Complete Application Startup
echo =====================================================
echo.

REM Execute the PowerShell script
powershell -ExecutionPolicy Bypass -File "%~dp0start-echona-complete.ps1"

pause
