# 🔧 Frontend-Backend Connectivity Fix

## Problem
Frontend showed error: **"Cannot connect to server. Please check if the backend is running."**

## Root Cause
The Vite dev server was binding to `localhost` only, which on Windows can resolve to IPv6 (`::1`) instead of IPv4 (`127.0.0.1`). When the browser accessed `http://127.0.0.1:3000`, it couldn't reach the IPv6-only listener.

## Solution Applied

### 1. Updated `frontend/vite.config.js`
Added `host: '0.0.0.0'` to make Vite listen on ALL network interfaces:

```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',      // 👈 CRITICAL: Listen on all interfaces
    port: frontendPort,
    strictPort: true,      // Fail if port is already in use
    proxy: {
      '/api': {
        target: backendUrl,
        changeOrigin: true,
        rewrite: (path) => path,
      }
    }
  }
})
```

**Why this works:**
- `0.0.0.0` tells the server to listen on ALL available IP addresses
- Makes the app accessible via: `localhost`, `127.0.0.1`, and local network IPs
- Ensures consistent behavior across different OS configurations

### 2. Created Validation Scripts

#### `validate-system.ps1` - System Health Check
Run this to verify all services are working:
```powershell
.\validate-system.ps1
```

Checks:
- ✅ Backend responding on `http://127.0.0.1:5000`
- ✅ Frontend accessible on `http://127.0.0.1:3000`
- ✅ Proxy routing `/api/*` to backend
- ✅ Spotify service configuration
- ✅ Port status for all services

#### `START_HERE.ps1` - One-Click Startup
Complete automated startup:
```powershell
.\START_HERE.ps1
```

This script:
1. Kills any existing processes
2. Starts backend (port 5000)
3. Starts frontend (port 3000)
4. Starts ML service (port 5001, if Python configured)
5. Validates all services
6. Opens browser to `http://127.0.0.1:3000`

## How to Use

### Quick Start (Recommended)
```powershell
# From project root
.\START_HERE.ps1
```

### Manual Start
```powershell
# Terminal 1: Backend
cd backend
npm start

# Terminal 2: Frontend
cd frontend
npm run dev

# Terminal 3: Validate
.\validate-system.ps1
```

## Verification

After starting services, verify connectivity:

```powershell
# Test backend
Invoke-RestMethod http://127.0.0.1:5000/api/health

# Test frontend
Invoke-WebRequest http://127.0.0.1:3000 -UseBasicParsing

# Test proxy (frontend → backend)
Invoke-RestMethod http://127.0.0.1:3000/api/health
```

All three should return successful responses.

## Important Notes

### ⚠️ Always Use 127.0.0.1
- **DO NOT** use `localhost` in browser for this app
- **ALWAYS** use `http://127.0.0.1:3000`
- Reason: Consistent IPv4 behavior across all systems

### ⚠️ Spotify Redirect URIs
In Spotify Developer Dashboard, use:
```
http://127.0.0.1:5000/api/spotify/callback
http://127.0.0.1:3000/callback
```

NOT `localhost` - Spotify rejects `localhost` in redirect URIs.

### ⚠️ After Editing vite.config.js
Always restart the frontend:
```powershell
# Kill frontend
Get-Process | Where-Object ProcessName -eq 'node' | Stop-Process -Force

# Restart
cd frontend
npm run dev
```

## Configuration Files Modified

### `frontend/vite.config.js`
- Added `host: '0.0.0.0'`
- Added `strictPort: true`

### `backend/.env`
```env
BACKEND_PORT=5000
FRONTEND_PORT=3000
FRONTEND_URL=http://127.0.0.1:3000
SPOTIFY_REDIRECT_URI=http://127.0.0.1:5000/api/spotify/callback
```

### `service-config.json`
```json
{
  "ports": {
    "frontend": 3000,
    "backend": 5000,
    "ml": 5001
  },
  "hosts": {
    "frontend": "http://127.0.0.1",
    "backend": "http://127.0.0.1",
    "ml": "http://127.0.0.1"
  }
}
```

## Troubleshooting

### Issue: "Cannot connect to server"
**Fix:**
1. Run `.\validate-system.ps1` to identify the problem
2. Ensure `vite.config.js` has `host: '0.0.0.0'`
3. Restart frontend: `cd frontend && npm run dev`
4. Access via `http://127.0.0.1:3000` (NOT localhost)

### Issue: Port Already in Use
**Fix:**
```powershell
# Kill all Node processes
Get-Process | Where-Object ProcessName -eq 'node' | Stop-Process -Force

# Restart services
.\START_HERE.ps1
```

### Issue: Proxy Not Working
**Fix:**
1. Verify backend is running: `Invoke-RestMethod http://127.0.0.1:5000/api/health`
2. Check `vite.config.js` proxy target points to `http://127.0.0.1:5000`
3. Restart frontend

### Issue: Services Start but Validation Fails
**Fix:**
1. Wait 10 seconds for services to fully initialize
2. Run `.\validate-system.ps1` again
3. Check if Windows Firewall is blocking connections

## Prevention

To ensure this never happens again:

1. **Always use START_HERE.ps1** - It validates everything
2. **Run validate-system.ps1** before reporting issues
3. **Never edit vite.config.js** without understanding the host setting
4. **Use 127.0.0.1** everywhere, never localhost
5. **Keep configuration files in sync** - Use service-config.json

## Testing

Verify the fix is permanent:

```powershell
# Full system test
.\START_HERE.ps1

# Wait for startup (about 15 seconds)

# Test signup
$body = @{
    name = "Test User"
    email = "test@example.com"
    password = "TestPass123!"
} | ConvertTo-Json

Invoke-RestMethod `
    -Uri "http://127.0.0.1:3000/api/auth/signup" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
```

Should return:
```json
{
  "success": true,
  "message": "Account created successfully",
  "token": "eyJ...",
  "user": { ... }
}
```

## Summary

✅ **Fixed:** Vite now binds to all interfaces  
✅ **Fixed:** Frontend accessible on 127.0.0.1  
✅ **Fixed:** Proxy working correctly  
✅ **Created:** Validation script for health checks  
✅ **Created:** One-click startup script  
✅ **Documented:** Complete troubleshooting guide  

**This issue will NOT recur** as long as:
- `vite.config.js` has `host: '0.0.0.0'`
- You use `http://127.0.0.1:3000` in browser
- You use `START_HERE.ps1` for reliable startup
