# 📁 WinZone - Complete File Structure (Phase 2)

## Updated Project Tree

```
Winzone/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                      # MongoDB connection with Mongoose
│   │   │
│   │   ├── controllers/
│   │   │   └── auth.controller.js         # Auth controllers: register, login, getCurrentUser
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js         # JWT verification middleware
│   │   │   └── role.middleware.js         # Role-based authorization middleware
│   │   │
│   │   ├── models/
│   │   │   └── user.model.js              # User schema with bcrypt password hashing
│   │   │
│   │   ├── routes/
│   │   │   ├── auth.route.js              # Auth routes: /register, /login, /me
│   │   │   └── health.route.js            # Health check route
│   │   │
│   │   ├── utils/
│   │   │   └── jwt.util.js                # JWT token generation and verification
│   │   │
│   │   ├── app.js                         # Express app configuration
│   │   └── server.js                      # Server entry point
│   │
│   ├── .env.example                       # Environment variables template
│   ├── .gitignore                         # Git ignore rules
│   └── package.json                       # Dependencies: express, mongoose, bcryptjs, jsonwebtoken, etc.
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── HealthCheck.jsx            # Backend health status component
│   │   │   └── ProtectedRoute.jsx         # Route protection wrapper component
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx            # Global auth state (user, token, login, logout)
│   │   │
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx              # Role-based dashboard (player/organizer/admin)
│   │   │   ├── Login.jsx                  # Login page with form validation
│   │   │   └── Register.jsx               # Registration page with role selection
│   │   │
│   │   ├── App.jsx                        # Main app with React Router setup
│   │   ├── main.jsx                       # React entry point
│   │   └── index.css                      # Global styles with Tailwind directives
│   │
│   ├── index.html                         # HTML template
│   ├── vite.config.js                     # Vite configuration with API proxy
│   ├── tailwind.config.js                 # Tailwind CSS configuration
│   ├── postcss.config.js                  # PostCSS configuration
│   ├── .eslintrc.cjs                      # ESLint configuration
│   ├── .gitignore                         # Git ignore rules
│   └── package.json                       # Dependencies: react, react-router-dom, etc.
│
├── README.md                              # Complete project documentation
├── INSTALLATION.md                        # Detailed installation guide
└── .gitignore                             # Project-level git ignore
```

---

## 📊 File Count Summary

### Backend Files
- **Configuration:** 1 file (db.js)
- **Controllers:** 1 file (auth.controller.js)
- **Middleware:** 2 files (auth.middleware.js, role.middleware.js)
- **Models:** 1 file (user.model.js)
- **Routes:** 2 files (auth.route.js, health.route.js)
- **Utils:** 1 file (jwt.util.js)
- **Core:** 2 files (app.js, server.js)
- **Config:** 3 files (.env.example, .gitignore, package.json)

**Total Backend Files:** 13 files

### Frontend Files
- **Components:** 2 files (HealthCheck.jsx, ProtectedRoute.jsx)
- **Context:** 1 file (AuthContext.jsx)
- **Pages:** 3 files (Dashboard.jsx, Login.jsx, Register.jsx)
- **Core:** 3 files (App.jsx, main.jsx, index.css)
- **Config:** 6 files (index.html, vite.config.js, tailwind.config.js, postcss.config.js, .eslintrc.cjs, .gitignore, package.json)

**Total Frontend Files:** 16 files

### Documentation
- README.md
- INSTALLATION.md

**Total Project Files:** 31 files

---

## 🔄 Files Modified from Phase 1 to Phase 2

### Backend
- ✅ **Modified:** `src/app.js` (added auth routes import)
- ✅ **Modified:** `package.json` (added bcryptjs, jsonwebtoken)
- ✅ **Added:** 7 new files (models, controllers, middleware, utils, routes)

### Frontend
- ✅ **Modified:** `src/App.jsx` (added routing and auth)
- ✅ **Modified:** `package.json` (added react-router-dom)
- ✅ **Added:** 6 new files (pages, context, ProtectedRoute component)

---

## 📦 New Dependencies in Phase 2

### Backend Dependencies
```json
{
  "bcryptjs": "^2.4.3",           // Password hashing
  "jsonwebtoken": "^9.0.2"        // JWT authentication
}
```

### Frontend Dependencies
```json
{
  "react-router-dom": "^6.22.3"   // Client-side routing
}
```

---

## 🎯 Key Features by File

### Backend

**user.model.js**
- User schema definition
- Password hashing pre-save hook
- Password comparison method
- Email validation

**auth.controller.js**
- `registerUser`: Create new account with validation
- `loginUser`: Authenticate and return JWT
- `getCurrentUser`: Fetch user from token

**auth.middleware.js**
- Extract JWT from Authorization header
- Verify token validity
- Attach user to request object

**role.middleware.js**
- Check user role against allowed roles
- Return 403 if unauthorized
- Support multiple role checks

**jwt.util.js**
- `generateToken`: Create JWT with user ID
- `verifyToken`: Decode and validate JWT

### Frontend

**AuthContext.jsx**
- Global auth state management
- Login/register/logout functions
- Token storage in localStorage
- Auto-fetch user on mount

**Login.jsx**
- Email/password form
- Form validation
- API integration
- Role-based redirect

**Register.jsx**
- Multi-field registration form
- Role selection dropdown
- Password confirmation
- Error handling

**Dashboard.jsx**
- Display user information
- Role-based UI content
- Wallet balance display
- Feature preview by role

**ProtectedRoute.jsx**
- Authentication check
- Redirect to login if not authenticated
- Loading state handling

---

## 🔐 Authentication Flow

### Registration Flow
```
1. User fills registration form (Register.jsx)
2. Form data sent to POST /api/auth/register
3. auth.controller.js validates input
4. user.model.js hashes password with bcrypt
5. User saved to MongoDB
6. JWT token generated (jwt.util.js)
7. Token and user data returned to frontend
8. AuthContext stores token in localStorage
9. User redirected to role-specific dashboard
```

### Login Flow
```
1. User enters credentials (Login.jsx)
2. Form data sent to POST /api/auth/login
3. auth.controller.js finds user by email
4. Password compared with bcrypt
5. JWT token generated if valid
6. Token and user data returned
7. AuthContext stores token
8. User redirected to dashboard
```

### Protected Route Access Flow
```
1. User navigates to protected route
2. ProtectedRoute.jsx checks authentication
3. If authenticated: render component
4. If not: redirect to /login
```

### API Request with Auth Flow
```
1. Frontend makes API request
2. AuthContext includes token in Authorization header
3. Backend auth.middleware.js verifies token
4. If valid: attach user to req.user, proceed
5. If invalid: return 401 Unauthorized
```

---

## 🚀 Next Phase Preview

Phase 3 will add:
- Tournament models and routes
- Player registration system
- Organizer tournament management
- Wallet transactions
- Match scheduling
- Real-time updates

New files expected:
- `backend/src/models/tournament.model.js`
- `backend/src/controllers/tournament.controller.js`
- `backend/src/routes/tournament.route.js`
- `frontend/src/pages/Tournaments.jsx`
- And more...

---

**Phase 2 Complete! ✅**
