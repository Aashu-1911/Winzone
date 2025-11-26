import User from '../models/user.model.js';

/**
 * Dummy Payment Controller
 * Simulates payment processing without real payment gateway
 * Auto-succeeds and generates game credentials
 */

/**
 * @desc    Process dummy payment and generate game credentials
 * @route   POST /api/payments/process
 * @access  Private (player only)
 */
export const processDummyPayment = async (req, res) => {
  try {
    const { cardNumber, cardHolder, expiryDate, cvv } = req.body;

    // Basic validation (dummy - just check if fields are provided)
    if (!cardNumber || !cardHolder || !expiryDate || !cvv) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all payment details (cardNumber, cardHolder, expiryDate, cvv)',
      });
    }

    // Find user
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if user has verified email
    if (!user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Please verify your email with OTP before making payment',
      });
    }

    // Check if payment already completed
    if (user.paymentCompleted) {
      return res.status(400).json({
        success: false,
        message: 'Payment already completed',
        data: {
          gameName: user.gameName,
          entryCode: user.entryCode,
        },
      });
    }

    // Auto-generate game credentials
    const gameName = 'BGMI'; // Static game name (can be made dynamic)

    // Generate entry code: WZ-XXXXXX (6 random alphanumeric uppercase)
    const generateEntryCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = '';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return `WZ-${code}`;
    };

    const entryCode = generateEntryCode();

    // Update user - mark payment as complete and user as eligible
    user.paymentCompleted = true;
    user.isEligible = true;
    user.gameName = gameName;
    user.entryCode = entryCode;
    await user.save();

    // Log payment success
    console.log(`[Payment] Dummy payment successful for user ${user.email}. Entry Code: ${entryCode}`);

    res.status(200).json({
      success: true,
      message: 'Payment processed successfully',
      data: {
        gameName,
        entryCode,
        amount: '10 INR', // Static entry fee display
        transactionId: `TXN_${Date.now()}`, // Dummy transaction ID
      },
    });
  } catch (error) {
    console.error('Process payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing payment',
      error: error.message,
    });
  }
};

export default {
  processDummyPayment,
};
