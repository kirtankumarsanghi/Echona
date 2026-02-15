# ============================================================
# ECHONA - Complete Startup Script
# ============================================================
# This script starts all services and validates they're working
# ============================================================

$ErrorActionPreference = "Stop"

Write-Host "`n╔════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║         🚀 Starting ECHONA Services           ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# ─── Kill existing processes ────────────────────────────────
Write-Host "🧹 Cleaning up existing processes..." -ForegroundColor Yellow
Get-Process | Where-Object { $_.ProcessName -eq 'node' } | Stop-Process -Force -ErrorAction SilentlyContinue
Get-Process | Where-Object { $_.ProcessName -eq 'python' -and $_.MainWindowTitle -like '*api.py*' } | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# ─── Start Backend ──────────────────────────────────────────
Write-Host "🔧 Starting Backend..." -ForegroundColor Yellow
$backendPath = Join-Path $PSScriptRoot "backend"
$backendProcess = Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; npm start" -PassThru -WindowStyle Minimized
Write-Host "   Backend started (PID: $($backendProcess.Id))" -ForegroundColor Green
Start-Sleep -Seconds 5

# ─── Start Frontend ─────────────────────────────────────────
Write-Host "✨ Starting Frontend..." -ForegroundColor Yellow
$frontendPath = Join-Path $PSScriptRoot "frontend"
$frontendProcess = Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; npm run dev" -PassThru -WindowStyle Minimized
Write-Host "   Frontend started (PID: $($frontendProcess.Id))" -ForegroundColor Green
Start-Sleep -Seconds 6

# ─── Start ML Service (Optional) ────────────────────────────
Write-Host "🤖 Starting ML Service..." -ForegroundColor Yellow
try {
    $mlProcess = Start-Process -FilePath "python" -ArgumentList "api.py" -WorkingDirectory $PSScriptRoot -PassThru -WindowStyle Minimized
    Write-Host "   ML Service started (PID: $($mlProcess.Id))" -ForegroundColor Green
} catch {
    Write-Host "   ML Service: Skipped (Python not configured)" -ForegroundColor Gray
}
Start-Sleep -Seconds 3

# ─── Validate System ────────────────────────────────────────
Write-Host "`n🔍 Validating services..." -ForegroundColor Cyan
& "$PSScriptRoot\validate-system.ps1"

# ─── Open Browser ───────────────────────────────────────────
Write-Host "`n🌐 Opening browser..." -ForegroundColor Cyan
Start-Process "http://127.0.0.1:3000"

Write-Host "`n✅ Startup complete!" -ForegroundColor Green
Write-Host "   - Frontend: http://127.0.0.1:3000" -ForegroundColor White
Write-Host "   - Backend:  http://127.0.0.1:5000" -ForegroundColor White
Write-Host "`n💡 To stop: Run STOP_ECHONA.bat`n" -ForegroundColor Yellow
