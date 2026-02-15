# ECHONA Startup (legacy entrypoint)
# Delegates to unified startup script to ensure consistent ports and service wiring.

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$targetScript = Join-Path $scriptDir "start-all-services.ps1"

if (!(Test-Path $targetScript)) {
    Write-Host "Missing script: $targetScript" -ForegroundColor Red
    exit 1
}

Write-Host "Launching unified startup script..." -ForegroundColor Cyan
powershell.exe -ExecutionPolicy Bypass -File $targetScript
