# 🚀 WinZone - Complete Installation & Run Guide

## Phase 2: Authentication System - Installation Commands

### 📋 Prerequisites Check
```powershell
# Check Node.js version (should be v18+)
node --version

# Check npm version
npm --version

# Check if MongoDB is installed (local)
mongod --version
```

---

## 🔧 Complete Installation Steps

### Step 1: Navigate to Project Root
```powershell
cd "c:\Users\ashis\OneDrive\Desktop\Projects\Winzone"
```

---

### Step 2: Backend Setup

#### Install Backend Dependencies
```powershell
# Navigate to backend folder
cd backend

# Install all dependencies (including new Phase 2 packages)
npm install

# Verify bcryptjs and jsonwebtoken are installed
npm list bcryptjs jsonwebtoken
```

#### Create Environment File
```powershell
# Copy .env.example to .env
Copy-Item .env.example .env

# Now edit .env file manually and set:
# - MONGO_URI (your MongoDB connection string)
# - JWT_SECRET (a strong secret key for JWT)
```

**Example .env file:**
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/winzone
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_12345
JWT_EXPIRE=7d
```

#### Start MongoDB (if using local installation)
```powershell
# In a new terminal window, start MongoDB
mongod

# Or if using MongoDB as a service (Windows)
net start MongoDB
```

#### Start Backend Server
```powershell
# Make sure you're in the backend folder
npm run dev
```

**Expected Output:**
```
✅ MongoDB Connected: localhost
🚀 Server running in development mode on port 5000
📍 Server URL: http://localhost:5000
```

---

### Step 3: Frontend Setup

#### Open a New Terminal Window
```powershell
# Navigate to frontend folder from project root
cd "c:\Users\ashis\OneDrive\Desktop\Projects\Winzone\frontend"

# Install all dependencies (including React Router)
npm install

# Verify react-router-dom is installed
npm list react-router-dom
```

#### Start Frontend Development Server
```powershell
# Start Vite dev server
npm run dev
```

**Expected Output:**
```
VITE v5.2.0  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

## 🧪 Testing the Complete System

### 1. Test Backend Health
```powershell
# Open browser or use curl
curl http://localhost:5000/api/health
```

**Expected Response:**
```json
{
  "status": "WinZone backend running successfully",
  "timestamp": "2025-10-30T..."
}
```

### 2. Test User Registration (API)
```powershell
# Register a test user
curl -X POST http://localhost:5000/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{
    "name": "Test Player",
    "email": "player@test.com",
    "password": "password123",
    "role": "player",
    "collegeName": "Test University"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "name": "Test Player",
    "email": "player@test.com",
    "role": "player",
    ...
  }
}
```

### 3. Test User Login (API)
```powershell
# Login with the test user
curl -X POST http://localhost:5000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{
    "email": "player@test.com",
    "password": "password123"
  }'
```

### 4. Test Frontend Application

Open your browser and navigate to: `http://localhost:5173`

**Test Flow:**
1. Click "Register" button
2. Fill in registration form with:
   - Name: Your Name
   - Email: youremail@example.com
   - Role: Player or Organizer
   - Password: minimum 6 characters
3. Submit form
4. Should automatically redirect to dashboard
5. Click "Logout"
6. Click "Login"
7. Enter credentials
8. Should redirect to role-specific dashboard

---

## 🔄 Quick Start Commands (Both Servers)

### Option 1: Two Separate Terminal Windows

**Terminal 1 (Backend):**
```powershell
cd "c:\Users\ashis\OneDrive\Desktop\Projects\Winzone\backend"
npm run dev
```

**Terminal 2 (Frontend):**
```powershell
cd "c:\Users\ashis\OneDrive\Desktop\Projects\Winzone\frontend"
npm run dev
```

### Option 2: Using PowerShell with Split Panes

```powershell
# In Windows Terminal, split pane (Alt+Shift+D)
# Terminal 1:
cd "c:\Users\ashis\OneDrive\Desktop\Projects\Winzone\backend" ; npm run dev

# Terminal 2:
cd "c:\Users\ashis\OneDrive\Desktop\Projects\Winzone\frontend" ; npm run dev
```

---

## 📦 New Dependencies Added in Phase 2

### Backend
- `bcryptjs` (^2.4.3) - Password hashing
- `jsonwebtoken` (^9.0.2) - JWT token generation and verification

### Frontend
- `react-router-dom` (^6.22.3) - Client-side routing

---

## 🗄️ Database Setup

### MongoDB Collections Created
After running the application, MongoDB will automatically create:
- **Database:** `winzone`
- **Collection:** `users`

### View Database
```powershell
# Connect to MongoDB shell
mongosh

# Switch to winzone database
use winzone

# View all users
db.users.find().pretty()

# Count users
db.users.countDocuments()
```

---

## 🔍 Verify Installation

### Backend Verification
```powershell
# Check all backend files exist
cd "c:\Users\ashis\OneDrive\Desktop\Projects\Winzone\backend"
ls src/models/user.model.js
ls src/controllers/auth.controller.js
ls src/middleware/auth.middleware.js
ls src/middleware/role.middleware.js
ls src/routes/auth.route.js
ls src/utils/jwt.util.js
```

### Frontend Verification
```powershell
# Check all frontend files exist
cd "c:\Users\ashis\OneDrive\Desktop\Projects\Winzone\frontend"
ls src/pages/Login.jsx
ls src/pages/Register.jsx
ls src/pages/Dashboard.jsx
ls src/context/AuthContext.jsx
ls src/components/ProtectedRoute.jsx
```

---

## 🛑 Stopping the Servers

### Stop Backend
- Press `Ctrl + C` in the backend terminal

### Stop Frontend
- Press `Ctrl + C` in the frontend terminal

### Stop MongoDB (if running manually)
```powershell
# In MongoDB terminal, press Ctrl + C
# Or stop the service
net stop MongoDB
```

---

## 🔄 Reinstalling Dependencies (if needed)

### Backend
```powershell
cd backend
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

### Frontend
```powershell
cd frontend
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

---

## ✅ Success Checklist

- [ ] Node.js v18+ installed
- [ ] MongoDB installed and running
- [ ] Backend dependencies installed (including bcryptjs, jsonwebtoken)
- [ ] Frontend dependencies installed (including react-router-dom)
- [ ] .env file created in backend with correct values
- [ ] Backend server running on port 5000
- [ ] Frontend server running on port 5173
- [ ] Can access http://localhost:5173 in browser
- [ ] Registration page works
- [ ] Login page works
- [ ] Dashboard displays user information
- [ ] Logout functionality works

---

## 🎉 You're All Set!

WinZone Phase 2 (Authentication System) is now fully installed and running!

**Next Steps:**
- Create test accounts with different roles (player, organizer, admin)
- Explore the role-based dashboards
- Test protected routes
- Review the code structure for Phase 3 development

---

**Built with ❤️ using MERN Stack**
