/**
 * Wallet Controller (Phase 7)
 * Handles wallet operations, top-up, and payout requests
 */

import paymentService from '../services/payment.service.js';
import { getWallet, creditWallet } from '../services/wallet.service.js';
import PayoutRequest from '../models/payoutRequest.model.js';
import Transaction from '../models/transaction.model.js';
import User from '../models/user.model.js';

/**
 * @route   GET /api/wallet
 * @desc    Get user's wallet balance and recent transactions
 * @access  Protected
 */
export const getUserWallet = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const wallet = await getWallet(req.user._id, limit);
    
    res.status(200).json({
      success: true,
      message: 'Wallet fetched successfully',
      data: wallet,
    });
  } catch (error) {
    console.error('[WalletController] Get wallet error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch wallet',
    });
  }
};

/**
 * @route   GET /api/wallet/transactions
 * @desc    Get user's transaction history (paginated)
 * @access  Protected
 */
export const getTransactions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = { userId: req.user._id };

    // Filter by type if provided
    if (req.query.type) {
      query.type = req.query.type;
    }

    // Filter by status if provided
    if (req.query.status) {
      query.status = req.query.status;
    }

    const total = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      message: 'Transactions fetched successfully',
      data: {
        transactions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('[WalletController] Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching transactions',
      error: error.message,
    });
  }
};

/**
 * @route   POST /api/wallet/topup
 * @desc    Create checkout session for wallet top-up
 * @access  Protected
 */
export const createTopUpSession = async (req, res) => {
  try {
    const { amount } = req.body;

    // Validate amount
    if (!amount || amount < 100) {
      return res.status(400).json({
        success: false,
        message: 'Minimum top-up amount is ₹100',
      });
    }

    if (amount > 100000) {
      return res.status(400).json({
        success: false,
        message: 'Maximum top-up amount is ₹1,00,000',
      });
    }

    const userId = req.user._id.toString();
    const currency = 'INR';
    
    // Convert to smallest currency unit (paise for INR, cents for USD)
    const amountInSmallestUnit = amount * 100;

    // Create checkout session
    const session = await paymentService.createTopUpSession({
      amount: amountInSmallestUnit,
      currency,
      userId,
      successUrl: `${process.env.FRONTEND_URL}/wallet/topup/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${process.env.FRONTEND_URL}/wallet/topup/cancel`,
      metadata: {
        userId,
        type: 'topup',
      },
    });

    res.status(200).json({
      success: true,
      data: {
        sessionId: session.id,
        url: session.url,
        amount,
        currency,
        provider: paymentService.getProvider(),
      },
    });
  } catch (error) {
    console.error('Create top-up session error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create checkout session',
    });
  }
};

/**
 * @route   POST /api/wallet/topup/verify
 * @desc    Verify payment session and credit wallet
 * @access  Protected
 */
export const verifyTopUp = async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required',
      });
    }

    // Verify session with payment provider
    const session = await paymentService.verifySession(sessionId);

    if (session.payment_status !== 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Payment not completed',
      });
    }

    // Extract amount (convert from smallest unit back to main unit)
    const amount = Math.floor(session.amount_total / 100);
    const currency = session.currency.toUpperCase();
    const userId = req.user._id;

    // Credit wallet with idempotency
    const idempotencyKey = `topup_${sessionId}`;
    const result = await creditWallet({
      userId,
      amount,
      type: 'topup',
      source: `stripe:${sessionId}`,
      description: `Wallet top-up via ${paymentService.getProvider()}`,
      metadata: {
        sessionId,
        provider: paymentService.getProvider(),
      },
      idempotencyKey,
    });

    if (result.duplicate) {
      return res.status(200).json({
        success: true,
        message: 'Top-up already processed',
        data: {
          amount,
          balance: result.user?.wallet?.balance || 0,
          duplicate: true,
        },
      });
    }

    res.status(200).json({
      success: true,
      message: `Successfully added ₹${amount} to your wallet`,
      data: {
        amount,
        currency,
        balance: result.user.wallet.balance,
        transaction: result.transaction,
      },
    });
  } catch (error) {
    console.error('Verify top-up error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to verify top-up',
    });
  }
};

/**
 * @route   POST /api/wallet/payout-request
 * @desc    Create payout/withdrawal request
 * @access  Protected
 */
export const createPayoutRequest = async (req, res) => {
  try {
    const { amount, method } = req.body;

    // Validate amount
    if (!amount || amount < 100) {
      return res.status(400).json({
        success: false,
        message: 'Minimum payout amount is ₹100',
      });
    }

    // Validate method
    if (!method || !method.type || !method.details) {
      return res.status(400).json({
        success: false,
        message: 'Payment method details are required',
      });
    }

    const validMethods = ['bank', 'upi', 'stripe'];
    if (!validMethods.includes(method.type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method',
      });
    }

    // Check wallet balance
    const user = await User.findById(req.user._id);
    if (user.wallet.balance < amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient wallet balance',
      });
    }

    // Check for pending payout requests
    const pendingRequest = await PayoutRequest.findOne({
      userId: req.user._id,
      status: { $in: ['requested', 'approved'] },
    });

    if (pendingRequest) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending payout request',
      });
    }

    // Create payout request
    const payoutRequest = await PayoutRequest.create({
      userId: req.user._id,
      amount,
      currency: user.wallet.currency,
      method,
    });

    res.status(201).json({
      success: true,
      message: 'Payout request created successfully. It will be processed by admin.',
      data: payoutRequest,
    });
  } catch (error) {
    console.error('Create payout request error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create payout request',
    });
  }
};

/**
 * @route   GET /api/wallet/payout-requests
 * @desc    Get user's payout requests
 * @access  Protected
 */
export const getUserPayoutRequests = async (req, res) => {
  try {
    const payoutRequests = await PayoutRequest.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('processedBy', 'name email')
      .populate('transactionId');

    res.status(200).json({
      success: true,
      data: payoutRequests,
    });
  } catch (error) {
    console.error('Get payout requests error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch payout requests',
    });
  }
};

export default {
  getUserWallet,
  getTransactions,
  createTopUpSession,
  verifyTopUp,
  createPayoutRequest,
  getUserPayoutRequests,
};
