# ECHONA Backend Auto-Restart Script
# This script will automatically restart the backend if it crashes

$Host.UI.RawUI.WindowTitle = "ECHONA Backend Server"

Write-Host ""
Write-Host "╔════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║      Starting ECHONA Backend Server       ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

# Change to backend directory
Set-Location -Path $PSScriptRoot

# Kill any existing process on port 5001
Write-Host "🔍 Checking for existing server on port 5001..." -ForegroundColor Yellow
try {
    $connections = Get-NetTCPConnection -LocalPort 5001 -ErrorAction SilentlyContinue
    if ($connections) {
        $pids = $connections | Select-Object -ExpandProperty OwningProcess -Unique
        foreach ($pid in $pids) {
            if ($pid -ne 0 -and $pid -ne 4) {
                try {
                    $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
                    if ($process) {
                        Write-Host "💀 Killing existing server (PID: $pid)..." -ForegroundColor Red
                        Stop-Process -Id $pid -Force -ErrorAction Stop
                        Write-Host "✅ Killed!" -ForegroundColor Green
                    }
                } catch {
                    Write-Host "⚠️  Could not kill process $pid" -ForegroundColor Yellow
                }
            }
        }
        Start-Sleep -Milliseconds 500
    } else {
        Write-Host "✅ Port 5001 is free!" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Port check warning (continuing anyway)" -ForegroundColor Yellow
}
Write-Host ""

# Function to start server
function Start-Backend {
    param (
        [int]$RestartCount = 0
    )
    
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Starting backend server..." -ForegroundColor Cyan
    Write-Host ""
    
    try {
        # Start the server
        $process = Start-Process -FilePath "node" -ArgumentList "server-simple.js" -NoNewWindow -PassThru -Wait
        
        if ($process.ExitCode -ne 0) {
            Write-Host ""
            Write-Host "❌ Server crashed with exit code $($process.ExitCode)" -ForegroundColor Red
            Write-Host "🔄 Restarting in 3 seconds..." -ForegroundColor Yellow
            Write-Host ""
            Start-Sleep -Seconds 3
            
            $RestartCount++
            if ($RestartCount -lt 10) {
                Start-Backend -RestartCount $RestartCount
            } else {
                Write-Host "⚠️  Too many restarts. Please check for errors." -ForegroundColor Red
                Write-Host "Press any key to exit..."
                $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
            }
        } else {
            Write-Host ""
            Write-Host "✅ Server stopped gracefully" -ForegroundColor Green
            Write-Host "Press any key to exit..."
            $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        }
    } catch {
        Write-Host ""
        Write-Host "❌ Error starting server: $_" -ForegroundColor Red
        Write-Host "Press any key to exit..."
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    }
}

# Start the backend
Start-Backend
