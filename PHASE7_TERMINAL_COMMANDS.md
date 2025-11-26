# Phase 7 - Terminal Commands Reference 🚀

## 📦 Installation

### Install Stripe Package
```powershell
cd backend
npm install stripe
```

### Verify Installation
```powershell
npm list stripe
# Should show: stripe@X.X.X
```

---

## 🔧 Server Management

### Start Development Server
```powershell
cd backend
npm run dev
```

### Start Production Server
```powershell
cd backend
npm start
```

### Check Server Status
```powershell
curl http://localhost:5000/api/health
```

---

## 🧪 Testing Commands (PowerShell)

### Setup Test Users

#### Register Player
```powershell
$playerReg = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"name":"Test Player","email":"player@test.com","password":"password123","role":"player"}'

$playerToken = $playerReg.data.token
echo "Player Token: $playerToken"
```

#### Register Admin
```powershell
$adminReg = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"name":"Admin User","email":"admin@test.com","password":"password123","role":"admin"}'

$adminToken = $adminReg.data.token
echo "Admin Token: $adminToken"
```

#### Login Existing User
```powershell
$login = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"player@test.com","password":"password123"}'

$playerToken = $login.data.token
```

---

### Wallet Operations

#### Get Wallet Balance
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/wallet" `
  -Method GET `
  -Headers @{Authorization="Bearer $playerToken"}
```

#### Create Top-Up Session
```powershell
$topup = Invoke-RestMethod -Uri "http://localhost:5000/api/wallet/topup" `
  -Method POST `
  -ContentType "application/json" `
  -Headers @{Authorization="Bearer $playerToken"} `
  -Body '{"amount":1000,"currency":"INR"}'

$sessionId = $topup.data.sessionId
echo "Session ID: $sessionId"
echo "Checkout URL: $($topup.data.checkoutUrl)"
```

#### Verify Top-Up
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/wallet/topup/verify" `
  -Method POST `
  -ContentType "application/json" `
  -Headers @{Authorization="Bearer $playerToken"} `
  -Body "{`"sessionId`":`"$sessionId`"}"
```

#### Get Transaction History
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/wallet/transactions?page=1&limit=20" `
  -Method GET `
  -Headers @{Authorization="Bearer $playerToken"}
```

#### Filter Transactions by Type
```powershell
# Rewards only
Invoke-RestMethod -Uri "http://localhost:5000/api/wallet/transactions?type=reward" `
  -Method GET `
  -Headers @{Authorization="Bearer $playerToken"}

# Top-ups only
Invoke-RestMethod -Uri "http://localhost:5000/api/wallet/transactions?type=topup" `
  -Method GET `
  -Headers @{Authorization="Bearer $playerToken"}
```

---

### Payout Operations

#### Create Payout Request (UPI)
```powershell
$payout = Invoke-RestMethod -Uri "http://localhost:5000/api/wallet/payout-request" `
  -Method POST `
  -ContentType "application/json" `
  -Headers @{Authorization="Bearer $playerToken"} `
  -Body '{
    "amount":500,
    "method":{
      "type":"upi",
      "details":{
        "upiId":"player@paytm",
        "name":"Test Player"
      }
    }
  }'

$payoutId = $payout.data._id
echo "Payout ID: $payoutId"
```

#### Create Payout Request (Bank)
```powershell
$payout = Invoke-RestMethod -Uri "http://localhost:5000/api/wallet/payout-request" `
  -Method POST `
  -ContentType "application/json" `
  -Headers @{Authorization="Bearer $playerToken"} `
  -Body '{
    "amount":1000,
    "method":{
      "type":"bank",
      "details":{
        "accountNumber":"1234567890",
        "ifsc":"SBIN0001234",
        "accountHolderName":"Test Player",
        "bankName":"State Bank of India"
      }
    }
  }'

$payoutId = $payout.data._id
```

#### Get My Payout Requests
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/wallet/payout-requests" `
  -Method GET `
  -Headers @{Authorization="Bearer $playerToken"}
```

---

### Admin Operations

#### List All Payout Requests
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/admin/payouts?page=1&limit=20" `
  -Method GET `
  -Headers @{Authorization="Bearer $adminToken"}
```

#### Filter Payout Requests by Status
```powershell
# Requested only
Invoke-RestMethod -Uri "http://localhost:5000/api/admin/payouts?status=requested" `
  -Method GET `
  -Headers @{Authorization="Bearer $adminToken"}

# Approved only
Invoke-RestMethod -Uri "http://localhost:5000/api/admin/payouts?status=approved" `
  -Method GET `
  -Headers @{Authorization="Bearer $adminToken"}
```

