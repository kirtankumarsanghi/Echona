# ECHONA unified stop script

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$sharedConfigPath = Join-Path $scriptDir "service-config.json"

if (!(Test-Path $sharedConfigPath)) {
    Write-Host "Missing shared config: $sharedConfigPath" -ForegroundColor Red
    exit 1
}

$sharedConfig = Get-Content $sharedConfigPath -Raw | ConvertFrom-Json
$ports = @([int]$sharedConfig.ports.frontend, [int]$sharedConfig.ports.backend, [int]$sharedConfig.ports.ml)
$stoppedCount = 0

foreach ($port in $ports) {
    $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($connections) {
        $connections |
            Select-Object -ExpandProperty OwningProcess -Unique |
            Where-Object { $_ -ne 0 -and $_ -ne 4 } |
            ForEach-Object {
                try {
                    Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue
                    $stoppedCount++
                } catch {}
            }
    }
}

Start-Sleep -Seconds 1

$remaining = @()
foreach ($port in $ports) {
    if (Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue) {
        $remaining += $port
    }
}

if ($remaining.Count -eq 0) {
    Write-Host "All services stopped. Processes terminated: $stoppedCount" -ForegroundColor Green
} else {
    Write-Host "Some ports are still active: $($remaining -join ', ')" -ForegroundColor Yellow
}
