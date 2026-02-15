@echo off
title ECHONA - Startup
color 0B

echo Starting ECHONA with unified startup script...
powershell.exe -ExecutionPolicy Bypass -File "%~dp0start-all-services.ps1"

echo.
echo Press any key to exit this window...
pause > nul
