# 🏆 WinZone - MERN Stack Project

A full-stack web application built with MongoDB, Express, React, and Node.js.

## 📁 Project Structure

```
Winzone/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                           # MongoDB connection configuration
│   │   ├── controllers/
│   │   │   ├── auth.controller.js              # Authentication controllers
│   │   │   └── competition.controller.js       # Competition CRUD controllers
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js              # JWT authentication middleware
│   │   │   └── role.middleware.js              # Role-based authorization
│   │   ├── models/
│   │   │   ├── user.model.js                   # User schema with bcrypt
│   │   │   └── competition.model.js            # Competition schema
│   │   ├── routes/
│   │   │   ├── health.route.js                 # Health check route
│   │   │   ├── auth.route.js                   # Authentication routes
│   │   │   └── competition.route.js            # Competition management routes
│   │   ├── utils/
│   │   │   └── jwt.util.js                     # JWT token utilities
│   │   ├── app.js                              # Express app configuration
│   │   └── server.js                           # Server entry point
│   ├── .env.example                            # Environment variables template
│   ├── .gitignore                              # Git ignore rules
│   └── package.json                            # Backend dependencies & scripts
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── HealthCheck.jsx                 # Health check component
│   │   │   ├── ProtectedRoute.jsx              # Route protection component
│   │   │   └── CreateCompetitionForm.jsx       # Competition creation modal
│   │   ├── context/
│   │   │   └── AuthContext.jsx                 # Global auth state management
│   │   ├── pages/
│   │   │   ├── Login.jsx                       # Login page
│   │   │   ├── Register.jsx                    # Registration page
│   │   │   ├── Dashboard.jsx                   # User dashboard (role-based)
│   │   │   └── OrganizerDashboard.jsx          # Organizer competition management
│   │   ├── App.jsx                             # Main App with routing
│   │   ├── main.jsx                            # React entry point
│   │   └── index.css                           # Global styles with Tailwind
│   ├── index.html                              # HTML template
│   ├── vite.config.js                          # Vite configuration
│   ├── tailwind.config.js                      # Tailwind CSS configuration
│   ├── postcss.config.js                       # PostCSS configuration
│   ├── .eslintrc.cjs                           # ESLint configuration
│   ├── .gitignore                              # Git ignore rules
│   └── package.json                            # Frontend dependencies & scripts
│
├── README.md                                   # This file
└── PHASE3_COMPLETE.md                          # Phase 3 documentation
```

## 🚀 Phase 1: Setup & Architecture (COMPLETED)

### ✅ Backend Features
- ✅ Node.js + Express with ES modules
- ✅ MongoDB connection via Mongoose
- ✅ Environment variables using dotenv
- ✅ CORS configuration
- ✅ JSON body parser
- ✅ Global error handling middleware
- ✅ Health check endpoint: `GET /api/health`
- ✅ Clean folder structure with separation of concerns

### ✅ Frontend Features
- ✅ React 18 with Vite
- ✅ Tailwind CSS for styling
- ✅ Health check component with live backend status
- ✅ API proxy configuration for development
- ✅ Modern ES modules
- ✅ Responsive UI design

---

## 🔐 Phase 2: Authentication System (COMPLETED)

### ✅ Backend Authentication Features
- ✅ **User Model** with Mongoose schema:
  - Fields: name, email, password, role, collegeName, profileImage, walletBalance
  - Password hashing using bcryptjs
  - Email validation and uniqueness
  - Password comparison method
- ✅ **JWT Authentication**:
  - Token generation and verification utilities
  - Secure token-based authentication
  - Token stored with 7-day expiration
- ✅ **Authentication Controllers**:
  - `registerUser` - Create new user account
  - `loginUser` - Verify credentials and return JWT
  - `getCurrentUser` - Fetch user details from token
- ✅ **Middleware**:
  - `authMiddleware` - Verify JWT and attach user to request
  - `roleMiddleware` - Restrict routes by role (player, organizer, admin)
- ✅ **Authentication Routes**:
  - `POST /api/auth/register` - User registration
  - `POST /api/auth/login` - User login
  - `GET /api/auth/me` - Get current user (protected)

### ✅ Frontend Authentication Features
- ✅ **AuthContext** - Global authentication state management:
  - User data and token storage
  - Login, register, logout functions
  - Role-based access checks
  - LocalStorage integration for persistence
- ✅ **Authentication Pages**:
  - **Login.jsx** - Beautiful login form with validation
  - **Register.jsx** - Registration form with role selection
  - **Dashboard.jsx** - Role-based dashboard (player/organizer/admin)
- ✅ **Route Protection**:
  - ProtectedRoute component for authenticated routes
  - Automatic redirect to login for unauthenticated users
  - Role-based dashboard routing
