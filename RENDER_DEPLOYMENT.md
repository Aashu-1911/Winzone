# Render Deployment Configuration

## Backend Deployment

**Service Type:** Web Service

**Build Command:**
```bash
cd backend && npm install
```

**Start Command:**
```bash
cd backend && npm start
```

**Environment Variables:**
```
NODE_ENV=production
MONGO_URI=<your-mongodb-atlas-uri>
JWT_SECRET=<your-secure-jwt-secret-min-32-chars>
JWT_EXPIRE=7d
FRONTEND_URL=<your-frontend-render-url>
PAYMENT_PROVIDER=dummy
PLATFORM_FEE_PERCENTAGE=10
ORGANIZER_FEE_PERCENTAGE=5
PORT=5000
```

**Health Check Path:** `/api/health`

---

## Frontend Deployment

**Service Type:** Static Site

**Build Command:**
```bash
cd frontend && npm install && npm run build
```

**Publish Directory:**
```
frontend/dist
```

**Environment Variables:**
```
VITE_API_URL=<your-backend-render-url>
VITE_NODE_ENV=production
```

---

## Pre-Deployment Checklist

### MongoDB Setup
1. Create MongoDB Atlas cluster
2. Whitelist Render IP addresses (0.0.0.0/0 for testing)
3. Create database user
4. Copy connection string to MONGO_URI

### Security
1. Generate secure JWT_SECRET (min 32 characters)
2. Update CORS settings in backend
3. Verify environment variables

### Testing
1. Test backend health endpoint
2. Test API endpoints
3. Verify frontend build locally
4. Check console for errors

---

## Deployment Steps

### 1. Deploy Backend First
- Create Web Service on Render
- Connect GitHub repository
- Set root directory to `backend`
- Configure environment variables
- Deploy and wait for success
- Note the backend URL

### 2. Deploy Frontend
- Create Static Site on Render
- Connect GitHub repository  
- Set root directory to `frontend`
- Configure VITE_API_URL with backend URL
- Deploy and wait for success

### 3. Verify
- Check backend health: `<backend-url>/api/health`
- Check frontend loads correctly
- Test login/register flow
- Verify API communication

---

## Common Issues & Solutions

### Backend won't start
- Verify MongoDB connection string
- Check all environment variables are set
- Review build logs for errors

### Frontend can't connect to backend
- Verify VITE_API_URL is correct
- Check CORS settings in backend
- Ensure FRONTEND_URL is set in backend

### Database connection fails
- Whitelist Render IPs in MongoDB Atlas
- Verify connection string format
- Check database user permissions

---

## Post-Deployment

### Monitor
- Check Render logs regularly
- Monitor database usage
- Watch for errors

### Performance
- Enable caching headers
- Consider CDN for static assets
- Monitor response times

### Security
- Regularly rotate JWT_SECRET
- Keep dependencies updated
- Monitor for vulnerabilities
