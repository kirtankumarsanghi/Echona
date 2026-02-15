# ECHONA stop (legacy entrypoint)
# Delegates to unified stop script to ensure consistent ports and service wiring.

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$targetScript = Join-Path $scriptDir "stop-all-services.ps1"

if (!(Test-Path $targetScript)) {
    Write-Host "Missing script: $targetScript" -ForegroundColor Red
    exit 1
}

Write-Host "Stopping ECHONA via unified stop script..." -ForegroundColor Cyan
powershell.exe -ExecutionPolicy Bypass -File $targetScript
