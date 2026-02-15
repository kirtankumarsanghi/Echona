# ECHONA Phase 3: Context-Aware Music Recommendation

## 🎯 Overview

Phase 3 implements intelligent, environment-aware music recommendations that automatically select songs based on:
- **Time of Day** (Morning, Afternoon, Evening, Night)
- **Weather Conditions** (Sunny, Rainy, Cloudy, Stormy, Snowy)
- **Context-to-Mood Mapping** (Automatic mood selection)

## 🚀 Features

### ✅ Implemented

1. **Weather API Integration**
   - Real-time weather data from OpenWeatherMap
   - Automatic weather condition mapping
   - Graceful fallback if API fails

2. **Time-Based Logic**
   - 4 time contexts: morning, afternoon, evening, night
   - Automatic detection based on system time
   - Smart mood suggestions per time slot

3. **Context Engine**
   - Combines time + weather data
   - Returns structured context object
   - Timestamp tracking for debugging

4. **Context-to-Mood Mapping**
   - Intelligent mapping algorithm
   - Weather takes priority in certain conditions
   - Time-based defaults

5. **Song Selection**
   - 30 verified YouTube songs across 6 moods
   - Mood-based filtering
   - Random selection from matched songs
   - Fallback to all songs if no exact match

6. **Professional UI**
   - Clean, warm color palette (amber/orange/teal)
   - Loading states and error handling
   - Modal with context explanation
   - Auto-play functionality

## 📁 File Structure

```
backend/
├── contextEngine.js       # Time + Weather detection
├── contextToMood.js       # Maps context → mood
├── mockMusic.js          # 30 songs with mood tags
└── routes/
    └── surpriseRoutes.js  # API endpoint

frontend/
└── src/
    └── components/
        └── SurpriseMe.jsx # UI component
```

## 🔧 Setup Instructions

### 1. Get Weather API Key

