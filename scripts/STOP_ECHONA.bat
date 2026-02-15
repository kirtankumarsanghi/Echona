@echo off
REM ECHONA PRO - Complete Stop Script (Batch Version)
REM This batch file will execute the PowerShell stop script

title ECHONA PRO - Stopping Application

echo.
echo =====================================================
echo    ECHONA PRO - Stopping All Services
echo =====================================================
echo.

REM Execute the PowerShell script
powershell -ExecutionPolicy Bypass -File "%~dp0stop-echona-complete.ps1"

pause
