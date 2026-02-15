# 🎵 Spotify Integration Setup for Production

## Step 1: Create Spotify Developer App (5 minutes)

### 1.1 Go to Spotify Developer Dashboard
Visit: https://developer.spotify.com/dashboard

### 1.2 Login or Create Account
- Use your Spotify account (Free or Premium)
- Accept Terms of Service

### 1.3 Create New App
1. Click **"Create app"**
2. Fill in the form:
   ```
   App Name: ECHONA Production
   App Description: Mental wellness app with mood-based music recommendations
   Website: https://echona-qanj.vercel.app
   Redirect URI: https://echona.onrender.com/api/spotify/callback
   ```
3. Check the box: "I understand and agree..."
4. Click **"Save"**

### 1.4 Get Your Credentials
1. Click on your newly created app
2. Click **"Settings"** button (top right)
3. You'll see:
   - **Client ID**: (copy this - looks like: `abc123def456...`)
   - **Client Secret**: Click "View client secret" (copy this)

**⚠️ IMPORTANT**: Keep Client Secret private! Never commit it to GitHub.

---

## Step 2: Configure Render Environment Variables (2 minutes)

### 2.1 Go to Render Dashboard
Visit: https://render.com/dashboard

### 2.2 Open Your Backend Service
1. Click on **"echona"** (your Node.js service)
2. Go to **"Environment"** tab (left sidebar)

### 2.3 Add Spotify Variables
Click **"Add Environment Variable"** and add these **THREE** variables:

| Key | Value | Example |
|-----|-------|---------|
| `SPOTIFY_CLIENT_ID` | Your Client ID from Step 1.4 | `abc123def456...` |
| `SPOTIFY_CLIENT_SECRET` | Your Client Secret from Step 1.4 | `xyz789ghi012...` |
| `SPOTIFY_REDIRECT_URI` | `https://echona.onrender.com/api/spotify/callback` | (exact value) |

### 2.4 Save and Wait
1. Click **"Save Changes"**
2. Backend will auto-redeploy (~1-2 minutes)
3. Wait for deployment to complete

---

## Step 3: Test Spotify Integration (3 minutes)

### 3.1 Check Backend Health
Visit: https://echona.onrender.com/api/spotify/health

**Expected Response:**
```json
{
  "success": true,
  "configured": true,
  "client_credentials": "valid"
}
```

### 3.2 Test on Frontend
1. Visit: https://echona-qanj.vercel.app
2. Login to your account
3. Go to Dashboard
4. Click **"Connect Spotify"** button
5. Authorize ECHONA to access your Spotify
6. You'll be redirected back with Spotify connected!

### 3.3 Try Music Features
- Search for songs by mood
- Get personalized recommendations
- View your top tracks
- Control playback (if Spotify Premium)

---

## Troubleshooting

### Issue: "Redirect URI Mismatch"
**Solution:** Make sure the Redirect URI in Spotify Dashboard exactly matches:
```
https://echona.onrender.com/api/spotify/callback
```
No trailing slash, must be HTTPS.

### Issue: "Invalid Client"
**Solution:** Double-check your Client ID and Client Secret are copied correctly without extra spaces.

### Issue: "Spotify unavailable"
**Solution:** 
1. Check backend logs on Render
2. Verify all 3 environment variables are set
3. Make sure backend finished redeploying

### Issue: "Premium Required"
**Note:** Some features (playback control, device management) require Spotify Premium. Music search and recommendations work with Free accounts.

---

## Features Available After Setup

✅ **Mood-Based Music Search**
- Search tracks by emotion/mood
- AI-powered recommendations

✅ **Spotify Integration** (with authorization)
- View your top tracks
- Get personalized playlists
- See your listening history

✅ **Premium Features** (Spotify Premium only)
- Control playback
- Skip tracks
- Adjust volume
- Select devices

---

## Security Notes

- Client Secret is stored securely in Render environment variables
- Never exposed to frontend
- OAuth 2.0 authorization flow (industry standard)
- User tokens stored securely in localStorage
- Automatic token refresh implemented

---

## Need Help?

1. **Backend Health Check**: https://echona.onrender.com/api/spotify/health
2. **Spotify Dashboard**: https://developer.spotify.com/dashboard
3. **Render Logs**: render.com > echona > Logs tab

---

## Quick Reference

**Your URLs:**
- Frontend: https://echona-qanj.vercel.app
- Backend: https://echona.onrender.com
- Spotify Callback: https://echona.onrender.com/api/spotify/callback

**Spotify Dashboard:**
- Developer Portal: https://developer.spotify.com/dashboard
- API Documentation: https://developer.spotify.com/documentation/web-api

---

## Summary

1. ✅ Create Spotify Dev App → Get Client ID & Secret
2. ✅ Add 3 env vars to Render backend
3. ✅ Wait for redeploy (1-2 min)
4. ✅ Test: Connect Spotify on frontend
5. ✅ Enjoy mood-based music! 🎵

**Total Time:** ~10 minutes
