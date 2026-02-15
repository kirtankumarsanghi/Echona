# Quick Deployment Guide for ECHONA

## 🚀 Fastest Way to Deploy (5 minutes)

### Step 1: Prepare Your Code
```bash
# Make sure all changes are committed
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### Step 2: Deploy to Render (Recommended)

1. **Go to [render.com](https://render.com)** and sign in with GitHub

2. **Create New Blueprint:**
   - Click "New +" → "Blueprint"
   - Select your `Echona` repository
   - Render will automatically detect `render.yaml`

3. **Add Required Environment Variables:**
   
   **For Backend Service:**
   - `JWT_SECRET` - Any long random string (e.g., generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
   - `SPOTIFY_CLIENT_ID` - From [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - `SPOTIFY_CLIENT_SECRET` - From Spotify Developer Dashboard
   - `SPOTIFY_REDIRECT_URI` - Will be `https://your-frontend-url.onrender.com/callback`
   - `OPENWEATHER_API_KEY` - From [OpenWeather](https://openweathermap.org/api)

   **For Frontend:**
   - `VITE_API_URL` - Will be `https://echona-backend.onrender.com` (from step 4)
   - `VITE_ML_API_URL` - Will be `https://echona-ml.onrender.com` (from step 4)

4. **Click "Apply"** - Render will deploy all three services

5. **Wait 5-10 minutes** for initial deployment

6. **Update Spotify Redirect URI:**
   - Go to Spotify Developer Dashboard
   - Update redirect URI to your frontend URL + `/callback`

### Step 3: Test Your Deployment

Visit your frontend URL and test:
- ✅ User registration/login
- ✅ Emotion detection
- ✅ Music recommendations
- ✅ Dashboard analytics

---

## Alternative: Deploy to Vercel (Frontend Only)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy frontend
cd frontend
vercel --prod

# Follow the prompts and add environment variables when asked
```

---

## 🔧 Important: Update CORS Settings

After deployment, update `backend/server.js`:

```javascript
const corsOptions = {
  origin: [
    'https://echona-frontend.onrender.com',  // Your actual frontend URL
    'http://localhost:5173'  // Keep for local development
  ],
  credentials: true
};
```

Commit and push to trigger redeployment.

---

## 📱 Share Your Live App!

After successful deployment:

1. **Update README.md** with live demo link
2. **Test all features** thoroughly
3. **Share your project!**

**Live URLs:**
- 🌐 Frontend: `https://echona-frontend.onrender.com`
- 🔧 Backend: `https://echona-backend.onrender.com`
- 🤖 ML Service: `https://echona-ml.onrender.com`

---

## 🆘 Troubleshooting

**Services not starting?**
- Check deployment logs in Render dashboard
- Verify all environment variables are set
- Ensure `requirements.txt` and `package.json` are up to date

**CORS errors?**
- Update backend CORS settings with your frontend URL
- Commit and push to redeploy

**ML service timing out?**
- May need to upgrade to paid tier for more resources
- Or optimize model loading in `ml/api.py`

---

## 💡 Pro Tips

1. **Free Tier Limitations:**
   - Services sleep after 15 minutes of inactivity
   - First request after sleep takes 30-60 seconds to wake up
   - Consider upgrading to paid tier for production use

2. **Keep Services Active:**
   - Use a service like [UptimeRobot](https://uptimerobot.com/) to ping your app every 5 minutes

3. **Monitor Your App:**
   - Check Render logs regularly
   - Set up error alerts in Render dashboard

---

Need detailed instructions? See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
