@echo off
echo ================================================
echo    ECHONA - Spotify Connection Test
echo ================================================
echo.

REM Check if backend is running
echo [1/4] Checking if backend is running...
powershell -Command "try { $r = Invoke-RestMethod 'http://localhost:5000/health' -TimeoutSec 3; Write-Host '   ✓ Backend is running on port 5000' -ForegroundColor Green } catch { Write-Host '   ✗ Backend is NOT running!' -ForegroundColor Red; Write-Host '   → Run: cd backend && npm start' -ForegroundColor Yellow; exit 1 }"
echo.

REM Check Spotify configuration
echo [2/4] Checking Spotify configuration...
powershell -Command "try { $r = Invoke-RestMethod 'http://localhost:5000/api/spotify/health' -TimeoutSec 3; if ($r.configured -eq $true) { Write-Host '   ✓ Spotify credentials are configured' -ForegroundColor Green } else { Write-Host '   ✗ Spotify credentials missing in .env' -ForegroundColor Red; exit 1 } } catch { Write-Host '   ✗ Cannot reach Spotify health endpoint' -ForegroundColor Red; exit 1 }"
echo.

REM Check frontend
echo [3/4] Checking if frontend is running...
powershell -Command "try { Invoke-WebRequest 'http://localhost:3000' -TimeoutSec 3 -UseBasicParsing | Out-Null; Write-Host '   ✓ Frontend is running on port 3000' -ForegroundColor Green } catch { Write-Host '   ⚠ Frontend is NOT running (optional)' -ForegroundColor Yellow; Write-Host '   → Run: cd frontend && npm run dev' -ForegroundColor Yellow }"
echo.

REM Show Spotify credentials
echo [4/4] Current Spotify Configuration:
powershell -Command "$env = Get-Content 'backend\.env' | Where-Object { $_ -match 'SPOTIFY' }; $env | ForEach-Object { if ($_ -match 'CLIENT_SECRET') { $parts = $_ -split '='; Write-Host ('   ' + $parts[0] + '=' + $parts[1].Substring(0, 8) + '...') -ForegroundColor Cyan } else { Write-Host ('   ' + $_) -ForegroundColor Cyan } }"
echo.

echo ================================================
echo    Next Steps
echo ================================================
echo.
echo 1. Go to: https://developer.spotify.com/dashboard
echo 2. Select your app
echo 3. Click "Edit Settings"
echo 4. Add Redirect URI: http://localhost:5000/api/spotify/callback
echo 5. Click SAVE
echo.
echo 6. Open: http://localhost:3000/music
echo 7. Click "Connect to Spotify" button
echo 8. Login and enjoy embedded playback!
echo.
echo ================================================
echo    Testing Complete
echo ================================================
pause
