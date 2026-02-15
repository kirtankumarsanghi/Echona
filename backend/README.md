# ECHONA Backend

Node.js Express API for emotion detection and music recommendations.

## Environment Variables Required

- `PORT` - Server port (default: 10000)
- `NODE_ENV` - Environment (production/development)
- `JWT_SECRET` - Secret key for JWT tokens
- `FRONTEND_URL` - Frontend URL for CORS
- `SPOTIFY_CLIENT_ID` - (Optional) Spotify API credentials
- `SPOTIFY_CLIENT_SECRET` - (Optional) Spotify API credentials

## Deploy to Render

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

Or manually:

1. Create Web Service on Render
2. Connect GitHub repository
3. Set Root Directory: `backend`
4. Build Command: `npm install`
5. Start Command: `node server.js`
6. Add environment variables above
