# 🔧 Port Already In Use - Quick Fix Guide

## The Problem
You see this error:
```
Error: listen EADDRINUSE: address already in use :::5001
```

This means port 5001 (or 3000) is already being used by another process.

---

## ✅ Quick Solutions (Choose One)

### Solution 1: Use the Stop Script (Easiest)
```bash
# Double-click this file:
stop-echona.bat

# Or run in PowerShell:
.\stop-echona.ps1
```

### Solution 2: Use the Kill Port Scripts
```bash
# For port 5001 (Backend):
cd backend
.\kill-port-5001.bat

# Or PowerShell:
.\kill-port-5001.ps1
```

### Solution 3: Manual PowerShell Command
```powershell
# Kill port 5001
Get-NetTCPConnection -LocalPort 5001 -ErrorAction SilentlyContinue | 
  Select-Object -ExpandProperty OwningProcess -Unique | 
  Where-Object { $_ -ne 0 -and $_ -ne 4 } | 
  ForEach-Object { Stop-Process -Id $_ -Force }

# Kill port 3000
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | 
  Select-Object -ExpandProperty OwningProcess -Unique | 
  Where-Object { $_ -ne 0 -and $_ -ne 4 } | 
  ForEach-Object { Stop-Process -Id $_ -Force }
```

### Solution 4: Manual CMD Command
```cmd
# Find process on port 5001
netstat -ano | findstr :5001

# Kill process (replace PID with actual number)
taskkill /F /PID <PID>
```

### Solution 5: Kill All Node Processes
```powershell
# Nuclear option - kills ALL Node.js processes
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
```

---

## 🎯 Prevention (New!)

All startup scripts now **automatically kill existing processes** before starting!

### Updated Scripts:
- ✅ `start-echona.bat` - Auto-kills on both ports
- ✅ `start-echona.ps1` - Auto-kills on both ports
- ✅ `backend/start-backend.bat` - Auto-kills port 5001
- ✅ `backend/start-backend.ps1` - Auto-kills port 5001

**Just run the start script again** - it will clean up automatically!

---

## 🔄 Recommended Workflow

### When Starting ECHONA:

1. **Stop any existing servers first:**
   ```bash
   .\stop-echona.bat
   ```

2. **Start fresh:**
   ```bash
   .\start-echona.bat
   ```

### When Restarting Just Backend:

1. **Stop and restart:**
   ```bash
   cd backend
   .\start-backend.bat
   ```
   (This now auto-kills existing backend)

### When Using npm run dev:

If you prefer `npm run dev`, first kill the port:
```bash
cd backend
.\kill-port-5001.bat
npm run dev
```

---

## 📋 New Files Created

### Port Management:
- `backend/kill-port-5001.bat` - Kill backend port
- `backend/kill-port-5001.ps1` - PowerShell version
- `stop-echona.bat` - Stop all servers (improved)
- `stop-echona.ps1` - PowerShell stop script

### Auto-Cleanup Startup Scripts (Updated):
- `start-echona.bat` - Now kills ports first
- `start-echona.ps1` - Now kills ports first
- `backend/start-backend.bat` - Now kills port first
- `backend/start-backend.ps1` - Now kills port first

---

## 🐛 Troubleshooting

### Port still in use after killing?
Wait 2-3 seconds and try again. The OS needs time to release the port.

### "Access denied" error?
- Run PowerShell as Administrator
- Or use Task Manager to end Node.js processes manually

### Process ID is 0 or 4?
These are system processes and can't be killed. Try:
```powershell
netstat -ano | findstr :5001
```
Look for other PIDs and kill those.

### Script didn't kill the process?
Some processes are protected. Open Task Manager:
1. Press `Ctrl+Shift+Esc`
2. Find "Node.js: Server-side JavaScript"
3. Right-click → End Task

---

## ✅ Current Status

Port 5001 is now **FREE** and ready to use!

You can now:
```bash
# Start with auto-cleanup
.\start-echona.bat

# Or backend only
cd backend
npm run dev

# Or use the auto-restart script
.\start-backend.bat
```

---

## 💡 Pro Tips

1. **Always use stop-echona.bat before closing terminals** 
   - Prevents orphaned processes

2. **Use the startup scripts instead of npm directly**
   - They handle cleanup automatically
   - They auto-restart on crashes

3. **Check what's on a port:**
   ```powershell
   netstat -ano | findstr :5001
   ```

4. **See all your Node processes:**
   ```powershell
   Get-Process -Name node
   ```

5. **When in doubt, use the nuclear option:**
   ```bash
   .\stop-echona.bat
   .\start-echona.bat
   ```

---

**Issue Resolved! 🎉**