1. Go to [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for free account
3. Get your API key
4. Create `.env` file in `backend/` folder:

```env
WEATHER_API_KEY=your_api_key_here
```

### 2. Install Dependencies

```bash
cd backend
npm install node-fetch dotenv express
```

### 3. Start Backend

```bash
cd backend
node server.js
```

Backend runs on: `http://localhost:5000`

### 4. Start Frontend

```bash
cd frontend
npm run dev
```

Frontend runs on: `http://localhost:3002`

## 🧠 How It Works

### 1. User Clicks "Surprise Me"

```jsx
// Frontend: SurpriseMe.jsx
const response = await axiosInstance.get("/api/surprise");
```

### 2. Backend Gets Context

```javascript
// Backend: contextEngine.js
const hour = new Date().getHours();
// Determines: morning | afternoon | evening | night

const weatherAPI = await fetch(openweathermap...);
// Determines: sunny | rainy | cloudy | stormy | snowy
```

### 3. Context Mapped to Mood

```javascript
// Backend: contextToMood.js
if (weather === "rainy") return "Calm";
if (time === "morning" && weather === "sunny") return "Happy";
if (time === "night") return "Calm";
// ... comprehensive logic
```

### 4. Song Selected

```javascript
// Backend: surpriseRoutes.js
const matchingSongs = musicLibrary.filter(song => song.mood === selectedMood);
const randomSong = matchingSongs[Math.floor(Math.random() * matchingSongs.length)];
```

### 5. Response Sent

```json
{
  "success": true,
  "context": {
    "time": "evening",
    "weather": "rainy",
    "moodUsed": "Calm"
  },
  "track": {
    "id": "c1",
    "title": "Weightless",
    "artist": "Marconi Union",
    "mood": "Calm",
    "genre": "ambient",
    "youtubeId": "UfcAVejslrU"
  }
}
```

## 🎓 Context-to-Mood Logic

| Context | Mood Selected | Reasoning |
|---------|---------------|-----------|
| Rainy weather | Calm | Rainy weather → relaxing, acoustic vibes |
| Stormy weather | Angry | Intense weather → powerful music |
| Sunny morning | Happy | Bright start → energetic, positive |
| Sunny afternoon | Excited | Peak energy time → active music |
| Evening | Calm | Wind-down time → relaxing |
| Night | Calm | Late hours → peaceful, ambient |
| Cloudy night | Sad | Melancholic atmosphere |

## 🎵 Music Library

- **Happy**: 5 songs (Pharrell, Bruno Mars, Justin Timberlake...)
- **Calm**: 5 songs (Weightless, River Flows, Clair de Lune...)
- **Excited**: 5 songs (Eye of Tiger, Believer, Titanium...)
- **Sad**: 5 songs (Someone Like You, Let Her Go, Fix You...)
- **Angry**: 5 songs (Lose Yourself, In The End, We Will Rock You...)
- **Anxious**: 5 songs (Breathe Me, Skinny Love, Creep...)

**Total: 30 verified YouTube songs**

## 🔍 Testing Scenarios

### Morning + Sunny
**Expected**: Happy/Excited mood
**Song Example**: "Happy" by Pharrell Williams

### Evening + Rainy
**Expected**: Calm mood
**Song Example**: "Weightless" by Marconi Union

### Night + Clear
**Expected**: Calm mood
**Song Example**: "River Flows In You" by Yiruma

### Afternoon + Stormy
**Expected**: Angry mood
**Song Example**: "Lose Yourself" by Eminem

## ⚡ API Endpoints

### GET /api/surprise

**Description**: Context-aware music recommendation

**Response**:
```json
{
  "success": true,
  "context": {
    "time": "morning",
    "weather": "sunny",
    "moodUsed": "Happy",
    "temperature": 25,
    "timestamp": "2026-02-11T10:30:00.000Z"
  },
  "track": {
    "id": "h1",
    "title": "Happy",
    "artist": "Pharrell Williams",
    "mood": "Happy",
    "genre": "pop",
    "youtubeId": "ZbZSe6N_BXs"
  }
}
```

**Error Response**:
```json
{
  "success": false,
  "error": "Failed to generate context-aware surprise"
}
```

## 🎨 UI Features

1. **Context Display**: Shows time + weather that influenced selection
2. **Mood Badge**: Visual mood indicator with warm colors
3. **Explanation**: Why this song was chosen
4. **Auto-play**: Opens YouTube in new tab
5. **Try Another**: Get new recommendation with one click
6. **Loading State**: Smooth animation while processing
7. **Error Handling**: Clear error messages

## 🐛 Troubleshooting

### Weather API Not Working
- Check `.env` file has `WEATHER_API_KEY`
- Verify API key is valid at openweathermap.org
- Check console for error messages
- System falls back to "clear" weather if API fails

### Backend Not Responding
- Ensure backend is running on port 5001
- Check `node server.js` output for errors
- Verify `node-fetch` is installed
- Check firewall settings

### Songs Not Playing
- Verify YouTube IDs are correct
- Check internet connection
- YouTube may block embeds (opens in new tab instead)
- Verify `mockMusic.js` has proper structure

## 📊 For VIVA/Interview

**Question**: "How does your Surprise Me feature work?"

**Answer**: 
"Phase 3 implements context-aware music recommendations using real-time data. The system fetches current weather conditions via OpenWeatherMap API and combines it with time-of-day detection. This context is mapped to appropriate moods through a comprehensive algorithm - for example, rainy evenings suggest calm music while sunny mornings suggest energetic tracks. The backend filters our verified music library by mood and randomly selects a song, ensuring both intelligent recommendations and variety. This makes Echona proactive and environment-aware, not just user-dependent."

**Key Points to Emphasize**:
- ✅ Real-time weather API integration
- ✅ Time-based contextual awareness
- ✅ Intelligent mood mapping algorithm
- ✅ No user input required
- ✅ Graceful error handling and fallbacks
- ✅ Verified music library with 30 songs

## 🎯 Success Metrics

- ✅ Zero user input required
- ✅ Context detected automatically
- ✅ Appropriate mood selected
- ✅ Song plays immediately
- ✅ Professional UI presentation
- ✅ Robust error handling

## 🔮 Future Enhancements

1. **User Location Detection**: Dynamic city selection
2. **Temperature Influence**: Hot weather → chill music
3. **Learning System**: Remember user preferences
4. **Spotify Integration**: Stream songs directly
5. **Social Features**: Share surprise picks
6. **Analytics**: Track most popular context combinations

---

**Phase 3 Status**: ✅ **COMPLETE**

All features implemented, tested, and production-ready.
