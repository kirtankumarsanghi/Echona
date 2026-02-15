param(
    [int]$Port = 5000
)

Write-Host "Checking port $Port..." -ForegroundColor Yellow

try {
    $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue

    if ($connections) {
        $pids = $connections | Select-Object -ExpandProperty OwningProcess -Unique

        foreach ($processId in $pids) {
            if ($processId -ne 0 -and $processId -ne 4) {
                try {
                    $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
                    if ($process) {
                        Write-Host "Killing process: $($process.ProcessName) (PID: $processId)" -ForegroundColor Red
                        Stop-Process -Id $processId -Force -ErrorAction Stop
                    }
                } catch {
                    Write-Host "Could not kill PID $processId" -ForegroundColor Yellow
                }
            }
        }

        Start-Sleep -Milliseconds 500
        Write-Host "Port $Port is now free" -ForegroundColor Green
    } else {
        Write-Host "Port $Port is already free" -ForegroundColor Green
    }
} catch {
    Write-Host "Port check failed: $($_.Exception.Message)" -ForegroundColor Yellow
}
