import User from '../models/user.model.js';
import otpService from '../services/otp.service.js';
import { generateToken } from '../utils/jwt.util.js';

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, collegeName, role, profileImage } = req.body;

    // Determine user role (default to 'player')
    const userRole = role || 'player';

    // Validation - required fields
    if (!name || !email || !password || !phone || !collegeName) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, password, phone, and collegeName',
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

    // Create new user (auto-verified, no OTP needed)
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: userRole,
      collegeName: collegeName || '',
      profileImage: profileImage || '',
      emailVerified: true, // Auto-verified
      isApprovedByAdmin: false,
      isEligible: userRole === 'organizer' ? true : false, // Organizers are eligible by default
      paymentCompleted: userRole === 'organizer' ? true : false, // Organizers don't need payment
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully. You can now login.',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
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

/**
 * @desc    Verify OTP after registration
 * @route   POST /api/auth/verify-otp
 * @access  Public
 */
export const verifyOTPController = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and OTP',
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if already verified
    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email already verified',
      });
    }

    // Verify OTP
    const verification = otpService.verifyOTP(user.otpCode, user.otpExpires, otp);
    
    if (!verification.valid) {
      return res.status(400).json({
        success: false,
        message: verification.message,
      });
    }

    // Mark email as verified and clear OTP
    user.emailVerified = true;
    user.otpCode = '';
    user.otpExpires = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully. You can now login.',
      data: {
        id: user._id,
        email: user.email,
        emailVerified: true,
      },
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying OTP',
      error: error.message,
    });
  }
};

/**
 * @desc    Resend OTP for verification
 * @route   POST /api/auth/resend-otp
 * @access  Public
 */
export const resendOTPController = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email',
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if already verified
    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email already verified',
      });
    }

    // Generate new OTP
    const otp = otpService.generateOTP();
    const otpExpiry = otpService.getOTPExpiry();

    user.otpCode = otp;
    user.otpExpires = otpExpiry;
    await user.save();

    // Log OTP to console
    console.log(`[Auth] New OTP for ${email}: ${otp} (expires in 10 minutes)`);

    res.status(200).json({
      success: true,
      message: 'New OTP sent successfully (check server console).',
      data: {
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resending OTP',
      error: error.message,
    });
  }
};

