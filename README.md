# 🎵 ECHONA - AI-Powered Mental Wellness Platform

<div align="center">

![ECHONA](https://img.shields.io/badge/ECHONA-Mental%20Wellness-8B5CF6?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?style=for-the-badge&logo=node.js)
![Python](https://img.shields.io/badge/Python-ML-3776AB?style=for-the-badge&logo=python)

**An intelligent mental wellness companion that combines emotion detection, music therapy, and personalized recommendations.**

### 🚀 **Live Demo**

[![Live Application](https://img.shields.io/badge/🌐_Live_Demo-Visit_App-8B5CF6?style=for-the-badge)](https://echona-qanj.vercel.app)

**Production URLs:**
-  **Frontend**: [https://echona-qanj.vercel.app](https://echona-qanj.vercel.app)
- **Backend API**: [https://echona.onrender.com](https://echona.onrender.com)
-  **ML Service**: [https://echona-ml.onrender.com](https://echona-ml.onrender.com)

[Features](#features) • [Tech Stack](#tech-stack) • [Installation](#installation) • [Usage](#usage) • [Documentation](#documentation)

</div>

---

##  Features

###  **Multi-Modal Emotion Detection**
- **Facial Emotion Recognition** - Real-time face emotion analysis using computer vision
- **Voice Emotion Analysis** - Detect emotions from voice tone and patterns
- **Text Sentiment Analysis** - Analyze emotional state from journal entries
- **Multimodal Fusion** - Combine all modalities for accurate emotion detection

### 🎶 **AI Music Therapy**
- **Mood-Based Recommendations** - Curated playlists based on your emotional state
- **Spotify Integration** - Seamless music playback with your Spotify account
- **Context-Aware Suggestions** - Music recommendations based on time, weather, and context
- **Surprise Me Feature** - Discover new music matched to your mood
- **Music Intelligence Search** - Faster, richer song discovery with improved metadata quality
- **Multilingual Song Search** - Better support for mixed-language and non-English queries
- **Smart Playback Recovery** - Handles unavailable tracks with graceful fallback and recovery
- **Live Sidebar Mini Player** - Persistent mini player with progress, quick controls, and mood glow

### **Wellness Dashboard**
- **Mood Tracking** - Visualize your emotional journey over time
- **Analytics & Insights** - Understand patterns in your mental wellness
- **Progress Charts** - Track improvements and identify trends
- **Activity History** - Review past mood entries and music sessions

### **Productivity Tools**
- **Smart Todo List** - Organize tasks with mood-aware prioritization
- **Journal Integration** - Express yourself through writing
- **Daily Challenges** - Personalized wellness activities
- **Planner Cockpit** - Quick capture, energy budget, and next-best-task recommendations
- **Board + List Views** - Workflow-friendly task management in both Kanban and list formats
- **Task Metadata** - Status flow, effort points, and tags for better planning clarity

### **Wellness Intelligence (New)**
- **Wellness Hub APIs** - New backend routes for wellness and music-intel insights
- **Mood Chat Detection** - Conversational mood signals integrated into the wellness flow
- **In-App Intelligence Panels** - New frontend panels for wellness and music intelligence

---

##  Tech Stack

### Frontend
- **React 18** - Modern UI with hooks and functional components
- **Vite** - Lightning-fast build tool and dev server
- **Tailwind CSS** - Utility-first styling with custom dark theme
- **Framer Motion** - Smooth animations and transitions
- **Chart.js** - Interactive data visualizations
- **Axios** - API communication

### Backend
- **Node.js & Express** - RESTful API server
- **JWT Authentication** - Secure user sessions
- **Spotify Web API** - Music streaming integration
- **Weather API** - Context-aware recommendations

### Machine Learning
- **Python 3.x** - ML model serving
- **TensorFlow/Keras** - Deep learning models
- **OpenCV** - Computer vision processing
- **Librosa** - Audio feature extraction
- **NLTK** - Natural language processing

### Database
- **SQLite** - Lightweight data storage
- **LocalStorage** - Client-side caching

---

## Installation

### Prerequisites
- **Node.js** 16.x or higher
- **Python** 3.8 or higher
- **npm** or **yarn**
- **Spotify Developer Account** (for music features)

### Clone the Repository
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

# Install Python packages
pip install -r requirements.txt
```

### Environment Configuration

Create `.env` file in the root directory:

```env
# Spotify API
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URI=http://localhost:5173/music

# Backend
PORT=5000
JWT_SECRET=your_jwt_secret_key

# Weather API (optional)
WEATHER_API_KEY=your_openweather_api_key

# ML Service
ML_SERVICE_PORT=5001
```

> 📝 **Note**: Get your Spotify credentials from [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)

---

##  Usage

### Quick Start

**Terminal 1** - Frontend:
```bash
cd frontend
npm run dev
```

**Terminal 2** - Backend:
```bash
cd backend
node server.js
```

**Terminal 3** - ML Service:
```bash
python api.py
```

Access the application at: **http://localhost:5173**

---

##  Project Structure

```
echona-pro/
│
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── utils/         # Helper functions
│   │   └── styles/        # Global styles
│   └── public/            # Static assets
│
├── backend/               # Node.js backend server
│   ├── routes/           # API route handlers
│   ├── services/         # Business logic
│   ├── middleware/       # Express middleware
│   ├── models/           # Data models
│   └── config/           # Configuration
│
├── ml/                   # Python ML services
│   ├── face_emotion.py   # Facial recognition
│   ├── voice_emotion.py  # Voice analysis
│   ├── text_emotion.py   # Text sentiment
│   ├── fusion.py         # Multimodal fusion
│   └── recommend.py      # Music recommendations
│
├── uploads/              # User-uploaded files
├── api.py                # ML API server
├── requirements.txt      # Python dependencies
└── service-config.json   # Service configuration
```

---

##  Key Features in Detail

### Emotion Detection System
The platform uses a sophisticated multimodal approach:
1. **Face Module**: Detects 7 basic emotions (happy, sad, angry, fear, surprise, disgust, neutral)
2. **Voice Module**: Analyzes pitch, tone, and rhythm patterns
3. **Text Module**: Processes sentiment from journal entries
4. **Fusion Engine**: Combines all inputs with weighted confidence scores

### Music Recommendation Engine
- **Mood Mapping**: Translates emotions to music characteristics (valence, energy, tempo)
- **Context Analysis**: Considers time of day, weather, and user history
- **Personalization**: Learns from user preferences and listening patterns
- **Diversity**: Balances familiar comfort songs with new discoveries

---

##  Recent Updates

### March 2026 - Major Product Upgrade
- ✅ Improved music metadata extraction to reduce generic artist/channel labels
- ✅ Added robust music-intel search quality and playback fallback behavior
- ✅ Added persistent sidebar mini player with live controls and progress sync
- ✅ Upgraded planner with workflow statuses, effort points, tags, and smart recommendations
- ✅ Added wellness and music intelligence backend/frontend modules
- ✅ Performed repository cleanup by removing legacy duplicates, backups, and non-runtime assets
- 📦 **Result**: Better UX, smarter recommendations, cleaner codebase, and stronger runtime stability

---

##  Contributing

Contributions are welcome! Please read our contributing guidelines first.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
---

##       Acknowledgments

- Spotify Web API for music integration
- OpenAI for AI insights
- TensorFlow community for ML models
- React and Node.js communities

---

##  Contact

**Project Creator**: Kirtan Kumar Sanghi
**Email**: kirtankumarsanghi@example.com  


---

<div align="center">

** Star this repo if you find it helpful!**

Made with ❤️ for mental wellness

</div>
