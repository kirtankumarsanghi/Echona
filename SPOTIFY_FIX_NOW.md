# 🔧 SPOTIFY CONNECTION FIX

## Problem:
The backend doesn't know where to redirect you after Spotify login.

## Solution:
Add the `FRONTEND_URL` environment variable to Render.

---

## ⚡ Quick Fix (2 minutes):

### Step 1: Add Environment Variable to Render

1. Go to https://render.com/dashboard
2. Click your **"echona"** backend service
3. Click **"Environment"** tab (left sidebar)
4. Click **"Add Environment Variable"**
5. Add this variable:

```
Key:   FRONTEND_URL
Value: https://echona-qanj.vercel.app
```

6. Click **"Save Changes"**
7. Wait 1-2 minutes for auto-redeploy

---

### Step 2: Verify Redirect URI in Spotify Dashboard

1. Go to https://developer.spotify.com/dashboard
2. Click your app
3. Click **"Settings"** (top right)
4. Scroll to **"Redirect URIs"**
5. Make sure this EXACT URI is listed:
   ```
   https://echona.onrender.com/api/spotify/callback
   ```
6. If not there:
   - Click **"Edit Settings"**
   - Click **"Add Redirect URI"**
   - Paste: `https://echona.onrender.com/api/spotify/callback`
   - Click **"Add"**
   - Scroll down and click **"Save"**

---

### Step 3: Test Connection (After 2 Minutes)

1. Visit: https://echona-qanj.vercel.app
2. Go to **Music** page
3. Click **"Connect to Spotify"**
4. Should now work! ✅

---

## What This Fixes:

Without `FRONTEND_URL`, the backend tries to redirect to `http://localhost:3000/callback` after Spotify login, which doesn't work in production.

With `FRONTEND_URL=https://echona-qanj.vercel.app`, it correctly redirects to your live frontend.

---

## Summary:

**Add to Render Environment Variables:**
```
FRONTEND_URL = https://echona-qanj.vercel.app
```

**Verify in Spotify Dashboard:**
```
Redirect URI = https://echona.onrender.com/api/spotify/callback
```

Then test after 2 minutes! 🎵
