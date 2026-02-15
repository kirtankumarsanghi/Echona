# 🎵 ECHONA PRO - Complete Setup & Usage Guide

## 🚀 Quick Start (Permanent Solution)

### **One-Click Startup**
Simply double-click: **`START_ECHONA.bat`**

This will automatically:
- ✅ Kill any processes blocking ports 3000, 5000, 5001
- ✅ Start ML API (Flask on port 5001)
- ✅ Start Backend Server (Node.js on port 5000)
- ✅ Start Frontend (React on port 3000)

### **One-Click Shutdown**
Double-click: **`STOP_ECHONA.bat`**

---

## 📋 Prerequisites

### 1. **Python Virtual Environment**
```powershell
# Create virtual environment (one-time setup)
python -m venv venv

# Activate it
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. **Node.js Dependencies**
```powershell
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. **API Keys Configuration**

Edit `backend\.env` file with your API keys:

```env
# Spotify API (Get from: https://developer.spotify.com/dashboard)
SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here
SPOTIFY_REDIRECT_URI=http://localhost:5000/api/spotify/callback

# Weather API (Get from: https://openweathermap.org/api)
WEATHER_API_KEY=your_weather_api_key_here

# JWT Secret (for authentication)
JWT_SECRET=your_super_secret_key_change_this

# MongoDB (OPTIONAL - leave commented if not using)
# MONGODB_URI=mongodb://localhost:27017/echona
```

---

## 🔧 Features Included

### ✅ **Working Features:**

1. **🎭 Mood Detection**
   - Face emotion detection (via webcam)
   - Text sentiment analysis
   - Voice emotion recognition

2. **🎵 Spotify Integration**
   - Full Spotify playback control
   - Search tracks and playlists
   - Mood-based recommendations
   - Player controls (play, pause, skip)

3. **🌤️ Weather API**
   - Real-time weather data
   - Location-based weather
   - Weather-mood correlation

4. **🔐 User Authentication**
   - Register new users
   - Login with JWT tokens
   - Protected routes
   - User sessions

5. **📊 Additional Features**
   - Mood history tracking
   - Daily affirmations
   - Breathing exercises
   - Meditation timer
   - Music challenges
   - Mood journal

---

## 🖥️ Manual Startup (Alternative)

If you prefer manual control:

### Option 1: PowerShell Scripts
```powershell
# Start all services
.\start-echona-complete.ps1

# Stop all services
.\stop-echona-complete.ps1
```

### Option 2: Individual Services
```powershell
# Terminal 1: ML API
.\venv\Scripts\python.exe api.py

# Terminal 2: Backend
cd backend
node server.js

# Terminal 3: Frontend
cd frontend
npm run dev
```

---

## 🌐 Access Points

Once started, access your application at:

| Service | URL | Port |
|---------|-----|------|
| **Frontend (Main App)** | http://localhost:3000 | 3000 |
| **Backend API** | http://localhost:5000 | 5000 |
| **ML API (Flask)** | http://127.0.0.1:5001 | 5001 |

---

## 🔍 Troubleshooting

### **Port Already in Use**
```powershell
# Run the stop script first
.\STOP_ECHONA.bat

# Or manually kill ports:
Get-NetTCPConnection -LocalPort 5000 | Select -Expand OwningProcess | Stop-Process -Force
Get-NetTCPConnection -LocalPort 5001 | Select -Expand OwningProcess | Stop-Process -Force
Get-NetTCPConnection -LocalPort 3000 | Select -Expand OwningProcess | Stop-Process -Force
```

### **Python Module Not Found**
```powershell
# Activate venv and install
.\venv\Scripts\activate
pip install opencv-python tensorflow librosa numpy flask flask-cors
```

### **Node Modules Missing**
```powershell
# Reinstall dependencies
cd backend
npm install

cd ../frontend
npm install
```

