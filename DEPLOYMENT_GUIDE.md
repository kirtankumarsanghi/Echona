# ECHONA Deployment Guide

This guide covers multiple deployment options for your ECHONA application (React frontend, Node.js backend, Python ML services).

---

## 🚀 Quick Deployment Options

### Option 1: Render (Recommended - All-in-One)
**Best for:** Complete full-stack deployment with free tier available

### Option 2: Vercel + Render
**Best for:** Maximum frontend performance

### Option 3: Railway
**Best for:** Simplified deployment with automatic scaling

---

## 📋 Pre-Deployment Checklist

1. ✅ Ensure all code is committed to GitHub
2. ✅ Create `.env` files for production
3. ✅ Build and test locally
4. ✅ Update API endpoints for production

---

## 🌐 Option 1: Deploy to Render (Complete Solution)

### A. Deploy Backend (Node.js)

1. **Go to [Render.com](https://render.com)** and sign up
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name:** `echona-backend`
   - **Region:** Choose closest to you
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Instance Type:** Free

5. **Add Environment Variables:**
   ```
   NODE_ENV=production
   PORT=5000
   JWT_SECRET=your-production-jwt-secret-here
   SPOTIFY_CLIENT_ID=your-spotify-client-id
   SPOTIFY_CLIENT_SECRET=your-spotify-client-secret
   SPOTIFY_REDIRECT_URI=https://your-frontend-url.com/callback
   OPENWEATHER_API_KEY=your-openweather-key
   ```

6. Click **"Create Web Service"**
7. Note your backend URL: `https://echona-backend.onrender.com`

### B. Deploy ML Services (Python)

1. Click **"New +"** → **"Web Service"**
2. Connect same repository
3. Configure:
   - **Name:** `echona-ml`
   - **Root Directory:** `ml`
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `python api.py` or `gunicorn api:app`
   - **Instance Type:** Free

4. **Add Environment Variables:**
   ```
   PYTHON_VERSION=3.11
   ```

5. Note your ML service URL: `https://echona-ml.onrender.com`

### C. Deploy Frontend (React)

1. Click **"New +"** → **"Static Site"**
2. Connect same repository
3. Configure:
   - **Name:** `echona-frontend`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`

4. **Add Environment Variables:**
   ```
   VITE_API_URL=https://echona-backend.onrender.com
   VITE_ML_API_URL=https://echona-ml.onrender.com
   ```

5. Click **"Create Static Site"**
6. Your app will be live at: `https://echona-frontend.onrender.com`

---

## 🎯 Option 2: Vercel (Frontend) + Render (Backend)

### A. Deploy Frontend to Vercel

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

4. **Follow prompts:**
   - Link to existing project? No
   - Project name: echona
   - Directory: ./
   - Want to override settings? No

5. **Add Environment Variables in Vercel Dashboard:**
   - Go to your project settings
   - Add:
     ```
     VITE_API_URL=https://echona-backend.onrender.com
     VITE_ML_API_URL=https://echona-ml.onrender.com
     ```

6. **Deploy to production:**
   ```bash
   vercel --prod
   ```

### B. Deploy Backend to Render
Follow Option 1 steps A & B above.

---

## 🚂 Option 3: Railway

1. **Go to [Railway.app](https://railway.app)** and sign up
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your repository

### Deploy Backend:
- **Root Directory:** `backend`
- **Start Command:** `node server.js`
- Add environment variables (same as Render)

### Deploy ML Service:
- **Root Directory:** `ml`
- **Start Command:** `python api.py`

### Deploy Frontend:
- **Root Directory:** `frontend`
- **Build Command:** `npm run build`
- **Start Command:** `npx serve dist`

---

## 🔧 Configuration Files Needed

### 1. Create `vercel.json` in frontend/ (for Vercel deployment)

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### 2. Create `render.yaml` in root (for Render Blueprint)

```yaml
services:
  # Backend Service
  - type: web
    name: echona-backend
    runtime: node
    buildCommand: cd backend && npm install
    startCommand: cd backend && node server.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 5000

  # ML Service
  - type: web
    name: echona-ml
    runtime: python
    buildCommand: cd ml && pip install -r ../requirements.txt
    startCommand: cd ml && python api.py

  # Frontend
  - type: web
    name: echona-frontend
    runtime: static
    buildCommand: cd frontend && npm install && npm run build
    staticPublishPath: ./frontend/dist
```

### 3. Update Frontend API Configuration

**Create `frontend/.env.production`:**
```env
VITE_API_URL=https://your-backend-url.onrender.com
VITE_ML_API_URL=https://your-ml-service-url.onrender.com
```

---

## 📝 Update Backend for Production

### Update `backend/server.js` CORS settings:

```javascript
const cors = require('cors');

const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-url.com', 'https://your-frontend-url.vercel.app']
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
};

app.use(cors(corsOptions));
```

---

## 🗄️ Database Considerations

### SQLite (Current Setup)
- Works but not ideal for cloud
- File-based, doesn't persist on Render free tier restarts

### Recommended: Upgrade to PostgreSQL

**For Render:**
1. Create PostgreSQL database in Render dashboard
2. Update backend to use PostgreSQL:
   ```bash
   npm install pg sequelize
   ```
3. Update connection string in environment variables

**For Railway:**
- Railway provides PostgreSQL addon automatically

---

## ✅ Testing Deployment

1. **Check Backend:**
   ```bash
   curl https://your-backend-url.com/api/health
   ```

2. **Check ML Service:**
   ```bash
   curl https://your-ml-service-url.com/health
   ```

3. **Check Frontend:**
   - Visit your frontend URL
   - Test login, emotion detection, music playback

---

## 🐛 Common Issues

### Issue: CORS Errors
**Solution:** Update backend CORS settings to include production frontend URL

### Issue: Environment Variables Not Loading
**Solution:** Verify all env vars are added in deployment platform dashboard

### Issue: Build Fails
**Solution:** 
- Check build logs
- Ensure all dependencies are in package.json
- Test build locally: `npm run build`

### Issue: ML Service Timeout
**Solution:** Increase instance size or optimize model loading

### Issue: Database Connection Failed
**Solution:** Add database URL to backend environment variables

---

## 🚀 Deployment Commands Quick Reference

### Deploy Everything to Render (using Blueprint):
```bash
# Commit render.yaml to your repo
git add render.yaml
git commit -m "Add Render deployment configuration"
git push origin main

# Then in Render dashboard: New → Blueprint → Select your repo
```

### Deploy Frontend to Vercel:
```bash
cd frontend
vercel --prod
```

### Manual Backend Update:
```bash
git add .
git commit -m "Update backend"
git push origin main
# Render/Railway auto-deploys from GitHub
```

---

## 🔒 Security Checklist

- [ ] Use strong JWT secrets in production
- [ ] Enable HTTPS only
- [ ] Set secure cookie options
- [ ] Add rate limiting
- [ ] Sanitize user inputs
- [ ] Use environment variables (never hardcode secrets)
- [ ] Enable Helmet.js security headers
- [ ] Set up CORS properly
- [ ] Regular dependency updates

---

## 📊 Monitoring

### Render:
- Built-in logs and metrics dashboard
- Free tier: Basic monitoring

### Vercel:
- Analytics dashboard
- Real-time logs

### Additional Tools:
- **Sentry:** Error tracking
- **LogRocket:** Session replay
- **Uptime Robot:** Uptime monitoring

---

## 💰 Cost Comparison (Monthly)

| Service | Free Tier | Paid |
|---------|-----------|------|
| Render | 750 hrs/month | $7-25/month |
| Vercel | 100 GB bandwidth | $20/month |
| Railway | $5 credit | $5-20/month |

---

## 🎓 Recommended: Start with Render

**Why?**
1. ✅ Free tier for all services
2. ✅ Easy setup with Blueprint
3. ✅ Auto-deploy from GitHub
4. ✅ Built-in PostgreSQL
5. ✅ Great for portfolio projects

**Steps:**
1. Push code to GitHub
2. Create Render account
3. Use Blueprint deployment (render.yaml)
4. Configure environment variables
5. Done! 🎉

---

## 📞 Need Help?

- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
- Railway Docs: https://docs.railway.app

---

## 🎉 After Deployment

1. Update your README.md with live demo links
2. Add deployment badges
3. Test all features thoroughly
4. Share your project link!

**Your ECHONA app will be live at:**
- Frontend: `https://echona-frontend.onrender.com`
- Backend: `https://echona-backend.onrender.com`
- ML Service: `https://echona-ml.onrender.com`

Good luck with your deployment! 🚀
