@echo off
title ECHONA - Health Check
powershell.exe -ExecutionPolicy Bypass -File "%~dp0health-check.ps1"
echo.
pause
