# 🎵 Spotify Integration Setup Guide

## Prerequisites

You need a Spotify Developer account to use Spotify authentication.

## Step 1: Create Spotify Developer App

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account
3. Click **"Create an App"**
4. Fill in the details:
   - **App Name**: ECHONA
   - **App Description**: Mood-based music recommendation app
   - Click **"Create"**

## Step 2: Get Your Credentials

1. In your app dashboard, you'll see:
   - **Client ID** - Copy this
   - **Client Secret** - Click "Show Client Secret" and copy this

## Step 3: Set Redirect URI

1. Click **"Edit Settings"** in your Spotify app dashboard
2. Under **Redirect URIs**, add:
   ```
  http://localhost:5000/api/spotify/callback
   ```
3. Click **"Add"**
4. Scroll down and click **"Save"**

## Step 4: Configure Backend

1. Open `backend/.env` file (create it if it doesn't exist)
2. Add your Spotify credentials:

```env
# Spotify API Credentials
SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here
SPOTIFY_REDIRECT_URI=http://localhost:5000/api/spotify/callback
```

**Replace `your_client_id_here` and `your_client_secret_here` with your actual credentials from Step 2.**

## Step 5: Install Dependencies (if needed)

The backend needs these packages:
```bash
cd backend
npm install spotify-web-api-node dotenv
```

## Step 6: Restart Backend

After configuring the .env file:

```bash
# Stop backend if running
# Then restart:
cd backend
node server.js
```

Or use the startup script:
```bash
.\start-echona.bat
```

## Step 7: Test Authentication

1. Start both backend and frontend
2. Go to http://localhost:3000/music
3. Click **"Connect to Spotify"** button
4. You'll be redirected to Spotify login
5. After login, you'll be redirected back to ECHONA
6. The button should now show **"Spotify Connected"** ✅

## How It Works

```
User clicks "Connect" 
  ↓
Redirected to Spotify Login (http://localhost:5000/api/spotify/login)
  ↓
User authorizes ECHONA
  ↓
Spotify redirects to callback (http://localhost:5000/api/spotify/callback)
  ↓
Backend exchanges code for access token
  ↓
Backend redirects to frontend with token (http://localhost:3000/callback)
  ↓
Frontend saves token to localStorage
  ↓
User redirected to /music page with Spotify connected! 🎉
```

## Troubleshooting

### "Invalid client" error
- Check that your Client ID and Client Secret are correct in `.env`
- Make sure there are no extra spaces or quotes

### "Invalid redirect URI" error  
- Go to Spotify Dashboard → Edit Settings
- Make sure `http://localhost:5000/api/spotify/callback` is in the Redirect URIs list
- Make sure it matches EXACTLY (no trailing slash)

### Can't see "Connect to Spotify" button
- Clear browser cache (Ctrl+Shift+Del)
- Hard refresh (Ctrl+F5)
- Restart frontend server

### Backend not loading Spotify routes
- Make sure `dotenv` is installed: `npm install dotenv`
- Check that `server.js` is running with `node server.js`
- Restart backend server

### Token expires quickly
- Spotify access tokens expire after 1 hour
- Implement token refresh using the `/api/spotify/refresh` endpoint (future enhancement)

## API Endpoints

After setup, these endpoints are available:

- **GET** `/api/spotify/login` - Redirects to Spotify authorization
- **GET** `/api/spotify/callback` - Handles OAuth callback
- **POST** `/api/spotify/refresh` - Refreshes expired access token
- **GET** `/api/spotify/me` - Gets current user profile

## Security Notes

- ✅ `.env` file is in `.gitignore` (credentials not committed to Git)
- ✅ Client Secret stays on backend (never sent to frontend)
- ✅ Access tokens stored in browser localStorage (not persistent cookies)
- ⚠️ For production, use HTTPS and proper secret management

## Next Steps

After Spotify is connected, you can:
- Fetch user's playlists
- Get user's top tracks
- Create custom playlists based on mood
- Control Spotify playback directly from ECHONA

Need help? Check the [Spotify Web API Documentation](https://developer.spotify.com/documentation/web-api/)

---

**Happy listening! 🎶**
