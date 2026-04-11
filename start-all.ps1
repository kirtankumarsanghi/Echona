$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$configPath = Join-Path $root "service-config.json"

function Get-PortConfig {
  if (Test-Path $configPath) {
    try {
      $cfg = Get-Content $configPath -Raw | ConvertFrom-Json
      return @{
        Frontend = [int]($cfg.ports.frontend)
        Backend  = [int]($cfg.ports.backend)
        Ml       = [int]($cfg.ports.ml)
      }
    } catch {
      Write-Warning "Could not parse service-config.json. Using defaults."
    }
  }

  return @{
    Frontend = 3000
    Backend  = 5000
    Ml       = 5001
  }
}

function Test-HttpHealthy {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Url,
    [int]$TimeoutSec = 2
  )

  try {
    $null = Invoke-RestMethod -Uri $Url -Method Get -TimeoutSec $TimeoutSec
    return $true
  } catch {
    return $false
  }
}

function Wait-ForHealth {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Name,
    [Parameter(Mandatory = $true)]
    [string]$Url,
    [int]$MaxSeconds = 90
  )

  Write-Host "[wait] $Name health: $Url"
  $sw = [System.Diagnostics.Stopwatch]::StartNew()
  while ($sw.Elapsed.TotalSeconds -lt $MaxSeconds) {
    if (Test-HttpHealthy -Url $Url) {
      Write-Host "[ok] $Name is healthy." -ForegroundColor Green
      return $true
    }
    Start-Sleep -Milliseconds 900
  }

  Write-Warning "$Name did not become healthy within $MaxSeconds seconds."
  return $false
}

function Start-ServiceWindow {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Title,
    [Parameter(Mandatory = $true)]
    [string]$WorkingDir,
    [Parameter(Mandatory = $true)]
    [string]$Command
  )

  $escapedDir = $WorkingDir.Replace("'", "''")
  $psCommand = "$host.UI.RawUI.WindowTitle = '$Title'; Set-Location '$escapedDir'; $Command"

  Start-Process -FilePath "powershell" -ArgumentList @(
    "-NoExit",
    "-ExecutionPolicy", "Bypass",
    "-Command", $psCommand
  ) | Out-Null

  Write-Host "[start] $Title"
}

function Resolve-PythonCommand {
  $venvPython = Join-Path $root "venv\Scripts\python.exe"
  if (Test-Path $venvPython) {
    return "& '$venvPython' api.py"
  }
  return "python api.py"
}

$ports = Get-PortConfig
$mlHealth = "http://127.0.0.1:$($ports.Ml)/health"
$backendHealth = "http://127.0.0.1:$($ports.Backend)/health"
$frontendUrl = "http://127.0.0.1:$($ports.Frontend)"

Write-Host "ECHONA one-command startup" -ForegroundColor Cyan
Write-Host "- Frontend: $frontendUrl"
Write-Host "- Backend:  http://127.0.0.1:$($ports.Backend)"
Write-Host "- ML:       http://127.0.0.1:$($ports.Ml)"

if (-not (Test-HttpHealthy -Url $mlHealth)) {
  Start-ServiceWindow -Title "ECHONA-ML" -WorkingDir $root -Command (Resolve-PythonCommand)
  Wait-ForHealth -Name "ML service" -Url $mlHealth -MaxSeconds 120 | Out-Null
} else {
  Write-Host "[skip] ML service already healthy." -ForegroundColor Yellow
}

if (-not (Test-HttpHealthy -Url $backendHealth)) {
  $backendDir = Join-Path $root "backend"
  Start-ServiceWindow -Title "ECHONA-BACKEND" -WorkingDir $backendDir -Command "npm start"
  Wait-ForHealth -Name "Backend" -Url $backendHealth -MaxSeconds 90 | Out-Null
} else {
  Write-Host "[skip] Backend already healthy." -ForegroundColor Yellow
}

$frontendListening = $false
try {
  $frontendListening = Test-NetConnection -ComputerName "127.0.0.1" -Port $ports.Frontend -InformationLevel Quiet -WarningAction SilentlyContinue
} catch {
  $frontendListening = $false
}

if (-not $frontendListening) {
  $frontendDir = Join-Path $root "frontend"
  Start-ServiceWindow -Title "ECHONA-FRONTEND" -WorkingDir $frontendDir -Command "npm run dev"
  Write-Host "[wait] Frontend starting on $frontendUrl"
  $frontSw = [System.Diagnostics.Stopwatch]::StartNew()
  while ($frontSw.Elapsed.TotalSeconds -lt 60) {
    try {
      $isUp = Test-NetConnection -ComputerName "127.0.0.1" -Port $ports.Frontend -InformationLevel Quiet -WarningAction SilentlyContinue
      if ($isUp) {
        Write-Host "[ok] Frontend is reachable." -ForegroundColor Green
        break
      }
    } catch {}
    Start-Sleep -Milliseconds 800
  }
} else {
  Write-Host "[skip] Frontend port already open." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "All startup commands executed." -ForegroundColor Green
Write-Host "Open: $frontendUrl"
