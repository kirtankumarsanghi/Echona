# ⚡ Quick Spotify Setup Checklist

Follow this checklist to enable Spotify in production (~10 minutes total)

## ☑️ Phase 1: Get Spotify Credentials (5 min)

- [ ] Go to https://developer.spotify.com/dashboard
- [ ] Login with Spotify account
- [ ] Click "Create app"
- [ ] Fill in:
  - App Name: `ECHONA Production`
  - Description: `Mental wellness app`
  - Website: `https://echona-qanj.vercel.app`
  - Redirect URI: `https://echona.onrender.com/api/spotify/callback` ⚠️ EXACT URL!
- [ ] Accept terms and click "Save"
- [ ] Click "Settings" button
- [ ] Copy **Client ID**
- [ ] Click "View client secret" and copy **Client Secret**

**✅ You now have:**
- ✓ Client ID (looks like: `abc123...`)
- ✓ Client Secret (looks like: `xyz789...`)

---

## ☑️ Phase 2: Configure Render (2 min)

- [ ] Go to https://render.com/dashboard
- [ ] Click on **"echona"** (your backend service)
- [ ] Click **"Environment"** tab
- [ ] Click **"Add Environment Variable"** and add:

### Variable 1:
```
Key:   SPOTIFY_CLIENT_ID
Value: [paste your Client ID]
```

### Variable 2:
```
Key:   SPOTIFY_CLIENT_SECRET
Value: [paste your Client Secret]
```

### Variable 3:
```
Key:   SPOTIFY_REDIRECT_URI
Value: https://echona.onrender.com/api/spotify/callback
```

- [ ] Click **"Save Changes"**
- [ ] Wait for auto-redeploy to complete (~1-2 minutes)

---

## ☑️ Phase 3: Test Integration (3 min)

### Test Backend:
- [ ] Visit: https://echona.onrender.com/api/spotify/health
- [ ] Check response shows `"configured": true`

### Test Frontend:
- [ ] Visit: https://echona-qanj.vercel.app
- [ ] Login to your account
- [ ] Go to **Music** page
- [ ] Click **"Connect Spotify"** button
- [ ] Authorize ECHONA
- [ ] You should be redirected back with Spotify connected! 🎉

### Try Features:
- [ ] Search for songs by mood
- [ ] Get personalized recommendations
- [ ] View your top tracks (if connected)

---

## ✅ Success Criteria

You'll know it's working when:
- ✅ Backend health shows `"configured": true`
- ✅ Frontend shows "Connect Spotify" button
- ✅ Clicking button opens Spotify authorization
- ✅ After authorization, you're redirected back to the app
- ✅ Can search and play music recommendations

---

## 🚨 Troubleshooting

### "Redirect URI Mismatch"
**Fix:** In Spotify Dashboard, make sure redirect URI is EXACTLY:
```
https://echona.onrender.com/api/spotify/callback
```
No trailing slash, no http (must be https), no typos.

### "Invalid Client"
**Fix:** Double-check Client ID and Secret in Render have no extra spaces.

### Still not working?
1. Check Render logs for errors
2. Verify all 3 environment variables are set
3. Make sure backend finished deploying
4. Try clearing browser cache and retry

---

## 📝 URLs Reference

- **Frontend:** https://echona-qanj.vercel.app
- **Backend:** https://echona.onrender.com
- **Backend Health:** https://echona.onrender.com/api/spotify/health
- **Spotify Dashboard:** https://developer.spotify.com/dashboard
- **Render Dashboard:** https://render.com/dashboard

---

## 🎵 What You Get

Once setup is complete:

### Free Spotify Account:
- ✅ Search tracks by mood/emotion
- ✅ Browse curated mood playlists
- ✅ Get AI recommendations
- ✅ View your top tracks

### Spotify Premium:
- All above, PLUS:
- ✅ Control playback directly from app
- ✅ Skip/pause/play tracks
- ✅ Adjust volume
- ✅ Select playback device

---

## ⏱️ Time Estimate

- Phase 1: 5 minutes
- Phase 2: 2 minutes  
- Phase 3: 3 minutes
- **Total: ~10 minutes**

---

## Need Detailed Instructions?

See: `SPOTIFY_SETUP_PRODUCTION.md` for step-by-step guide with screenshots.

---

**Ready? Start with Phase 1!** ☝️
