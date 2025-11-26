import express from 'express';
import paymentController from '../controllers/payment.controller.js';
import dummyPaymentController from '../controllers/dummyPayment.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
import { roleMiddleware } from '../middleware/role.middleware.js';

const router = express.Router();

/**
 * Payment Routes
 * - POST /process -> process dummy payment and generate game credentials (authenticated player)
 * - POST /webhook -> provider webhooks (existing)
 */

// Process dummy payment (player must be authenticated)
router.post('/process', authMiddleware, roleMiddleware('player'), dummyPaymentController.processDummyPayment);

// Existing webhook route (raw body)
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.handleWebhook);

export default router;
