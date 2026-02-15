# ECHONA - Complete Startup Guide 🚀

## Quick Start (Recommended)

### Windows - One-Click Start
**Just double-click** `start-echona.bat` in the root folder!

This will automatically:
- ✅ Start the backend server (Port 5000)
- ✅ Start the frontend server (Port 3000)
- ✅ Start the ML API (Port 5001)
- ✅ Open both in separate terminal windows

Then open your browser to: **http://localhost:3000/**

### To Stop All Servers
Double-click `stop-echona.bat` to stop all ECHONA servers.

---

## Manual Startup Options

### Option 1: PowerShell Script (Recommended)
```powershell
.\start-echona.ps1
```

### Option 2: Individual Servers

#### Start Backend Only:
```bash
# Use the auto-restart script
cd backend
.\start-backend.bat

# Or manually
cd backend
node server.js
```

#### Start Frontend Only:
```bash
cd frontend
npm run dev
```

---

## Verifying Everything Works

### Test Backend
Open browser to:
- **Main**: http://localhost:5000/
- **Health**: http://localhost:5000/health

You should see JSON response showing server is running.

### Test Frontend
Open browser to:
- **App**: http://localhost:3000/

You should see the ECHONA home page.

---

## Full Application Architecture

### Services:
1. **Backend API** - Port 5000 (Node.js/Express)
   - Mood tracking
   - Statistics
   - API endpoints
   - Auto-restart on crashes

2. **Frontend** - Port 3000 (React + Vite)
   - User interface
   - Mood detection
   - Music player
   - Dashboard & Analytics

3. **ML API** - Port 5001 (Python/Flask) - Optional
   - Emotion detection from images/audio
   - Text sentiment analysis
   - Start with: `python api.py`

---

## Troubleshooting

### Backend Won't Start

**Error: Port 5000 already in use**
```powershell
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Or use stop script
.\stop-echona.bat
```

**Error: Module not found**
```bash
cd backend
npm install
```

### Frontend Won't Start

**Error: Port 3000 already in use**
```powershell
# Kill all node processes
.\stop-echona.bat

# Or manually
taskkill /F /IM node.exe
```

**Error: Dependencies missing**
```bash
cd frontend
npm install
```

### Backend Keeps Crashing

The backend now has built-in auto-restart! If it crashes:
1. Check the backend terminal window for error messages
2. The server will attempt to restart automatically
3. If it fails 10 times, it will stop (check logs)

Common issues:
- Missing dependencies: Run `npm install` in backend folder
- Port already in use: Use `stop-echona.bat` first
- Corrupted node_modules: Delete and run `npm install` again

---

## Advanced Configuration

### Change Backend Port
Edit `backend/server.js`:
```javascript
const PORT = 5000; // Change to your preferred port
```

### Change Frontend Port
Edit `frontend/vite.config.js`:
```javascript
server: {
  port: 3000, // Change to your preferred port
}
```

---

## Development Mode

### Backend with Auto-Reload
```bash
cd backend
npm run dev  # Uses nodemon for auto-reload on file changes
```

### Frontend with Hot Reload
```bash
cd frontend
npm run dev  # Already includes hot reload
```

---

## Production Build

### Build Frontend
```bash
cd frontend
npm run build
```
Creates optimized production build in `frontend/dist/`

### Serve Production Build
```bash
cd frontend
npm run preview
```

---

## API Endpoints Reference

### Backend API (http://localhost:5000)

#### Health Check
```
GET /
GET /health
```

#### Mood Operations
```
POST /api/mood/add
Body: { "mood": "Happy", "score": 8 }

GET /api/mood
GET /api/mood/history
GET /api/mood/stats
```

#### Surprise Me
```
GET /api/surprise
```

---

## File Structure

```
echona-pro/
├── start-echona.bat          ← Quick start script (Windows)
├── start-echona.ps1          ← PowerShell start script
├── stop-echona.bat           ← Stop all servers
├── STARTUP_GUIDE.md          ← This file
│
├── backend/
│   ├── server.js             ← Main backend server
│   ├── start-backend.bat     ← Backend-only start
│   ├── start-backend.ps1     ← PowerShell backend start
│   └── package.json
│
├── frontend/
│   ├── index.html            ← Entry point
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx
│       ├── index.jsx
│       ├── pages/            ← Main pages
│       └── components/       ← Reusable components
│
└── ml/                       ← Optional ML features
    └── api.py
```

---

## Features Available

✅ **Mood Detection**
- Manual mood selection
- Camera-based emotion detection
- Voice mood analysis
- Text sentiment analysis

✅ **Music Player**
- Mood-based recommendations
- YouTube integration
- Curated playlists

✅ **Dashboard**
- Mood history tracking
- Statistical analysis
- Charts and graphs
- Streak tracking

✅ **Wellness Features**
- Breathing exercises
- Meditation timer
- Daily affirmations
- Mini challenges

✅ **Social Features**
- Mood journal
- Comments
- Sharing

---

## Tips for Best Experience

1. **Always start backend first**, then frontend
2. **Use the quick start script** for easiest setup
3. **Check terminal windows** for error messages if something doesn't work
4. **Clear browser cache** if you see old UI
5. **Use Chrome/Edge** for best compatibility

---

## Getting Help

If you encounter issues:

1. Check the terminal windows for error messages
2. Try stopping all servers and restarting: `stop-echona.bat` then `start-echona.bat`
3. Verify all dependencies are installed: `npm install` in both folders
4. Check if ports 3000, 5000, and 5001 are available
5. Restart VSCode if file changes aren't being picked up

---

## What's Been Fixed

✅ **Robust Backend**
- Auto-restart on crashes
- Better error handling
- Graceful shutdown
- Detailed logging
- Port conflict detection

✅ **Easy Startup**
- One-click start scripts
- Auto server management
- Health checks
- Status monitoring

✅ **Permanent Solution**
- Backend won't randomly crash
- Clear error messages when something goes wrong
- Auto-recovery from common errors
- Scripts handle all edge cases

---

**Enjoy your ECHONA experience! 🎵🎭📊**