#### Approve Payout
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/admin/payouts/$payoutId/approve" `
  -Method PUT `
  -ContentType "application/json" `
  -Headers @{Authorization="Bearer $adminToken"} `
  -Body '{"note":"Approved for processing"}'
```

#### Reject Payout
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/admin/payouts/$payoutId/reject" `
  -Method PUT `
  -ContentType "application/json" `
  -Headers @{Authorization="Bearer $adminToken"} `
  -Body '{"reason":"Invalid bank details provided"}'
```

#### Get All Transactions (Admin)
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/transactions/admin/all?page=1&limit=50" `
  -Method GET `
  -Headers @{Authorization="Bearer $adminToken"}
```

#### Filter Transactions (Admin)
```powershell
# By type
Invoke-RestMethod -Uri "http://localhost:5000/api/transactions/admin/all?type=reward" `
  -Method GET `
  -Headers @{Authorization="Bearer $adminToken"}

# By status
Invoke-RestMethod -Uri "http://localhost:5000/api/transactions/admin/all?status=completed" `
  -Method GET `
  -Headers @{Authorization="Bearer $adminToken"}

# By user ID
Invoke-RestMethod -Uri "http://localhost:5000/api/transactions/admin/all?userId=USER_ID_HERE" `
  -Method GET `
  -Headers @{Authorization="Bearer $adminToken"}
```

---

### Webhook Simulation

#### Simulate Checkout Completed
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/payments/webhook" `
  -Method POST `
  -ContentType "application/json" `
  -Headers @{"x-webhook-signature"="mock_signature"} `
  -Body '{
    "type":"checkout.session.completed",
    "data":{
      "object":{
        "id":"mock_session_webhook_test",
        "payment_status":"paid",
        "amount_total":100000,
        "currency":"inr",
        "client_reference_id":"REPLACE_WITH_ACTUAL_USER_ID"
      }
    }
  }'
```

#### Simulate Payment Intent Succeeded
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/payments/webhook" `
  -Method POST `
  -ContentType "application/json" `
  -Headers @{"x-webhook-signature"="mock_signature"} `
  -Body '{
    "type":"payment_intent.succeeded",
    "data":{
      "object":{
        "id":"pi_test_123",
        "status":"succeeded",
        "amount":100000,
        "currency":"inr"
      }
    }
  }'
```

---

## 🎯 Complete Test Flows

### Flow 1: Complete Top-Up Test
```powershell
# Step 1: Check initial balance
$wallet = Invoke-RestMethod -Uri "http://localhost:5000/api/wallet" -Headers @{Authorization="Bearer $playerToken"}
Write-Host "Initial Balance: $($wallet.data.balance)"

# Step 2: Create top-up
$topup = Invoke-RestMethod -Uri "http://localhost:5000/api/wallet/topup" -Method POST -ContentType "application/json" -Headers @{Authorization="Bearer $playerToken"} -Body '{"amount":1000}'
$sessionId = $topup.data.sessionId
Write-Host "Session ID: $sessionId"

# Step 3: Verify top-up
$verify = Invoke-RestMethod -Uri "http://localhost:5000/api/wallet/topup/verify" -Method POST -ContentType "application/json" -Headers @{Authorization="Bearer $playerToken"} -Body "{`"sessionId`":`"$sessionId`"}"
Write-Host "Verification: $($verify.message)"

# Step 4: Check updated balance
$wallet = Invoke-RestMethod -Uri "http://localhost:5000/api/wallet" -Headers @{Authorization="Bearer $playerToken"}
Write-Host "New Balance: $($wallet.data.balance)"
```

### Flow 2: Complete Payout Test
```powershell
# Step 1: Check balance
$wallet = Invoke-RestMethod -Uri "http://localhost:5000/api/wallet" -Headers @{Authorization="Bearer $playerToken"}
Write-Host "Balance: $($wallet.data.balance)"

# Step 2: Create payout request
$payout = Invoke-RestMethod -Uri "http://localhost:5000/api/wallet/payout-request" -Method POST -ContentType "application/json" -Headers @{Authorization="Bearer $playerToken"} -Body '{
  "amount":500,
  "method":{"type":"upi","details":{"upiId":"test@paytm","name":"Test Player"}}
}'
$payoutId = $payout.data._id
Write-Host "Payout ID: $payoutId"

# Step 3: Admin approves
$approve = Invoke-RestMethod -Uri "http://localhost:5000/api/admin/payouts/$payoutId/approve" -Method PUT -ContentType "application/json" -Headers @{Authorization="Bearer $adminToken"} -Body '{"note":"Approved"}'
Write-Host "Payout Status: $($approve.data.status)"

