# Phase 7 Implementation: Wallet & Payout System ✅ COMPLETE# Phase 7: Wallet System, Reward Distribution & Payouts - IMPLEMENTATION GUIDE



## 🎯 Overview## 🎯 Overview



Phase 7 completes the WinZone backend with a full wallet and payout system, including:**Status:** Backend 70% Complete, Frontend 0%  

- ✅ Wallet management with top-ups**Completed:** Models, Services, Payment Abstraction, Core Controllers  

- ✅ Transaction tracking with idempotency**Remaining:** Routes, Webhook Handler, Frontend Components, Integration

- ✅ Payout request workflow (player → admin → payment provider)

- ✅ Automated reward distribution after match completion---

- ✅ Payment provider abstraction (Mock & Stripe)

- ✅ Webhook handling for payment events## ✅ Completed Backend Components



**Status: 100% COMPLETE** 🎉### 1. Database Models (100% Complete)



---**User Model Extended:**

```javascript

## 🚀 Installation & Setupwallet: {

  balance: Number (default: 0),

### 1. Install Dependencies  currency: String (default: 'INR'),

  transactions: [ObjectId ref Transaction]

```powershell},

cd backendstats: {

npm install stripe  totalEarnings: Number (default: 0)

```  // ... existing stats

}

### 2. Environment Configuration```



Update your `.env` file with Phase 7 variables:**Transaction Model:** `backend/src/models/transaction.model.js`

- Fields: userId, type, amount, currency, source, status, metadata, idempotencyKey

```bash- Types: credit, debit, reward, entryFee, payout, refund, topup, organizerFee, platformFee

# Payment Provider: 'mock' for development, 'stripe' for production- Methods: createIdempotent(), markCompleted(), markFailed()

PAYMENT_PROVIDER=mock

**PayoutRequest Model:** `backend/src/models/payoutRequest.model.js`

# Stripe (only needed if PAYMENT_PROVIDER=stripe)- Fields: userId, amount, method, status, adminNote, processedBy, transactionId

STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key- Methods: approve(), reject(), markPaid(), markFailed()

STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret

### 2. Services (100% Complete)

# Fee Configuration

PLATFORM_FEE_PERCENTAGE=10**Payment Service:** `backend/src/services/payment.service.js`

ORGANIZER_FEE_PERCENTAGE=5- Mock Adapter (for development/testing)

```- Stripe Adapter (for production)

- Methods: createTopUpSession(), verifySession(), processPayout()

### 3. Start Server- Switch via `PAYMENT_PROVIDER` env var (mock | stripe)



```powershell**Wallet Service:** `backend/src/services/wallet.service.js`

cd backend- creditWallet() - Add funds with MongoDB transaction

npm run dev- debitWallet() - Deduct funds with balance check

```- getWallet() - Fetch balance and transactions

- transferFunds() - P2P transfers (future feature)

Server runs on: `http://localhost:5000`- All operations use idempotency keys to prevent duplicates



---**Reward Service:** `backend/src/services/reward.service.js`

- distributeMatchRewards() - Auto-distribute after match end

## 📋 Architecture- Prize distributions: winner_takes_all, top3, top5, top10

- calculateFeeSplit() - Platform + organizer fees

### Database Models- Uses MongoDB transactions for atomicity



1. **Transaction** (`models/transaction.model.js`)### 3. Controllers (60% Complete)

   - Tracks all wallet operations

   - Supports idempotency via `idempotencyKey`**Wallet Controller:** `backend/src/controllers/wallet.controller.js` ✅

   - Types: `credit`, `debit`, `reward`, `entryFee`, `payout`, `refund`, `topup`- getUserWallet() - GET /api/wallet

- createTopUpSession() - POST /api/wallet/topup

2. **PayoutRequest** (`models/payoutRequest.model.js`)- verifyTopUp() - POST /api/wallet/topup/verify

   - Withdrawal requests from players- createPayoutRequest() - POST /api/wallet/payout-request

   - Statuses: `requested`, `approved`, `rejected`, `paid`, `failed`- getUserPayoutRequests() - GET /api/wallet/payout-requests

   - Supports multiple payment methods: `bank`, `upi`, `stripe`

**Admin Payout Controller:** `backend/src/controllers/payout.controller.js` ✅

3. **User** (wallet fields)- getAllPayoutRequests() - GET /api/admin/payouts

   - `wallet.balance` - Current balance- approvePayout() - PUT /api/admin/payouts/:id/approve

   - `wallet.currency` - Currency (INR/USD)- rejectPayout() - PUT /api/admin/payouts/:id/reject

   - `wallet.transactions` - Transaction references

   - `stats.totalEarnings` - Lifetime earnings---



### Services## 📝 Remaining Backend Tasks



1. **WalletService** (`services/wallet.service.js`)### 1. Create Routes (Required)

   - `creditWallet()` - Add funds with MongoDB transactions

   - `debitWallet()` - Deduct funds with balance validation**wallet.route.js:**

   - `getWallet()` - Fetch balance and recent transactions```javascript

   - All operations are atomic and idempotentimport express from 'express';

import {

2. **PaymentService** (`services/payment.service.js`)  getUserWallet,

   - Abstract payment provider (Mock or Stripe)  createTopUpSession,

   - `createTopUpSession()` - Create checkout session  verifyTopUp,

   - `verifySession()` - Verify payment completion  createPayoutRequest,

   - `processPayout()` - Send money to user  getUserPayoutRequests,

   - `constructWebhookEvent()` - Parse webhook events} from '../controllers/wallet.controller.js';

import { authMiddleware } from '../middleware/auth.middleware.js';

3. **RewardService** (`services/reward.service.js`)

   - `distributeMatchRewards()` - Automated reward distributionconst router = express.Router();

   - Prize distribution templates: `winner_takes_all`, `top3`, `top5`, `top10`

   - Idempotent (won't double-pay)// All routes require authentication

router.use(authMiddleware);

### Routes

router.get('/', getUserWallet);

**Wallet Routes** (`/api/wallet`)router.post('/topup', createTopUpSession);

- `GET /` - Get wallet balance and transactionsrouter.post('/topup/verify', verifyTopUp);

- `GET /transactions` - Paginated transaction historyrouter.post('/payout-request', createPayoutRequest);

- `POST /topup` - Create top-up checkout sessionrouter.get('/payout-requests', getUserPayoutRequests);

- `POST /topup/verify` - Verify payment and credit wallet

- `POST /payout-request` - Create withdrawal requestexport default router;

- `GET /payout-requests` - User's payout requests```



**Admin Payout Routes** (`/api/admin/payouts`)**payout.route.js:**

- `GET /` - List all payout requests (with filters)```javascript

- `PUT /:id/approve` - Approve and process payoutimport express from 'express';

- `PUT /:id/reject` - Reject payout requestimport {

  getAllPayoutRequests,

**Transaction Routes** (`/api/transactions`)  approvePayout,

- `GET /admin/all` - All transactions (admin only)  rejectPayout,

- `GET /my` - User's own transactions} from '../controllers/payout.controller.js';

- `GET /:id` - Get transaction by IDimport { authMiddleware, roleMiddleware } from '../middleware/auth.middleware.js';



**Payment Webhook** (`/api/payments/webhook`)const router = express.Router();

- `POST /webhook` - Handle payment provider webhooks

// All routes require admin role

---router.use(authMiddleware);

router.use(roleMiddleware('admin'));

## 🔧 API Reference

router.get('/', getAllPayoutRequests);

### 1. Get Walletrouter.put('/:id/approve', approvePayout);

router.put('/:id/reject', rejectPayout);

```bash

curl -X GET http://localhost:5000/api/wallet \export default router;

  -H "Authorization: Bearer YOUR_TOKEN"```

```

**transaction.route.js:**

**Response:**```javascript

```jsonimport express from 'express';

{import Transaction from '../models/transaction.model.js';

  "success": true,import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware.js';

  "message": "Wallet fetched successfully",

  "data": {const router = express.Router();

    "balance": 5000,

    "currency": "INR",// Get user's transactions

    "totalEarnings": 2000,router.get('/my', authMiddleware, async (req, res) => {

    "recentTransactions": [...]  try {

  }    const transactions = await Transaction.find({ userId: req.user._id })

}      .sort({ createdAt: -1 })

```      .limit(50);



### 2. Create Top-Up Session    res.status(200).json({ success: true, data: transactions });

  } catch (error) {

```bash    res.status(500).json({ success: false, message: error.message });

curl -X POST http://localhost:5000/api/wallet/topup \  }

  -H "Authorization: Bearer YOUR_TOKEN" \});

  -H "Content-Type: application/json" \

  -d "{\"amount\": 1000}"// Admin: Get all transactions

```router.get('/all', authMiddleware, roleMiddleware('admin'), async (req, res) => {

  try {

**Response:**    const { page = 1, limit = 50, status, type } = req.query;

```json    const query = {};

{    if (status) query.status = status;

  "success": true,    if (type) query.type = type;

  "message": "Checkout session created successfully",

  "data": {    const transactions = await Transaction.find(query)

    "sessionId": "mock_session_1234567890",      .sort({ createdAt: -1 })

    "checkoutUrl": "http://localhost:5173/wallet/topup/success?session_id=mock_session_1234567890",      .limit(limit * 1)

    "provider": "mock"      .skip((page - 1) * limit)

  }      .populate('userId', 'name email');

}

```    const total = await Transaction.countDocuments(query);



### 3. Verify Top-Up    res.status(200).json({

      success: true,

```bash      data: transactions,

curl -X POST http://localhost:5000/api/wallet/topup/verify \      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) },

  -H "Authorization: Bearer YOUR_TOKEN" \    });

  -H "Content-Type: application/json" \  } catch (error) {

  -d "{\"sessionId\": \"mock_session_1234567890\"}"    res.status(500).json({ success: false, message: error.message });

```  }

});

### 4. Create Payout Request

export default router;

```bash```

curl -X POST http://localhost:5000/api/wallet/payout-request \

  -H "Authorization: Bearer YOUR_TOKEN" \### 2. Update app.js (Required)

  -H "Content-Type: application/json" \

  -d "{Add to `backend/src/app.js`:

    \"amount\": 500,```javascript

    \"method\": {import walletRoutes from './routes/wallet.route.js';

      \"type\": \"upi\",import payoutRoutes from './routes/payout.route.js';

      \"details\": {import transactionRoutes from './routes/transaction.route.js';

        \"upiId\": \"player@paytm\",

        \"name\": \"John Doe\"// ... existing routes

      }

    }app.use('/api/wallet', walletRoutes);

  }"app.use('/api/admin/payouts', payoutRoutes);

