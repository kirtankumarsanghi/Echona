# 🎯 ECHONA PRO - Quick Reference Card

## 🚀 **STARTING THE APP**
```
Double-click: start-echona.bat
or run: powershell -ExecutionPolicy Bypass -File .\start-all-services.ps1
```

## 🛑 **STOPPING THE APP**
```
Double-click: stop-echona.bat
or run: powershell -ExecutionPolicy Bypass -File .\stop-all-services.ps1
```

## 🌐 **URLS TO OPEN**
- **Main App**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **ML API**: http://127.0.0.1:5001

---

## ✅ **FEATURES CHECKLIST**

### Ready to Use:
- ✅ Mood Detection (Face, Text, Voice)
- ✅ Spotify Integration
- ✅ Weather API
- ✅ User Login/Authentication
- ✅ Mood History & Analytics
- ✅ Music Recommendations
- ✅ Breathing Exercises
- ✅ Daily Affirmations
- ✅ Meditation Timer
- ✅ Music Challenges

---

## 🔧 **CONFIGURATION**

### Configuration Files:
- `service-config.json` (single source of truth for frontend/backend/ML ports)
- `backend\.env` (backend secrets + API credentials)
- `frontend\.env.local` (frontend API base URL)
- Environment variable `ML_PORT` (or shared config fallback for ML service)

### Required API Keys:
1. **Spotify**: Get from https://developer.spotify.com/dashboard
   - SPOTIFY_CLIENT_ID
   - SPOTIFY_CLIENT_SECRET

2. **Weather**: Get from https://openweathermap.org/api
   - WEATHER_API_KEY

### Optional:
- MongoDB (commented out by default)

---

## ⚡ **QUICK TROUBLESHOOTING**

### Port Conflicts?
```powershell
powershell -ExecutionPolicy Bypass -File .\stop-all-services.ps1
powershell -ExecutionPolicy Bypass -File .\start-all-services.ps1
```

### Python Errors?
```powershell
.\venv\Scripts\activate
pip install -r requirements.txt
```

### Node Errors?
```powershell
cd backend
npm install

cd frontend
npm install
```

### Spotify Not Working?
1. Check backend\.env has correct credentials
2. Verify redirect URI: http://localhost:5000/api/spotify/callback
3. Restart backend

### Login Issues?
1. Clear browser cache/localStorage
2. Check JWT_SECRET in backend\.env
3. Register new account

---

## 📊 **SERVICE STATUS CHECK**

### Check if services are running:
```powershell
Get-NetTCPConnection -LocalPort 3000,5000,5001 | Format-Table
```

### Manually kill a port:
```powershell
# Replace XXXX with port number
Get-NetTCPConnection -LocalPort XXXX | Select -Expand OwningProcess | Stop-Process -Force
```

---

## 🎯 **FIRST TIME SETUP**

1. ✅ Install Python 3.10+
2. ✅ Install Node.js 16+
3. ✅ Create virtual environment: `python -m venv venv`
4. ✅ Install Python packages: `.\venv\Scripts\activate` then `pip install -r requirements.txt`
5. ✅ Install backend deps: `cd backend` then `npm install`
6. ✅ Install frontend deps: `cd frontend` then `npm install`
7. ✅ Configure API keys in `backend\.env`
8. ✅ Run: `START_ECHONA.bat`

---

## 📝 **IMPORTANT FILES**

| File | Purpose |
|------|---------|
| `start-echona.bat` | **START** all services |
| `stop-echona.bat` | **STOP** all services |
| `service-config.json` | Centralized frontend/backend/ML port mapping |
| `backend\.env` | API keys configuration |
| `COMPLETE_SETUP_GUIDE.md` | Full documentation |
| `api.py` | ML API server |
| `backend\server.js` | Backend server |
| `frontend\src\` | React app source |

---

## 🎉 **EXPECTED BEHAVIOR**

When you start the app:
1. Three PowerShell windows open
2. Each shows startup messages
3. No red error messages
4. Browser can access http://localhost:3000

---

## 🆘 **EMERGENCY RESET**

If nothing works:
1. Run: `STOP_ECHONA.bat`
2. Restart computer
3. Run: `START_ECHONA.bat`
4. Check `backend\.env` has API keys

---

**💡 TIP**: Keep this file open for quick reference!

**📖 For detailed help, see**: `COMPLETE_SETUP_GUIDE.md`
