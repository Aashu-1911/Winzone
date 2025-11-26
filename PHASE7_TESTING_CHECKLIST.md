# Phase 7 Testing Checklist ✅

## 🎯 Overview

This checklist ensures all Phase 7 features (Wallet & Payout) are working correctly.

---

## ✅ Pre-Testing Setup

### 1. Server Running
```powershell
cd backend
npm run dev
```
- [ ] Server starts on port 5000
- [ ] MongoDB connected
- [ ] No startup errors

### 2. Environment Variables
Check `.env` file:
- [ ] `PAYMENT_PROVIDER=mock`
- [ ] `JWT_SECRET` is set
- [ ] `MONGO_URI` is correct

### 3. Test Users Created
- [ ] Player account exists
- [ ] Admin account exists
- [ ] Both can login successfully

---

## 🧪 Test Scenarios

### Scenario 1: Wallet Top-Up Flow ✅

**Objective:** Test complete top-up cycle from session creation to wallet credit

| Step | Action | Expected Result | Status |
|------|--------|----------------|--------|
| 1 | Get initial wallet balance | Returns balance: 0, currency: INR | ☐ |
| 2 | Create top-up session (₹1000) | Returns sessionId and checkoutUrl | ☐ |
| 3 | Verify top-up with sessionId | Wallet credited ₹1000 | ☐ |
| 4 | Check updated balance | Balance shows ₹1000 | ☐ |
| 5 | Verify transaction created | Transaction type: topup, amount: 1000 | ☐ |
| 6 | Try duplicate verification | Returns "already processed" | ☐ |

**PowerShell Commands:**
```powershell
# Step 1
$wallet = Invoke-RestMethod -Uri "http://localhost:5000/api/wallet" -Headers @{Authorization="Bearer $token"}
$wallet.data.balance

# Step 2
$topup = Invoke-RestMethod -Uri "http://localhost:5000/api/wallet/topup" -Method POST -ContentType "application/json" -Headers @{Authorization="Bearer $token"} -Body '{"amount":1000}'
$sessionId = $topup.data.sessionId

# Step 3
$verify = Invoke-RestMethod -Uri "http://localhost:5000/api/wallet/topup/verify" -Method POST -ContentType "application/json" -Headers @{Authorization="Bearer $token"} -Body "{\"sessionId\":\"$sessionId\"}"

# Step 4
$wallet = Invoke-RestMethod -Uri "http://localhost:5000/api/wallet" -Headers @{Authorization="Bearer $token"}
$wallet.data.balance  # Should be 1000
```

---

### Scenario 2: Payout Request Flow ✅

**Objective:** Test payout creation, admin approval, and wallet deduction

| Step | Action | Expected Result | Status |
|------|--------|----------------|--------|
| 1 | Check wallet has sufficient balance | Balance ≥ ₹500 | ☐ |
| 2 | Create payout request (₹500, UPI) | Request created with status: requested | ☐ |
| 3 | Try duplicate payout | Error: "pending payout exists" | ☐ |
| 4 | Admin: List pending payouts | Shows payout request | ☐ |
| 5 | Admin: Approve payout | Status: paid, provider payout created | ☐ |
| 6 | Check player wallet | Balance reduced by ₹500 | ☐ |
| 7 | Verify transaction created | Type: payout, amount: 500, status: completed | ☐ |

**PowerShell Commands:**
```powershell
# Step 2
$payout = Invoke-RestMethod -Uri "http://localhost:5000/api/wallet/payout-request" -Method POST -ContentType "application/json" -Headers @{Authorization="Bearer $playerToken"} -Body '{
  "amount":500,
  "method":{"type":"upi","details":{"upiId":"test@paytm","name":"Test Player"}}
}'
$payoutId = $payout.data._id

# Step 4
$payouts = Invoke-RestMethod -Uri "http://localhost:5000/api/admin/payouts?status=requested" -Headers @{Authorization="Bearer $adminToken"}

# Step 5
$approve = Invoke-RestMethod -Uri "http://localhost:5000/api/admin/payouts/$payoutId/approve" -Method PUT -ContentType "application/json" -Headers @{Authorization="Bearer $adminToken"} -Body '{"note":"Approved"}'
```

