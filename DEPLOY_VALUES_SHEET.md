# ECHONA Deployment Master Sheet

Use this single file to deploy everything without confusion.

## 0) Fill These Values Once

Replace only the values in this section first.

- FRONTEND_URL: https://echona-qanj.vercel.app
- BACKEND_URL: https://YOUR_BACKEND_SERVICE.onrender.com
- ML_URL: https://echona.onrender.com
- MONGO_URI: mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority
- SESSION_SECRET: <generate-a-long-random-secret>
- GOOGLE_CLIENT_ID: <google-client-id>
- GOOGLE_CLIENT_SECRET: <google-client-secret>
- SPOTIFY_CLIENT_ID: <spotify-client-id>
- SPOTIFY_CLIENT_SECRET: <spotify-client-secret>
- WEATHER_API_KEY: <openweather-api-key>

Derived value:
- SPOTIFY_REDIRECT_URI: BACKEND_URL/api/spotify/callback

---

## 1) Deploy ML Service On Render

1. Open Render dashboard.
2. Click New -> Web Service.
3. Connect your GitHub repo.
4. Configure:
- Name: echona-ml
- Runtime: Python
- Branch: main
- Root Directory: leave empty (repo root)
- Build Command: pip install -r requirements.txt
- Start Command: python api.py
- Health Check Path: /health

5. Environment variables:
- PYTHON_VERSION = 3.11

6. Click Create Web Service.
7. Wait until deploy completes.
8. Open ML health URL:
- ML_URL/health

Expected:
- success true
- status ok
- capabilities face/text/voice true

---

## 2) Deploy Backend Service On Render

1. Open Render dashboard.
2. Click New -> Web Service.
3. Select the same GitHub repository.
4. In service setup, enter exactly:
- Name: echona-backend
- Runtime: Node
- Branch: main
- Region: same as ML service
- Root Directory: backend
- Build Command: npm install
- Start Command: node server.js
- Health Check Path: /health

5. Open the Environment tab and add variables one by one:

NODE_ENV=production
PORT=10000
FRONTEND_URL=https://echona-qanj.vercel.app
ML_SERVICE_URL=https://echona.onrender.com
SESSION_SECRET=<generate-a-long-random-secret>
GOOGLE_CLIENT_ID=<google-client-id>
GOOGLE_CLIENT_SECRET=<google-client-secret>
SPOTIFY_CLIENT_ID=<spotify-client-id>
SPOTIFY_CLIENT_SECRET=<spotify-client-secret>
SPOTIFY_REDIRECT_URI=https://YOUR_BACKEND_SERVICE.onrender.com/api/spotify/callback
WEATHER_API_KEY=<openweather-api-key>
MONGODB_URI=<optional-but-recommended>

6. Click Create Web Service.
7. Wait for deploy logs to finish. If it fails, open Logs tab and fix the missing variable shown.
8. Copy your backend URL from Render, then replace BACKEND_URL in this sheet.
9. Update this variable in Render now that BACKEND_URL is known:
- SPOTIFY_REDIRECT_URI=https://YOUR_BACKEND_SERVICE.onrender.com/api/spotify/callback

10. Trigger a Manual Deploy (Clear build cache only if needed).
11. Verify backend endpoints in browser:
- BACKEND_URL/health
- BACKEND_URL/api/ml/health
- BACKEND_URL/api/auth/health

Expected:
- backend health status ok
- ml health reachable through backend
- auth health returns success true

---

## 3) Deploy Frontend On Vercel

1. Open Vercel dashboard.
2. Import project (or open existing project).
3. Set Root Directory to frontend.
4. Build settings:
- Install Command: npm install --legacy-peer-deps
- Build Command: npm run build
- Output Directory: dist

5. Environment variables:
- VITE_API_URL = https://YOUR_BACKEND_SERVICE.onrender.com

6. Redeploy project.
7. Verify frontend:
- https://echona-qanj.vercel.app

---

## 4) Configure Google OAuth

In Google Cloud Console -> APIs & Services -> Credentials -> OAuth client:

Authorized JavaScript origins:
- https://echona-qanj.vercel.app

Authorized redirect URIs (if required by your flow):
- https://YOUR_BACKEND_SERVICE.onrender.com/api/auth/google

Save changes.

---

## 5) Configure Spotify Redirect URI

In Spotify Developer Dashboard -> App settings -> Redirect URIs:
- https://YOUR_BACKEND_SERVICE.onrender.com/api/spotify/callback

Save changes.

---

## 6) Final Smoke Test (In Order)

1. Open frontend URL:
- https://echona-qanj.vercel.app

2. Login with Google.

3. Test mood detection:
- Face
- Text
- Voice

4. Open music page and verify recommendations load.

5. Open these health endpoints:
- BACKEND_URL/health
- BACKEND_URL/api/ml/health
- ML_URL/health

If all pass, deployment is complete.

---

## 7) Quick Troubleshooting

If frontend cannot call backend:
- Check VITE_API_URL on Vercel.
- Confirm BACKEND_URL is correct and HTTPS.

If login fails:
- Check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET on backend.
- Check Google OAuth origins/redirects include your production URLs.

If mood detection falls back:
- Check ML_URL/health.
- Check backend env ML_SERVICE_URL points to ML_URL exactly.

If Spotify fails:
- Check SPOTIFY_REDIRECT_URI matches Spotify dashboard exactly.

If backend restarts lose users/sessions:
- Add MONGODB_URI (recommended for production persistence).

If Render backend crashes with "Invalid scheme, expected connection string to start with mongodb:// or mongodb+srv://":
- Your MONGODB_URI value is malformed.
- Either set a valid Mongo URI (must start with `mongodb://` or `mongodb+srv://`) or temporarily remove MONGODB_URI.
- Then click Manual Deploy on Render.

---

## 8) Copy-Paste Filled Template

After replacing YOUR_BACKEND_SERVICE, this is your final env map.

Render Backend env:

NODE_ENV=production
PORT=10000
FRONTEND_URL=https://echona-qanj.vercel.app
ML_SERVICE_URL=https://echona.onrender.com
SESSION_SECRET=<your-secret>
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
SPOTIFY_CLIENT_ID=<your-spotify-client-id>
SPOTIFY_CLIENT_SECRET=<your-spotify-client-secret>
SPOTIFY_REDIRECT_URI=https://YOUR_BACKEND_SERVICE.onrender.com/api/spotify/callback
WEATHER_API_KEY=<your-weather-key>
MONGODB_URI=<your-mongo-uri>

Vercel Frontend env:

VITE_API_URL=https://YOUR_BACKEND_SERVICE.onrender.com

Render ML env:

PYTHON_VERSION=3.11
