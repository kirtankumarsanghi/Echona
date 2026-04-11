# Easy Production Deployment (Vercel + Render)

This is the fastest stable setup for ECHONA:
- Frontend on Vercel
- Backend on Render
- ML service on Render

## 1) Deploy ML Service (Render)

1. Create a new Render Web Service.
2. Connect this repository.
3. Use these settings:
- Runtime: Python
- Root directory: repository root
- Build command: `pip install -r requirements.txt`
- Start command: `python api.py`
- Health check path: `/health`

4. Set environment variables:
- `PYTHON_VERSION=3.11`

5. Deploy and copy the ML URL, for example:
- `https://echona-ml.onrender.com`

## 2) Deploy Backend Service (Render)

1. Create another Render Web Service.
2. Connect this repository.
3. Use these settings:
- Runtime: Node
- Root directory: `backend`
- Build command: `npm install`
- Start command: `node server.js`
- Health check path: `/health`

4. Set environment variables:
- `NODE_ENV=production`
- `PORT=10000`
- `FRONTEND_URL=https://echona-qanj.vercel.app`
- `ML_SERVICE_URL=<your-ml-render-url>`
- `SESSION_SECRET=<strong-random-secret>`
- `GOOGLE_CLIENT_ID=<google-client-id>`
- `GOOGLE_CLIENT_SECRET=<google-client-secret>`
- `SPOTIFY_CLIENT_ID=<spotify-client-id>`
- `SPOTIFY_CLIENT_SECRET=<spotify-client-secret>`
- `SPOTIFY_REDIRECT_URI=https://echona.onrender.com/api/spotify/callback`
- `WEATHER_API_KEY=<openweather-api-key>`
- Optional: `MONGODB_URI=<mongo-connection-string>`

5. Deploy and verify:
- `https://echona.onrender.com/health`
- `https://echona.onrender.com/api/ml/health`

## 3) Deploy Frontend (Vercel)

1. Import project in Vercel.
2. Set Root Directory to `frontend`.
3. Build settings:
- Install command: `npm install --legacy-peer-deps`
- Build command: `npm run build`
- Output directory: `dist`

4. Add environment variable:
- `VITE_API_URL=https://echona.onrender.com`

5. Redeploy and verify:
- `https://echona-qanj.vercel.app`

## 4) Required Third-Party Console Updates

## Google OAuth
Add these in Google Cloud OAuth settings:
- Authorized JavaScript origins:
  - `https://echona-qanj.vercel.app`
- Authorized redirect URIs (if used by your flow):
  - `https://echona.onrender.com/api/auth/google`

## Spotify App
Add redirect URI in Spotify Developer dashboard:
- `https://echona.onrender.com/api/spotify/callback`

## 5) Final Smoke Test

1. Open `https://echona-qanj.vercel.app`.
2. Sign in with Google.
3. Open mood detection and test camera/text/voice.
4. Confirm recommendations load on music page.
5. Check backend health and ML health endpoints again.

## Troubleshooting

- If frontend shows CORS/session issues:
  - Confirm `FRONTEND_URL` is exactly `https://echona-qanj.vercel.app` on backend.

- If mood detection falls back too often:
  - Confirm backend env `ML_SERVICE_URL` points to your ML Render URL.
  - Confirm ML `/health` is `ok`.

- If first request is slow:
  - Render free tier can cold start; retry once after 20-60 seconds.
