# Phase 7 Quick Start Guide 🚀

## Installation (2 minutes)

### 1. Install Dependencies
```powershell
cd backend
npm install stripe
```

### 2. Update Environment Variables
Add to `backend/.env`:
```bash
PAYMENT_PROVIDER=mock
PLATFORM_FEE_PERCENTAGE=10
ORGANIZER_FEE_PERCENTAGE=5
```

### 3. Start Server
```powershell
npm run dev
```

✅ Server ready on http://localhost:5000

---

## Quick Test (5 minutes)

### Setup Test Users
```powershell
# Register Player
$player = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method POST -ContentType "application/json" -Body '{"name":"Test Player","email":"player@test.com","password":"password123","role":"player"}'
$playerToken = $player.data.token

# Register Admin
$admin = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method POST -ContentType "application/json" -Body '{"name":"Admin User","email":"admin@test.com","password":"password123","role":"admin"}'
$adminToken = $admin.data.token
```

### Test Wallet Top-Up
```powershell
# 1. Check balance (should be 0)
Invoke-RestMethod -Uri "http://localhost:5000/api/wallet" -Headers @{Authorization="Bearer $playerToken"}

# 2. Create top-up
$topup = Invoke-RestMethod -Uri "http://localhost:5000/api/wallet/topup" -Method POST -ContentType "application/json" -Headers @{Authorization="Bearer $playerToken"} -Body '{"amount":1000}'
$sessionId = $topup.data.sessionId

# 3. Verify payment
Invoke-RestMethod -Uri "http://localhost:5000/api/wallet/topup/verify" -Method POST -ContentType "application/json" -Headers @{Authorization="Bearer $playerToken"} -Body "{\"sessionId\":\"$sessionId\"}"

# 4. Check balance (should be 1000)
Invoke-RestMethod -Uri "http://localhost:5000/api/wallet" -Headers @{Authorization="Bearer $playerToken"}
```

### Test Payout
```powershell
# 1. Create payout request
$payout = Invoke-RestMethod -Uri "http://localhost:5000/api/wallet/payout-request" -Method POST -ContentType "application/json" -Headers @{Authorization="Bearer $playerToken"} -Body '{
  "amount":500,
  "method":{"type":"upi","details":{"upiId":"test@paytm","name":"Test Player"}}
}'
$payoutId = $payout.data._id

# 2. Admin approves
Invoke-RestMethod -Uri "http://localhost:5000/api/admin/payouts/$payoutId/approve" -Method PUT -ContentType "application/json" -Headers @{Authorization="Bearer $adminToken"} -Body '{"note":"Approved"}'

# 3. Check balance (should be 500)
Invoke-RestMethod -Uri "http://localhost:5000/api/wallet" -Headers @{Authorization="Bearer $playerToken"}
```

✅ **All tests passed!** Phase 7 is working correctly.

---

## API Endpoints Summary

### Wallet
- `GET /api/wallet` - Get balance
- `POST /api/wallet/topup` - Create top-up
- `POST /api/wallet/topup/verify` - Verify payment
- `POST /api/wallet/payout-request` - Request payout
- `GET /api/wallet/transactions` - Transaction history

### Admin
- `GET /api/admin/payouts` - List payout requests
- `PUT /api/admin/payouts/:id/approve` - Approve
- `PUT /api/admin/payouts/:id/reject` - Reject

### Transactions
- `GET /api/transactions/my` - My transactions
- `GET /api/transactions/admin/all` - All (admin)

### Webhooks
- `POST /api/payments/webhook` - Payment events

---

## Import Postman Collection

1. Open Postman
2. Import `postman_collection_phase7.json`
3. Update variables:
   - `baseUrl`: http://localhost:5000
   - Run "Register Player" → auto-sets `playerToken`
   - Run "Register Admin" → auto-sets `adminToken`
4. Run requests in order!

---

## Switching to Stripe (Production)

### 1. Get Stripe Keys
- Sign up at https://stripe.com
- Get API keys from Dashboard

### 2. Update .env
```bash
PAYMENT_PROVIDER=stripe
STRIPE_SECRET_KEY=sk_live_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret
```

### 3. Configure Webhook
- Stripe Dashboard → Webhooks
- URL: `https://yourdomain.com/api/payments/webhook`
- Events: `checkout.session.completed`, `payout.paid`

### 4. Test with Stripe CLI
```powershell
stripe listen --forward-to localhost:5000/api/payments/webhook
```

---

## Troubleshooting

**Server won't start?**
- Check MongoDB is running
- Verify .env file exists

**Wallet not crediting?**
- Check server logs: `[WalletController]`
- Verify sessionId is correct
- For mock: always succeeds
- For Stripe: check Stripe dashboard

**Payout fails?**
- Ensure sufficient balance
- No pending payout requests
- Check payment provider logs

**Need help?**
- Check `PHASE7_IMPLEMENTATION.md` for detailed docs
- Review `PHASE7_TESTING_CHECKLIST.md` for test cases
- Look at server logs for errors

---

## Next Steps

1. ✅ Test all features locally
2. ✅ Review Postman collection
3. ✅ Read implementation docs
4. 🎯 Build frontend (optional)
5. 🚀 Deploy to production

**Phase 7 Complete!** 🎉