---

### Scenario 3: Match Reward Distribution ✅

**Objective:** Verify automatic reward distribution after match completion

**Prerequisites:**
- Competition created with prizePool = ₹1000
- Match created with 3 players
- Match started and scores updated

| Step | Action | Expected Result | Status |
|------|--------|----------------|--------|
| 1 | End match (as organizer) | Match status: completed | ☐ |
| 2 | Check response | rewardDistribution object present | ☐ |
| 3 | Verify winner's wallet | Balance increased by prize amount | ☐ |
| 4 | Check winner's transactions | Transaction type: reward, source: match:matchId | ☐ |
| 5 | Try ending match again | Rewards already distributed (idempotent) | ☐ |
| 6 | Verify match metadata | rewardsDistributed: true | ☐ |

**PowerShell Commands:**
```powershell
# Step 1
$endMatch = Invoke-RestMethod -Uri "http://localhost:5000/api/matches/$matchId/end" -Method POST -Headers @{Authorization="Bearer $organizerToken"}

# Check reward distribution
$endMatch.rewardDistribution

# Step 3
$winnerWallet = Invoke-RestMethod -Uri "http://localhost:5000/api/wallet" -Headers @{Authorization="Bearer $winnerToken"}
```

---

### Scenario 4: Transaction History ✅

**Objective:** Verify transaction listing and filtering

| Step | Action | Expected Result | Status |
|------|--------|----------------|--------|
| 1 | Get all transactions (player) | Shows user's transactions only | ☐ |
| 2 | Filter by type: reward | Only reward transactions shown | ☐ |
| 3 | Filter by type: topup | Only topup transactions shown | ☐ |
| 4 | Test pagination | Page 1 shows first 20 items | ☐ |
| 5 | Admin: Get all transactions | Shows all users' transactions | ☐ |
| 6 | Admin: Filter by userId | Shows specific user's transactions | ☐ |

**PowerShell Commands:**
```powershell
# Player transactions
Invoke-RestMethod -Uri "http://localhost:5000/api/wallet/transactions?page=1&limit=20" -Headers @{Authorization="Bearer $playerToken"}

# Filtered
Invoke-RestMethod -Uri "http://localhost:5000/api/wallet/transactions?type=reward" -Headers @{Authorization="Bearer $playerToken"}

# Admin all transactions
Invoke-RestMethod -Uri "http://localhost:5000/api/transactions/admin/all?page=1&limit=50" -Headers @{Authorization="Bearer $adminToken"}
```

---

### Scenario 5: Webhook Processing ✅

**Objective:** Test webhook event handling

| Step | Action | Expected Result | Status |
|------|--------|----------------|--------|
| 1 | Send checkout.session.completed | Wallet credited automatically | ☐ |
| 2 | Check user's wallet | Balance increased | ☐ |
| 3 | Send duplicate webhook | Idempotent (no duplicate credit) | ☐ |
| 4 | Send invalid signature (if Stripe) | 400 error | ☐ |
| 5 | Send payment_intent.succeeded | Transaction updated | ☐ |

**PowerShell Commands:**
```powershell
# Simulate checkout webhook
Invoke-RestMethod -Uri "http://localhost:5000/api/payments/webhook" -Method POST -ContentType "application/json" -Headers @{"x-webhook-signature"="mock_signature"} -Body '{
  "type":"checkout.session.completed",
  "data":{
    "object":{
      "id":"mock_session_webhook",
      "payment_status":"paid",
      "amount_total":50000,
      "currency":"inr",
      "client_reference_id":"USER_ID_HERE"
    }
  }
}'
```

---

### Scenario 6: Error Handling ✅

**Objective:** Verify proper error responses

| Test Case | Expected Behavior | Status |
|-----------|-------------------|--------|
| Top-up with amount < ₹100 | 400: Minimum amount error | ☐ |
| Top-up with amount > ₹100,000 | 400: Maximum amount error | ☐ |
| Payout with insufficient balance | 400: Insufficient balance error | ☐ |
| Payout with pending request | 400: Pending payout exists error | ☐ |
| Wallet access without auth | 401: Unauthorized | ☐ |
| Admin route with player token | 403: Forbidden | ☐ |
| Approve non-existent payout | 404: Not found | ☐ |
| Reject without reason | 400: Reason required | ☐ |

