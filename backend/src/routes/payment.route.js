import express from 'express';
import paymentController from '../controllers/payment.controller.js';
import razorpayController from '../controllers/razorpay.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
import { roleMiddleware } from '../middleware/role.middleware.js';

const router = express.Router();

/**
 * Payment Routes
 * - POST /order  -> create razorpay order (authenticated player)
 * - POST /verify -> verify razorpay signature and mark user eligible
 * - POST /webhook -> provider webhooks (existing)
 */

// Create order (player must be authenticated)
router.post('/order', authMiddleware, roleMiddleware('player'), razorpayController.createOrder);

// Verify payment (player must be authenticated)
router.post('/verify', authMiddleware, roleMiddleware('player'), razorpayController.verifyPayment);

// Existing webhook route (raw body)
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.handleWebhook);

export default router;
