# ECHONA Full Stack Startup Script
# Start both Backend and Frontend servers

$Host.UI.RawUI.WindowTitle = "ECHONA Application Startup"

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║           ECHONA Application Startup             ║" -ForegroundColor Cyan
Write-Host "║      Starting Backend + Frontend Servers         ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Get the script directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Kill any existing servers first
Write-Host "🧹 Stopping any existing servers..." -ForegroundColor Yellow
try {
    # Kill port 5001
    $conn5001 = Get-NetTCPConnection -LocalPort 5001 -ErrorAction SilentlyContinue
    if ($conn5001) {
        $conn5001 | Select-Object -ExpandProperty OwningProcess -Unique | Where-Object { $_ -ne 0 -and $_ -ne 4 } | ForEach-Object {
            Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue
        }
    }
    # Kill port 3000
    $conn3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
    if ($conn3000) {
        $conn3000 | Select-Object -ExpandProperty OwningProcess -Unique | Where-Object { $_ -ne 0 -and $_ -ne 4 } | ForEach-Object {
            Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue
        }
    }
    Start-Sleep -Milliseconds 500
} catch {
    # Ignore errors, continue anyway
}
Write-Host "✅ Ports cleared!" -ForegroundColor Green
Write-Host ""

# Start Backend Server
Write-Host "[1/2] Starting Backend Server on port 5001..." -ForegroundColor Yellow
$backendPath = Join-Path $ScriptDir "backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$backendPath'; node server-simple.js" -WindowStyle Normal

# Wait for backend to start
Write-Host "      Waiting for backend to initialize..." -ForegroundColor Gray
Start-Sleep -Seconds 3

# Test backend
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5001/api/health" -UseBasicParsing -TimeoutSec 5
    Write-Host "      ✅ Backend is running!" -ForegroundColor Green
} catch {
    Write-Host "      ⚠️  Backend may still be starting..." -ForegroundColor Yellow
}

# Start Frontend Server
Write-Host "[2/2] Starting Frontend Server on port 3000..." -ForegroundColor Yellow
$frontendPath = Join-Path $ScriptDir "frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$frontendPath'; npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║             ✅ ECHONA is starting!               ║" -ForegroundColor Green
Write-Host "╠═══════════════════════════════════════════════════╣" -ForegroundColor White
Write-Host "║  Backend:  http://localhost:5001                 ║" -ForegroundColor White
Write-Host "║  Frontend: http://localhost:3000                 ║" -ForegroundColor White
Write-Host "║                                                   ║" -ForegroundColor White
Write-Host "║  Wait a few seconds, then open your browser to:  ║" -ForegroundColor White
Write-Host "║  👉 http://localhost:3000                        ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "Press any key to exit this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
