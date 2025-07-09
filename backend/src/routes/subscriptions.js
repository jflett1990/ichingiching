const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const User = require('../models/User');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const router = express.Router();

// Get subscription status and available plans
router.get('/status', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId).select('subscription');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Available subscription plans
    const plans = {
      free: {
        name: 'Free',
        price: 0,
        features: {
          basicInterpretations: true,
          readingHistory: 'limited',
          themes: 'basic',
          claudeRequests: 3,
          exportHistory: false,
          guidedMeditation: false,
          conversationalAI: false,
          patternAnalysis: false
        }
      },
      premium: {
        name: 'Premium',
        price: 9.99,
        billingPeriod: 'month',
        features: {
          basicInterpretations: true,
          readingHistory: 'unlimited',
          themes: 'all',
          claudeRequests: 'unlimited',
          exportHistory: true,
          guidedMeditation: true,
          conversationalAI: true,
          patternAnalysis: true
        }
      },
      unlimited: {
        name: 'Unlimited',
        price: 79.99,
        billingPeriod: 'year',
        features: {
          basicInterpretations: true,
          readingHistory: 'unlimited',
          themes: 'all',
          claudeRequests: 'unlimited',
          exportHistory: true,
          guidedMeditation: true,
          conversationalAI: true,
          patternAnalysis: true,
          priority: true,
          earlyAccess: true
        }
      }
    };

    res.json({
      success: true,
      subscription: {
        current: user.subscription,
        hasPremiumAccess: user.hasPremiumAccess(),
        availablePlans: plans
      }
    });

  } catch (error) {
    console.error('Get subscription status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving subscription status'
    });
  }
});

// Create Stripe checkout session for subscription
router.post('/create-checkout', auth, [
  body('planType').isIn(['premium', 'unlimited']),
  body('successUrl').isURL(),
  body('cancelUrl').isURL()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userId = req.user.userId;
    const { planType, successUrl, cancelUrl } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Define Stripe price IDs (these would be set up in Stripe dashboard)
    const priceIds = {
      premium: process.env.STRIPE_PREMIUM_PRICE_ID || 'price_premium_monthly',
      unlimited: process.env.STRIPE_UNLIMITED_PRICE_ID || 'price_unlimited_yearly'
    };

    const priceId = priceIds[planType];
    if (!priceId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan type'
      });
    }

    // Create or retrieve Stripe customer
    let customerId = user.subscription.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: userId.toString()
        }
      });
      customerId = customer.id;
      user.subscription.stripeCustomerId = customerId;
      await user.save();
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId: userId.toString(),
        planType: planType
      }
    });

    res.json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id
    });

  } catch (error) {
    console.error('Create checkout session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating checkout session'
    });
  }
});

// Handle Stripe webhook events
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;
      
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

// Cancel subscription
router.post('/cancel', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.subscription.stripeSubscriptionId) {
      return res.status(400).json({
        success: false,
        message: 'No active subscription found'
      });
    }

    // Cancel subscription at period end
    await stripe.subscriptions.update(user.subscription.stripeSubscriptionId, {
      cancel_at_period_end: true
    });

    user.subscription.status = 'canceled';
    await user.save();

    res.json({
      success: true,
      message: 'Subscription will be canceled at the end of the current billing period'
    });

  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error canceling subscription'
    });
  }
});

// Reactivate canceled subscription
router.post('/reactivate', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.subscription.stripeSubscriptionId) {
      return res.status(400).json({
        success: false,
        message: 'No subscription found'
      });
    }

    // Reactivate subscription
    await stripe.subscriptions.update(user.subscription.stripeSubscriptionId, {
      cancel_at_period_end: false
    });

    user.subscription.status = 'active';
    await user.save();

    res.json({
      success: true,
      message: 'Subscription reactivated successfully'
    });

  } catch (error) {
    console.error('Reactivate subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error reactivating subscription'
    });
  }
});

// Get billing history
router.get('/billing-history', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (!user || !user.subscription.stripeCustomerId) {
      return res.status(404).json({
        success: false,
        message: 'No billing history found'
      });
    }

    // Get invoices from Stripe
    const invoices = await stripe.invoices.list({
      customer: user.subscription.stripeCustomerId,
      limit: 100
    });

    const billingHistory = invoices.data.map(invoice => ({
      id: invoice.id,
      date: new Date(invoice.created * 1000),
      amount: invoice.total / 100, // Convert from cents
      currency: invoice.currency.toUpperCase(),
      status: invoice.status,
      pdfUrl: invoice.invoice_pdf,
      description: invoice.lines.data[0]?.description || 'Subscription payment'
    }));

    res.json({
      success: true,
      billingHistory
    });

  } catch (error) {
    console.error('Get billing history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving billing history'
    });
  }
});

// Webhook helper functions
async function handleCheckoutCompleted(session) {
  const userId = session.metadata.userId;
  const planType = session.metadata.planType;

  const user = await User.findById(userId);
  if (user) {
    user.subscription.type = planType;
    user.subscription.status = 'active';
    user.subscription.startDate = new Date();
    await user.save();
  }
}

async function handleSubscriptionCreated(subscription) {
  const customer = await stripe.customers.retrieve(subscription.customer);
  const userId = customer.metadata.userId;

  const user = await User.findById(userId);
  if (user) {
    user.subscription.stripeSubscriptionId = subscription.id;
    user.subscription.status = 'active';
    user.subscription.startDate = new Date(subscription.current_period_start * 1000);
    user.subscription.endDate = new Date(subscription.current_period_end * 1000);
    
    // Set features based on subscription
    if (user.subscription.type === 'premium' || user.subscription.type === 'unlimited') {
      user.subscription.features = {
        guidedMeditation: true,
        premiumThemes: true,
        unlimitedReadings: true,
        conversationalAI: true,
        patternAnalysis: true,
        exportHistory: true
      };
    }
    
    await user.save();
  }
}

async function handleSubscriptionUpdated(subscription) {
  const customer = await stripe.customers.retrieve(subscription.customer);
  const userId = customer.metadata.userId;

  const user = await User.findById(userId);
  if (user) {
    user.subscription.status = subscription.status;
    user.subscription.endDate = new Date(subscription.current_period_end * 1000);
    await user.save();
  }
}

async function handleSubscriptionDeleted(subscription) {
  const customer = await stripe.customers.retrieve(subscription.customer);
  const userId = customer.metadata.userId;

  const user = await User.findById(userId);
  if (user) {
    user.subscription.type = 'free';
    user.subscription.status = 'inactive';
    user.subscription.stripeSubscriptionId = null;
    user.subscription.features = {
      guidedMeditation: false,
      premiumThemes: false,
      unlimitedReadings: false,
      conversationalAI: false,
      patternAnalysis: false,
      exportHistory: false
    };
    await user.save();
  }
}

async function handlePaymentSucceeded(invoice) {
  // Handle successful payment - could send confirmation email
  console.log('Payment succeeded for invoice:', invoice.id);
}

async function handlePaymentFailed(invoice) {
  // Handle failed payment - could send notification email
  console.log('Payment failed for invoice:', invoice.id);
}

module.exports = router;