@echo off
setlocal

set "SCRIPT_DIR=%~dp0"
set "TARGET=%SCRIPT_DIR%stop-all-services.ps1"

if not exist "%TARGET%" (
    echo Missing script: %TARGET%
    exit /b 1
)

echo Stopping ECHONA via unified stop script...
powershell -ExecutionPolicy Bypass -File "%TARGET%"