# Step 4: Check balance
$wallet = Invoke-RestMethod -Uri "http://localhost:5000/api/wallet" -Headers @{Authorization="Bearer $playerToken"}
Write-Host "New Balance: $($wallet.data.balance)"
```

### Flow 3: View Transaction History
```powershell
# Get all transactions
$transactions = Invoke-RestMethod -Uri "http://localhost:5000/api/wallet/transactions?page=1&limit=20" -Headers @{Authorization="Bearer $playerToken"}

# Display transactions
$transactions.data.transactions | ForEach-Object {
    Write-Host "Type: $($_.type) | Amount: $($_.amount) | Status: $($_.status) | Date: $($_.createdAt)"
}

Write-Host "`nTotal Transactions: $($transactions.data.pagination.total)"
```

---

## 🔍 Debugging Commands

### Check MongoDB Collections
```powershell
# Using MongoDB shell
mongo winzone

# Check users
db.users.find().pretty()

# Check transactions
db.transactions.find().sort({createdAt: -1}).limit(10).pretty()

# Check payout requests
db.payoutrequests.find().pretty()

# Check wallet balances
db.users.find({}, {name: 1, email: 1, "wallet.balance": 1}).pretty()
```

### View Server Logs
```powershell
# In separate terminal while server is running
# Look for these patterns:
# [WalletController] ...
# [PayoutController] ...
# [RewardService] ...
# [PaymentWebhook] ...
```

### Test Error Scenarios
```powershell
# Test insufficient balance
Invoke-RestMethod -Uri "http://localhost:5000/api/wallet/payout-request" `
  -Method POST `
  -ContentType "application/json" `
  -Headers @{Authorization="Bearer $playerToken"} `
  -Body '{"amount":999999,"method":{"type":"upi","details":{"upiId":"test@paytm","name":"Test"}}}'

# Test minimum amount validation
Invoke-RestMethod -Uri "http://localhost:5000/api/wallet/topup" `
  -Method POST `
  -ContentType "application/json" `
  -Headers @{Authorization="Bearer $playerToken"} `
  -Body '{"amount":50}'

# Test unauthorized access
Invoke-RestMethod -Uri "http://localhost:5000/api/wallet"
```

---

## 📋 Stripe CLI Commands (Production Setup)

### Install Stripe CLI
```powershell
# Download from: https://github.com/stripe/stripe-cli/releases
# Or use: scoop install stripe

# Login
stripe login
```

### Listen to Webhooks Locally
```powershell
stripe listen --forward-to localhost:5000/api/payments/webhook
```

### Trigger Test Events
```powershell
# Trigger checkout.session.completed
stripe trigger checkout.session.completed

# Trigger payment_intent.succeeded
stripe trigger payment_intent.succeeded

# Trigger payout.paid
stripe trigger payout.paid
```

### View Webhook Logs
```powershell
stripe webhooks tail
```

---

## 🎯 Quick Testing Checklist

Run these commands in order to verify everything works:

```powershell
# 1. Start server
cd backend; npm run dev

# 2. Health check
curl http://localhost:5000/api/health

# 3. Register player
$player = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method POST -ContentType "application/json" -Body '{"name":"Test","email":"test@test.com","password":"password123","role":"player"}'
$token = $player.data.token

# 4. Check wallet (should be 0)
Invoke-RestMethod -Uri "http://localhost:5000/api/wallet" -Headers @{Authorization="Bearer $token"}

# 5. Top-up
$topup = Invoke-RestMethod -Uri "http://localhost:5000/api/wallet/topup" -Method POST -ContentType "application/json" -Headers @{Authorization="Bearer $token"} -Body '{"amount":1000}'
Invoke-RestMethod -Uri "http://localhost:5000/api/wallet/topup/verify" -Method POST -ContentType "application/json" -Headers @{Authorization="Bearer $token"} -Body "{`"sessionId`":`"$($topup.data.sessionId)`"}"

# 6. Check wallet (should be 1000)
$wallet = Invoke-RestMethod -Uri "http://localhost:5000/api/wallet" -Headers @{Authorization="Bearer $token"}
Write-Host "Balance: $($wallet.data.balance)"
```

✅ If balance shows 1000, Phase 7 is working correctly!

---

## 📚 Related Documentation

- **Quick Start:** `QUICKSTART_PHASE7.md`
- **Implementation Guide:** `PHASE7_IMPLEMENTATION.md`
- **Testing Checklist:** `PHASE7_TESTING_CHECKLIST.md`
- **Completion Summary:** `PHASE7_COMPLETE.md`
- **Postman Collection:** `postman_collection_phase7.json`

---

**Happy Testing! 🚀**
