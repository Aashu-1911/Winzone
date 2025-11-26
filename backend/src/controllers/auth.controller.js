import User from '../models/user.model.js';
import crypto from 'crypto';
import { generateToken } from '../utils/jwt.util.js';

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, collegeName, gamingHandle, role, profileImage } = req.body;

    // Validation - required fields per milestone
    if (!name || !email || !password || !phone || !collegeName || !gamingHandle) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, password, phone, collegeName and gamingHandle',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    // Create email verification token
    const verificationToken = crypto.randomBytes(20).toString('hex');
    const tokenExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    // Create new user (do NOT auto-login)
    const user = await User.create({
      name,
      email,
      password,
      phone,
      gamingHandle,
      role: role || 'player', // Default to player if not specified
      collegeName: collegeName || '',
      profileImage: profileImage || '',
      emailVerified: false,
      isApprovedByAdmin: false,
      isEligible: false,
      paymentCompleted: false,
      emailVerificationToken: verificationToken,
      emailVerificationTokenExpires: new Date(tokenExpiry),
    });

    // Log verification link to console (developer/test flow)
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`;
    console.log(`[Auth] Email verification link for ${email}: ${verificationUrl}`);

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please verify your email using the link sent (logged to server).',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        collegeName: user.collegeName,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message,
    });
  }
};

/**
 * @desc    Login user and return JWT token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Find user and include password field for comparison
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Compare passwords
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        collegeName: user.collegeName,
        profileImage: user.profileImage,
        walletBalance: user.walletBalance,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message,
    });
  }
};

/**
 * @desc    Get current user details from JWT token
 * @route   GET /api/auth/me
 * @access  Private (requires authentication)
 */
export const getCurrentUser = async (req, res) => {
  try {
    // req.user is set by auth middleware
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        collegeName: user.collegeName,
        profileImage: user.profileImage,
        walletBalance: user.walletBalance,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user data',
      error: error.message,
    });
  }
};
