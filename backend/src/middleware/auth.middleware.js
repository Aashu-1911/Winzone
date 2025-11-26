import User from '../models/user.model.js';
import { verifyToken } from '../utils/jwt.util.js';

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user to request object
 * @desc    Protect routes - verify JWT token
 * @access  Private routes
 */
export const authMiddleware = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided. Authorization denied.',
      });
    }

    // Extract token (format: "Bearer <token>")
    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = verifyToken(token);

    // Find user by ID from token payload
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found. Authorization denied.',
      });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token. Authorization denied.',
      error: error.message,
    });
  }
};

export default authMiddleware;
