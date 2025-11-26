# Dummy Payment System with OTP Verification - API Guide

## Overview

This system uses:
- **OTP verification** for user registration (6-digit code, 10-minute expiry)
- **Dummy payment system** (no real payment gateway - auto-succeeds)
- **In-game player ID** required during registration

## User Registration Flow

### 1. Register User

**POST** `/api/auth/register`

**Required Fields:**
- name
- email
- password
- phone
- collegeName
- gamingHandle
- inGamePlayerID (NEW - player's in-game ID)

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
    "gamingHandle": "john_gamer",
    "inGamePlayerID": "BGMI_123456"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully. OTP sent for verification (check server console).",
  "data": {
    "id": "64abc123...",
    "email": "john@example.com",
    "message": "Please verify OTP to complete registration"
  }
}
```

**Note:** Check server console for the 6-digit OTP.

---

### 2. Verify OTP

**POST** `/api/auth/verify-otp`

**Request:**
```bash
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "otp": "123456"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "OTP verified successfully. You can now login.",
  "data": {
    "id": "64abc123...",
    "email": "john@example.com",
    "emailVerified": true
  }
}
```

---

### 3. Resend OTP (Optional)

**POST** `/api/auth/resend-otp`

**Request:**
```bash
curl -X POST http://localhost:5000/api/auth/resend-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "New OTP sent successfully (check server console).",
  "data": {
    "email": "john@example.com"
  }
}
```

---

### 4. Login

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

---

## Payment Flow

### 5. Process Dummy Payment

**POST** `/api/payments/process`

**Headers:**
- Authorization: Bearer <token>

**Required Fields:**
- cardNumber (dummy - any value)
- cardHolder (dummy - any value)
- expiryDate (dummy - any value)
- cvv (dummy - any value)

**Request:**
```bash
curl -X POST http://localhost:5000/api/payments/process \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "cardNumber": "1234567890123456",
    "cardHolder": "John Doe",
    "expiryDate": "12/25",
    "cvv": "123"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Payment processed successfully",
  "data": {
    "gameName": "BGMI",
    "entryCode": "WZ-A3X92D",
    "amount": "10 INR",
    "transactionId": "TXN_1638123456789"
  }
}
```

**What happens:**
- Payment auto-succeeds (no real gateway)
- User's `isEligible` set to `true`
- User's `paymentCompleted` set to `true`
- `gameName` assigned as "BGMI"
- `entryCode` auto-generated (e.g., WZ-A3X92D)

---

## Admin Endpoints

### List Users

**GET** `/api/admin/users?role=player&isEligible=true`

**Headers:**
- Authorization: Bearer <admin_token>

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
      "inGamePlayerID": "BGMI_123456",
      "collegeName": "MIT",
      "emailVerified": true,
      "isApprovedByAdmin": false,
      "isEligible": true,
      "paymentCompleted": true,
      "gameName": "BGMI",
      "entryCode": "WZ-A3X92D"
    }
  ]
}
```

---

### Approve User

**PUT** `/api/admin/users/:id/approve`

**Headers:**
- Authorization: Bearer <admin_token>

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

## Complete User Journey Example

### Step 1: Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Smith",
    "email": "alice@example.com",
    "password": "alice123",
    "phone": "9988776655",
    "collegeName": "Stanford",
    "gamingHandle": "alice_pro",
    "inGamePlayerID": "BGMI_ALICE99"
  }'
```
**Console Output:** `[Auth] OTP for alice@example.com: 567890 (expires in 10 minutes)`

### Step 2: Verify OTP
```bash
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "otp": "567890"
  }'
```

### Step 3: Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "alice123"
  }'
```
**Save the token from response**

### Step 4: Make Dummy Payment
```bash
curl -X POST http://localhost:5000/api/payments/process \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "cardNumber": "4111111111111111",
    "cardHolder": "Alice Smith",
    "expiryDate": "12/26",
    "cvv": "456"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Payment processed successfully",
  "data": {
    "gameName": "BGMI",
    "entryCode": "WZ-K9L2M4",
    "amount": "10 INR",
    "transactionId": "TXN_1638123789012"
  }
}
```

