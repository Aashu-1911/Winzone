# 🚀 Phase 5: Backend API Integration - Complete Guide

## ✅ Implementation Summary

Phase 5 successfully integrates the **WinZone frontend** (React + Vite + Tailwind) with the **existing backend** (Node.js + Express + MongoDB), establishing a fully functional full-stack MERN application with JWT authentication and real-time data management.

---

## 📦 Packages Installed

```bash
npm install axios react-hot-toast
```

- **axios** (v1.x): HTTP client for API requests with interceptors
- **react-hot-toast** (v2.x): Beautiful toast notifications with custom styling

---

## 🏗️ Architecture Overview

```
Frontend (React + Vite)
├── Services Layer (axios)
│   ├── api.js (axios instance + interceptors)
│   ├── authService.js (register, login, getCurrentUser)
│   └── competitionService.js (CRUD operations)
│
├── Context (State Management)
│   └── AuthContext.jsx (user state, token management)
│
├── Pages (UI Components)
│   ├── Login.jsx (integrated with loginUser API)
│   ├── Register.jsx (integrated with registerUser API)
│   ├── Home.jsx (displays live competitions from API)
│   ├── Dashboard.jsx (player/admin dashboard)
│   └── OrganizerDashboard.jsx (competition management)
│
└── Components
    ├── Navbar.jsx (user profile with real data)
    ├── Footer.jsx (branding)
    └── CreateCompetitionForm.jsx (create competitions via API)

⬇️ HTTP Requests (axios)

Backend (Node.js + Express + MongoDB)
├── Routes
│   ├── /api/auth (register, login, /me)
│   └── /api/competitions (CRUD + my/list)
├── Controllers (business logic)
├── Middleware (JWT auth, role-based access)
└── Models (User, Competition - MongoDB)
```

---

## 🔧 Configuration Files

### 1. Environment Variables (`.env`)

**Location:** `frontend/.env`

```env
# Backend API Configuration
VITE_API_URL=http://localhost:5000

# Environment
VITE_NODE_ENV=development
```

**⚠️ Important:** 
- Vite uses `VITE_` prefix for environment variables
- Access in code: `import.meta.env.VITE_API_URL`
- Create `.env.example` for team members

---

## 📡 API Service Layer

### **1. Axios Instance** (`services/api.js`)

**Purpose:** Centralized HTTP client with automatic token injection and error handling

**Key Features:**
- Base URL from environment variable
- Request interceptor adds JWT token to all requests
- Response interceptor handles 401 (logout), 403, 404, 500 errors
- 10-second timeout for all requests

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Auto-inject token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

### **2. Authentication Service** (`services/authService.js`)

**Functions:**

| Function | Method | Endpoint | Description |
|----------|--------|----------|-------------|
| `registerUser(userData)` | POST | `/api/auth/register` | Register new user, returns token + user |
| `loginUser(credentials)` | POST | `/api/auth/login` | Login user, returns token + user |
| `getCurrentUser()` | GET | `/api/auth/me` | Fetch current user profile (requires token) |
| `logoutUser()` | - | Client-side | Clears token from localStorage |

**Example Usage:**

```javascript
import { loginUser } from '../services/authService';

try {
  const data = await loginUser({ email, password });
  if (data.success) {
    login(data.user, data.token); // Update AuthContext
    toast.success(`Welcome back, ${data.user.name}!`);
  }
} catch (error) {
  toast.error(error.message || 'Login failed');
}
```

---

### **3. Competition Service** (`services/competitionService.js`)

**Functions:**

| Function | Method | Endpoint | Access | Description |
|----------|--------|----------|--------|-------------|
| `getAllCompetitions()` | GET | `/api/competitions` | Public | Get all competitions (browse) |
| `getCompetitionById(id)` | GET | `/api/competitions/:id` | Public | Get single competition details |
| `getMyCompetitions()` | GET | `/api/competitions/my/list` | Organizer | Get logged-in organizer's competitions |
| `createCompetition(data)` | POST | `/api/competitions/create` | Organizer | Create new competition |
| `updateCompetition(id, data)` | PUT | `/api/competitions/:id` | Organizer | Update competition (own only) |
| `deleteCompetition(id)` | DELETE | `/api/competitions/:id` | Organizer | Delete competition (own only) |

**Example Usage:**

