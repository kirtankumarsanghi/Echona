# 🎵 Spotify Integration - Permanent Fix Guide

## Problem: "INVALID_CLIENT: Invalid redirect URI"

This error occurs when the redirect URI in your code doesn't match what's registered in the Spotify Developer Dashboard.

---

## ✅ Step-by-Step Fix

### Step 1: Login to Spotify Developer Dashboard

1. Go to: **https://developer.spotify.com/dashboard**
2. Login with your Spotify account
3. Click on your app: **"echona-pro"** (or whatever name you used)

### Step 2: Add Redirect URI

1. Click **"Edit Settings"** button (top right)
2. Scroll down to **"Redirect URIs"** section
3. Add this EXACT URI:
   ```
   http://localhost:5000/api/spotify/callback
   ```
4. Click **"ADD"** button
5. Scroll to bottom and click **"SAVE"**

### Step 3: Verify Your Credentials

Make sure your `.env` file in the `backend` folder has the correct credentials:

```env
SPOTIFY_CLIENT_ID=68954d4553a54b298d58299f7fb4f225
SPOTIFY_CLIENT_SECRET=9cf1e521879a445f819130e026439930
SPOTIFY_REDIRECT_URI=http://localhost:5000/api/spotify/callback
```

**Important:** The Client ID and Secret shown above are from your current `.env`. Make sure they match what's in your Spotify Dashboard.

---

## 🎮 How to Use Spotify in Your App

### Option 1: Web Player (Embedded Playback) ⭐ RECOMMENDED

Your app already has a **Spotify Web Player** built in! This lets users play songs DIRECTLY in the browser without leaving the site.

**Requirements:**
- ✅ Spotify Premium account
- ✅ Modern browser (Chrome, Firefox, Edge, Safari)

**How It Works:**
1. Click **"Connect to Spotify"** button on the Music page
2. Login with your Spotify account
3. The Spotify Web Player loads automatically
4. Search for songs and click to play them IN THE WEBSITE
5. Full playback controls (play, pause, skip, volume)

### Option 2: Search Without Login

- You can search Spotify tracks without logging in
- Click "Open in Spotify" to play in the Spotify app/web

---

## 🔧 Testing the Fix

### Test 1: Backend Health Check
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/spotify/health"
```

**Expected Response:**
```json
{
  "success": true,
  "status": "ok",
  "configured": true,
  "message": "Spotify service ready"
}
```

### Test 2: OAuth Flow (Manual)

1. Make sure backend is running: `cd backend && npm start`
2. Make sure frontend is running: `cd frontend && npm run dev`
3. Open: `http://localhost:3000/music`
4. Click **"Connect to Spotify"** button
5. You should be redirected to Spotify login page
6. After login, you should return to your app with access

---

## 📋 Current Redirect URIs to Register

Register **ALL** of these in your Spotify Dashboard for maximum compatibility:

```
http://localhost:5000/api/spotify/callback
http://127.0.0.1:5000/api/spotify/callback
http://localhost:3000/callback
```

(The main one is the first, but adding all three prevents issues)

---

## 🎵 Features Available After Connecting

Once connected to Spotify, users can:

### In the Music Page:
1. **Web Player** - Play songs directly in browser
2. **Search** - Search entire Spotify catalog
3. **Top Tracks** - View user's most played tracks
4. **Top Artists** - View user's favorite artists  
5. **Recent Plays** - See recently played tracks
6. **Playlists** - Browse user's playlists
7. **Playback Control** - Play, pause, skip, volume control

### Technical Details:
- Uses Spotify Web Playback SDK
- Requires Spotify Premium for playback
- Fallback to "Open in Spotify" for free users
- Tokens stored securely in localStorage
- Automatic token refresh

---

## 🐛 Troubleshooting

### Issue: Still Getting "Invalid Redirect URI"

**Solution:**
1. Double-check the URI is EXACTLY: `http://localhost:5000/api/spotify/callback`
2. No trailing slash
3. No extra spaces
4. Click SAVE in Spotify Dashboard
5. Wait 1-2 minutes for changes to propagate
6. Clear browser cache
7. Try again

### Issue: "Premium Required" Error

**Solution:**
- Spotify Web Playback only works with Premium accounts
- Free users can still:
  - Search songs
  - View recommendations
  - Click "Open in Spotify" to play in Spotify app

### Issue: Player Not Loading

**Solution:**
1. Check browser console for errors (F12)
2. Make sure you're using HTTPS or localhost (Spotify SDK requirement)
3. Disable browser extensions that might block scripts
4. Try a different browser (Chrome works best)

### Issue: Token Expired

**Solution:**
- Tokens expire after 1 hour
- Click "Disconnect" then "Connect to Spotify" again
- Or implement automatic refresh (already built in)

---

## 🔐 Security Notes

1. **Never commit** `.env` file to Git
2. **Regenerate secrets** before deploying to production
3. Add production domain to Spotify Dashboard redirects
4. Use environment variables for deployment

---

## 📸 What It Should Look Like

After fixing and connecting:

```
┌────────────────────────────────────┐
│  🎵 Spotify Web Player             │
│  ✅ Connected                      │
│  🎧 Now Playing: Song Name         │
│  ──────────■───────── 2:15        │
│   ⏮️  ⏯️  ⏭️  🔊────────          │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│  🔍 Search Spotify                 │
│  [Search for songs, artists...]    │
└────────────────────────────────────┘

Top Tracks | Top Artists | Playlists
```

---

## 🚀 Quick Commands

### Start Everything:
```powershell
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend  
cd frontend
npm run dev

# Terminal 3 - ML Service (Optional)
python api.py
```

### Test Spotify:
```powershell
# Health check
Invoke-RestMethod "http://localhost:5000/api/spotify/health"

# Manual OAuth (opens browser)
Start-Process "http://localhost:5000/api/spotify/login"
```

---

## ✅ Checklist

Before testing, verify:

- [ ] Backend is running on port 5000
- [ ] Frontend is running on port 3000
- [ ] Redirect URI added to Spotify Dashboard
- [ ] Redirect URI saved in Spotify Dashboard
- [ ] `.env` file has correct CLIENT_ID and CLIENT_SECRET
- [ ] Browser allows third-party cookies (for Spotify)
- [ ] You have a Spotify Premium account (for playback)

---

## 📞 Still Having Issues?

If you followed all steps and still see the error:

1. **Verify Client ID/Secret:**
   - Go to Spotify Dashboard
   - Copy the Client ID and Client Secret
   - Paste them into `backend/.env`
   - Restart backend server

2. **Check Spotify Dashboard Settings:**
   - Make sure the app is not in "Development Mode" restrictions
   - Add your Spotify account email to "Users and Access" if needed

3. **Try Incognito Mode:**
   - Clear all cookies and cache
   - Try in incognito/private window
   - This rules out cookie/cache issues

---

**Your app already has full Spotify integration built in! Just add the redirect URI and you're ready to play songs in the website! 🎵**
