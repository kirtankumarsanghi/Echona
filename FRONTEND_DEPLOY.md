# Deploy Frontend Only - Quick Guide

## Option 1: Vercel (Recommended - 2 minutes)

### Method A: Using Vercel Dashboard (Easiest)

1. **Go to [vercel.com](https://vercel.com)** and sign in with GitHub

2. **Import your repository:**
   - Click "Add New" → "Project"
   - Select your `Echona` repository
   - Vercel will auto-detect it's a Vite app

3. **Configure the project:**
   - Framework Preset: `Vite`
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. **Add Environment Variables:**
   ```
   VITE_API_URL=http://localhost:5000
   VITE_ML_API_URL=http://localhost:5001
   ```
   (These point to your local backend for now)

5. **Click Deploy** - Done in ~1 minute!

6. **Access your site:** `https://echona.vercel.app` (or similar)

---

### Method B: Using Vercel CLI (Alternative)

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to frontend
cd frontend

# Deploy
vercel --prod

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? echona-frontend
# - Directory? ./
# - Override settings? No

# Add environment variables
vercel env add VITE_API_URL
# Enter: http://localhost:5000

vercel env add VITE_ML_API_URL
# Enter: http://localhost:5001

# Redeploy with env vars
vercel --prod
```

---

## Option 2: Netlify (Also Quick)

### Using Netlify Drop (Drag & Drop)

```bash
# Build your frontend first
cd frontend
npm install
npm run build

# The dist/ folder is now ready
```

1. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
2. Drag and drop your `frontend/dist` folder
3. Done! Instant deployment

### Using Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Navigate to frontend
cd frontend

# Build
npm run build

# Deploy
netlify deploy --prod

# Follow prompts and select dist/ as publish directory
```

---

## Option 3: GitHub Pages (Free Forever)

```bash
# Install gh-pages
cd frontend
npm install --save-dev gh-pages

# Add to package.json scripts:
# "deploy": "npm run build && gh-pages -d dist"

# Deploy
npm run deploy
```

Then enable GitHub Pages in your repo settings: Settings → Pages → Source: gh-pages branch

---

## Important: Update API URLs Later

Right now, the frontend will use `localhost:5000` and `localhost:5001` for API calls. 

**After deploying backend/ML services:**

1. Update environment variables in Vercel/Netlify dashboard:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com
   VITE_ML_API_URL=https://your-ml-url.onrender.com
   ```

2. Redeploy (automatic on Vercel/Netlify after env var change)

---

## Testing Your Deployed Frontend

Your deployed frontend will have:
- ✅ Login/signup pages (UI only, needs backend to function)
- ✅ Dashboard (UI visible)
- ✅ All styling and animations
- ⚠️ API calls will fail (until you connect backend)

This is perfect for:
- Showing the UI/UX design
- Testing frontend responsiveness
- Sharing with stakeholders
- Portfolio demonstration

---

## Next Steps

After frontend is live:
1. ✅ Test the deployed URL
2. Deploy backend (see DEPLOYMENT_GUIDE.md)
3. Update frontend environment variables
4. Test full functionality

---

## Quick Command Summary

**Vercel (fastest):**
```bash
npm install -g vercel
cd frontend
vercel --prod
```

**Netlify:**
```bash
npm install -g netlify-cli
cd frontend
npm run build
netlify deploy --prod
```

**Your frontend will be live in < 3 minutes!** 🚀
