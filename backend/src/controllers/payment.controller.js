/**
 * Payment Controller (Phase 7)
 * Handles payment webhooks from Stripe or mock provider
 */

import paymentService from '../services/payment.service.js';
import { creditWallet } from '../services/wallet.service.js';
import Transaction from '../models/transaction.model.js';

/**
 * @route   POST /api/payments/webhook
 * @desc    Handle payment provider webhooks (Stripe, etc.)
 * @access  Public (verified by signature)
 */
export const handleWebhook = async (req, res) => {
  try {
    // Get raw body and signature
    const signature = req.headers['stripe-signature'] || req.headers['x-webhook-signature'];
    const payload = req.body;

    // Verify webhook signature
    const isValid = paymentService.verifyWebhook(payload, signature);
    
    if (!isValid && paymentService.getProvider() === 'stripe') {
      console.error('[PaymentWebhook] Invalid webhook signature');
      return res.status(400).json({
        success: false,
        message: 'Invalid webhook signature',
      });
    }

    // Construct event
    const event = paymentService.constructWebhookEvent(payload, signature);

    console.log(`[PaymentWebhook] Received event: ${event.type}`);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;

      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object);
        break;

      case 'payout.paid':
        await handlePayoutPaid(event.data.object);
        break;

      case 'payout.failed':
        await handlePayoutFailed(event.data.object);
        break;

      default:
        console.log(`[PaymentWebhook] Unhandled event type: ${event.type}`);
    }

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Webhook processed successfully',
    });
  } catch (error) {
    console.error('[PaymentWebhook] Webhook handler error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing webhook',
      error: error.message,
    });
  }
};

/**
 * Handle checkout.session.completed event
 * Credit user wallet after successful checkout
 */
const handleCheckoutSessionCompleted = async (session) => {
  try {
    console.log('[PaymentWebhook] Processing checkout.session.completed:', session.id);

    // Extract metadata
    const userId = session.client_reference_id || session.metadata?.userId;
    const amount = session.amount_total / 100; // Convert from cents/paise
    const currency = session.currency.toUpperCase();

    if (!userId) {
      console.error('[PaymentWebhook] No user ID in session metadata');
      return;
    }

    // Credit wallet with idempotency
    const idempotencyKey = `topup_${session.id}`;
    const result = await creditWallet({
      userId,
      amount,
      type: 'topup',
      source: `checkout:${session.id}`,
      description: 'Wallet top-up via webhook',
      metadata: {
        sessionId: session.id,
        provider: 'stripe',
        paymentStatus: session.payment_status,
      },
      idempotencyKey,
    });

    if (result.duplicate) {
      console.log('[PaymentWebhook] Duplicate checkout session, skipped:', session.id);
    } else {
      console.log(`[PaymentWebhook] Wallet credited: ${amount} ${currency} for user ${userId}`);
    }
  } catch (error) {
    console.error('[PaymentWebhook] Error handling checkout.session.completed:', error);
    throw error;
  }
};

/**
 * Handle payment_intent.succeeded event
 */
const handlePaymentIntentSucceeded = async (paymentIntent) => {
  try {
    console.log('[PaymentWebhook] Processing payment_intent.succeeded:', paymentIntent.id);

    // Check if this payment intent is related to a transaction
    const transaction = await Transaction.findOne({
      'metadata.paymentIntentId': paymentIntent.id,
    });

    if (transaction && transaction.status === 'pending') {
      transaction.status = 'completed';
      transaction.metadata.paymentStatus = 'succeeded';
      await transaction.save();
      console.log('[PaymentWebhook] Transaction marked as completed:', transaction._id);
    }
  } catch (error) {
    console.error('[PaymentWebhook] Error handling payment_intent.succeeded:', error);
    throw error;
  }
};

/**
 * Handle payment_intent.payment_failed event
 */
const handlePaymentIntentFailed = async (paymentIntent) => {
  try {
    console.log('[PaymentWebhook] Processing payment_intent.payment_failed:', paymentIntent.id);

    // Check if this payment intent is related to a transaction
    const transaction = await Transaction.findOne({
      'metadata.paymentIntentId': paymentIntent.id,
    });

    if (transaction && transaction.status === 'pending') {
      await transaction.markFailed('Payment intent failed');
      console.log('[PaymentWebhook] Transaction marked as failed:', transaction._id);
    }
  } catch (error) {
    console.error('[PaymentWebhook] Error handling payment_intent.payment_failed:', error);
    throw error;
  }
};

/**
 * Handle payout.paid event
 */
const handlePayoutPaid = async (payout) => {
  try {
    console.log('[PaymentWebhook] Processing payout.paid:', payout.id);

    // Find transaction by provider payout ID
    const transaction = await Transaction.findOne({
      'metadata.providerPayoutId': payout.id,
    });

    if (transaction && transaction.status === 'pending') {
      transaction.status = 'completed';
      transaction.metadata.payoutStatus = 'paid';
      await transaction.save();
      console.log('[PaymentWebhook] Payout transaction marked as completed:', transaction._id);
    }
  } catch (error) {
    console.error('[PaymentWebhook] Error handling payout.paid:', error);
    throw error;
  }
};

/**
 * Handle payout.failed event
 */
const handlePayoutFailed = async (payout) => {
  try {
    console.log('[PaymentWebhook] Processing payout.failed:', payout.id);

    // Find transaction by provider payout ID
    const transaction = await Transaction.findOne({
      'metadata.providerPayoutId': payout.id,
    });

    if (transaction && transaction.status === 'pending') {
      await transaction.markFailed('Payout failed at provider');
      console.log('[PaymentWebhook] Payout transaction marked as failed:', transaction._id);
    }
  } catch (error) {
    console.error('[PaymentWebhook] Error handling payout.failed:', error);
    throw error;
  }
};

export default {
  handleWebhook,
};