**PowerShell Commands:**
```powershell
# Test insufficient balance
Invoke-RestMethod -Uri "http://localhost:5000/api/wallet/payout-request" -Method POST -ContentType "application/json" -Headers @{Authorization="Bearer $playerToken"} -Body '{
  "amount":999999,
  "method":{"type":"upi","details":{"upiId":"test@paytm","name":"Test"}}
}'
# Expected: 400 error
```

---

### Scenario 7: Admin Payout Rejection ✅

**Objective:** Test payout rejection workflow

| Step | Action | Expected Result | Status |
|------|--------|----------------|--------|
| 1 | Create payout request | Status: requested | ☐ |
| 2 | Admin: Reject with reason | Status: rejected | ☐ |
| 3 | Verify wallet unchanged | Balance same as before | ☐ |
| 4 | Check payout request details | adminNote contains reason | ☐ |
| 5 | Try approving rejected payout | Error: Already rejected | ☐ |

**PowerShell Commands:**
```powershell
# Reject payout
Invoke-RestMethod -Uri "http://localhost:5000/api/admin/payouts/$payoutId/reject" -Method PUT -ContentType "application/json" -Headers @{Authorization="Bearer $adminToken"} -Body '{
  "reason":"Invalid bank details"
}'
```

---

### Scenario 8: Idempotency Testing ✅

**Objective:** Verify idempotency mechanisms

| Test Case | Expected Behavior | Status |
|-----------|-------------------|--------|
| Verify same top-up session twice | 2nd call returns "already processed" | ☐ |
| Distribute rewards for same match twice | 2nd call skipped, no double-pay | ☐ |
| Approve same payout twice | 2nd call error: already approved | ☐ |
| Webhook with same event ID twice | Only processed once | ☐ |

---

## 📊 Summary Report Template

After completing all tests, fill in this summary:

### Test Results Summary

| Category | Total Tests | Passed | Failed | Pass Rate |
|----------|-------------|--------|--------|-----------|
| Wallet Top-Up | 6 | ___ | ___ | ___% |
| Payout Request | 7 | ___ | ___ | ___% |
| Match Rewards | 6 | ___ | ___ | ___% |
| Transactions | 6 | ___ | ___ | ___% |
| Webhooks | 5 | ___ | ___ | ___% |
| Error Handling | 8 | ___ | ___ | ___% |
| Admin Rejection | 5 | ___ | ___ | ___% |
| Idempotency | 4 | ___ | ___ | ___% |
| **TOTAL** | **47** | **___** | **___** | **___%** |

### Issues Found
1. _______________________________________
2. _______________________________________
3. _______________________________________

### Notes
- _______________________________________
- _______________________________________

---

## 🔧 Debugging Tips

### Check Server Logs
```powershell
# Look for these log patterns:
# [WalletController] ...
# [PayoutController] ...
# [RewardService] ...
# [PaymentWebhook] ...
```

### Query Database Directly
```javascript
// MongoDB shell
use winzone

// Check transactions
db.transactions.find({userId: ObjectId("USER_ID")}).sort({createdAt: -1})

// Check payout requests
db.payoutrequests.find({status: "requested"})

// Check user wallet
db.users.findOne({email: "player@test.com"}, {wallet: 1, stats: 1})
```

### Common Issues

**Issue: Wallet not credited after verification**
- Check: Transaction created with correct idempotencyKey
- Check: User balance updated
- Look for: MongoDB transaction rollback errors

**Issue: Payout not processed**
- Check: User has sufficient balance
- Check: No pending payout requests
- Look for: Payment provider errors

**Issue: Rewards not distributed**
- Check: Match status is "completed"
- Check: Competition has prizePool > 0
- Check: match.metadata.rewardsDistributed
- Look for: RewardService errors in logs

---

## ✅ Sign-Off

**Tester Name:** _______________________  
**Date:** _______________________  
**Overall Status:** [ ] PASS [ ] FAIL  
**Ready for Production:** [ ] YES [ ] NO  

**Comments:**
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
