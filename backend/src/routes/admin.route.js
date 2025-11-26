import express from 'express';
import adminController from '../controllers/admin.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
import { roleMiddleware } from '../middleware/role.middleware.js';

const router = express.Router();

// All admin routes require admin role
router.get('/users', authMiddleware, roleMiddleware('admin'), adminController.listUsers);
router.put('/users/:id/approve', authMiddleware, roleMiddleware('admin'), adminController.approveUser);

export default router;