---

## Updated User Schema

```javascript
{
  // Basic fields
  name: String (required)
  email: String (required, unique)
  password: String (required, hashed)
  phone: String (required)
  gamingHandle: String (required)
  inGamePlayerID: String (required) // NEW
  collegeName: String (required)
  role: String (player/organizer/admin)
  
  // Verification & Approval
  emailVerified: Boolean (default: false) // Set true after OTP verification
  isApprovedByAdmin: Boolean (default: false)
  isEligible: Boolean (default: false) // Set true after payment
  paymentCompleted: Boolean (default: false) // Set true after payment
  
  // OTP fields (NEW)
  otpCode: String (6-digit code)
  otpExpires: Date (10 minutes from generation)
  
  // Secure Join (set after payment)
  gameName: String (e.g., "BGMI")
  entryCode: String (e.g., "WZ-A3X92D")
}
```

---

## Key Changes from Razorpay System

### What was removed:
- ❌ Razorpay integration (no real payment gateway)
- ❌ Email verification tokens
- ❌ Order creation flow
- ❌ Payment signature verification

### What was added:
- ✅ OTP verification system (6-digit, 10-min expiry)
- ✅ In-game player ID field (required)
- ✅ Dummy payment (auto-succeeds)
- ✅ Resend OTP functionality

### Payment behavior:
- **Before:** Create order → Razorpay checkout → Verify signature → Grant access
- **After:** Provide dummy card details → Auto-success → Grant access immediately

---

## Testing Notes

1. **OTP always logged to console** - Check terminal for OTP codes
2. **Payment always succeeds** - Any card details accepted
3. **Entry code auto-generated** - Format: WZ-XXXXXX (6 random alphanumeric)
4. **Static entry fee** - Always displays "10 INR"
5. **Email verification required** - Must verify OTP before payment

---

## Environment Variables

Update your `.env` file:

```env
# Payment Configuration
PAYMENT_PROVIDER=dummy

# No Razorpay/Stripe keys needed
```

---

## Postman Collection

```json
{
  "info": {
    "name": "WinZone Dummy Payment + OTP",
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
              "raw": "{\n  \"name\": \"Test User\",\n  \"email\": \"test@example.com\",\n  \"password\": \"test123\",\n  \"phone\": \"1234567890\",\n  \"collegeName\": \"Test College\",\n  \"gamingHandle\": \"test_gamer\",\n  \"inGamePlayerID\": \"BGMI_TEST123\"\n}"
            },
            "url": {"raw": "http://localhost:5000/api/auth/register"}
          }
        },
        {
          "name": "Verify OTP",
          "request": {
            "method": "POST",
            "header": [{"key": "Content-Type", "value": "application/json"}],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"test@example.com\",\n  \"otp\": \"123456\"\n}"
            },
            "url": {"raw": "http://localhost:5000/api/auth/verify-otp"}
          }
        },
        {
          "name": "Resend OTP",
          "request": {
            "method": "POST",
            "header": [{"key": "Content-Type", "value": "application/json"}],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"test@example.com\"\n}"
            },
            "url": {"raw": "http://localhost:5000/api/auth/resend-otp"}
          }
        },
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "header": [{"key": "Content-Type", "value": "application/json"}],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"test@example.com\",\n  \"password\": \"test123\"\n}"
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
          "name": "Process Dummy Payment",
          "request": {
            "method": "POST",
            "header": [
              {"key": "Content-Type", "value": "application/json"},
              {"key": "Authorization", "value": "Bearer {{token}}"}
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"cardNumber\": \"1234567890123456\",\n  \"cardHolder\": \"Test User\",\n  \"expiryDate\": \"12/25\",\n  \"cvv\": \"123\"\n}"
            },
            "url": {"raw": "http://localhost:5000/api/payments/process"}
          }
        }
      ]
    }
  ]
}
```
