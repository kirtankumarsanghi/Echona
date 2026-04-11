# ECHONA Final Deployment Steps (Based on Current Status)

Current confirmed status:
- Backend is live at: https://echona-1.onrender.com
- ML service is live at: https://echona.onrender.com
- Backend is running with in-memory sessions because MONGODB_URI is invalid (this is okay temporarily).

## Step 1: Verify Backend and ML Health First

Open these URLs in browser:
- https://echona-1.onrender.com/health
- https://echona-1.onrender.com/api/ml/health
- https://echona.onrender.com/health

Expected:
- All should return JSON responses.
- Backend should show status ok.
- /api/ml/health should indicate ML reachable.

## Step 2: Configure Frontend (Vercel)

Go to Vercel project settings for your frontend project:
- Project: echona-qanj (or your current frontend project)
- Settings -> Environment Variables

Add or update:
- VITE_API_URL = https://echona-1.onrender.com

Then redeploy frontend:
- Deployments -> Redeploy latest

After redeploy, open:
- https://echona-qanj.vercel.app

## Step 3: Update OAuth Providers with New Backend URL

## Google OAuth
In Google Cloud Console -> APIs & Services -> Credentials -> OAuth Client:

Authorized JavaScript origins:
- https://echona-qanj.vercel.app

Authorized redirect URIs (if your flow uses redirect endpoints):
- https://echona-1.onrender.com/api/auth/google

Save.

## Spotify App
In Spotify Developer Dashboard -> App settings -> Redirect URIs:
- https://echona-1.onrender.com/api/spotify/callback

Save.

## Step 4: Backend Environment Variables Check (Render)

Open Render backend service (echona-1) -> Environment and confirm:

Required:
- NODE_ENV=production
- PORT=10000
- FRONTEND_URL=https://echona-qanj.vercel.app
- ML_SERVICE_URL=https://echona.onrender.com
- HEALTH_TIMEOUT_MS=20000
- ML_TIMEOUT_MS=120000
- SESSION_SECRET=<long-random-secret>
- GOOGLE_CLIENT_ID=<your-value>
- GOOGLE_CLIENT_SECRET=<your-value>
- SPOTIFY_CLIENT_ID=<your-value>
- SPOTIFY_CLIENT_SECRET=<your-value>
- SPOTIFY_REDIRECT_URI=https://echona-1.onrender.com/api/spotify/callback
- WEATHER_API_KEY=<your-value>

Optional for now:
- MONGODB_URI

Important now:
- If MONGODB_URI is invalid, remove it for now.
- You can add a correct Mongo URI later.

After any env change:
- Manual Deploy -> Deploy latest commit

How to set these in Render (exact clicks):
1. Open your backend service on Render.
2. Click Environment in the left menu.
3. Click Add Environment Variable.
4. Add HEALTH_TIMEOUT_MS with value 20000.
5. Click Add Environment Variable again.
6. Add ML_TIMEOUT_MS with value 120000.
7. Verify ML_SERVICE_URL is exactly https://echona.onrender.com.
8. Click Save Changes.
9. Open the Deploys tab.
10. Click Manual Deploy.
11. Click Deploy latest commit.

## Step 5: End-to-End Production Test

1. Open frontend:
- https://echona-qanj.vercel.app

2. Login with Google.

3. Test mood detection:
- Face
- Text
- Voice

4. Go to Music page and confirm recommendations load.

5. Re-check APIs:
- https://echona-1.onrender.com/health
- https://echona-1.onrender.com/api/ml/health

## Step 6: Make Sessions Persistent (Recommended After Go-Live)

Right now backend warns about MemoryStore in production.
That means sessions are not durable across process restarts.

To fix permanently:
1. Create MongoDB Atlas cluster.
2. Create DB user and allow Render IP/network access.
3. Get real URI starting with mongodb+srv://
4. Set MONGODB_URI in Render backend env.
5. Manual Deploy backend.

## Quick Copy Block (Use These Exact URLs)

Render backend env URL values:
- FRONTEND_URL=https://echona-qanj.vercel.app
- ML_SERVICE_URL=https://echona.onrender.com
- SPOTIFY_REDIRECT_URI=https://echona-1.onrender.com/api/spotify/callback

Render backend timeout values:
- HEALTH_TIMEOUT_MS=20000
- ML_TIMEOUT_MS=120000

Vercel frontend env:
- VITE_API_URL=https://echona-1.onrender.com

## If Something Still Fails

Collect and share these 3 outputs:
- https://echona-1.onrender.com/health
- https://echona-1.onrender.com/api/ml/health
- Browser console errors on https://echona-qanj.vercel.app
