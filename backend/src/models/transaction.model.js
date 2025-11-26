import mongoose from 'mongoose';

/**
 * Transaction Schema for Wallet System (Phase 7)
 * Tracks all monetary transactions: credits, debits, rewards, payouts
 */
const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    type: {
      type: String,
      enum: ['credit', 'debit', 'reward', 'entryFee', 'payout', 'refund', 'topup', 'organizerFee', 'platformFee'],
      required: [true, 'Transaction type is required'],
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount must be positive'],
    },
    currency: {
      type: String,
      default: 'INR',
      enum: ['INR', 'USD'],
    },
    source: {
      type: String,
      required: [true, 'Transaction source is required'],
      // Examples: "match:matchId", "competition:competitionId", "admin", "stripe:paymentId", "topup:checkoutId"
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'cancelled'],
      default: 'pending',
      index: true,
    },
    description: {
      type: String,
      default: '',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
      // Can store: { matchId, competitionId, paymentIntentId, payoutId, rank, etc. }
    },
    // For idempotency: prevent duplicate payouts/rewards
    idempotencyKey: {
      type: String,
      unique: true,
      sparse: true, // Allows null values while enforcing uniqueness for non-null
      index: true,
    },
    // Balance snapshot after this transaction
    balanceAfter: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// Indexes for efficient queries
transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ type: 1, status: 1 });
transactionSchema.index({ source: 1 });

/**
 * Static method: Create transaction with idempotency check
 */
transactionSchema.statics.createIdempotent = async function(transactionData) {
  const { idempotencyKey } = transactionData;
  
  if (idempotencyKey) {
    // Check if transaction already exists
    const existing = await this.findOne({ idempotencyKey });
    if (existing) {
      console.log(`Transaction with idempotency key ${idempotencyKey} already exists`);
      return existing;
    }
  }
  
  return await this.create(transactionData);
};

/**
 * Instance method: Mark transaction as completed
 */
transactionSchema.methods.markCompleted = async function(balanceAfter) {
  this.status = 'completed';
  this.balanceAfter = balanceAfter;
  await this.save();
  return this;
};

/**
 * Instance method: Mark transaction as failed
 */
transactionSchema.methods.markFailed = async function(errorReason) {
  this.status = 'failed';
  if (errorReason) {
    this.metadata.errorReason = errorReason;
  }
  await this.save();
  return this;
};

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
