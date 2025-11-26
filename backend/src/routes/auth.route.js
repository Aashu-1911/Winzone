import express from 'express';
import {
  registerUser,
  loginUser,
  getCurrentUser,
  verifyOTPController,
  resendOTPController,
} from '../controllers/auth.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 * @body    { name, email, password, role?, collegeName?, profileImage? }
 */
router.post('/register', registerUser);

/**
 * @route   POST /api/auth/login
 * @desc    Login user and get JWT token
 * @access  Public
 * @body    { email, password }
 */
router.post('/login', loginUser);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private (requires valid JWT token)
 * @header  Authorization: Bearer <token>
 */
router.get('/me', authMiddleware, getCurrentUser);

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Verify OTP after registration
 * @access  Public
 * @body    { email, otp }
 */
router.post('/verify-otp', verifyOTPController);

/**
 * @route   POST /api/auth/resend-otp
 * @desc    Resend OTP for verification
 * @access  Public
 * @body    { email }
 */
router.post('/resend-otp', resendOTPController);

export default router;