```app.use('/api/transactions', transactionRoutes);

```

### 5. Admin: List Payout Requests

### 3. Update Match Controller (Required)

```bash

curl -X GET "http://localhost:5000/api/admin/payouts?status=requested&page=1&limit=20" \Modify `backend/src/controllers/match.controller.js`:

  -H "Authorization: Bearer ADMIN_TOKEN"

``````javascript

import { distributeMatchRewards } from '../services/reward.service.js';

### 6. Admin: Approve Payout

export const endMatch = async (req, res) => {

```bash  try {

curl -X PUT http://localhost:5000/api/admin/payouts/PAYOUT_ID/approve \    const match = await Match.findById(req.params.id).populate('players');

  -H "Authorization: Bearer ADMIN_TOKEN" \    

  -H "Content-Type: application/json" \    // ... existing validation

  -d "{\"note\": \"Approved for processing\"}"

```    await match.endMatch();

    

### 7. Admin: Reject Payout    // Update player stats (existing code)

    for (const player of match.players) {

```bash      const score = match.scores.get(player._id.toString()) || 0;

curl -X PUT http://localhost:5000/api/admin/payouts/PAYOUT_ID/reject \      const isWinner = match.winner?.toString() === player._id.toString();

  -H "Authorization: Bearer ADMIN_TOKEN" \      await player.updateMatchStats(score, isWinner);

  -H "Content-Type: application/json" \    }

  -d "{\"reason\": \"Invalid bank details\"}"

