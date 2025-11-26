/**
 * Wallet Service (Phase 7)
 * Handles wallet operations with MongoDB transactions for atomicity
 */

import mongoose from 'mongoose';
import User from '../models/user.model.js';
import Transaction from '../models/transaction.model.js';

/**
 * Credit user wallet (add funds)
 * Uses MongoDB transaction to ensure atomicity
 */
export const creditWallet = async ({ 
  userId, 
  amount, 
  type = 'credit', 
  source, 
  description = '', 
  metadata = {},
  idempotencyKey = null,
  session = null 
}) => {
  const useExternalSession = !!session;
  const mongoSession = session || await mongoose.startSession();
  
  try {
    if (!useExternalSession) {
      mongoSession.startTransaction();
    }

    // Check for existing transaction with same idempotency key
    if (idempotencyKey) {
      const existing = await Transaction.findOne({ idempotencyKey }).session(mongoSession);
      if (existing) {
        console.log(`[WalletService] Transaction with idempotency key ${idempotencyKey} already exists`);
        if (!useExternalSession) {
          await mongoSession.abortTransaction();
        }
        return { transaction: existing, duplicate: true };
      }
    }

    // Get user and update wallet balance
    const user = await User.findById(userId).session(mongoSession);
    if (!user) {
      throw new Error('User not found');
    }

    const previousBalance = user.wallet.balance;
    const newBalance = previousBalance + amount;

    // Create transaction record
    const transaction = await Transaction.create(
      [{
        userId,
        type,
        amount,
        currency: user.wallet.currency,
        source,
        status: 'completed',
        description,
        metadata,
        balanceAfter: newBalance,
        idempotencyKey,
      }],
      { session: mongoSession }
    );

    // Update user wallet
    user.wallet.balance = newBalance;
    user.wallet.transactions.push(transaction[0]._id);
    
    // If it's a reward, update totalEarnings
    if (type === 'reward') {
      user.stats.totalEarnings = (user.stats.totalEarnings || 0) + amount;
    }
    
    await user.save({ session: mongoSession });

    if (!useExternalSession) {
      await mongoSession.commitTransaction();
    }

    console.log(`[WalletService] Credited ${amount} to user ${userId}. New balance: ${newBalance}`);
    
    return { transaction: transaction[0], user, duplicate: false };
  } catch (error) {
    if (!useExternalSession) {
      await mongoSession.abortTransaction();
    }
    console.error('[WalletService] Credit wallet error:', error);
    throw error;
  } finally {
    if (!useExternalSession) {
      mongoSession.endSession();
    }
  }
};

/**
 * Debit user wallet (deduct funds)
 * Uses MongoDB transaction to ensure atomicity
 */
export const debitWallet = async ({ 
  userId, 
  amount, 
  type = 'debit', 
  source, 
  description = '', 
  metadata = {},
  idempotencyKey = null,
  session = null 
}) => {
  const useExternalSession = !!session;
  const mongoSession = session || await mongoose.startSession();
  
  try {
    if (!useExternalSession) {
      mongoSession.startTransaction();
    }

    // Check for existing transaction
    if (idempotencyKey) {
      const existing = await Transaction.findOne({ idempotencyKey }).session(mongoSession);
      if (existing) {
        console.log(`[WalletService] Transaction with idempotency key ${idempotencyKey} already exists`);
        if (!useExternalSession) {
          await mongoSession.abortTransaction();
        }
        return { transaction: existing, duplicate: true };
      }
    }

    // Get user and check balance
    const user = await User.findById(userId).session(mongoSession);
    if (!user) {
      throw new Error('User not found');
    }

    const previousBalance = user.wallet.balance;
    if (previousBalance < amount) {
      throw new Error('Insufficient wallet balance');
    }

    const newBalance = previousBalance - amount;

    // Create transaction record
    const transaction = await Transaction.create(
      [{
        userId,
        type,
        amount,
        currency: user.wallet.currency,
        source,
        status: 'completed',
        description,
        metadata,
        balanceAfter: newBalance,
        idempotencyKey,
      }],
      { session: mongoSession }
    );

    // Update user wallet
    user.wallet.balance = newBalance;
    user.wallet.transactions.push(transaction[0]._id);
    await user.save({ session: mongoSession });

    if (!useExternalSession) {
      await mongoSession.commitTransaction();
    }

    console.log(`[WalletService] Debited ${amount} from user ${userId}. New balance: ${newBalance}`);
    
    return { transaction: transaction[0], user, duplicate: false };
  } catch (error) {
    if (!useExternalSession) {
      await mongoSession.abortTransaction();
    }
    console.error('[WalletService] Debit wallet error:', error);
    throw error;
  } finally {
    if (!useExternalSession) {
      mongoSession.endSession();
    }
  }
};

/**
 * Get wallet balance and recent transactions
 */
export const getWallet = async (userId, limit = 10) => {
  const user = await User.findById(userId)
    .select('wallet stats')
    .populate({
      path: 'wallet.transactions',
      options: { 
        sort: { createdAt: -1 },
        limit 
      }
    });

  if (!user) {
    throw new Error('User not found');
  }

  return {
    balance: user.wallet.balance,
    currency: user.wallet.currency,
    totalEarnings: user.stats.totalEarnings || 0,
    recentTransactions: user.wallet.transactions,
  };
};

/**
 * Transfer funds between users (for future features)
 */
export const transferFunds = async ({ fromUserId, toUserId, amount, source, metadata = {} }) => {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();

    // Debit from sender
    await debitWallet({
      userId: fromUserId,
      amount,
      type: 'debit',
      source,
      description: `Transfer to user ${toUserId}`,
      metadata: { toUserId, ...metadata },
      session,
    });

    // Credit to receiver
    await creditWallet({
      userId: toUserId,
      amount,
      type: 'credit',
      source,
      description: `Transfer from user ${fromUserId}`,
      metadata: { fromUserId, ...metadata },
      session,
    });

    await session.commitTransaction();
    
    console.log(`[WalletService] Transferred ${amount} from ${fromUserId} to ${toUserId}`);
    
    return { success: true };
  } catch (error) {
    await session.abortTransaction();
    console.error('[WalletService] Transfer error:', error);
    throw error;
  } finally {
    session.endSession();
  }
};

export default {
  creditWallet,
  debitWallet,
  getWallet,
  transferFunds,
};
