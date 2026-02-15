# ============================================================
# ECHONA System Validation Script
# ============================================================
# This script validates that all services are running correctly
# and can communicate with each other.
# ============================================================

$ErrorActionPreference = "SilentlyContinue"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "    🔍 ECHONA System Validation" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$allGood = $true

# ─── Test 1: Backend Health ─────────────────────────────────
Write-Host "Testing Backend (http://127.0.0.1:5000)..." -NoNewline
try {
    $backendHealth = Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/health" -TimeoutSec 5
    if ($backendHealth.status -eq "ok") {
        Write-Host " ✅ OK" -ForegroundColor Green
    } else {
        Write-Host " ⚠️  Backend returned status: $($backendHealth.status)" -ForegroundColor Yellow
        $allGood = $false
    }
} catch {
    Write-Host " ❌ FAILED" -ForegroundColor Red
    Write-Host "  Error: Backend is not responding on port 5000" -ForegroundColor Red
    Write-Host "  Fix: Run 'cd backend && npm start'" -ForegroundColor Yellow
    $allGood = $false
}

# ─── Test 2: Frontend Accessibility (127.0.0.1) ────────────
Write-Host "Testing Frontend (http://127.0.0.1:3000)..." -NoNewline
try {
    $frontendResponse = Invoke-WebRequest -Uri "http://127.0.0.1:3000" -TimeoutSec 5 -UseBasicParsing
    if ($frontendResponse.StatusCode -eq 200) {
        Write-Host " ✅ OK" -ForegroundColor Green
    } else {
        Write-Host " ⚠️  Status: $($frontendResponse.StatusCode)" -ForegroundColor Yellow
        $allGood = $false
    }
} catch {
    Write-Host " ❌ FAILED" -ForegroundColor Red
    Write-Host "  Error: Frontend is not accessible on 127.0.0.1:3000" -ForegroundColor Red
    Write-Host "  Fix: Ensure vite.config.js has 'host: 0.0.0.0'" -ForegroundColor Yellow
    Write-Host "  Run: cd frontend && npm run dev" -ForegroundColor Yellow
    $allGood = $false
}

# ─── Test 3: Frontend -> Backend Proxy ──────────────────────
Write-Host "Testing Frontend->Backend Proxy..." -NoNewline
try {
    $proxyTest = Invoke-RestMethod -Uri "http://127.0.0.1:3000/api/health" -TimeoutSec 5
    if ($proxyTest.status -eq "ok") {
        Write-Host " ✅ OK" -ForegroundColor Green
    } else {
        Write-Host " ⚠️  Proxy returned unexpected status" -ForegroundColor Yellow
        $allGood = $false
    }
} catch {
    Write-Host " ❌ FAILED" -ForegroundColor Red
    Write-Host "  Error: Frontend proxy is not forwarding requests to backend" -ForegroundColor Red
    Write-Host "  Fix: Check vite.config.js proxy configuration" -ForegroundColor Yellow
    $allGood = $false
}

# ─── Test 4: Spotify Configuration ──────────────────────────
Write-Host "Testing Spotify Service..." -NoNewline
try {
    $spotifyHealth = Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/spotify/health" -TimeoutSec 5
    if ($spotifyHealth.configured -eq $true) {
        Write-Host " ✅ Configured" -ForegroundColor Green
    } else {
        Write-Host " ⚠️  Not Configured" -ForegroundColor Yellow
        Write-Host "  Check: SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in .env" -ForegroundColor Yellow
        $allGood = $false
    }
} catch {
    Write-Host " ⚠️  Not Available" -ForegroundColor Yellow
}

# ─── Test 5: Port Availability ──────────────────────────────
Write-Host "`nChecking Port Status..." -ForegroundColor White
$ports = @(
    @{ Port = 3000; Service = "Frontend (Vite)" },
    @{ Port = 5000; Service = "Backend (Express)" },
    @{ Port = 5001; Service = "ML Service (Python)" }
)

foreach ($portInfo in $ports) {
    $connection = Get-NetTCPConnection -LocalPort $portInfo.Port -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($connection) {
        $processId = $connection.OwningProcess
        $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
        $processName = if ($process) { $process.ProcessName } else { "Unknown" }
        Write-Host "  Port $($portInfo.Port): ✅ LISTENING ($processName PID $processId)" -ForegroundColor Green
    } else {
        Write-Host "  Port $($portInfo.Port): ⚠️  NOT LISTENING" -ForegroundColor Yellow
        Write-Host "    Expected: $($portInfo.Service)" -ForegroundColor Gray
    }
}

# ─── Final Result ────────────────────────────────────────────
Write-Host "`n========================================" -ForegroundColor Cyan
if ($allGood) {
    Write-Host "    ✅ ALL SYSTEMS OPERATIONAL" -ForegroundColor Green
    Write-Host "========================================`n" -ForegroundColor Cyan
    Write-Host "✨ Frontend: http://127.0.0.1:3000" -ForegroundColor White
    Write-Host "🔧 Backend:  http://127.0.0.1:5000" -ForegroundColor White
    Write-Host "📊 Health:   http://127.0.0.1:5000/health`n" -ForegroundColor White
} else {
    Write-Host "    ⚠️  ISSUES DETECTED" -ForegroundColor Yellow
    Write-Host "========================================`n" -ForegroundColor Cyan
    Write-Host "Please fix the issues above before using the application." -ForegroundColor Yellow
    Write-Host "For help, see: COMPLETE_SETUP_GUIDE.md`n" -ForegroundColor Cyan
}

Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