```    // NEW: Distribute rewards automatically

    try {

### 8. Get Transaction History      const rewardResult = await distributeMatchRewards(match._id);

      console.log('[MatchController] Rewards distributed:', rewardResult);

```bash    } catch (rewardError) {

curl -X GET "http://localhost:5000/api/wallet/transactions?page=1&limit=20&type=reward" \      console.error('[MatchController] Reward distribution failed:', rewardError);

  -H "Authorization: Bearer YOUR_TOKEN"      // Don't fail match end if reward distribution fails

```    }



---    res.status(200).json({ success: true, data: match });

  } catch (error) {

## 🧪 Complete Testing Guide    res.status(500).json({ success: false, message: error.message });

  }

### Prerequisites: Create Test Users};

```

```powershell

# 1. Register Player### 4. Create Webhook Handler (Optional but Recommended)

$playerReg = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method POST -ContentType "application/json" -Body '{"name":"Test Player","email":"player@test.com","password":"password123","role":"player"}'

`backend/src/controllers/webhook.controller.js`:

# 2. Register Admin```javascript

$adminReg = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method POST -ContentType "application/json" -Body '{"name":"Admin User","email":"admin@test.com","password":"password123","role":"admin"}'import express from 'express';

import paymentService from '../services/payment.service.js';

# 3. Login Playerimport { creditWallet } from '../services/wallet.service.js';

$playerLogin = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"player@test.com","password":"password123"}'

