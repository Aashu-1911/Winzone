import express from 'express';
import authMiddleware from '../middleware/auth.middleware.js';
import roleMiddleware from '../middleware/role.middleware.js';
import transactionController from '../controllers/transaction.controller.js';

const router = express.Router();

/**
 * Transaction Routes
 */

// Get all transactions (admin only - with filters & pagination)
router.get('/admin/all', authMiddleware, roleMiddleware('admin'), transactionController.getAllTransactions);

// Get user's own transactions (protected)
router.get('/my', authMiddleware, transactionController.getMyTransactions);

// Get transaction by ID
router.get('/:id', authMiddleware, transactionController.getTransactionById);

export default router;
