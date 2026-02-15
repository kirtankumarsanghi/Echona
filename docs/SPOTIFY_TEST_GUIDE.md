# Spotify Integration Test Guide

## ✅ Current Status

### Backend Configuration
- **Endpoint**: `http://127.0.0.1:5000/api/spotify/login`
- **Callback**: `http://127.0.0.1:5000/api/spotify/callback`
- **Client ID**: `68954d4553a54b298d58299f7fb4f225`
- **Status**: ✅ Backend routes configured

### Frontend Configuration
- **Music Page**: Has "Connect to Spotify" button
- **Callback Page**: Handles OAuth tokens
- **Status**: ✅ UI configured (simple, no fancy changes)

---

## 🚀 Setup Steps

### Step 1: Add Redirect URI to Spotify Dashboard

**CRITICAL**: You must add the redirect URI to your Spotify App

1. Go to: https://developer.spotify.com/dashboard
2. Find your app with Client ID: `68954d4553a54b298d58299f7fb4f225`
3. Click **"Settings"**
4. Scroll to **"Redirect URIs"**
5. Add this URI: `http://127.0.0.1:5000/api/spotify/callback`
6. Click **"ADD"**
7. Click **"SAVE"** at the bottom

**Note**: The URI is already in your clipboard - just paste it!

---

## 🧪 Testing the Integration

### Test 1: Manual Flow Test

1. **Open**: `http://localhost:3000/music`
2. **Click**: "Connect to Spotify" button
3. **Expected**: Redirects to Spotify login page
4. **Action**: Login with your Spotify account
5. **Action**: Click "Agree" to authorize
6. **Expected**: Redirects back to `/music` page
7. **Expected**: Button changes to "Spotify Connected" (green)

### Test 2: Token Verification

After connecting, check browser console:
```javascript
localStorage.getItem('spotify_token')
// Should return an access token string

localStorage.getItem('spotify_refresh_token')
// Should return a refresh token string
```

### Test 3: Backend Health Check

```powershell
# Test backend endpoint
curl.exe http://127.0.0.1:5000/health

# Test Spotify login endpoint (should redirect)
Start-Process "http://127.0.0.1:5000/api/spotify/login"
```

---

## 🎯 Complete Flow Diagram

```
1. User clicks "Connect to Spotify" on Music page
   ↓
2. Browser → http://127.0.0.1:5000/api/spotify/login
   ↓
3. Backend redirects → Spotify OAuth page
   ↓
4. User logs in and authorizes
   ↓
5. Spotify → http://127.0.0.1:5000/api/spotify/callback?code=XXX
   ↓
6. Backend exchanges code for tokens
   ↓
7. Backend redirects → http://localhost:3000/callback?access_token=XXX
   ↓
8. Frontend Callback.jsx saves tokens to localStorage
   ↓
9. Frontend redirects → /music page
   ↓
10. Music page shows "Spotify Connected" ✅
```

---

## ❌ Troubleshooting

### Issue: "Invalid redirect URI"
- **Cause**: URI not added to Spotify Dashboard
- **Fix**: Follow Step 1 above

### Issue: "INVALID_CLIENT"
- **Cause**: Wrong Client ID or Secret
- **Fix**: Check `.env` file in backend folder

### Issue: Button stays "Connect to Spotify"
- **Cause**: Token not saved
- **Fix**: Check browser console for errors

### Issue: "403 Forbidden"
- **Cause**: App not approved for extended quota
- **Fix**: This is normal - test with your account only

---

## ✅ Success Checklist

- [ ] Redirect URI added to Spotify Dashboard
- [ ] Backend running on http://127.0.0.1:5000
- [ ] Frontend running on http://localhost:3000
- [ ] Can click "Connect to Spotify" button
- [ ] Successfully redirected to Spotify login
- [ ] Successfully logged in and authorized
- [ ] Redirected back to Music page
- [ ] Button shows "Spotify Connected" (green)
- [ ] Tokens saved in localStorage

---

## 🎵 What Spotify Gives You

Once connected, your app has access to:
- User's Spotify profile
- User's playlists
- Playback control
- Currently playing track
- Search Spotify library
- Create/modify playlists

---

## 📝 Notes

- The simple UI is preserved (no fancy animations on auth page)
- Spotify button only appears on Music page
- Token refresh happens automatically
- Tokens expire after 1 hour (refresh token used to get new access token)
