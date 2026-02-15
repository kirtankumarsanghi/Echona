# ECHONA complete stop entrypoint (legacy-compatible)
# Delegates to the unified stop script.

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$targetScript = Join-Path $scriptDir "stop-all-services.ps1"

if (!(Test-Path $targetScript)) {
    Write-Host "Missing script: $targetScript" -ForegroundColor Red
    exit 1
}

Write-Host "Stopping ECHONA via unified stop script..." -ForegroundColor Cyan
powershell.exe -ExecutionPolicy Bypass -File $targetScript