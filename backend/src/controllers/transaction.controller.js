/**
 * Transaction Controller (Phase 7)
 * Handles transaction queries and admin operations
 */

import Transaction from '../models/transaction.model.js';

/**
 * @route   GET /api/transactions/admin/all
 * @desc    Get all transactions (admin only) with filters
 * @access  Admin
 */
export const getAllTransactions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const query = {};

    // Filter by type
    if (req.query.type) {
      query.type = req.query.type;
    }

    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Filter by user ID
    if (req.query.userId) {
      query.userId = req.query.userId;
    }

    // Filter by source
    if (req.query.source) {
      query.source = new RegExp(req.query.source, 'i');
    }

    // Filter by date range
    if (req.query.startDate || req.query.endDate) {
      query.createdAt = {};
      if (req.query.startDate) {
        query.createdAt.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        query.createdAt.$lte = new Date(req.query.endDate);
      }
    }

    const total = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .populate('userId', 'name email wallet')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Calculate summary stats
    const stats = await Transaction.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
        },
      },
    ]);

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
        stats,
      },
    });
  } catch (error) {
    console.error('[TransactionController] Get all transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching transactions',
      error: error.message,
    });
  }
};

/**
 * @route   GET /api/transactions/my
 * @desc    Get user's own transactions
 * @access  Protected
 */
export const getMyTransactions = async (req, res) => {
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
      message: 'Your transactions fetched successfully',
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
    console.error('[TransactionController] Get my transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching your transactions',
      error: error.message,
    });
  }
};

/**
 * @route   GET /api/transactions/:id
 * @desc    Get transaction by ID
 * @access  Protected (own transactions) / Admin (all transactions)
 */
export const getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('userId', 'name email wallet');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
    }

    // Check authorization (user can only view their own transactions, unless admin)
    if (
      req.user.role !== 'admin' &&
      transaction.userId._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You can only view your own transactions',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Transaction fetched successfully',
      data: transaction,
    });
  } catch (error) {
    console.error('[TransactionController] Get transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching transaction',
      error: error.message,
    });
  }
};

export default {
  getAllTransactions,
  getMyTransactions,
  getTransactionById,
};