- ✅ **React Router** integration with protected routes
- ✅ **Tailwind-styled forms** with error handling

---

## 🛠️ Installation & Setup

### Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** (local installation or MongoDB Atlas account)
- **npm** or **yarn**

### Step 1: Clone or Navigate to Project
```powershell
cd "c:\Users\ashis\OneDrive\Desktop\Projects\Winzone"
```

### Step 2: Backend Setup

```powershell
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create .env file from template
Copy-Item .env.example .env

# Edit .env and update MONGO_URI with your MongoDB connection string
# Example: MONGO_URI=mongodb://localhost:27017/winzone
# Or for MongoDB Atlas: MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/winzone

# Start backend server
npm run dev
```

**Backend will run on:** `http://localhost:5000`

### Step 3: Frontend Setup

Open a **new terminal** window:

```powershell
# Navigate to frontend folder from project root
cd "c:\Users\ashis\OneDrive\Desktop\Projects\Winzone\frontend"

# Install dependencies
npm install

# Start frontend development server
npm run dev
```

**Frontend will run on:** `http://localhost:5173`

---

## 🧪 Testing the Application

### Phase 1 Testing (Health Check)

1. **Verify Backend:**
   - Open browser: `http://localhost:5000`
   - You should see: `{"message":"Welcome to WinZone API"}`
   - Test health endpoint: `http://localhost:5000/api/health`
   - Expected response: `{"status":"WinZone backend running successfully","timestamp":"..."}`

2. **Verify Frontend:**
   - Open browser: `http://localhost:5173`
   - You should see the WinZone landing page
   - The "Backend Health Status" section should show a green success message
   - Click "Refresh" button to re-test the connection

### Phase 2 Testing (Authentication)

1. **User Registration:**
   - Navigate to `http://localhost:5173/register`
   - Fill in the registration form:
     - Name: Your Name
     - Email: test@example.com
     - Role: Choose "Player" or "Organizer"
     - College Name: Your College (optional)
     - Password: minimum 6 characters
   - Click "Create Account"
   - You should be redirected to the dashboard based on your role

2. **User Login:**
   - Navigate to `http://localhost:5173/login`
   - Enter your email and password
   - Click "Login"
   - You should be redirected to your role-specific dashboard

3. **Protected Routes:**
   - Try accessing `http://localhost:5173/dashboard` without logging in
   - You should be redirected to the login page
   - After login, you can access the dashboard

4. **Role-Based Dashboard:**
   - **Player Dashboard**: Shows player-specific features
   - **Organizer Dashboard**: Shows organizer-specific features
   - **Admin Dashboard**: Shows admin-specific features
   - Dashboard displays user info: name, email, college, wallet balance

5. **API Testing (using Postman or curl):**
   ```powershell
   # Register a new user
   curl -X POST http://localhost:5000/api/auth/register `
     -H "Content-Type: application/json" `
     -d '{"name":"Test User","email":"test@example.com","password":"password123","role":"player"}'

   # Login
   curl -X POST http://localhost:5000/api/auth/login `
     -H "Content-Type: application/json" `
     -d '{"email":"test@example.com","password":"password123"}'

   # Get current user (replace <TOKEN> with actual token from login)
   curl http://localhost:5000/api/auth/me `
     -H "Authorization: Bearer <TOKEN>"
   ```

### Phase 3 Testing (Competition Management)

1. **Login as Organizer:**
   - Navigate to `http://localhost:5173/login`
   - Login with an organizer account
   - You'll be redirected to `/organizer-dashboard`

2. **Create Competition:**
   - Click "Create Competition" button
   - Fill in all required fields:
     - Title: "BGMI Championship 2025"
     - Description: Competition details
     - Game Type: Select from dropdown (BGMI, Free Fire, etc.)
     - Entry Fee: 50
     - Start Time: Future date and time
     - End Time: After start time
     - Max Players: 100
     - Prize Pool: 5000 (optional)
     - Rules: Competition rules (optional)
     - College Restricted: Toggle if needed
   - Submit form
   - Competition appears in the dashboard
   - Statistics cards update automatically

3. **Manage Competitions:**
   - View all your competitions in the grid
   - See competition status (Upcoming/Ongoing/Completed)
   - Check participant count
   - Delete competitions (if no participants registered)

