# ============================================================
# ECHONA - Health Check Script
# Checks status of all 3 services without starting them
# ============================================================

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$sharedConfigPath = Join-Path $scriptDir "service-config.json"

if (!(Test-Path $sharedConfigPath)) {
    Write-Host "[ERROR] Missing shared config: $sharedConfigPath" -ForegroundColor Red
    exit 1
}

$sharedConfig = Get-Content $sharedConfigPath -Raw | ConvertFrom-Json
$frontendPort = [int]$sharedConfig.ports.frontend
$backendPort  = [int]$sharedConfig.ports.backend
$mlPort       = [int]$sharedConfig.ports.ml

$checkMark = [char]0x2713
$crossMark = [char]0x2717

Write-Host ""
Write-Host "  ECHONA Health Check" -ForegroundColor Cyan
Write-Host "  ==================" -ForegroundColor Cyan
Write-Host ""

# --- Check ML service ---
$mlStatus = $null
try {
    $mlResp = Invoke-WebRequest -Uri "http://127.0.0.1:$mlPort/health" -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
    $mlJson = $mlResp.Content | ConvertFrom-Json
    $mlStatus = @{ ok = $true; detail = "status=$($mlJson.status)" }
} catch {
    $mlStatus = @{ ok = $false; detail = "not reachable" }
}

# --- Check Backend ---
$backendStatus = $null
try {
    $beResp = Invoke-WebRequest -Uri "http://localhost:$backendPort/health" -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
    $beJson = $beResp.Content | ConvertFrom-Json
    $mlConn = if ($beJson.ml_service) { "ml=$($beJson.ml_service)" } else { "" }
    $backendStatus = @{ ok = $true; detail = "status=$($beJson.status) $mlConn".Trim() }
} catch {
    $backendStatus = @{ ok = $false; detail = "not reachable" }
}

# --- Check Frontend ---
$frontendStatus = $null
try {
    $feResp = Invoke-WebRequest -Uri "http://localhost:$frontendPort/" -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
    $frontendStatus = @{ ok = $true; detail = "HTTP $($feResp.StatusCode)" }
} catch {
    $frontendStatus = @{ ok = $false; detail = "not reachable" }
}

# --- Print results ---
function Show-Status {
    param([string]$Label, [hashtable]$Status, [string]$Url)
    $icon  = if ($Status.ok) { $checkMark } else { $crossMark }
    $color = if ($Status.ok) { "Green" } else { "Red" }
    Write-Host "  $icon $($Label.PadRight(15)) $Url" -ForegroundColor $color
    Write-Host "    $($Status.detail)" -ForegroundColor DarkGray
}

Show-Status -Label "ML Service"  -Status $mlStatus      -Url "http://127.0.0.1:$mlPort"
Show-Status -Label "Backend API" -Status $backendStatus  -Url "http://localhost:$backendPort"
Show-Status -Label "Frontend"    -Status $frontendStatus -Url "http://localhost:$frontendPort"

Write-Host ""

# --- Port process info ---
Write-Host "  Active port bindings:" -ForegroundColor DarkGray
foreach ($port in @($mlPort, $backendPort, $frontendPort)) {
    $conn = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($conn) {
        $proc = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
        Write-Host "    :$port -> $($proc.ProcessName) (PID $($conn.OwningProcess))" -ForegroundColor DarkGray
    } else {
        Write-Host "    :$port -> (no process)" -ForegroundColor DarkGray
    }
}
Write-Host ""

$allOk = $mlStatus.ok -and $backendStatus.ok -and $frontendStatus.ok
if ($allOk) {
    Write-Host "  All services healthy!" -ForegroundColor Green
} else {
    Write-Host "  Some services are down. Run: .\start-all-services.ps1" -ForegroundColor Yellow
}
Write-Host ""
