# Deploy Backend to Render - Step by Step

## 🚀 Follow These Steps (15 minutes)

### Step 1: Sign Up / Sign In to Render (1 minute)

1. Go to **[https://render.com](https://render.com)**
2. Click **"Get Started for Free"** or **"Sign In"**
3. Choose **"Sign in with GitHub"** (easiest way)
4. Authorize Render to access your GitHub repositories

---

### Step 2: Create New Web Service (2 minutes)

1. Click **"New +"** button in the top right
2. Select **"Web Service"**
3. Find and select your **`Echona`** repository
   - If you don't see it, click **"Configure account"** and give Render access
4. Click **"Connect"**

---

### Step 3: Configure the Service (3 minutes)

Fill in these settings:

**Basic Settings:**
- **Name**: `echona-backend` (or any name you want)
- **Region**: Choose closest to you (e.g., `Oregon (US West)`)
- **Branch**: `main`
- **Root Directory**: `backend`
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `node server.js`

**Instance Type:**
- Select **"Free"** (enough for testing/demo)

---

### Step 4: Add Environment Variables (5 minutes)

Click **"Add Environment Variable"** and add these:

#### Required Variables:

1. **JWT_SECRET**
   ```
   Value: echona_production_secret_2026_change_this_to_random_string
   ```
   (Or generate a random one with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)

2. **PORT**
   ```
   Value: 10000
   ```

3. **NODE_ENV**
   ```
   Value: production
   ```

4. **FRONTEND_URL**
   ```
   Value: https://echona-qanj.vercel.app
   ```

#### Optional Variables (add later if needed):

5. **SPOTIFY_CLIENT_ID** (For music features)
   ```
   Value: your_spotify_client_id
   ```
   Get from: https://developer.spotify.com/dashboard

6. **SPOTIFY_CLIENT_SECRET**
   ```
   Value: your_spotify_client_secret
   ```

7. **SPOTIFY_REDIRECT_URI**
   ```
   Value: https://echona-backend.onrender.com/api/spotify/callback
   ```
   (Replace with your actual Render URL after deployment)

---

### Step 5: Deploy! (1 minute)

1. Click **"Create Web Service"** at the bottom
2. Wait for deployment to complete (~5 minutes)
3. Watch the logs - you should see:
   ```
   ==> Build successful 🎉
   ==> Starting service...
   ==> Server running on port 10000
   ```

---

### Step 6: Copy Your Backend URL (30 seconds)

1. At the top of your Render dashboard, you'll see a URL like:
   ```
   https://echona-backend.onrender.com
   ```
2. **Copy this URL** - you'll need it for the next step

---

### Step 7: Update Frontend Environment Variables (2 minutes)

1. Go to **[vercel.com](https://vercel.com)** dashboard
2. Open your **echona** project
3. Go to **Settings** → **Environment Variables**
4. Find `VITE_API_URL` and click **Edit**
5. Change value to: `https://echona-backend.onrender.com` (your URL from Step 6)
6. Click **Save**
7. Go to **Deployments** tab
8. Click the **⋯** menu on latest deployment → **Redeploy** → **Redeploy**

---

### Step 8: Test Your App! (1 minute)

1. Wait ~1 minute for Vercel to redeploy
2. Visit **https://echona-qanj.vercel.app/auth**
3. Try creating an account and logging in
4. ✅ **IT SHOULD WORK NOW!**

---

## ⚠️ Important Notes

### Free Tier Limitations:
- Backend sleeps after 15 minutes of inactivity
- First request after sleep takes ~30-60 seconds to wake up
- 750 hours/month free (enough for demos)

### If Login Still Doesn't Work:

1. **Check Render logs:**
   - Go to Render dashboard → Your service → **Logs**
   - Look for errors

2. **Check CORS settings:**
   - Make sure `FRONTEND_URL` env var matches your Vercel URL exactly

3. **Test backend directly:**
   ```bash
   curl https://echona-backend.onrender.com/api/health
   ```
   Should return: `{"status":"ok"}`

---

## 🎯 What You Just Deployed:

✅ Backend API server running on Render  
✅ Connected to your frontend on Vercel  
✅ User authentication working  
✅ Ready for emotion detection features  

---

## Next Steps (Optional):

1. **Deploy ML Service** (for emotion detection)
   - Follow same process but use `ml` as root directory
   - Use Python runtime instead of Node

2. **Add Spotify Integration**
   - Create app at https://developer.spotify.com/dashboard
   - Add Client ID and Secret to Render env vars
   - Update Redirect URI in Spotify dashboard

3. **Monitor Your App**
   - Check Render logs regularly
   - Set up alerts in Render dashboard

---

## 🆘 Troubleshooting

**"Application failed to respond"**
- Check if PORT=10000 is set in env vars
- Check build logs for errors

**CORS errors in browser console**
- Verify FRONTEND_URL matches your Vercel URL exactly
- Make sure there's no trailing slash

**Backend taking too long to respond**
- Free tier wakes up slowly - wait 60 seconds
- Consider upgrading to paid tier ($7/month)

---

## You're All Set! 🎉

Your backend is now live and connected to your frontend.  
Go test it at: **https://echona-qanj.vercel.app**
