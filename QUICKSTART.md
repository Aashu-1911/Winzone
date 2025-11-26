# 🚀 WinZone - Quick Start Guide (Phase 2)

## ⚡ Fast Installation (5 Minutes)

### Step 1: Install Backend Dependencies
```powershell
cd "c:\Users\ashis\OneDrive\Desktop\Projects\Winzone\backend"
npm install
```

### Step 2: Configure Environment
```powershell
Copy-Item .env.example .env
```

**Edit `.env` file and set:**
```env
MONGO_URI=mongodb://localhost:27017/winzone
JWT_SECRET=your_secret_key_min_32_characters_long
```

### Step 3: Start Backend
```powershell
npm run dev
```
**Should see:** ✅ MongoDB Connected: localhost

### Step 4: Install Frontend Dependencies (New Terminal)
```powershell
cd "c:\Users\ashis\OneDrive\Desktop\Projects\Winzone\frontend"
npm install
```

### Step 5: Start Frontend
```powershell
npm run dev
```
**Should see:** ➜  Local:   http://localhost:5173/

---

## 🧪 Quick Test (2 Minutes)

### 1. Open Browser
Navigate to: http://localhost:5173

### 2. Register a User
- Click "Register"
- Fill in the form:
  - Name: Test Player
  - Email: test@example.com
  - Role: Player
  - Password: password123
- Submit

### 3. Verify Dashboard
- Should auto-login and redirect to dashboard
- See your user information displayed

### 4. Test Logout/Login
- Click "Logout"
- Click "Login"
- Enter credentials
- Should redirect back to dashboard

---

## ✅ Success Indicators

**Backend Running:**
```
✅ MongoDB Connected: localhost
🚀 Server running in development mode on port 5000
```

**Frontend Running:**
```
VITE v5.2.0  ready in XXX ms
➜  Local:   http://localhost:5173/
```

**Working Features:**
- ✅ Can access http://localhost:5173
- ✅ Can register new users
- ✅ Can login
- ✅ Dashboard shows user info
- ✅ Logout works

---

## 🐛 Quick Troubleshooting

### MongoDB Connection Error
```powershell
# Start MongoDB (if not running)
net start MongoDB
```

### Port Already in Use
```powershell
# Kill process on port 5000 (backend)
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process -Force

# Kill process on port 5173 (frontend)
Get-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess | Stop-Process -Force
```

### Dependencies Error
```powershell
# Backend
cd backend
Remove-Item -Recurse -Force node_modules
npm install

# Frontend
cd frontend
Remove-Item -Recurse -Force node_modules
npm install
```

---

## 📚 Full Documentation

For detailed documentation, see:
- **README.md** - Complete project documentation
- **INSTALLATION.md** - Detailed installation guide
- **API_REFERENCE.md** - API endpoint reference
- **PROJECT_STRUCTURE.md** - File structure and flows
- **PHASE2_COMPLETE.md** - Phase 2 completion summary

---

## 🎯 What's Next?

**After successful setup:**
1. Create test users with different roles (player, organizer, admin)
2. Test the API endpoints using Postman or curl
3. Review the code structure
4. Read the documentation for Phase 3 features

**Ready for Phase 3?**
- Phase 3 will add tournament management, wallet transactions, and more!

---

**Built with ❤️ using MERN Stack**
