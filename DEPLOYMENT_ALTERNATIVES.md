# Vercel Deployment Guide (Alternative to Render)

## Option 1: Deploy Both on Vercel

### Backend (API Routes)

**Framework Preset:** Other

**Build Command:**
```bash
cd backend && npm install
```

**Output Directory:**
```
backend
```

**Install Command:**
```bash
npm install
```

**Root Directory:**
```
backend
```

Create `vercel.json` in backend folder:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/server.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### Frontend

**Framework Preset:** Vite

**Build Command:**
```bash
npm run build
```

**Output Directory:**
```
dist
```

**Install Command:**
```bash
npm install
```

**Root Directory:**
```
frontend
```

**Environment Variables:**
```
VITE_API_URL=<your-backend-vercel-url>
VITE_NODE_ENV=production
```

---

## Option 2: Netlify Deployment

### Frontend on Netlify

**Build command:**
```bash
cd frontend && npm install && npm run build
```

**Publish directory:**
```
frontend/dist
```

**Environment variables:**
```
VITE_API_URL=<your-backend-url>
VITE_NODE_ENV=production
```

Create `frontend/_redirects`:
```
/*    /index.html   200
```

---

## Option 3: Railway Deployment

### Backend on Railway

1. Create new project
2. Deploy from GitHub
3. Set root directory to `backend`
4. Railway auto-detects Node.js
5. Add environment variables
6. Deploy

### Frontend on Railway (or Netlify/Vercel)

1. Create new project
2. Deploy from GitHub
3. Set root directory to `frontend`
4. Add environment variables
5. Deploy

---

## Recommended Setup

**Best Performance:**
- Backend: Render or Railway
- Frontend: Vercel or Netlify
- Database: MongoDB Atlas

**Easiest Setup:**
- Both: Render
- Database: MongoDB Atlas

**Free Tier:**
- Backend: Render (Web Service)
- Frontend: Vercel or Netlify
- Database: MongoDB Atlas (M0)
