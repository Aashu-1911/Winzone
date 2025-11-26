import mongoose from 'mongoose';

/**
 * PayoutRequest Schema for Withdrawal System (Phase 7)
 * Players request withdrawals, admins approve/reject
 */
const payoutRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [100, 'Minimum payout amount is 100'],
    },
    currency: {
      type: String,
      default: 'INR',
      enum: ['INR', 'USD'],
    },
    method: {
      type: {
        type: String,
        enum: ['bank', 'upi', 'stripe'],
        required: true,
      },
      details: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
        // For bank: { accountNumber, ifsc, accountHolderName, bankName }
        // For UPI: { upiId, name }
        // For Stripe: { stripeAccountId }
      },
    },
    status: {
      type: String,
      enum: ['requested', 'approved', 'rejected', 'paid', 'failed'],
      default: 'requested',
      index: true,
    },
    adminNote: {
      type: String,
      default: '',
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      // Admin who approved/rejected
    },
    processedAt: {
      type: Date,
    },
    // Reference to transaction created when payout is processed
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
    },
    // Payment provider reference (Stripe payout ID, etc.)
    providerPayoutId: {
      type: String,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
payoutRequestSchema.index({ userId: 1, createdAt: -1 });
payoutRequestSchema.index({ status: 1 });

/**
 * Instance method: Approve payout request
 */
payoutRequestSchema.methods.approve = async function(adminId, note = '') {
  this.status = 'approved';
  this.adminNote = note;
  this.processedBy = adminId;
  this.processedAt = new Date();
  await this.save();
  return this;
};

/**
 * Instance method: Reject payout request
 */
payoutRequestSchema.methods.reject = async function(adminId, reason) {
  this.status = 'rejected';
  this.adminNote = reason;
  this.processedBy = adminId;
  this.processedAt = new Date();
  await this.save();
  return this;
};

/**
 * Instance method: Mark as paid
 */
payoutRequestSchema.methods.markPaid = async function(transactionId, providerPayoutId = null) {
  this.status = 'paid';
  this.transactionId = transactionId;
  if (providerPayoutId) {
    this.providerPayoutId = providerPayoutId;
  }
  await this.save();
  return this;
};

/**
 * Instance method: Mark as failed
 */
payoutRequestSchema.methods.markFailed = async function(errorReason) {
  this.status = 'failed';
  this.metadata.errorReason = errorReason;
  await this.save();
  return this;
};

const PayoutRequest = mongoose.model('PayoutRequest', payoutRequestSchema);

export default PayoutRequest;
