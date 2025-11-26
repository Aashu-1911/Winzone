import express from 'express';
import authMiddleware from '../middleware/auth.middleware.js';
import roleMiddleware from '../middleware/role.middleware.js';
import payoutController from '../controllers/payout.controller.js';

const router = express.Router();

/**
 * Payout Admin Routes
 * All routes require admin authentication
 */

// Get all payout requests (with filters)
router.get('/', authMiddleware, roleMiddleware('admin'), payoutController.getAllPayoutRequests);

// Approve payout request
router.put('/:id/approve', authMiddleware, roleMiddleware('admin'), payoutController.approvePayout);

// Reject payout request
router.put('/:id/reject', authMiddleware, roleMiddleware('admin'), payoutController.rejectPayout);

export default router;