```javascript
import { getMyCompetitions, deleteCompetition } from '../services/competitionService';
import toast from 'react-hot-toast';

// Fetch organizer's competitions
const fetchCompetitions = async () => {
  try {
    const data = await getMyCompetitions();
    if (data.success) {
      setCompetitions(data.data);
    }
  } catch (error) {
    toast.error(error.message);
  }
};

// Delete competition
const handleDelete = async (id) => {
  try {
    await deleteCompetition(id);
    toast.success('Competition deleted! 🗑️');
    fetchCompetitions(); // Refresh list
  } catch (error) {
    toast.error(error.message);
  }
};
```

---

## 🔐 Authentication Flow

### **1. Registration Flow**

```
User fills Register Form
  ↓
registerUser({ name, email, password, role, collegeName })
  ↓
POST /api/auth/register
  ↓
Backend validates + creates user + generates JWT
  ↓
Response: { success: true, token, user: {...} }
  ↓
Frontend: register(user, token) → saves to AuthContext + localStorage
  ↓
Navigate to /organizer-dashboard or /dashboard based on role
  ↓
Toast: "Welcome to WinZone, {name}! 🎮"
```

### **2. Login Flow**

```
User fills Login Form
  ↓
loginUser({ email, password })
  ↓
POST /api/auth/login
  ↓
Backend verifies credentials + generates JWT
  ↓
Response: { success: true, token, user: {...} }
  ↓
Frontend: login(user, token) → saves to AuthContext + localStorage
  ↓
Navigate to role-specific dashboard
  ↓
Toast: "Welcome back, {name}! 🎮"
```

### **3. Auto-Login on Page Refresh**

```
App loads → AuthContext useEffect runs
  ↓
Check localStorage for token
  ↓
If token exists → fetchCurrentUser()
  ↓
GET /api/auth/me (with Authorization: Bearer {token})
  ↓
Backend verifies JWT → returns user data
  ↓
Frontend: setUser(data.user) → user stays logged in
  ↓
If token invalid → logout() → clear localStorage → redirect to /login
```

---

## 🎨 Toast Notifications

**Integration:** `react-hot-toast` with cyberpunk theme

**Location:** `App.jsx`

```jsx
import { Toaster } from 'react-hot-toast';

<Toaster
  position="top-right"
  toastOptions={{
    duration: 4000,
    style: {
      background: '#151934', // dark-surface
      color: '#fff',
      border: '1px solid rgba(34, 211, 238, 0.3)', // cyber-blue
      borderRadius: '12px',
      fontFamily: 'Rajdhani, sans-serif',
    },
    success: {
      iconTheme: { primary: '#22c55e', secondary: '#fff' },
      style: { border: '1px solid rgba(34, 197, 94, 0.5)' },
    },
    error: {
      iconTheme: { primary: '#ef4444', secondary: '#fff' },
      style: { border: '1px solid rgba(239, 68, 68, 0.5)' },
    },
  }}
/>
```

**Usage Examples:**

```javascript
import toast from 'react-hot-toast';

// Success
toast.success('Competition created successfully! 🎮');

// Error
toast.error('Failed to delete competition');

// Custom
toast('Processing...', { icon: '⏳' });

// Promise-based
toast.promise(
  createCompetition(data),
  {
    loading: 'Creating competition...',
    success: 'Competition created! 🎉',
    error: 'Failed to create',
  }
);
```

---

## 📄 Updated Components

### **1. AuthContext.jsx**

**Changes:**
- ✅ Replaced fetch API with `getCurrentUser()` service
- ✅ Added `fetchCurrentUser` to context value for manual refresh
- ✅ Improved error handling with try-catch

### **2. Login.jsx**

**Changes:**
- ✅ Replaced fetch with `loginUser()` service
- ✅ Removed manual error state (using toasts now)
- ✅ Added loading spinner during API call
- ✅ Role-based navigation after login

### **3. Register.jsx**

**Changes:**
- ✅ Replaced fetch with `registerUser()` service
- ✅ Removed manual error state
- ✅ Added password validation (min 6 characters)
- ✅ Toast notifications for success/error

### **4. OrganizerDashboard.jsx**

**Changes:**
- ✅ Replaced fetch with `getMyCompetitions()` service
- ✅ Integrated `deleteCompetition()` service
- ✅ Removed custom toast state (using react-hot-toast)
- ✅ Added loading state for competitions
- ✅ Real-time data fetching on component mount

