# ECHONA - AI-Powered Mental Wellness Platform

<div align="center">

![ECHONA](https://img.shields.io/badge/ECHONA-Mental%20Wellness-8B5CF6?style=for-the-badge)
![React](https://img.shields.io/badge/React-19.2.0-61DAFB?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?style=for-the-badge&logo=node.js)
![Python](https://img.shields.io/badge/Python-ML-3776AB?style=for-the-badge&logo=python)

An intelligent mental wellness platform that combines multimodal emotion detection, music therapy, and personalized wellness workflows.

### Live Demo

[![Live Application](https://img.shields.io/badge/Live_Demo-Visit_App-8B5CF6?style=for-the-badge)](https://echona-qanj.vercel.app)

Production URLs:
- Frontend: [https://echona-qanj.vercel.app](https://echona-qanj.vercel.app)
- Backend API: [https://echona.onrender.com](https://echona.onrender.com)
- ML Service: [https://echona-ml.onrender.com](https://echona-ml.onrender.com)

### Project Presentation
- Slides: [ECHONA Project PPT](https://onedrive.live.com/:p:/g/personal/01e12439c7dbdf5a/IQCNVafGM2u7Taz3CMj52PYcAcB1sSM9WRkvmiojFsDFFr4?rtime=t7uN9MmW3kg&redeem=aHR0cHM6Ly8xZHJ2Lm1zL3AvYy8wMWUxMjQzOWM3ZGJkZjVhL0lRQ05WYWZHTTJ1N1RhejNDTWo1MlBZY0FjQjFzU005V1Jrdm1pb2pGc0RGRnI0P2U9TTNtcWhy)

[Features](#features) | [Tech Stack](#tech-stack) | [Architecture](#architecture) | [Installation](#installation) | [Usage](#usage)

Quick deploy guide: [DEPLOY_EASY.md](DEPLOY_EASY.md)

</div>

---

## Features

### Multimodal Emotion Detection
- Face emotion detection with trained model and fallback strategies
- Voice emotion detection from uploaded or recorded audio
- Text emotion detection with model cascade and keyword fallback
- Multimodal fusion endpoint combining face, voice, and text signals
- Confidence and source metadata returned for every prediction

### Music and Recommendation System
- Mood-based music recommendations
- Therapy context per mood (goal, strategy, energy, tags)
- Spotify OAuth integration for profile, playlists, and playback
- Music Intelligence search, transition, rescue, and impact modules
- Playback fallback and recovery behavior

### Wellness and Productivity
- Mood history tracking and dashboard analytics
- Journal create/read/delete workflow
- Planner workflow with statuses, effort points, and tags
- Wellness habits and mood synchronization APIs
- Guided chat mood signals and wellness intelligence panel

### Platform Reliability
- Backend proxy for ML requests with retry and timeout policy
- Session-based authentication with CSRF protection
- Rate limiting and security headers
- Health endpoints for frontend, backend, and ML services
- Local one-command startup with service health checks

---

## Tech Stack

### Frontend
- React 19
- React Router DOM 6
- Vite 5
- Tailwind CSS
- Framer Motion
- Axios
- Chart.js and react-chartjs-2
- react-helmet-async
- DOMPurify

### Backend
- Node.js
- Express 4
- express-session
- connect-mongo
- mongoose
- helmet
- express-rate-limit
- cors
- axios
- spotify-web-api-node
- google-auth-library

### Machine Learning Service
- Python 3
- Flask and flask-cors
- TensorFlow and Keras
- OpenCV
- scikit-learn
- Librosa
- NumPy and SciPy
- Transformers
- DeepFace (fallback path)
- NLTK

### Storage
- MongoDB (primary when configured)
- In-memory fallback for session/data continuity in optional-db mode
- Browser localStorage for selected client-side persistence
- JSON logs for ML metrics and predictions

---

## Architecture

ECHONA uses a three-service architecture:

1. Frontend (React): user interface, routing, state management, and input capture
2. Backend (Express): auth/session security, API orchestration, Spotify integration, wellness and music-intel business logic
3. ML Service (Flask): face/voice/text inference, multimodal fusion, recommendation engine

Typical ML request flow:

1. Frontend sends request to backend `/api/ml/*`
2. Backend validates and proxies to ML service
3. ML service runs model inference and returns emotion/confidence/source
4. Backend normalizes response and forwards to frontend
5. Frontend stores mood and drives dashboard/music experiences

---

## Installation

### Prerequisites
- Node.js 18 or higher
- Python 3.8 or higher
- npm
- Spotify Developer account (for Spotify features)

### Clone
```bash
git clone https://github.com/kirtankumarsanghi/Echona.git
cd echona-pro
```

### Install Frontend Dependencies
```bash
cd frontend
npm install
```

### Install Backend Dependencies
```bash
cd ../backend
npm install
```

### Setup Python Environment
```bash
cd ..
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt
```

---

## Environment Configuration

Create `.env` in root or `backend/.env` depending on your setup.

### Required/Recommended Backend Variables
```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000
ML_SERVICE_URL=http://127.0.0.1:5001

SESSION_SECRET=replace_with_secure_random_value

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URI=http://localhost:5000/api/spotify/callback

MONGODB_URI=your_mongodb_uri_optional

WEATHER_API_KEY=your_openweather_api_key_optional
```

Notes:
- Backend uses session-based auth, not JWT-based auth.
- If `MONGODB_URI` is missing or invalid, backend continues in optional in-memory mode.
- Ports are also read from `service-config.json`.

---

## Usage

### One-command startup (Windows PowerShell)
```powershell
.\start-all.ps1
```

This starts ML, backend, and frontend in separate PowerShell windows and waits for health readiness.

### Manual startup

Terminal 1 (ML service):
```bash
python api.py
```

Terminal 2 (Backend):
```bash
cd backend
npm start
```

Terminal 3 (Frontend):
```bash
cd frontend
npm run dev
```

Default local URLs (from `service-config.json` defaults):
- Frontend: `http://127.0.0.1:3000`
- Backend: `http://127.0.0.1:5000`
- ML: `http://127.0.0.1:5001`

---

## Project Structure

```text
echona-pro/
|- frontend/                # React application
|  |- src/components/       # Reusable UI components
|  |- src/pages/            # Route pages
|  |- src/context/          # Auth and mood context providers
|  |- src/api/              # Axios and ML API wrappers
|  `- src/utils/            # Shared helpers
|- backend/                 # Express API server
|  |- routes/               # Auth, mood, ml, spotify, wellness, music-intel
|  |- middleware/           # Auth, logging, error handlers
|  |- services/             # External service integrations
|  `- config/               # Environment and config validation
|- ml/                      # ML modules and model artifacts
|  |- face_emotion.py
|  |- voice_emotion.py
|  |- text_emotion.py
|  |- fusion.py
|  |- recommend.py
|  |- logs/                 # Metrics and prediction logs
|  `- models/               # .h5 and .pkl model files
|- api.py                   # Flask ML API entrypoint
|- start-all.ps1            # Local startup orchestrator
|- service-config.json      # Shared ports/hosts/timeouts
`- requirements.txt         # Python dependencies
```

---

## Recent Product Changes

- Added robust music-intel routes and frontend panels
- Added wellness intelligence hub workflows and APIs
- Improved planner system with richer task metadata
- Added stronger ML proxy retry and cold-start handling
- Expanded multimodal detection endpoints and diagnostics
- Improved session and CSRF security flow for production deployments

---

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m "feat: your change"`)
4. Push to your branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## Contact

Project Creator: Kirtan Kumar Sanghi
Email: kirtankumarsanghi@example.com

</div>
