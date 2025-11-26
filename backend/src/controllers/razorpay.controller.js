import razorpayService from '../services/razorpay.service.js';
import User from '../models/user.model.js';

// Create payment order (amount in INR -> paise)
export const createOrder = async (req, res) => {
  try {
    // Static entry fee: 10 INR
    const amountInPaise = 10 * 100;
    const receipt = `receipt_${req.user._id}_${Date.now()}`;

    const order = await razorpayService.createOrder({ amount: amountInPaise, currency: 'INR', receipt });

    return res.status(200).json({
      success: true,
      message: 'Order created',
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        razorpayKeyId: process.env.RAZORPAY_KEY_ID || '',
      },
    });
  } catch (error) {
    console.error('Create order error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create order', data: null });
  }
};

// Verify payment signature and mark user eligible
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Missing payment verification fields', data: null });
    }

    const isValid = razorpayService.verifySignature({ order_id: razorpay_order_id, payment_id: razorpay_payment_id, signature: razorpay_signature });

    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid signature', data: null });
    }

    // Update user record
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found', data: null });
    }

    // Assign static game name or from user's choice (use static "BGMI" per spec)
    const gameName = user.gameName || 'BGMI';

    // Generate entry code: WZ-XXXXXX (6 alphanumeric uppercase)
    const generateEntryCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = '';
      for (let i = 0; i < 6; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
      return `WZ-${code}`;
    };

    const entryCode = generateEntryCode();

    user.isEligible = true;
    user.paymentCompleted = true;
    user.gameName = gameName;
    user.entryCode = entryCode;
    await user.save();

    return res.status(200).json({ success: true, message: 'Payment verified', data: { gameName, entryCode } });
  } catch (error) {
    console.error('Verify payment error:', error);
    return res.status(500).json({ success: false, message: 'Payment verification failed', data: null });
  }
};

export default {
  createOrder,
  verifyPayment,
};
