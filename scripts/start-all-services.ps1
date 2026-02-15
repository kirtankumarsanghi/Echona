# ============================================================
# ECHONA - Unified Startup Script
# Starts ML service, Backend API, and Frontend dev server
# Reads ports from service-config.json for consistency
# ============================================================

$ErrorActionPreference = "Continue"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Join-Path $scriptDir "backend"
$frontendDir = Join-Path $scriptDir "frontend"
$sharedConfigPath = Join-Path $scriptDir "service-config.json"

# --- Banner ---
Write-Host ""
Write-Host "  ==============================" -ForegroundColor Cyan
Write-Host "    ECHONA  -  Starting Up..." -ForegroundColor Cyan
Write-Host "  ==============================" -ForegroundColor Cyan
Write-Host ""

# --- Load shared config ---
if (!(Test-Path $sharedConfigPath)) {
    Write-Host "[ERROR] Missing shared config: $sharedConfigPath" -ForegroundColor Red
    exit 1
}

$sharedConfig = Get-Content $sharedConfigPath -Raw | ConvertFrom-Json
$frontendPort = [int]$sharedConfig.ports.frontend
$backendPort  = [int]$sharedConfig.ports.backend
$mlPort       = [int]$sharedConfig.ports.ml

# --- Ensure .env files exist ---
function Ensure-EnvFile {
    param([string]$Dir, [string]$ExampleName = ".env.example", [string]$TargetName = ".env")
    $envPath = Join-Path $Dir $TargetName
    $examplePath = Join-Path $Dir $ExampleName
    if (!(Test-Path $envPath) -and (Test-Path $examplePath)) {
        Copy-Item $examplePath $envPath
        Write-Host "  [AUTO] Created $TargetName from $ExampleName in $(Split-Path $Dir -Leaf)" -ForegroundColor Yellow
    }
}

Ensure-EnvFile -Dir $scriptDir
Ensure-EnvFile -Dir $backendDir
Ensure-EnvFile -Dir $frontendDir

# --- Find Python ---
$pythonExe = $null
$venvPython = Join-Path $scriptDir "venv\Scripts\python.exe"
if (Test-Path $venvPython) {
    $pythonExe = $venvPython
} else {
    # Try system Python
    $sysPython = Get-Command python -ErrorAction SilentlyContinue
    if ($sysPython) { $pythonExe = $sysPython.Source }
}

# --- Helpers ---
function Clear-Port {
    param([int]$Port)
    $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    if ($connections) {
        $pids = $connections | Select-Object -ExpandProperty OwningProcess -Unique | Where-Object { $_ -ne 0 -and $_ -ne 4 }
        foreach ($procId in $pids) {
            try {
                $procName = (Get-Process -Id $procId -ErrorAction SilentlyContinue).ProcessName
                Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
                Write-Host "    Killed $procName (PID $procId) on port $Port" -ForegroundColor DarkGray
            } catch {}
        }
    }
}

function Wait-ForHealth {
    param(
        [string]$Url,
        [string]$Label,
        [int]$Retries = 25,
        [int]$DelayMs = 600
    )
    Write-Host -NoNewline "  Waiting for $Label "
    for ($i = 0; $i -lt $Retries; $i++) {
        try {
            $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
            if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 400) {
                Write-Host " OK" -ForegroundColor Green
                return $true
            }
        } catch {}
        Write-Host -NoNewline "." -ForegroundColor DarkGray
        Start-Sleep -Milliseconds $DelayMs
    }
    Write-Host " TIMEOUT" -ForegroundColor Red
    return $false
}

# --- Clear ports ---
Write-Host "  [1/4] Clearing ports $mlPort, $backendPort, $frontendPort..." -ForegroundColor White
Clear-Port -Port $mlPort
Clear-Port -Port $backendPort
Clear-Port -Port $frontendPort
Start-Sleep -Seconds 1

# --- Set env vars ---
$env:BACKEND_PORT   = "$backendPort"
$env:FRONTEND_PORT  = "$frontendPort"
$env:ML_PORT        = "$mlPort"
$env:ML_SERVICE_URL = "http://127.0.0.1:$mlPort"

# --- Start ML service ---
Write-Host "  [2/4] Starting ML service (port $mlPort)..." -ForegroundColor White
if ($pythonExe) {
    Start-Process -FilePath $pythonExe -ArgumentList "api.py" -WorkingDirectory $scriptDir -WindowStyle Normal | Out-Null
} else {
    Write-Host "    [WARN] Python not found - ML service will not start." -ForegroundColor Yellow
    Write-Host "    Create a venv: python -m venv venv && venv\Scripts\activate && pip install -r requirements.txt" -ForegroundColor DarkGray
}

# --- Start backend ---
Write-Host "  [3/4] Starting backend (port $backendPort)..." -ForegroundColor White
$nodeCmd = Get-Command node -ErrorAction SilentlyContinue
if ($nodeCmd) {
    Start-Process -FilePath "node" -ArgumentList "server.js" -WorkingDirectory $backendDir -WindowStyle Normal | Out-Null
} else {
    Write-Host "    [ERROR] Node.js not found in PATH!" -ForegroundColor Red
    exit 1
}

# --- Start frontend ---
Write-Host "  [4/4] Starting frontend (port $frontendPort)..." -ForegroundColor White
Start-Process -FilePath "npm.cmd" -ArgumentList "run", "dev" -WorkingDirectory $frontendDir -WindowStyle Normal | Out-Null

# --- Health checks ---
Write-Host ""
Write-Host "  Running health checks..." -ForegroundColor White

$mlOk      = if ($pythonExe) { Wait-ForHealth -Url "http://127.0.0.1:$mlPort/health"       -Label "ML service" }       else { $false }
$backendOk = Wait-ForHealth -Url "http://localhost:$backendPort/health" -Label "Backend"
$frontendOk = Wait-ForHealth -Url "http://localhost:$frontendPort/"     -Label "Frontend" -Retries 30

# --- Summary ---
$checkMark = [char]0x2713
$crossMark = [char]0x2717

Write-Host ""
Write-Host "  ==============================" -ForegroundColor Cyan
Write-Host "    ECHONA  STARTUP  STATUS" -ForegroundColor Cyan
Write-Host "  ==============================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  $(if ($mlOk)       { $checkMark } else { $crossMark }) ML Service     http://127.0.0.1:$mlPort"       -ForegroundColor $(if ($mlOk)       { "Green" } else { "Yellow" })
Write-Host "  $(if ($backendOk)  { $checkMark } else { $crossMark }) Backend API    http://localhost:$backendPort"   -ForegroundColor $(if ($backendOk)  { "Green" } else { "Red" })
Write-Host "  $(if ($frontendOk) { $checkMark } else { $crossMark }) Frontend       http://localhost:$frontendPort"  -ForegroundColor $(if ($frontendOk) { "Green" } else { "Yellow" })
Write-Host ""

if (!$backendOk) {
    Write-Host "  [!] Backend failed to start - check backend\server.js logs" -ForegroundColor Red
}
if (!$mlOk -and $pythonExe) {
    Write-Host "  [!] ML service failed - music recommendations will use fallback" -ForegroundColor Yellow
}
if ($frontendOk) {
    Write-Host "  Open ECHONA: http://localhost:$frontendPort" -ForegroundColor Green
}
Write-Host ""
