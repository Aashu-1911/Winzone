# 🔌 WinZone API - Quick Reference (Phase 2)

## Base URL
```
http://localhost:5000
```

---

## 🌐 Public Endpoints (No Authentication Required)

### 1. Welcome Message
```http
GET /
```

**Response:**
```json
{
  "message": "Welcome to WinZone API"
}
```

---

### 2. Health Check
```http
GET /api/health
```

**Response:**
```json
{
  "status": "WinZone backend running successfully",
  "timestamp": "2025-10-30T12:00:00.000Z"
}
```

---

### 3. User Registration
```http
POST /api/auth/register
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "player",
  "collegeName": "Test University"
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
    "collegeName": "Test University",
    "profileImage": "",
    "walletBalance": 0
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "User with this email already exists"
}
```

---

### 4. User Login
```http
POST /api/auth/login
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "6721a3f4b5c9d8e7f6a5b4c3",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "player",
    "collegeName": "Test University",
    "profileImage": "",
    "walletBalance": 0
  }
}
```

**Error Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

## 🔒 Protected Endpoints (Authentication Required)

### 5. Get Current User
```http
GET /api/auth/me
Authorization: Bearer <your_jwt_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": "6721a3f4b5c9d8e7f6a5b4c3",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "player",
    "collegeName": "Test University",
    "profileImage": "",
    "walletBalance": 0,
    "createdAt": "2025-10-30T12:00:00.000Z",
    "updatedAt": "2025-10-30T12:00:00.000Z"
  }
}
```

**Error Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "No token provided. Authorization denied."
}
```

---

## 📝 PowerShell cURL Examples

### Register User
```powershell
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

### Login User
```powershell
curl -X POST http://localhost:5000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{
    "email": "player@test.com",
    "password": "password123"
  }'
```

### Get Current User (replace <TOKEN> with your actual token)
```powershell
curl http://localhost:5000/api/auth/me `
  -H "Authorization: Bearer <TOKEN>"
```

---

## 🧪 Postman Collection Setup

### Environment Variables
Create a Postman environment with:
- `baseUrl`: `http://localhost:5000`
- `token`: (will be set automatically after login)

### Collection Structure
```
WinZone API
├── Health
│   └── GET Health Check
├── Auth
│   ├── POST Register User
│   ├── POST Login User
│   └── GET Current User (Auth Required)
```

### Auto-set Token Script (for Login request)
Add this to the "Tests" tab of your Login request:
```javascript
if (pm.response.code === 200) {
    const responseJson = pm.response.json();
    pm.environment.set("token", responseJson.token);
}
```

Then in protected requests, use:
```
Authorization: Bearer {{token}}
```

---

## 🎯 User Roles

| Role      | Description                        | Dashboard Route           |
|-----------|------------------------------------|---------------------------|
| player    | Can join and play in tournaments   | /player-dashboard         |
| organizer | Can create and manage tournaments  | /organizer-dashboard      |
| admin     | Full system access                 | /admin-dashboard          |

---

## ⚠️ Common Error Codes

| Status Code | Meaning                          | Common Cause                        |
|-------------|----------------------------------|-------------------------------------|
| 200         | OK                               | Successful request                  |
| 201         | Created                          | User registered successfully        |
| 400         | Bad Request                      | Missing or invalid data             |
| 401         | Unauthorized                     | Invalid or missing token            |
| 403         | Forbidden                        | Insufficient permissions            |
| 404         | Not Found                        | Route or resource doesn't exist     |
| 500         | Internal Server Error            | Server-side error                   |

---

## 🔐 JWT Token Format

### Header
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Expiration
- Default: 7 days
- Configurable via `JWT_EXPIRE` in `.env`

### Token Payload
```json
{
  "id": "6721a3f4b5c9d8e7f6a5b4c3",
  "iat": 1698765432,
  "exp": 1699370232
}
```

---

## 🚀 Quick Test Script

Save this as `test-api.ps1`:

```powershell
# Test WinZone API
$baseUrl = "http://localhost:5000"

# Test Health
Write-Host "Testing Health Endpoint..." -ForegroundColor Green
curl "$baseUrl/api/health"

# Register User
Write-Host "`nRegistering User..." -ForegroundColor Green
$registerResponse = curl -X POST "$baseUrl/api/auth/register" `
  -H "Content-Type: application/json" `
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "player"
  }'

# Login User
Write-Host "`nLogging In..." -ForegroundColor Green
$loginResponse = curl -X POST "$baseUrl/api/auth/login" `
  -H "Content-Type: application/json" `
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

Write-Host "`nAll tests completed!" -ForegroundColor Cyan
```

Run with: `.\test-api.ps1`

---

## 📚 Additional Resources

- **Postman Workspace**: Import the collection from PROJECT_STRUCTURE.md
- **API Documentation**: See README.md for detailed endpoint info
- **Frontend Integration**: Check AuthContext.jsx for implementation examples

---

**Phase 2 API Complete! ✅**
