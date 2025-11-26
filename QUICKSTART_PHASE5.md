# 🚀 WinZone - Quick Start Guide (Phase 5)

## Prerequisites

- Node.js (v18+ recommended)
- MongoDB (local or Atlas)
- Git

---

## ⚡ Quick Setup (5 minutes)

### 1. Clone & Install

```bash
# Clone repository
cd C:\Users\ashis\OneDrive\Desktop\Projects\Winzone

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment

**Backend** (`backend/.env`):
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://your_connection_string
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
```

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:5000
VITE_NODE_ENV=development
```

### 3. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

---

## 🎮 Test the Application

### 1. Open Browser
Navigate to: http://localhost:5173

### 2. Register New User
- Click "Register"
- Fill in details:
  - Name: Test Player
  - Email: player@test.com
  - Password: password123
  - Role: **Player** or **Organizer**
  - College: Your College Name
- Click "Register" button

### 3. Explore Features

**As Player:**
- View live competitions on home page
- Access player dashboard
- Browse upcoming tournaments

**As Organizer:**
- Create new competitions
- Manage your competitions
- Delete competitions
- View participants

---

## 🔍 Verify Everything Works

### Health Check
```bash
# Backend health
curl http://localhost:5000/api/health

# Should return:
# {"status":"WinZone backend running successfully","timestamp":"..."}
```

### API Test
```bash
# Register user (PowerShell)
curl -X POST http://localhost:5000/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "player",
    "collegeName": "Test College"
  }'
```

---

## 📱 Features Checklist

Test these features in the app:

- [ ] User registration with email/password
- [ ] User login with JWT authentication
- [ ] Auto-login on page refresh (token persistence)
- [ ] Logout functionality
- [ ] Create competition (organizer only)
- [ ] View my competitions (organizer)
- [ ] Delete competition (organizer)
- [ ] View all competitions (home page)
- [ ] Role-based navigation (player vs organizer dashboards)
- [ ] Toast notifications for all actions

---

## 🐛 Troubleshooting

### Backend Won't Start
```bash
# Check MongoDB connection
# Verify MONGO_URI in backend/.env

# Check port 5000 is free
netstat -ano | findstr :5000

# Kill process if needed
taskkill /PID <PID> /F
```

### Frontend Won't Start
```bash
# Clear node_modules and reinstall
cd frontend
rm -rf node_modules
npm install

# Try different port if 5173 is busy
npm run dev -- --port 5174
```

### CORS Error
- Verify `FRONTEND_URL` in backend/.env matches your Vite dev server URL
- Check browser console for exact error
- Restart both servers after changing .env files

### 401 Unauthorized
- Token might be expired (re-login)
- Check if token exists: `localStorage.getItem('token')`
- Clear localStorage and login again

---

## 📚 Documentation

- **Full Phase 5 Guide:** `PHASE5_COMPLETE.md`
- **API Reference:** `API_REFERENCE.md`
- **Project Structure:** `PROJECT_STRUCTURE.md`

---

## 🎯 What's Next?

After Phase 5, you have:
- ✅ Full MERN stack application
- ✅ JWT authentication
- ✅ Real-time data from MongoDB
- ✅ Cyberpunk gaming UI
- ✅ Role-based access control

**Next Features to Build:**
1. Player competition registration
2. Payment gateway integration
3. Live leaderboards
4. User profile management
5. Admin panel

---

## 🆘 Need Help?

1. **Check logs:**
   - Backend: Terminal 1 output
   - Frontend: Browser console (F12)

2. **Test API directly:**
   - Use Postman or curl
   - See `API_REFERENCE.md` for endpoints

3. **Verify database:**
   - Check MongoDB Compass
   - Ensure users/competitions collections exist

---

## 🎉 Success!

If you can:
- ✅ Register a new user
- ✅ Login successfully
- ✅ See your name in navbar
- ✅ Create a competition (as organizer)
- ✅ View competitions on home page

**You're all set! Enjoy building! 🚀**

---

**Last Updated:** Phase 5 - October 31, 2025
**Tech Stack:** MongoDB, Express, React, Node.js, Tailwind, Framer Motion, JWT, Axios
