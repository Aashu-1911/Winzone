import express from 'express';
import authMiddleware from '../middleware/auth.middleware.js';
import walletController from '../controllers/wallet.controller.js';

const router = express.Router();

/**
 * Wallet Routes
 * All routes are protected (require authentication)
 */

// Get user's wallet balance and recent transactions
router.get('/', authMiddleware, walletController.getUserWallet);

// Get user's transaction history (paginated)
router.get('/transactions', authMiddleware, walletController.getTransactions);

// Create top-up checkout session
router.post('/topup', authMiddleware, walletController.createTopUpSession);

// Verify top-up payment (called after successful payment)
router.post('/topup/verify', authMiddleware, walletController.verifyTopUp);

// Create payout request (withdrawal)
router.post('/payout-request', authMiddleware, walletController.createPayoutRequest);

// Get user's payout requests
router.get('/payout-requests', authMiddleware, walletController.getUserPayoutRequests);

export default router;
