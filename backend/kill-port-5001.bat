@echo off
echo Killing process on port 5001...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5001" ^| find "LISTENING"') do (
    echo Found process %%a using port 5001
    taskkill /F /PID %%a
)
echo Port 5001 is now free!
timeout /t 2 /nobreak > nul