### **Spotify Not Working**
1. Check `backend\.env` has correct `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET`
2. Verify redirect URI in Spotify Dashboard matches: `http://localhost:5000/api/spotify/callback`
3. Restart backend server after changing .env

### **Weather API Not Working**
1. Get free API key from: https://openweathermap.org/api
2. Add to `backend\.env`: `WEATHER_API_KEY=your_key_here`
3. Restart backend server

### **Login/Authentication Issues**
1. Check `JWT_SECRET` is set in `backend\.env`
2. Clear browser localStorage: Open DevTools → Application → Local Storage → Clear
3. Try registering a new account

### **MongoDB Connection Errors**
MongoDB is **OPTIONAL**. The app works without it.
- If you see MongoDB warnings, they're harmless
- To disable: keep `MONGODB_URI` commented in `backend\.env`
- To enable: Install MongoDB and uncomment the line

---

## 📁 Project Structure

```
echona-pro/
├── START_ECHONA.bat          ← Double-click to start everything
├── STOP_ECHONA.bat           ← Double-click to stop everything
├── start-echona-complete.ps1 ← PowerShell startup script
├── stop-echona-complete.ps1  ← PowerShell stop script
├── api.py                    ← ML API (Flask)
├── venv/                     ← Python virtual environment
├── backend/
│   ├── server.js            ← Main backend server
│   ├── .env                 ← API keys & configuration
│   ├── routes/              ← API endpoints
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/           ← React pages
│   │   ├── components/      ← React components
│   │   └── api/             ← API configuration
│   └── package.json
└── ml/                       ← ML models and processing
```

---

## 🎯 Usage Workflow

1. **Start the Application**
   - Double-click `START_ECHONA.bat`
   - Wait for all three windows to open
   - Each service has its own terminal window

2. **Access the App**
   - Open browser to http://localhost:3000
   - Register a new account or login

3. **Connect Spotify** (Optional)
   - Go to Music page
   - Click "Connect to Spotify"
   - Authorize the app
   - Start playing music!

4. **Use Mood Detection**
   - Go to Mood Analysis page
   - Choose detection method (face/text/voice)
   - Get mood-based music recommendations

5. **Stop the Application**
   - Double-click `STOP_ECHONA.bat`
   - Or close the three terminal windows

---

## 🔐 Security Notes

- **NEVER** commit `.env` file to Git
- Change `JWT_SECRET` to a strong random string
- Keep API keys private
- Use environment variables in production

---

## 📝 Development

### Running in Development Mode
All services run in development mode by default:
- Flask: Debug mode OFF (for stability)
- Node.js: Auto-restart on file changes (if using nodemon)
- React: Hot reload enabled

### Making Changes
- **Backend**: Edit files in `backend/`, server auto-restarts
- **Frontend**: Edit files in `frontend/src/`, hot reload updates instantly
- **ML API**: Restart ML API window after changing `ml/` files

---

## 🆘 Support

### Common Issues

**Q: Frontend shows "Network Error"**
A: Ensure backend is running on port 5000. Check `backend/.env` is configured.

**Q: ML API crashes on startup**
A: Install missing Python packages: `pip install -r requirements.txt`

**Q: Spotify returns 401 Unauthorized**
A: Check your Spotify API credentials and redirect URI

**Q: Port conflicts even after running stop script**
A: Restart your computer or manually kill processes via Task Manager

---

## 🎉 Success Checklist

After running `START_ECHONA.bat`, you should see:

- ✅ Three PowerShell windows open (ML API, Backend, Frontend)
- ✅ ML API shows: "Running on http://127.0.0.1:5001"
- ✅ Backend shows: "Server running on port 5000"
- ✅ Frontend shows: "Local: http://localhost:3000"
- ✅ Browser opens to http://localhost:3000
- ✅ No red error messages in any window

---

## 📄 License

MIT License - Feel free to use and modify!

---

## 👨‍💻 Developed By

ECHONA PRO Team - 2026

**Enjoy your mood-based music experience! 🎵🎭**