4. **API Testing:**
   ```powershell
   # Create competition (replace <TOKEN> with organizer token)
   curl -X POST http://localhost:5000/api/competitions/create `
     -H "Content-Type: application/json" `
     -H "Authorization: Bearer <TOKEN>" `
     -d '{
       "title": "Test Championship",
       "description": "This is a test competition",
       "gameType": "BGMI",
       "entryFee": 50,
       "startTime": "2025-12-01T10:00:00",
       "endTime": "2025-12-01T18:00:00",
       "maxPlayers": 50
     }'

   # Get my competitions
   curl http://localhost:5000/api/competitions/my/list `
     -H "Authorization: Bearer <TOKEN>"

   # Browse all competitions (public)
   curl http://localhost:5000/api/competitions

   # Get specific competition (public)
   curl http://localhost:5000/api/competitions/<COMPETITION_ID>

   # Delete competition
   curl -X DELETE http://localhost:5000/api/competitions/<COMPETITION_ID> `
     -H "Authorization: Bearer <TOKEN>"
   ```

---

## 📜 Available Scripts

### Backend Scripts
```powershell
npm start     # Start production server
npm run dev   # Start development server with nodemon (auto-reload)
```

### Frontend Scripts
```powershell
npm run dev      # Start Vite development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

---

## 🔧 Environment Variables

### Backend (.env)
Create a `.env` file in the `backend/` folder:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/winzone
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your_jwt_secret_here_change_in_production
JWT_EXPIRE=7d
```

**Important:** Never commit `.env` file to version control!

---

## 🎯 API Endpoints

### Phase 1 Endpoints
| Method | Endpoint       | Description                    | Access |
|--------|----------------|--------------------------------|--------|
| GET    | `/`            | Welcome message                | Public |
| GET    | `/api/health`  | Backend health check           | Public |

### Phase 2 Endpoints (Authentication)
| Method | Endpoint            | Description                    | Access    | Headers Required |
|--------|---------------------|--------------------------------|-----------|------------------|
| POST   | `/api/auth/register`| Register new user              | Public    | Content-Type     |
| POST   | `/api/auth/login`   | Login user                     | Public    | Content-Type     |
| GET    | `/api/auth/me`      | Get current user profile       | Private   | Authorization    |

### Phase 3 Endpoints (Competition Management)
| Method | Endpoint                    | Description                    | Access          | Headers Required       |
|--------|-----------------------------|--------------------------------|-----------------|------------------------|
| POST   | `/api/competitions/create`  | Create new competition         | Organizer/Admin | Authorization, Content |
| GET    | `/api/competitions/my/list` | Get my competitions            | Organizer/Admin | Authorization          |
| GET    | `/api/competitions/:id`     | Get competition details        | Public          | None                   |
| PUT    | `/api/competitions/:id`     | Update competition             | Owner only      | Authorization, Content |
| DELETE | `/api/competitions/:id`     | Delete competition             | Owner only      | Authorization          |
| GET    | `/api/competitions`         | Browse all competitions        | Public          | None (query filters)   |

**Request Examples:**

**Register:**
```json
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "player",
  "collegeName": "ABC University"
}
```

**Login:**
```json
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Get Current User:**
```
GET /api/auth/me
Headers: Authorization: Bearer <your_jwt_token>
```

---

## 🔐 Security Features
- ✅ CORS configured for frontend origin
- ✅ Environment variables for sensitive data
- ✅ JWT-based authentication with secure tokens
- ✅ Password hashing with bcrypt (10 salt rounds)
- ✅ Protected routes with middleware
- ✅ Role-based authorization (player, organizer, admin)
- ✅ Error handling middleware
- ✅ Unhandled rejection/exception handlers
- ✅ Process exit on critical errors
- ✅ Token validation and expiration
- ✅ Secure password storage (never stored in plain text)

---

## 🗂️ Code Guidelines Followed

1. ✅ **ES Modules:** Using `import/export` syntax throughout
2. ✅ **Async/Await:** All async operations use async/await with try-catch
3. ✅ **Error Handling:** Proper error messages and status codes
4. ✅ **Comments:** Meaningful JSDoc comments for functions
5. ✅ **No Placeholders:** All functions are fully implemented
6. ✅ **Environment Variables:** No hardcoded secrets
7. ✅ **Clean Structure:** Separation of concerns (controllers, models, routes, middleware)
8. ✅ **Modular Code:** Reusable utilities and components

---

## 🎯 Phase 3: Organizer Dashboard & Competition Management (COMPLETED)

### ✅ Backend Competition Features
- ✅ **Competition Model** with comprehensive schema:
  - Fields: title, description, gameType, entryFee, startTime, endTime, organizerId, maxPlayers, participants, status, isCollegeRestricted, prizePool, rules
  - Virtual fields: participantCount, availableSlots
  - Methods: isFull(), hasParticipant()
  - Auto status update based on time
- ✅ **Competition Controllers**:
  - `createCompetition` - Create new competition with validation
  - `getMyCompetitions` - Fetch organizer's competitions
  - `getCompetitionById` - Get single competition details
  - `updateCompetition` - Update competition (organizer only)
  - `deleteCompetition` - Delete competition with participant check
  - `getAllCompetitions` - Browse all competitions (public)