### **5. CreateCompetitionForm.jsx**

**Changes:**
- ✅ Replaced fetch with `createCompetition()` service
- ✅ Added toast notifications for success/error
- ✅ Simplified form submission logic

### **6. Home.jsx**

**Changes:**
- ✅ Added `getAllCompetitions()` API integration
- ✅ Displays live competitions dynamically
- ✅ Filters for upcoming/ongoing competitions
- ✅ Shows first 6 live competitions on homepage

### **7. App.jsx**

**Changes:**
- ✅ Added `<Toaster />` component with cyber theme
- ✅ Configured toast position and styling

---

## 🧪 Testing Guide

### **Prerequisites**

1. **Backend Running:**
   ```bash
   cd backend
   npm run dev
   # Server should be running on http://localhost:5000
   ```

2. **MongoDB Connected:**
   - Check backend console for "MongoDB connected successfully"

3. **Frontend Running:**
   ```bash
   cd frontend
   npm run dev
   # App should be running on http://localhost:5173 or 5175
   ```

---

### **Test Scenarios**

#### **1. User Registration**

**Steps:**
1. Navigate to http://localhost:5173/register
2. Fill in:
   - Name: "Test Player"
   - Email: "player@test.com"
   - Password: "password123"
   - Role: Player
   - College: "Test University"
3. Click "Register"

**Expected Results:**
- ✅ Toast: "Welcome to WinZone, Test Player! 🎮"
- ✅ Redirected to `/dashboard`
- ✅ Navbar shows user name and "Player" role
- ✅ JWT token saved in localStorage

**Verify in Backend:**
```bash
# Check MongoDB
# New user should be created with hashed password
```

---

#### **2. User Login**

**Steps:**
1. Logout if logged in
2. Navigate to http://localhost:5173/login
3. Fill in:
   - Email: "player@test.com"
   - Password: "password123"
4. Click "Login"

**Expected Results:**
- ✅ Toast: "Welcome back, Test Player! 🎮"
- ✅ Redirected to `/dashboard`
- ✅ User data loads correctly

**Common Errors:**
- ❌ "Invalid email or password" → Check credentials
- ❌ "Network error" → Backend not running

---

#### **3. Auto-Login (Token Persistence)**

**Steps:**
1. Login as any user
2. Refresh the page (F5)
3. Navigate to different pages

**Expected Results:**
- ✅ User stays logged in after refresh
- ✅ Navbar shows correct user data
- ✅ No redirect to login page
- ✅ Protected routes remain accessible

**What's Happening:**
- On page load, `AuthContext` checks localStorage for token
- Calls `/api/auth/me` with token
- If valid, user data is restored

---

#### **4. Create Competition (Organizer)**

**Steps:**
1. Register/Login as Organizer role
2. Navigate to `/organizer-dashboard`
3. Click "Create Competition"
4. Fill in form:
   - Title: "BGMI Championship"
   - Game Type: BGMI
   - Entry Fee: 50
   - Prize Pool: 5000
   - Max Players: 100
   - Start/End Time: Future dates
5. Click "Create Competition"

**Expected Results:**
- ✅ Toast: "Competition created successfully! 🎮"
- ✅ Modal closes
- ✅ New competition appears in list
- ✅ Competition card shows all details

**Verify in Backend:**
```bash
# Check MongoDB competitions collection
# New competition should have:
# - organizerId: current user's ID
# - status: "upcoming"
```

---

#### **5. Fetch My Competitions (Organizer)**

**Steps:**
1. Login as Organizer
2. Navigate to `/organizer-dashboard`
3. Page loads automatically

**Expected Results:**
- ✅ Loading spinner appears briefly
- ✅ List of competitions created by this organizer
- ✅ Each card shows title, game, entry fee, prize pool
- ✅ Empty state if no competitions: "No competitions yet"

**API Call:**
```
GET /api/competitions/my/list
Authorization: Bearer <token>
```

---

#### **6. Delete Competition (Organizer)**

**Steps:**
1. Login as Organizer with existing competitions
2. Navigate to `/organizer-dashboard`
3. Click "Delete" button on any competition
4. Confirm deletion in browser alert

**Expected Results:**
- ✅ Confirmation dialog: "Are you sure?"
- ✅ Toast: "Competition deleted successfully! 🗑️"
- ✅ Competition removed from list
- ✅ MongoDB record deleted

