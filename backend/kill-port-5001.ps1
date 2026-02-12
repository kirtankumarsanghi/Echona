# Kill process using port 5001
Write-Host "🔍 Checking port 5001..." -ForegroundColor Yellow

try {
    $connections = Get-NetTCPConnection -LocalPort 5001 -ErrorAction SilentlyContinue
    
    if ($connections) {
        $pids = $connections | Select-Object -ExpandProperty OwningProcess -Unique
        
        foreach ($pid in $pids) {
            if ($pid -ne 0 -and $pid -ne 4) {  # Skip System Idle and System processes
                try {
                    $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
                    if ($process) {
                        Write-Host "💀 Killing process: $($process.ProcessName) (PID: $pid)" -ForegroundColor Red
                        Stop-Process -Id $pid -Force -ErrorAction Stop
                        Write-Host "✅ Process killed successfully!" -ForegroundColor Green
                    }
                } catch {
                    Write-Host "⚠️  Could not kill process $pid - may require admin privileges" -ForegroundColor Yellow
                }
            }
        }
        
        Start-Sleep -Milliseconds 500
        Write-Host "✅ Port 5001 is now free!" -ForegroundColor Green
    } else {
        Write-Host "✅ Port 5001 is already free!" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Error checking port: $_" -ForegroundColor Yellow
    Write-Host "Trying alternate method..." -ForegroundColor Yellow
    
    # Fallback method
    $netstat = netstat -ano | findstr ":5001"
    if ($netstat) {
        Write-Host "Found: $netstat" -ForegroundColor Gray
        $netstat | ForEach-Object {
            if ($_ -match "\s+(\d+)\s*$") {
                $pid = $matches[1]
                if ($pid -ne 0 -and $pid -ne 4) {
                    try {
                        Write-Host "💀 Killing PID: $pid" -ForegroundColor Red
                        Stop-Process -Id $pid -Force -ErrorAction Stop
                        Write-Host "✅ Killed!" -ForegroundColor Green
                    } catch {
                        Write-Host "⚠️  Failed to kill PID $pid" -ForegroundColor Yellow
                    }
                }
            }
        }
    }
}

Write-Host ""
Start-Sleep -Seconds 1
