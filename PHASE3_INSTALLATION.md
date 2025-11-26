# 🚀 Phase 3 Installation & Startup Guide

## ✅ No New Dependencies Required

Phase 3 uses **existing dependencies** from Phase 1 and Phase 2. No additional packages need to be installed!

All Phase 3 features work with:
- ✅ Mongoose (existing) - for Competition model
- ✅ Express (existing) - for Competition routes
- ✅ React (existing) - for UI components
- ✅ React Router (existing) - for routing
- ✅ Tailwind CSS (existing) - for styling

---

## 🔄 Quick Start (Restart Servers)

Since no new dependencies are required, simply restart your servers to load the new code:

### Step 1: Restart Backend

```powershell
# In backend folder
# Press Ctrl+C to stop the current server (if running)
# Then start again:
npm run dev
```

**Expected Output:**
```
Server running on port 5000
Database connected successfully
```

### Step 2: Restart Frontend

```powershell
# In frontend folder (new terminal window)
# Press Ctrl+C to stop the current server (if running)
# Then start again:
npm run dev
```

**Expected Output:**
```
  VITE v5.2.0  ready in 500 ms

  ➜  Local:   http://localhost:5173/
```

---

## 🧪 Test Phase 3 Features

### 1. Login as Organizer
Navigate to: `http://localhost:5173/login`
- Use an existing organizer account, or
- Register a new account with role "organizer"

### 2. Access Organizer Dashboard
After login, you'll be redirected to: `http://localhost:5173/organizer-dashboard`

### 3. Create Your First Competition
- Click "Create Competition" button
- Fill in the form:
  - **Title**: "BGMI Tournament 2025"
  - **Description**: "Inter-college BGMI championship"
  - **Game Type**: Select "BGMI" from dropdown
  - **Entry Fee**: 50
  - **Start Time**: Choose a future date/time
  - **End Time**: Choose time after start time
  - **Max Players**: 100
- Submit form
- Competition appears in your dashboard!

### 4. Verify Database
Open MongoDB Compass or Atlas dashboard and check:
- New collection: `competitions`
- Your competition document should be visible

---

## 📊 What's New in Phase 3

### Backend (3 new files)
```
backend/src/
├── models/competition.model.js        ✨ NEW
├── controllers/competition.controller.js  ✨ NEW
└── routes/competition.route.js        ✨ NEW
```

### Frontend (2 new files)
```
frontend/src/
├── pages/OrganizerDashboard.jsx       ✨ NEW
└── components/CreateCompetitionForm.jsx ✨ NEW
```

### Modified Files
- `backend/src/app.js` - Added competition routes
- `frontend/src/App.jsx` - Added organizer dashboard route

---

## 🎯 API Endpoints Available

### Public Endpoints (No Auth Required)
- `GET /api/competitions` - Browse all competitions
- `GET /api/competitions/:id` - Get competition details

### Organizer Endpoints (Auth Required)
- `POST /api/competitions/create` - Create competition
- `GET /api/competitions/my/list` - Get my competitions
- `PUT /api/competitions/:id` - Update my competition
- `DELETE /api/competitions/:id` - Delete my competition

---

## 🐛 Troubleshooting

### Backend Errors

**Error: "Cannot find module './routes/competition.route.js'"**
- Solution: Make sure `backend/src/routes/competition.route.js` exists
- Restart the backend server

**Error: "Competition model not defined"**
- Solution: Verify `backend/src/models/competition.model.js` exists
- Check for syntax errors in the model file
- Restart the backend server

### Frontend Errors

**Error: "Cannot find module './pages/OrganizerDashboard'"**
- Solution: Verify `frontend/src/pages/OrganizerDashboard.jsx` exists
- Check import path in App.jsx is correct
- Restart the frontend server

**404 on /organizer-dashboard**
- Solution: Check App.jsx routing is updated
- Verify you're logged in as an organizer
- Clear browser cache and retry

### Dashboard Shows Empty

**No competitions showing but you created some:**
- Check browser console for API errors
- Verify JWT token is valid (check localStorage)
- Check MongoDB connection
- Verify competition organizerId matches your user _id

---

## ✅ Verification Checklist

- [ ] Backend server running on port 5000
- [ ] Frontend server running on port 5173
- [ ] MongoDB connected successfully
- [ ] Can login as organizer
- [ ] Can access /organizer-dashboard route
- [ ] Can open "Create Competition" modal
- [ ] Can submit competition form
- [ ] Competition appears in dashboard
- [ ] Statistics cards show correct counts
- [ ] Can delete competition (without participants)

---

## 📚 Documentation

- **Full Phase 3 Docs**: `PHASE3_COMPLETE.md`
- **Main README**: `README.md` (updated with Phase 3)
- **This Guide**: `PHASE3_INSTALLATION.md`

---

## 🎉 Success!

If all steps above work, Phase 3 is successfully installed and running!

**Next:** Phase 4 will add player features to browse and register for competitions.

---

**Need Help?**
- Check `PHASE3_COMPLETE.md` for detailed API documentation
- Review `README.md` for complete project setup
- Verify all Phase 3 files exist in the correct locations
