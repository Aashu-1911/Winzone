/**
 * Payment Service Abstraction Layer (Phase 7)
 * Supports mock (development) and Stripe (production) providers
 * 
 * To switch providers, set PAYMENT_PROVIDER env var:
 * - "mock" for development testing
 * - "stripe" for production
 */

import Stripe from 'stripe';

// Initialize Stripe with secret key
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

/**
 * Mock Payment Adapter (for development/testing)
 */
class MockPaymentAdapter {
  constructor() {
    this.provider = 'mock';
  }

  /**
   * Create checkout session for top-up
   */
  async createCheckoutSession({ amount, currency, userId, successUrl, cancelUrl }) {
    console.log('[MOCK] Creating checkout session:', { amount, currency, userId });
    
    // Simulate Stripe checkout session
    const mockSession = {
      id: `mock_session_${Date.now()}`,
      url: `${successUrl}?session_id=mock_session_${Date.now()}&mock=true`,
      amount,
      currency,
      status: 'open',
    };
    
    return mockSession;
  }

  /**
   * Verify checkout session (called from webhook or success page)
   */
  async verifyCheckoutSession(sessionId) {
    console.log('[MOCK] Verifying checkout session:', sessionId);
    
    if (sessionId.startsWith('mock_session_')) {
      return {
        id: sessionId,
        payment_status: 'paid',
        amount_total: 100000, // 1000.00 in smallest currency unit (paise/cents)
        currency: 'inr',
        metadata: {},
      };
    }
    
    throw new Error('Invalid mock session ID');
  }

  /**
   * Create payout to recipient
   */
  async createPayout({ amount, currency, destination, metadata }) {
    console.log('[MOCK] Creating payout:', { amount, currency, destination, metadata });
    
    // Simulate successful payout
    const mockPayout = {
      id: `mock_payout_${Date.now()}`,
      amount,
      currency,
      status: 'paid',
      destination,
      arrival_date: Math.floor(Date.now() / 1000) + 86400, // Tomorrow
    };
    
    // Simulate async payout (would normally take time)
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return mockPayout;
  }

  /**
   * Verify webhook signature (mock always returns true)
   */
  verifyWebhookSignature(payload, signature, secret) {
    console.log('[MOCK] Verifying webhook signature (auto-approved)');
    return true;
  }

  /**
   * Construct webhook event
   */
  constructWebhookEvent(payload, signature, secret) {
    console.log('[MOCK] Constructing webhook event');
    
    // Parse mock event
    try {
      const event = JSON.parse(payload);
      return event;
    } catch (err) {
      throw new Error('Invalid mock webhook payload');
    }
  }
}

/**
 * Stripe Payment Adapter (for production)
 */
class StripePaymentAdapter {
  constructor() {
    if (!stripe) {
      throw new Error('Stripe is not initialized. Set STRIPE_SECRET_KEY in environment variables.');
    }
    this.provider = 'stripe';
    this.stripe = stripe;
  }

  /**
   * Create Stripe Checkout Session
   */
  async createCheckoutSession({ amount, currency, userId, successUrl, cancelUrl, metadata = {} }) {
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: 'Wallet Top-up',
              description: 'Add funds to your WinZone wallet',
            },
            unit_amount: amount, // Amount in smallest currency unit (paise/cents)
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: userId,
      metadata: {
        userId,
        type: 'wallet_topup',
        ...metadata,
      },
    });

    return session;
  }

  /**
   * Retrieve and verify checkout session
   */
  async verifyCheckoutSession(sessionId) {
    const session = await this.stripe.checkout.sessions.retrieve(sessionId);
    return session;
  }

  /**
   * Create payout (requires Stripe Connect)
   */
  async createPayout({ amount, currency, destination, metadata = {} }) {
    const payout = await this.stripe.payouts.create({
      amount,
      currency: currency.toLowerCase(),
      destination, // Connected account ID or bank account
      metadata,
    });

    return payout;
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload, signature, secret) {
    try {
      const event = this.stripe.webhooks.constructEvent(payload, signature, secret);
      return true;
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return false;
    }
  }

  /**
   * Construct webhook event
   */
  constructWebhookEvent(payload, signature, secret) {
    const event = this.stripe.webhooks.constructEvent(payload, signature, secret);
    return event;
  }
}

/**
 * Payment Service Factory
 * Returns the appropriate adapter based on PAYMENT_PROVIDER env var
 */
class PaymentService {
  constructor() {
    const provider = process.env.PAYMENT_PROVIDER || 'mock';
    
    if (provider === 'stripe') {
      this.adapter = new StripePaymentAdapter();
    } else {
      this.adapter = new MockPaymentAdapter();
    }
    
    console.log(`[PaymentService] Initialized with ${this.adapter.provider} provider`);
  }

  /**
   * Create checkout session for wallet top-up
   */
  async createTopUpSession({ amount, currency = 'INR', userId, successUrl, cancelUrl, metadata = {} }) {
    return await this.adapter.createCheckoutSession({
      amount,
      currency,
      userId,
      successUrl,
      cancelUrl,
      metadata,
    });
  }

  /**
   * Verify payment session
   */
  async verifySession(sessionId) {
    return await this.adapter.verifyCheckoutSession(sessionId);
  }

  /**
   * Process payout to user
   */
  async processPayout({ amount, currency = 'INR', destination, metadata = {} }) {
    return await this.adapter.createPayout({
      amount,
      currency,
      destination,
      metadata,
    });
  }

  /**
   * Verify webhook signature
   */
  verifyWebhook(payload, signature) {
    const secret = process.env.STRIPE_WEBHOOK_SECRET || 'mock_webhook_secret';
    return this.adapter.verifyWebhookSignature(payload, signature, secret);
  }

  /**
   * Construct webhook event from payload
   */
  constructWebhookEvent(payload, signature) {
    const secret = process.env.STRIPE_WEBHOOK_SECRET || 'mock_webhook_secret';
    return this.adapter.constructWebhookEvent(payload, signature, secret);
  }

  /**
   * Get provider name
   */
  getProvider() {
    return this.adapter.provider;
  }
}

// Export singleton instance
const paymentService = new PaymentService();

export default paymentService;