---

#### **7. View Live Competitions (Home Page)**

**Steps:**
1. Navigate to http://localhost:5173/
2. Scroll to "Featured Competitions" section

**Expected Results:**
- ✅ Up to 6 live competitions displayed
- ✅ Only upcoming/ongoing competitions shown
- ✅ Each card shows game, entry fee, prize pool
- ✅ Empty state if no competitions

**API Call:**
```
GET /api/competitions
# No authentication required (public route)
```

---

#### **8. Unauthorized Access (401 Error)**

**Steps:**
1. Login and save token
2. Manually delete token from localStorage:
   ```javascript
   localStorage.removeItem('token')
   ```
3. Try to access `/organizer-dashboard`

**Expected Results:**
- ✅ Axios interceptor catches 401 error
- ✅ Automatically redirects to `/login`
- ✅ User is logged out

---

### **Postman Testing**

#### **Collection Structure**

```
WinZone API - Phase 5
├── Auth
│   ├── POST Register User
│   ├── POST Login User
│   └── GET Current User (Protected)
│
└── Competitions
    ├── GET All Competitions (Public)
    ├── GET My Competitions (Organizer)
    ├── POST Create Competition (Organizer)
    ├── PUT Update Competition (Organizer)
    └── DELETE Delete Competition (Organizer)
```

#### **Environment Variables**

```
baseUrl: http://localhost:5000
token: (auto-set after login)
```

#### **Auto-Set Token Script**

Add to Login request "Tests" tab:

```javascript
if (pm.response.code === 200) {
    const responseJson = pm.response.json();
    pm.environment.set("token", responseJson.token);
    console.log("Token saved:", responseJson.token);
}
```

#### **Protected Request Headers**

```
Authorization: Bearer {{token}}
Content-Type: application/json
```

---

## 🐛 Common Issues & Solutions

### **1. CORS Error**

**Error:** `Access to XMLHttpRequest blocked by CORS policy`

**Solution:**
- Check backend `app.js`:
  ```javascript
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  }));
  ```
- Verify `FRONTEND_URL` in backend `.env` matches your Vite dev server port

---

### **2. 401 Unauthorized on Protected Routes**

**Error:** `No token provided. Authorization denied.`

**Possible Causes:**
- Token not in localStorage
- Token expired (default: 7 days)
- Axios interceptor not adding token

**Solution:**
- Check localStorage: `localStorage.getItem('token')`
- Re-login to get fresh token
- Verify interceptor in `services/api.js`

---

### **3. Network Error / Backend Unreachable**

**Error:** `Network error. Unable to reach the server`

**Solution:**
- Verify backend is running on port 5000
- Check MongoDB is connected
- Confirm `VITE_API_URL` in frontend `.env`
- Try: `curl http://localhost:5000/api/health`

---

### **4. Empty Competitions List (Organizer)**

**Possible Causes:**
- No competitions created yet
- Competitions created by different organizer

**Solution:**
- Create a test competition via dashboard
- Check MongoDB: `db.competitions.find({ organizerId: <user_id> })`
- Verify API response in Network tab (DevTools)

---

### **5. Toast Not Showing**

**Possible Causes:**
- `<Toaster />` not added to App.jsx
- Import missing: `import toast from 'react-hot-toast'`

**Solution:**
- Verify `<Toaster />` is inside `<Router>` in App.jsx
- Check z-index conflicts with other components

---

## 📁 File Structure

```
frontend/
├── .env                          # Environment variables (VITE_API_URL)
├── .env.example                  # Template for team
│
├── src/
│   ├── services/                 # API Service Layer
│   │   ├── api.js                # Axios instance + interceptors
│   │   ├── authService.js        # Authentication APIs
│   │   └── competitionService.js # Competition APIs
│   │
│   ├── context/
│   │   └── AuthContext.jsx       # Updated with API integration
│   │
│   ├── pages/
│   │   ├── Login.jsx             # Uses loginUser service
│   │   ├── Register.jsx          # Uses registerUser service
│   │   ├── Home.jsx              # Fetches live competitions
│   │   ├── Dashboard.jsx         # Player/admin dashboard
│   │   └── OrganizerDashboard.jsx # Competition management
│   │
│   ├── components/
│   │   ├── Navbar.jsx            # Shows real user data
│   │   ├── Footer.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── CreateCompetitionForm.jsx # Uses createCompetition service
│   │
│   └── App.jsx                   # Added Toaster component
│
└── package.json                  # Added axios, react-hot-toast
```

