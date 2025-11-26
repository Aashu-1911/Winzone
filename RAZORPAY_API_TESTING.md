# Razorpay Payment Integration - API Testing Guide

## Environment Setup

Add the following to your `.env` file (backend):

```env
PAYMENT_PROVIDER=razorpay_test
RAZORPAY_KEY_ID=rzp_test_your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

## API Endpoints

### 1. Register User (Updated)

**POST** `/api/auth/register`

**Required Fields:**
- name
- email
- password
- phone
- collegeName
- gamingHandle

**Request:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "phone": "9876543210",
    "collegeName": "MIT",
    "gamingHandle": "john_gamer"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully. Please verify your email using the link sent (logged to server).",
  "data": {
    "id": "64abc123...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "player",
    "collegeName": "MIT",
    "profileImage": ""
  }
}
```

**Note:** Check server console for email verification link.

---

### 2. Login User

**POST** `/api/auth/login`

**Request:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64abc123...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "player",
    "collegeName": "MIT",
    "profileImage": "",
    "walletBalance": 0
  }
}
```

**Save the token** for subsequent authenticated requests.

---

### 3. Create Payment Order

**POST** `/api/payments/order`

**Headers:**
- Authorization: Bearer <token>

**Request:**
```bash
curl -X POST http://localhost:5000/api/payments/order \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "message": "Order created",
  "data": {
    "orderId": "order_KZ8X...",
    "amount": 1000,
    "currency": "INR",
    "razorpayKeyId": "rzp_test_..."
  }
}
```

**Note:** Amount is 10 INR (1000 paise) - static entry fee.

---

### 4. Verify Payment (After Razorpay Checkout)

**POST** `/api/payments/verify`

**Headers:**
- Authorization: Bearer <token>

**Request:**
```bash
curl -X POST http://localhost:5000/api/payments/verify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "razorpay_order_id": "order_KZ8X...",
    "razorpay_payment_id": "pay_KZ8X...",
    "razorpay_signature": "abc123..."
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Payment verified",
  "data": {
    "gameName": "BGMI",
    "entryCode": "WZ-A3X92D"
  }
}
```

**What happens:**
- `isEligible` = true
- `paymentCompleted` = true
- `gameName` = "BGMI" (static)
- `entryCode` = auto-generated (e.g., WZ-A3X92D)

---

### 5. List Users (Admin Only)

**GET** `/api/admin/users`

**Headers:**
- Authorization: Bearer <admin_token>

**Query Parameters:**
- role (optional): player | organizer | admin
- isEligible (optional): true | false
- search (optional): search by name or email

**Request:**
```bash
curl -X GET "http://localhost:5000/api/admin/users?role=player&isEligible=true" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "message": "Users fetched",
  "data": [
    {
      "_id": "64abc123...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "player",
      "phone": "9876543210",
      "gamingHandle": "john_gamer",
      "collegeName": "MIT",
      "emailVerified": false,
      "isApprovedByAdmin": false,
      "isEligible": true,
      "paymentCompleted": true,
      "gameName": "BGMI",
      "entryCode": "WZ-A3X92D",
      "createdAt": "2025-01-01T10:00:00.000Z",
      "updatedAt": "2025-01-01T10:05:00.000Z"
    }
  ]
}
```

---

### 6. Approve User (Admin Only)

**PUT** `/api/admin/users/:id/approve`

**Headers:**
- Authorization: Bearer <admin_token>

**Request:**
```bash
curl -X PUT http://localhost:5000/api/admin/users/64abc123.../approve \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "message": "User approved",
  "data": {
    "id": "64abc123...",
    "isApprovedByAdmin": true
  }
}
```

---

## Testing Flow

### Complete User Journey:

1. **Register** → User creates account
   - Returns user data (no token)
   - Check server console for verification link

2. **Login** → Get JWT token
   - Use token for all authenticated requests

3. **Create Order** → Generate Razorpay order
   - Frontend uses `orderId` and `razorpayKeyId` for Razorpay checkout

4. **Razorpay Checkout** → User pays via Razorpay UI (frontend)
   - On success, Razorpay returns `payment_id`, `order_id`, `signature`

5. **Verify Payment** → Backend validates signature
   - User becomes eligible
   - Receives `gameName` and `entryCode`

6. **Admin Review** → Admin lists users and approves
   - Admin can filter by role, eligibility
   - Approval sets `isApprovedByAdmin = true`

---

## Postman Collection

Import this JSON into Postman for quick testing:

```json
{
  "info": {
    "name": "WinZone Razorpay Payment",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Register User",
          "request": {
            "method": "POST",
            "header": [{"key": "Content-Type", "value": "application/json"}],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"John Doe\",\n  \"email\": \"john@example.com\",\n  \"password\": \"password123\",\n  \"phone\": \"9876543210\",\n  \"collegeName\": \"MIT\",\n  \"gamingHandle\": \"john_gamer\"\n}"
            },
            "url": {"raw": "http://localhost:5000/api/auth/register"}
          }
        },
        {
          "name": "Login User",
          "request": {
            "method": "POST",
            "header": [{"key": "Content-Type", "value": "application/json"}],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"john@example.com\",\n  \"password\": \"password123\"\n}"
            },
            "url": {"raw": "http://localhost:5000/api/auth/login"}
          }
        }
      ]
    },
    {
      "name": "Payment",
      "item": [
        {
          "name": "Create Order",
          "request": {
            "method": "POST",
            "header": [
              {"key": "Authorization", "value": "Bearer {{token}}"}
            ],
            "url": {"raw": "http://localhost:5000/api/payments/order"}
          }
        },
        {
          "name": "Verify Payment",
          "request": {
            "method": "POST",
            "header": [
              {"key": "Content-Type", "value": "application/json"},
              {"key": "Authorization", "value": "Bearer {{token}}"}
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"razorpay_order_id\": \"order_xxx\",\n  \"razorpay_payment_id\": \"pay_xxx\",\n  \"razorpay_signature\": \"signature_xxx\"\n}"
            },
            "url": {"raw": "http://localhost:5000/api/payments/verify"}
          }
        }
      ]
    },
    {
      "name": "Admin",
      "item": [
        {
          "name": "List Users",
          "request": {
            "method": "GET",
            "header": [
              {"key": "Authorization", "value": "Bearer {{admin_token}}"}
            ],
            "url": {"raw": "http://localhost:5000/api/admin/users?role=player"}
          }
        },
        {
          "name": "Approve User",
          "request": {
            "method": "PUT",
            "header": [
              {"key": "Authorization", "value": "Bearer {{admin_token}}"}
            ],
            "url": {"raw": "http://localhost:5000/api/admin/users/{{user_id}}/approve"}
          }
        }
      ]
    }
  ]
}
```

---

## User Schema Fields (Updated)

```javascript
{
  // Basic fields
  name: String (required)
  email: String (required, unique)
  password: String (required, hashed)
  phone: String (NEW - required)
  gamingHandle: String (NEW - required)
  collegeName: String (required)
  role: String (player/organizer/admin)
  
  // Verification & Approval
  emailVerified: Boolean (default: false)
  isApprovedByAdmin: Boolean (default: false)
  isEligible: Boolean (default: false) // Set true after payment
  paymentCompleted: Boolean (default: false)
  
  // Secure Join (set after payment)
  gameName: String (e.g., "BGMI")
  entryCode: String (e.g., "WZ-A3X92D")
  
  // Email verification token
  emailVerificationToken: String
  emailVerificationTokenExpires: Date
}
```

---

## Notes

1. **No wallet, no payout, no transaction history** - Per requirements
2. **Static entry fee**: 10 INR (1000 paise)
3. **Entry code format**: WZ-XXXXXX (6 random alphanumeric uppercase)
4. **Game name**: Static "BGMI" (can be made dynamic later)
5. **Email verification**: Token logged to console (no actual email sent)
6. **Admin approval**: Separate from payment eligibility
7. **Response format**: All endpoints return `{success, message, data}`
