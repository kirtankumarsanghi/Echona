# ECHONA complete startup entrypoint (legacy-compatible)
# Delegates to the unified startup script.

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$targetScript = Join-Path $scriptDir "start-all-services.ps1"

if (!(Test-Path $targetScript)) {
    Write-Host "Missing script: $targetScript" -ForegroundColor Red
    exit 1
}

Write-Host "Launching ECHONA via unified startup script..." -ForegroundColor Cyan
powershell.exe -ExecutionPolicy Bypass -File $targetScript