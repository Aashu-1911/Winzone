/**
 * Admin Payout Controller (Phase 7)
 * Admin operations for managing payout requests
 */

import PayoutRequest from '../models/payoutRequest.model.js';
import { debitWallet } from '../services/wallet.service.js';
import paymentService from '../services/payment.service.js';
import Transaction from '../models/transaction.model.js';

/**
 * @route   GET /api/admin/payouts
 * @desc    Get all payout requests (admin only)
 * @access  Admin
 */
export const getAllPayoutRequests = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    const query = status ? { status } : {};
    
    const payoutRequests = await PayoutRequest.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('userId', 'name email wallet')
      .populate('processedBy', 'name email')
      .populate('transactionId');

    const total = await PayoutRequest.countDocuments(query);

    res.status(200).json({
      success: true,
      data: payoutRequests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get all payout requests error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch payout requests',
    });
  }
};

/**
 * @route   PUT /api/admin/payouts/:id/approve
 * @desc    Approve payout request and process payment
 * @access  Admin
 */
export const approvePayout = async (req, res) => {
  try {
    const { id } = req.params;
    const { note = '' } = req.body;

    const payoutRequest = await PayoutRequest.findById(id).populate('userId');
    
    if (!payoutRequest) {
      return res.status(404).json({
        success: false,
        message: 'Payout request not found',
      });
    }

    if (payoutRequest.status !== 'requested') {
      return res.status(400).json({
        success: false,
        message: `Payout request is already ${payoutRequest.status}`,
      });
    }

    // Approve the request
    await payoutRequest.approve(req.user._id, note);

    // Debit user's wallet
    const debitResult = await debitWallet({
      userId: payoutRequest.userId._id,
      amount: payoutRequest.amount,
      type: 'payout',
      source: `payout_request:${payoutRequest._id}`,
      description: `Payout withdrawal`,
      metadata: {
        payoutRequestId: payoutRequest._id,
        method: payoutRequest.method.type,
      },
      idempotencyKey: `payout_debit_${payoutRequest._id}`,
    });

    if (debitResult.duplicate) {
      return res.status(200).json({
        success: true,
        message: 'Payout already processed',
        data: payoutRequest,
      });
    }

    // Process payout with payment provider
    let providerPayout = null;
    try {
      // Convert to smallest currency unit
      const amountInSmallestUnit = payoutRequest.amount * 100;
      
      // Determine destination based on method
      let destination = '';
      if (payoutRequest.method.type === 'upi') {
        destination = payoutRequest.method.details.upiId;
      } else if (payoutRequest.method.type === 'bank') {
        destination = payoutRequest.method.details.accountNumber;
      } else if (payoutRequest.method.type === 'stripe') {
        destination = payoutRequest.method.details.stripeAccountId;
      }

      providerPayout = await paymentService.processPayout({
        amount: amountInSmallestUnit,
        currency: payoutRequest.currency,
        destination,
        metadata: {
          payoutRequestId: payoutRequest._id.toString(),
          userId: payoutRequest.userId._id.toString(),
        },
      });

      // Mark payout request as paid
      await payoutRequest.markPaid(debitResult.transaction._id, providerPayout.id);

      res.status(200).json({
        success: true,
        message: 'Payout approved and processed successfully',
        data: {
          payoutRequest,
          transaction: debitResult.transaction,
          providerPayout: {
            id: providerPayout.id,
            status: providerPayout.status,
            provider: paymentService.getProvider(),
          },
        },
      });
    } catch (providerError) {
      console.error('Payment provider error:', providerError);
      
      // Mark payout as failed
      await payoutRequest.markFailed(providerError.message);
      
      // Mark transaction as failed
      await debitResult.transaction.markFailed(providerError.message);

      return res.status(500).json({
        success: false,
        message: 'Payout approved but payment processing failed. Please retry.',
        error: providerError.message,
      });
    }
  } catch (error) {
    console.error('Approve payout error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to approve payout',
    });
  }
};

/**
 * @route   PUT /api/admin/payouts/:id/reject
 * @desc    Reject payout request
 * @access  Admin
 */
export const rejectPayout = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required',
      });
    }

    const payoutRequest = await PayoutRequest.findById(id);
    
    if (!payoutRequest) {
      return res.status(404).json({
        success: false,
        message: 'Payout request not found',
      });
    }

    if (payoutRequest.status !== 'requested') {
      return res.status(400).json({
        success: false,
        message: `Payout request is already ${payoutRequest.status}`,
      });
    }

    await payoutRequest.reject(req.user._id, reason);

    res.status(200).json({
      success: true,
      message: 'Payout request rejected',
      data: payoutRequest,
    });
  } catch (error) {
    console.error('Reject payout error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to reject payout',
    });
  }
};

export default {
  getAllPayoutRequests,
  approvePayout,
  rejectPayout,
};