- ✅ **Competition Routes**:
  - `POST /api/competitions/create` - Create competition (organizer/admin)
  - `GET /api/competitions/my/list` - Get my competitions (organizer/admin)
  - `GET /api/competitions/:id` - Get competition details (public)
  - `PUT /api/competitions/:id` - Update competition (owner only)
  - `DELETE /api/competitions/:id` - Delete competition (owner only)
  - `GET /api/competitions` - Browse all competitions (public)
- ✅ **Role-based Protection**: authMiddleware + roleMiddleware for organizer routes

### ✅ Frontend Organizer Features
- ✅ **OrganizerDashboard.jsx** - Full-featured competition management:
  - Dashboard statistics (total, upcoming, ongoing, participants)
  - Competition grid with cards
  - Status-based color coding
  - Delete functionality with confirmation
  - Loading and empty states
  - Toast notifications
  - Responsive Tailwind design
- ✅ **CreateCompetitionForm.jsx** - Modal form for competitions:
  - All required fields (title, description, gameType, fees, dates, players)
  - Optional fields (prizePool, rules)
  - College restriction toggle
  - Form validation
  - Success/error handling
  - Beautiful modal UI
- ✅ **Routing Integration**: Organizer dashboard connected to `/organizer-dashboard`

### 🎮 Game Types Supported
- BGMI, Free Fire, Call of Duty Mobile, Valorant, Chess, Ludo, Carrom, Cricket, Football

### 📊 Competition Status Flow
- **Upcoming** → **Ongoing** → **Completed** / **Cancelled**

### 🔐 Authorization Logic
- Only organizers and admins can create competitions
- Only competition owner can update/delete their competitions
- Cannot delete competitions with registered participants
- Cannot update ongoing or completed competitions

**📖 Full Phase 3 Documentation:** See `PHASE3_COMPLETE.md` for detailed API documentation, request/response examples, and feature walkthrough.

---

## 📈 Next Steps - Phase 4: Player Features & Tournament Participation

### Upcoming Features
1. **Player Browsing**
   - Browse all available competitions
   - Filter by game type, status, date
   - Search competitions
   - View competition details

2. **Player Registration**
   - Register for competitions
   - Entry fee payment (wallet integration)
   - View registered competitions
   - Unregister (with refund logic)

3. **Wallet System**
   - Deposit and withdrawal
   - Transaction history
   - Payment gateway integration
   - Wallet balance management

4. **Tournament Brackets**
   - Automated bracket generation
   - Match scheduling
   - Score updates
   - Winner determination

5. **Real-time Features**
   - Live competition updates
   - Match notifications
   - WebSocket integration
   - Real-time participant count

---

## 🤝 Development Workflow

### Starting Development
```powershell
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Before Committing
```powershell
# Frontend linting
cd frontend
npm run lint

# Test both servers are running
# Backend: http://localhost:5000/api/health
# Frontend: http://localhost:5173
```

---

## 🐛 Troubleshooting

### Backend won't start
- ✅ Check MongoDB is running (local) or connection string is correct (Atlas)
- ✅ Verify `.env` file exists in `backend/` folder
- ✅ Run `npm install` again
- ✅ Check port 5000 is not in use

### Frontend won't start
- ✅ Run `npm install` in frontend folder
- ✅ Check port 5173 is not in use
- ✅ Verify backend is running first

### Health check fails
- ✅ Ensure backend server is running
- ✅ Check Vite proxy configuration in `vite.config.js`
- ✅ Verify CORS settings in `backend/src/app.js`
- ✅ Check browser console for errors

### Authentication issues
- ✅ Verify MongoDB is running and user collection is created
- ✅ Check JWT_SECRET is set in `.env` file
- ✅ Clear browser localStorage and try again
- ✅ Check browser console for token errors
- ✅ Verify API calls include proper headers

---

## 📝 Notes

- The Tailwind `@tailwind` directives warning in `index.css` is expected and will be processed correctly by PostCSS during build.
- MongoDB must be running before starting the backend server.
- Both servers must be running for full-stack functionality.
- Use MongoDB Compass or Atlas UI to verify database connection and data.
- **Phase 2**: User passwords are securely hashed and never stored in plain text.
- JWT tokens are stored in browser localStorage and included in Authorization headers.
- Role-based routing automatically directs users to their appropriate dashboard.

---

## 🎓 Learning Resources

### Backend (Node.js + Express + MongoDB)
- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [JWT Authentication Guide](https://jwt.io/introduction)
- [Bcrypt.js Documentation](https://www.npmjs.com/package/bcryptjs)

### Frontend (React + Vite + Tailwind)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [React Router Documentation](https://reactrouter.com/)

---

## 📄 License

ISC

---

**Built with ❤️ using MERN Stack**