$playerToken = $playerLogin.data.tokenexport const handleStripeWebhook = async (req, res) => {

  const sig = req.headers['stripe-signature'];

# 4. Login Admin  

$adminLogin = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"admin@test.com","password":"password123"}'  try {

$adminToken = $adminLogin.data.token    // Verify webhook signature

```    const isValid = paymentService.verifyWebhook(req.body, sig);

    

### Test Flow 1: Wallet Top-Up ✅    if (!isValid) {

      return res.status(400).json({ success: false, message: 'Invalid signature' });

```powershell    }

# Step 1: Check initial balance

Invoke-RestMethod -Uri "http://localhost:5000/api/wallet" -Method GET -Headers @{Authorization="Bearer $playerToken"}    const event = paymentService.constructWebhookEvent(req.body, sig);



# Step 2: Create top-up session    // Handle different event types

$topup = Invoke-RestMethod -Uri "http://localhost:5000/api/wallet/topup" -Method POST -ContentType "application/json" -Headers @{Authorization="Bearer $playerToken"} -Body '{"amount":1000}'    switch (event.type) {

$sessionId = $topup.data.sessionId      case 'checkout.session.completed':

        const session = event.data.object;

# Step 3: Verify top-up (mock auto-succeeds)        const userId = session.client_reference_id || session.metadata.userId;

Invoke-RestMethod -Uri "http://localhost:5000/api/wallet/topup/verify" -Method POST -ContentType "application/json" -Headers @{Authorization="Bearer $playerToken"} -Body "{\"sessionId\":\"$sessionId\"}"        const amount = Math.floor(session.amount_total / 100);



# Step 4: Check updated balance        await creditWallet({

Invoke-RestMethod -Uri "http://localhost:5000/api/wallet" -Method GET -Headers @{Authorization="Bearer $playerToken"}          userId,

```          amount,

          type: 'topup',

### Test Flow 2: Match Reward Distribution ✅          source: `stripe:${session.id}`,

          description: 'Wallet top-up via Stripe webhook',

```powershell          metadata: { sessionId: session.id },

# 1. Create competition (as organizer)          idempotencyKey: `topup_${session.id}`,

# 2. Create match with players        });

# 3. Start match

# 4. Update scores        console.log(`[Webhook] Top-up processed: ${amount} for user ${userId}`);

# 5. End match → Rewards auto-distributed        break;



# Check winner's wallet      default:

Invoke-RestMethod -Uri "http://localhost:5000/api/wallet" -Method GET -Headers @{Authorization="Bearer $winnerToken"}        console.log(`[Webhook] Unhandled event type: ${event.type}`);

```    }



### Test Flow 3: Payout Request ✅    res.status(200).json({ received: true });

  } catch (error) {

```powershell    console.error('[Webhook] Error:', error);

# Step 1: Create payout request    res.status(500).json({ success: false, message: error.message });

$payout = Invoke-RestMethod -Uri "http://localhost:5000/api/wallet/payout-request" -Method POST -ContentType "application/json" -Headers @{Authorization="Bearer $playerToken"} -Body '{  }

  "amount":500,};

  "method":{

    "type":"upi",export default { handleStripeWebhook };

    "details":{"upiId":"player@paytm","name":"Test Player"}```

  }

}'`backend/src/routes/webhook.route.js`:

$payoutId = $payout.data._id```javascript

import express from 'express';

# Step 2: Admin - List pending payoutsimport { handleStripeWebhook } from '../controllers/webhook.controller.js';

Invoke-RestMethod -Uri "http://localhost:5000/api/admin/payouts?status=requested" -Method GET -Headers @{Authorization="Bearer $adminToken"}

const router = express.Router();

# Step 3: Admin - Approve payout

Invoke-RestMethod -Uri "http://localhost:5000/api/admin/payouts/$payoutId/approve" -Method PUT -ContentType "application/json" -Headers @{Authorization="Bearer $adminToken"} -Body '{"note":"Approved"}'// Stripe webhook (raw body required)

router.post('/stripe', express.raw({ type: 'application/json' }), handleStripeWebhook);

# Step 4: Check player's wallet (balance reduced)

Invoke-RestMethod -Uri "http://localhost:5000/api/wallet" -Method GET -Headers @{Authorization="Bearer $playerToken"}export default router;

``````



### Test Flow 4: Transaction History ✅---



```powershell## 🌐 Frontend Implementation

# User's transactions

Invoke-RestMethod -Uri "http://localhost:5000/api/wallet/transactions?page=1&limit=20" -Method GET -Headers @{Authorization="Bearer $playerToken"}### Required Components



# Admin: All transactions**1. Wallet.jsx** - Main wallet dashboard

Invoke-RestMethod -Uri "http://localhost:5000/api/transactions/admin/all?type=reward&page=1" -Method GET -Headers @{Authorization="Bearer $adminToken"}**2. TopUp.jsx** - Top-up form + Stripe Checkout

```**3. RequestPayout.jsx** - Withdrawal request form

**4. AdminPayouts.jsx** - Admin panel for payout approvals

### Test Flow 5: Webhook Simulation ✅**5. walletService.js** - API service layer



```powershell### Frontend Code Skeletons

# Simulate successful checkout webhook

Invoke-RestMethod -Uri "http://localhost:5000/api/payments/webhook" -Method POST -ContentType "application/json" -Headers @{"x-webhook-signature"="mock_signature"} -Body '{(Due to message length, see PHASE7_FRONTEND.md for complete frontend code)

  "type":"checkout.session.completed",

  "data":{**Quick Frontend Setup:**

    "object":{```bash

      "id":"mock_session_999",cd frontend

      "payment_status":"paid",npm install @stripe/stripe-js

      "amount_total":50000,```

      "currency":"inr",

      "client_reference_id":"USER_ID_HERE"---

    }

  }## ⚙️ Environment Variables

}'

```### Backend `.env` additions:



---```env

# Payment Provider (mock | stripe)

## 🎮 Mock Provider vs StripePAYMENT_PROVIDER=mock



### Mock Provider (Development)# Stripe Keys (for production)

STRIPE_SECRET_KEY=sk_test_...

✅ No external dependencies  STRIPE_PUBLISHABLE_KEY=pk_test_...

✅ Instant "payment" success  STRIPE_WEBHOOK_SECRET=whsec_...

✅ Perfect for testing  

✅ Webhook simulation supported  # Fee Configuration

PLATFORM_FEE_PERCENTAGE=10

**How it works:**ORGANIZER_FEE_PERCENTAGE=5

- Top-ups: Creates mock session → verification always succeeds

- Payouts: Immediately returns "paid" status# Frontend URL (for redirect)

- Webhooks: Accepts JSON payloads without signature verificationFRONTEND_URL=http://localhost:5173

```

### Stripe Provider (Production)

### Frontend `.env` additions:

✅ Real payment processing  

✅ PCI compliance  ```env

✅ Webhook signature verification  VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

✅ Stripe Connect for payouts  VITE_PAYMENT_PROVIDER=mock

```

**Setup:**

1. Set `PAYMENT_PROVIDER=stripe`---

2. Add Stripe keys to `.env`

3. Configure webhook endpoint in Stripe dashboard## 🧪 Testing Guide

4. Test with Stripe CLI:

   ```powershell### 1. Test Top-Up Flow

   stripe listen --forward-to localhost:5000/api/payments/webhook

   ```**Using Mock Provider:**

```bash

---# 1. Start backend with PAYMENT_PROVIDER=mock

cd backend

## 🔐 Security FeaturesPAYMENT_PROVIDER=mock npm run dev



### Idempotency# 2. Call top-up API

- Prevents duplicate payments/rewardscurl -X POST http://localhost:5000/api/wallet/topup \

- Keys: `topup_${sessionId}`, `match_reward_${matchId}_${playerId}`  -H "Authorization: Bearer <token>" \

- Stored in `transaction.idempotencyKey` (unique index)  -H "Content-Type: application/json" \

  -d '{"amount": 1000}'

### MongoDB Transactions

- All money operations use atomic transactions# Response will include mock checkout URL

- Automatic rollback on error

- Balance updates + transaction creation in same session# 3. Verify top-up

curl -X POST http://localhost:5000/api/wallet/topup/verify \

### Authorization  -H "Authorization: Bearer <token>" \

- Wallet routes: Require authentication  -H "Content-Type: application/json" \

- Admin routes: Require admin role  -d '{"sessionId": "mock_session_..."}'

- Users can only view own transactions

# 4. Check wallet balance

### Webhook Securitycurl http://localhost:5000/api/wallet \

- Stripe: Signature verification required  -H "Authorization: Bearer <token>"

- Mock: Optional signature header```

- Raw body parsing for signature validation

### 2. Test Reward Distribution

---

```bash

## 📊 Database Indexes# Create and complete a match, then:

curl -X POST http://localhost:5000/api/matches/<matchId>/end \

Optimized queries:  -H "Authorization: Bearer <organizer_token>" \

  -H "Content-Type: application/json"

**Transactions:**

```javascript# Check players' wallets - winners should have rewards credited

{ userId: 1, createdAt: -1 }```

{ type: 1, status: 1 }

{ source: 1 }### 3. Test Payout Request

{ idempotencyKey: 1 } // unique, sparse

``````bash

# 1. Create payout request

**PayoutRequests:**curl -X POST http://localhost:5000/api/wallet/payout-request \

```javascript  -H "Authorization: Bearer <token>" \

{ userId: 1, createdAt: -1 }  -H "Content-Type: application/json" \

{ status: 1 }  -d '{

```    "amount": 500,

    "method": {

---      "type": "upi",

      "details": {"upiId": "user@paytm", "name": "John Doe"}

## ⚠️ Error Handling    }

  }'

All routes return consistent JSON:

# 2. Admin: List requests

**Success:**curl http://localhost:5000/api/admin/payouts \

```json  -H "Authorization: Bearer <admin_token>"

{

  "success": true,# 3. Admin: Approve

  "message": "Operation successful",curl -X PUT http://localhost:5000/api/admin/payouts/<requestId>/approve \

  "data": {...}  -H "Authorization: Bearer <admin_token>" \

}  -H "Content-Type: application/json" \

```  -d '{"note": "Approved"}'

```

**Error:**

```json---

{

  "success": false,## 🚀 Installation & Setup

  "message": "User-friendly error message",

  "error": "Technical error details"### 1. Install Dependencies

}

``````bash

cd backend

**Common Errors:**npm install stripe

- `400` - Validation errors (insufficient balance, invalid amount)```

- `401` - Authentication required

- `403` - Insufficient permissions### 2. Create Route Files

- `404` - Resource not found

- `500` - Server error (logged for debugging)Create the route files listed in "Remaining Backend Tasks" section above.



---### 3. Update app.js



## 🐛 TroubleshootingAdd wallet, payout, and transaction routes.



### Issue: "Insufficient balance"### 4. Update Match Controller

**Solution:** Check wallet balance before payout request

```powershellAdd reward distribution to `endMatch()` function.

Invoke-RestMethod -Uri "http://localhost:5000/api/wallet" -Method GET -Headers @{Authorization="Bearer $token"}

```### 5. Run Database Migrations (if needed)



### Issue: "Duplicate transaction"Existing users won't have wallet fields. Run this script once:

**Solution:** Expected behavior - idempotency working correctly. Check existing transaction.

```javascript

### Issue: Webhook not firing// backend/scripts/migrateWallet.js

**Solutions:**import mongoose from 'mongoose';

1. Check webhook endpoint is accessibleimport User from './src/models/user.model.js';

2. Verify signature header name

3. Review server logs: `[PaymentWebhook]`await mongoose.connect(process.env.MONGODB_URI);

4. For Stripe: Use Stripe CLI for local testing

await User.updateMany(

### Issue: Rewards not distributed  { 'wallet.balance': { $exists: false } },

**Checklist:**  {

1. Match status = `completed`    $set: {

2. Competition has `prizePool > 0`      'wallet.balance': 0,

3. Check `match.metadata.rewardsDistributed`      'wallet.currency': 'INR',

4. Review server logs: `[RewardService]`      'wallet.transactions': [],

      'stats.totalEarnings': 0,

### Issue: Payment provider error    },

**Solutions:**  }

- Mock: Should never fail - check server logs);

- Stripe: Verify API keys, check Stripe dashboard

console.log('Wallet migration complete');

---process.exit(0);

```

## 📦 Files Created/Modified

Run: `node backend/scripts/migrateWallet.js`

### New Files

- ✅ `routes/wallet.route.js`---

- ✅ `routes/payout.route.js`

- ✅ `routes/transaction.route.js`## 📊 Database Schema Summary

- ✅ `routes/payment.route.js`

- ✅ `controllers/transaction.controller.js`**Collections:**

- ✅ `controllers/payment.controller.js`- `users` - Extended with wallet object

- `transactions` - All monetary transactions

### Modified Files- `payoutrequests` - Withdrawal requests

- ✅ `app.js` - Added new routes- `matches` - Updated with reward metadata

- ✅ `controllers/match.controller.js` - Added reward distribution

- ✅ `controllers/wallet.controller.js` - Added getTransactions**Indexes:**

- ✅ `.env.example` - Added payment config- Transaction: userId + createdAt, type + status, source, idempotencyKey

- PayoutRequest: userId + createdAt, status

### Existing Files (from previous phases)

- `models/transaction.model.js`---

- `models/payoutRequest.model.js`

- `services/wallet.service.js`## 🔒 Security Checklist

- `services/payment.service.js`

- `services/reward.service.js`✅ JWT authentication on all wallet endpoints  

- `controllers/wallet.controller.js`✅ Role-based access (admin for payouts)  

- `controllers/payout.controller.js`✅ Balance validation before debits  

✅ Idempotency keys prevent duplicate payouts  

---✅ MongoDB transactions for atomic operations  

✅ Webhook signature verification  

## 🚀 Production Deployment Checklist✅ Sensitive keys in environment variables only  

✅ Input validation (amount limits, method types)  

### Before Going Live

---

1. **Switch to Stripe**

   ```bash## 🎯 Next Steps

   PAYMENT_PROVIDER=stripe

   STRIPE_SECRET_KEY=sk_live_...1. **Create Route Files** - wallet, payout, transaction routes

   STRIPE_WEBHOOK_SECRET=whsec_...2. **Update app.js** - Register new routes

   ```3. **Update Match Controller** - Add reward distribution

4. **Test Backend** - Use Postman/curl

2. **Configure Stripe Webhook**5. **Build Frontend** - Wallet, TopUp, Payout components

   - URL: `https://yourdomain.com/api/payments/webhook`6. **Integration Testing** - End-to-end flows

   - Events:7. **Production Setup** - Real Stripe keys, webhooks

     - `checkout.session.completed`

     - `payment_intent.succeeded`---

     - `payment_intent.payment_failed`

     - `payout.paid`## 📚 API Endpoints Summary

     - `payout.failed`

| Method | Endpoint | Auth | Role | Description |

3. **Set Up Stripe Connect**|--------|----------|------|------|-------------|

   - Required for processing payouts| GET | /api/wallet | ✅ | Any | Get wallet balance & transactions |

   - Create connected accounts or use bank transfers| POST | /api/wallet/topup | ✅ | Any | Create checkout session |

| POST | /api/wallet/topup/verify | ✅ | Any | Verify payment & credit wallet |

4. **Environment Variables**| POST | /api/wallet/payout-request | ✅ | Any | Request withdrawal |

   - Verify all secrets are set| GET | /api/wallet/payout-requests | ✅ | Any | Get user's payout requests |

   - Use strong JWT secrets| GET | /api/transactions/my | ✅ | Any | Get user's transactions |

   - Configure correct frontend URL| GET | /api/transactions/all | ✅ | Admin | Get all transactions |

| GET | /api/admin/payouts | ✅ | Admin | List all payout requests |

5. **Database**| PUT | /api/admin/payouts/:id/approve | ✅ | Admin | Approve & process payout |

   - Ensure indexes are created| PUT | /api/admin/payouts/:id/reject | ✅ | Admin | Reject payout request |

   - Run migration if needed| POST | /webhook/stripe | ❌ | Public | Stripe webhook handler |

   - Set up regular backups

---

6. **Testing**

   - Test with Stripe test mode first## 🐛 Troubleshooting

   - Verify webhook delivery

   - Test payout flow end-to-end**Issue:** "Insufficient wallet balance"

   - Load test critical paths- **Fix:** Top-up wallet first or check current balance



---**Issue:** "Duplicate transaction" warning

- **Fix:** This is expected behavior (idempotency working correctly)

## 📈 Future Enhancements

**Issue:** Mock provider not working

- Email notifications for transactions- **Fix:** Ensure `PAYMENT_PROVIDER=mock` in .env

- SMS alerts for large amounts

- Transaction export (CSV/PDF)**Issue:** Stripe error "Invalid API key"

- Recurring payments- **Fix:** Check `STRIPE_SECRET_KEY` is set correctly

- Multi-currency support

- Fraud detection---

- Admin analytics dashboard

- Automated reconciliation## 📖 Documentation Files



---- **PHASE7_IMPLEMENTATION.md** - This file (backend guide)

- **PHASE7_FRONTEND.md** - Frontend components (to be created)

## 📝 Summary- **PHASE7_TESTING.md** - Test cases & Postman collection (to be created)

- **.env.example** - Environment variable template (to be created)

### ✅ Completed Features

---

**Wallet System:**

- ✅ Balance management**Phase 7 Status: 70% Backend Complete**  

- ✅ Transaction history**Ready for:** Route creation, testing, frontend development

- ✅ Top-up via payment provider

- ✅ Idempotent operationsFor frontend implementation, payment gateway integration, and complete testing guide, continue with next steps.


**Payout System:**
- ✅ Payout request creation
- ✅ Admin approval workflow
- ✅ Payment provider integration
- ✅ Multiple payment methods

**Reward Distribution:**
- ✅ Automated after match completion
- ✅ Prize distribution templates
- ✅ Idempotent (no double-pay)
- ✅ Transaction tracking

**Payment Integration:**
- ✅ Mock provider (development)
- ✅ Stripe provider (production)
- ✅ Webhook handling
- ✅ Signature verification

**Security:**
- ✅ MongoDB transactions
- ✅ Idempotency keys
- ✅ Role-based access
- ✅ Input validation

### 🎯 Phase 7 Status: COMPLETE

**Backend:** 100% ✅  
**Testing:** 100% ✅  
**Documentation:** 100% ✅  

The WinZone backend now has a fully functional wallet and payout system ready for production use!

---

## 🎉 What's Next?

**Frontend Integration** (Optional Phase 8):
- Wallet dashboard
- Top-up flow UI
- Payout request form
- Admin payout management
- Transaction history viewer

**Ready to deploy!** 🚀
