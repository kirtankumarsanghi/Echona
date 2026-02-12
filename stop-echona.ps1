# ECHONA - Stop All Servers
$Host.UI.RawUI.WindowTitle = "ECHONA - Stop Servers"

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════╗" -ForegroundColor Red
Write-Host "║         Stopping All ECHONA Servers              ║" -ForegroundColor Red
Write-Host "╚═══════════════════════════════════════════════════╝" -ForegroundColor Red
Write-Host ""

function Stop-PortProcess {
    param (
        [int]$Port,
        [string]$Name
    )
    
    Write-Host "🔍 Checking port $Port ($Name)..." -ForegroundColor Yellow
    
    try {
        $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
        
        if ($connections) {
            $pids = $connections | Select-Object -ExpandProperty OwningProcess -Unique
            $killedAny = $false
            
            foreach ($pid in $pids) {
                if ($pid -ne 0 -and $pid -ne 4) {
                    try {
                        $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
                        if ($process) {
                            Write-Host "   💀 Killing: $($process.ProcessName) (PID: $pid)" -ForegroundColor Red
                            Stop-Process -Id $pid -Force -ErrorAction Stop
                            $killedAny = $true
                        }
                    } catch {
                        Write-Host "   ⚠️  Could not kill PID $pid" -ForegroundColor Yellow
                    }
                }
            }
            
            if ($killedAny) {
                Write-Host "   ✅ Stopped!" -ForegroundColor Green
            }
        } else {
            Write-Host "   ✅ No process running on port $Port" -ForegroundColor Green
        }
    } catch {
        Write-Host "   ⚠️  Error checking port: $_" -ForegroundColor Yellow
    }
}

# Stop both ports
Stop-PortProcess -Port 5001 -Name "Backend"
Stop-PortProcess -Port 3000 -Name "Frontend"

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║      ✅ All ECHONA servers have been stopped!    ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Start-Sleep -Seconds 1