---

## 🚀 Running the Full Stack Application

### **Development Mode (Recommended)**

**1. Start Backend (Terminal 1)**

```bash
cd C:\Users\ashis\OneDrive\Desktop\Projects\Winzone\backend
npm run dev

# Expected output:
# 🚀 Server running in development mode on port 5000
# ✅ MongoDB connected successfully
```

**2. Start Frontend (Terminal 2)**

```bash
cd C:\Users\ashis\OneDrive\Desktop\Projects\Winzone\frontend
npm run dev

# Expected output:
# VITE v7.x.x  ready in 476 ms
# ➜  Local:   http://localhost:5173/
```

**3. Access Application**

- Frontend: http://localhost:5173
- Backend Health Check: http://localhost:5000/api/health

---

### **Production Build**

**1. Build Frontend**

```bash
cd frontend
npm run build

# Creates 'dist' folder with optimized assets
```

**2. Serve Static Files from Backend**

Update `backend/app.js`:

```javascript
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Serve static files from React build
app.use(express.static(path.join(__dirname, '../../frontend/dist')));

// Catch-all route for React Router
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
});
```

**3. Start Production Server**

```bash
cd backend
npm start
```

---

## 📊 API Response Examples

### **1. Register User**

**Request:**
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "player",
  "collegeName": "MIT"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "6721a3f4b5c9d8e7f6a5b4c3",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "player",
    "collegeName": "MIT",
    "walletBalance": 0,
    "profileImage": ""
  }
}
```

---

### **2. Get My Competitions (Organizer)**

**Request:**
```http
GET /api/competitions/my/list
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "6721b5f4c8d9e7f8a9b6c5d4",
      "title": "BGMI Championship 2025",
      "gameType": "BGMI",
      "entryFee": 50,
      "prizePool": 5000,
      "maxPlayers": 100,
      "startTime": "2025-11-15T10:00:00.000Z",
      "endTime": "2025-11-15T16:00:00.000Z",
      "status": "upcoming",
      "organizerId": {
        "_id": "6721a3f4b5c9d8e7f6a5b4c3",
        "name": "Organizer Name",
        "email": "organizer@example.com"
      },
      "participants": [],
      "createdAt": "2025-10-31T12:00:00.000Z"
    }
  ]
}
```

---

## 🎯 Next Steps (Future Enhancements)

### **Phase 6: Advanced Features**

1. **Player Registration to Competitions**
   - Join competition button
   - Payment gateway integration (Razorpay/Stripe)
   - Wallet system for entry fees

2. **Live Leaderboards**
   - Real-time score updates
   - WebSocket integration for live data
   - Match result submission

3. **User Profiles**
   - Edit profile page
   - Upload profile picture
   - View competition history

4. **Organizer Analytics**
   - Revenue dashboard
   - Participant statistics
   - Competition performance metrics

5. **Admin Panel**
   - User management (ban/unban)
   - Competition approval system
   - Platform analytics

---

## 📝 Summary Checklist

- ✅ **Environment configured** (.env with VITE_API_URL)
- ✅ **Axios installed** with interceptors for token management
- ✅ **Service layer created** (authService, competitionService)
- ✅ **AuthContext updated** with real API calls
- ✅ **Login/Register integrated** with backend JWT
- ✅ **Toast notifications** added with cyber theme
- ✅ **OrganizerDashboard** fetches real competitions
- ✅ **Home page** displays live competitions
- ✅ **Error handling** implemented globally
- ✅ **Loading states** added to all async operations
- ✅ **Protected routes** working with JWT verification

---

## 🎉 Phase 5 Complete!

The WinZone platform now has:
- **Full-stack MERN integration** ✅
- **JWT authentication** with auto-login ✅
- **Real-time data fetching** from MongoDB ✅
- **Beautiful toast notifications** ✅
- **Role-based access control** ✅
- **RESTful API communication** ✅

**Ready for deployment! 🚀**

---

## 📞 Support

For issues or questions:
1. Check browser console for errors
2. Verify backend logs
3. Review this documentation
4. Test with Postman first
5. Check MongoDB data directly

**Happy Coding! 🎮**
