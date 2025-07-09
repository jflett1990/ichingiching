import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../components/themes/ThemeProvider';
import { useAppState, usePremiumFeatures } from '../store/AppStateProvider';
import LiquidGlassCard from '../components/ui/LiquidGlassCard';

interface PricingTier {
  id: string;
  name: string;
  price: {
    monthly: number;
    yearly: number;
  };
  badge?: string;
  features: string[];
  highlighted?: boolean;
  description: string;
}

const pricingTiers: PricingTier[] = [
  {
    id: 'free',
    name: 'Free',
    price: { monthly: 0, yearly: 0 },
    description: 'Perfect for occasional seekers',
    features: [
      'Basic question formation',
      'Standard coin toss animation',
      'Core hexagram interpretation',
      'Last 10 readings in history',
      'Basic instructions & guidance',
      'Default liquid glass theme'
    ]
  },
  {
    id: 'premium',
    name: 'Premium',
    price: { monthly: 9.99, yearly: 99.99 },
    badge: 'Most Popular',
    highlighted: true,
    description: 'Enhanced experience for dedicated practitioners',
    features: [
      'All Free features',
      'Guided question formation with meditation',
      'Enhanced coin toss animations',
      'Full reading history with search',
      '5 premium themes (Art Nouveau, Cyberpunk, Pop Art, Zen)',
      'Pattern analysis and insights',
      'Favorites and tagging system',
      'Enhanced Three.js animations',
      'Priority email support'
    ]
  },
  {
    id: 'lifetime',
    name: 'Lifetime',
    price: { monthly: 0, yearly: 299.99 },
    badge: 'Best Value',
    description: 'One-time payment for lifelong wisdom',
    features: [
      'All Premium features',
      'Follow-up conversations with Claude AI',
      'Advanced pattern analysis',
      'Export readings to PDF',
      'Early access to new features',
      'Lifetime updates',
      'Priority support & feature requests',
      'Custom theme creation (coming soon)',
      'Advanced meditation guidance'
    ]
  }
];

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Meditation Teacher",
    content: "The premium themes and guided meditation feature have transformed my daily practice. Worth every penny.",
    avatar: "👩‍🦳"
  },
  {
    name: "Marcus Rodriguez", 
    role: "Life Coach",
    content: "The pattern analysis helps me understand my clients' recurring themes. An invaluable tool for my practice.",
    avatar: "👨‍💼"
  },
  {
    name: "Emma Thompson",
    role: "Spiritual Seeker",
    content: "The AI conversations take readings to a whole new level. It's like having a wise counselor available 24/7.",
    avatar: "👩‍🎨"
  }
];

const PremiumPage: React.FC = () => {
  const { currentTheme } = useTheme();
  const { user, upgradeToMembership, trackEvent } = useAppState();
  const premiumFeatures = usePremiumFeatures();
  const navigate = useNavigate();
  
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [selectedTier, setSelectedTier] = useState<string>('premium');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    trackEvent('premium_page_viewed');
  }, [trackEvent]);

  const handleUpgrade = async (tierId: string) => {
    if (tierId === 'free') return;
    
    setSelectedTier(tierId);
    setIsProcessing(true);
    
    try {
      // Track upgrade attempt
      trackEvent('upgrade_attempted', { 
        tier: tierId, 
        billing_cycle: billingCycle,
        source: 'premium_page'
      });

      // In a real implementation, this would integrate with Stripe
      setShowPaymentModal(true);
      
    } catch (error) {
      console.error('Upgrade failed:', error);
      trackEvent('upgrade_failed', { tier: tierId, error: String(error) });
    } finally {
      setIsProcessing(false);
    }
  };

  const calculateSavings = (tier: PricingTier) => {
    if (tier.price.yearly === 0) return 0;
    const monthlyTotal = tier.price.monthly * 12;
    const savings = monthlyTotal - tier.price.yearly;
    return Math.round((savings / monthlyTotal) * 100);
  };

  if (premiumFeatures.isPremium) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6"
        >
          <LiquidGlassCard className="p-8">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="space-y-6"
            >
              <div className="text-6xl mb-4">✨</div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                You're Already Premium!
              </h1>
              <p className="text-xl opacity-80">
                Thank you for supporting Wisdom Oracle. Enjoy all premium features!
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="p-4 bg-white/5 rounded-lg">
                  <div className="text-2xl mb-2">🎨</div>
                  <h3 className="font-semibold">Premium Themes</h3>
                  <p className="text-sm opacity-70">5 exclusive themes</p>
                  <Link to="/themes" className="text-sm text-blue-400 hover:text-blue-300">
                    Explore Themes →
                  </Link>
                </div>
                
                <div className="p-4 bg-white/5 rounded-lg">
                  <div className="text-2xl mb-2">📊</div>
                  <h3 className="font-semibold">Pattern Analysis</h3>
                  <p className="text-sm opacity-70">Deep insights</p>
                  <Link to="/patterns" className="text-sm text-blue-400 hover:text-blue-300">
                    View Patterns →
                  </Link>
                </div>
                
                <div className="p-4 bg-white/5 rounded-lg">
                  <div className="text-2xl mb-2">💬</div>
                  <h3 className="font-semibold">AI Conversations</h3>
                  <p className="text-sm opacity-70">Follow-up questions</p>
                  <Link to="/conversations" className="text-sm text-blue-400 hover:text-blue-300">
                    Start Conversation →
                  </Link>
                </div>
              </div>

              <div className="flex gap-4 justify-center mt-8">
                <Link to="/divination" className="btn-premium">
                  Start New Reading
                </Link>
                <Link to="/settings" className="btn-secondary">
                  Manage Subscription
                </Link>
              </div>
            </motion.div>
          </LiquidGlassCard>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-yellow-400 bg-clip-text text-transparent">
          Unlock Premium Wisdom
        </h1>
        <p className="text-xl md:text-2xl opacity-80 mb-8 max-w-3xl mx-auto">
          Enhance your I Ching practice with advanced features, premium themes, and AI-powered insights
        </p>
        
        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <span className={billingCycle === 'monthly' ? 'font-semibold' : 'opacity-70'}>Monthly</span>
          <button
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
            className="relative w-16 h-8 bg-white/20 rounded-full transition-colors"
          >
            <motion.div
              animate={{ x: billingCycle === 'yearly' ? 32 : 4 }}
              className="absolute top-1 w-6 h-6 bg-white rounded-full"
            />
          </button>
          <span className={billingCycle === 'yearly' ? 'font-semibold' : 'opacity-70'}>
            Yearly <span className="text-green-400 text-sm">(Save up to 17%)</span>
          </span>
        </div>
      </motion.div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {pricingTiers.map((tier, index) => (
          <motion.div
            key={tier.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative"
          >
            {tier.badge && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-4 py-1 rounded-full text-sm font-semibold">
                  {tier.badge}
                </span>
              </div>
            )}
            
            <LiquidGlassCard 
              className={`p-6 h-full ${
                tier.highlighted 
                  ? 'ring-2 ring-yellow-400/50 bg-gradient-to-br from-yellow-400/10 to-purple-500/10' 
                  : ''
              }`}
            >
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                <p className="text-sm opacity-70 mb-4">{tier.description}</p>
                
                <div className="mb-4">
                  {tier.price.monthly === 0 && tier.price.yearly === 0 ? (
                    <div className="text-4xl font-bold">Free</div>
                  ) : (
                    <>
                      <div className="text-4xl font-bold">
                        ${billingCycle === 'monthly' ? tier.price.monthly : tier.price.yearly}
                      </div>
                      <div className="text-sm opacity-70">
                        {billingCycle === 'monthly' ? '/month' : tier.id === 'lifetime' ? 'one-time' : '/year'}
                      </div>
                      {billingCycle === 'yearly' && tier.id !== 'lifetime' && calculateSavings(tier) > 0 && (
                        <div className="text-sm text-green-400 mt-1">
                          Save {calculateSavings(tier)}%
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {tier.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="text-green-400 mt-1">✓</span>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleUpgrade(tier.id)}
                disabled={isProcessing || tier.id === 'free'}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${
                  tier.id === 'free'
                    ? 'bg-white/10 text-white/50 cursor-not-allowed'
                    : tier.highlighted
                    ? 'btn-premium'
                    : 'btn-secondary hover:btn-premium'
                }`}
              >
                {isProcessing && selectedTier === tier.id ? (
                  <div className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : tier.id === 'free' ? (
                  'Current Plan'
                ) : (
                  `Get ${tier.name}`
                )}
              </button>
            </LiquidGlassCard>
          </motion.div>
        ))}
      </div>

      {/* Feature Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-16"
      >
        <LiquidGlassCard className="p-8">
          <h2 className="text-3xl font-bold text-center mb-8">Feature Comparison</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left py-4 px-2">Feature</th>
                  <th className="text-center py-4 px-2">Free</th>
                  <th className="text-center py-4 px-2">Premium</th>
                  <th className="text-center py-4 px-2">Lifetime</th>
                </tr>
              </thead>
              <tbody className="space-y-2">
                {[
                  { feature: 'Basic Readings', free: true, premium: true, lifetime: true },
                  { feature: 'Reading History', free: '10 readings', premium: 'Unlimited', lifetime: 'Unlimited' },
                  { feature: 'Premium Themes', free: false, premium: true, lifetime: true },
                  { feature: 'Pattern Analysis', free: false, premium: true, lifetime: true },
                  { feature: 'AI Conversations', free: false, premium: false, lifetime: true },
                  { feature: 'Guided Meditation', free: false, premium: true, lifetime: true },
                  { feature: 'Export Readings', free: false, premium: false, lifetime: true },
                  { feature: 'Priority Support', free: false, premium: true, lifetime: true },
                ].map((row, idx) => (
                  <tr key={idx} className="border-b border-white/10">
                    <td className="py-3 px-2 font-medium">{row.feature}</td>
                    <td className="py-3 px-2 text-center">
                      {typeof row.free === 'boolean' ? (
                        row.free ? <span className="text-green-400">✓</span> : <span className="text-red-400">✗</span>
                      ) : (
                        <span className="text-sm">{row.free}</span>
                      )}
                    </td>
                    <td className="py-3 px-2 text-center">
                      {typeof row.premium === 'boolean' ? (
                        row.premium ? <span className="text-green-400">✓</span> : <span className="text-red-400">✗</span>
                      ) : (
                        <span className="text-sm">{row.premium}</span>
                      )}
                    </td>
                    <td className="py-3 px-2 text-center">
                      {typeof row.lifetime === 'boolean' ? (
                        row.lifetime ? <span className="text-green-400">✓</span> : <span className="text-red-400">✗</span>
                      ) : (
                        <span className="text-sm">{row.lifetime}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </LiquidGlassCard>
      </motion.div>

      {/* Testimonials */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mb-16"
      >
        <h2 className="text-3xl font-bold text-center mb-8">What Our Users Say</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
            >
              <LiquidGlassCard className="p-6 h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-2xl">{testimonial.avatar}</div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm opacity-70">{testimonial.role}</div>
                  </div>
                </div>
                <p className="text-sm italic">"{testimonial.content}"</p>
              </LiquidGlassCard>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* FAQ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <LiquidGlassCard className="p-8">
          <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                q: "Can I cancel anytime?",
                a: "Yes, you can cancel your subscription at any time. You'll keep premium access until the end of your billing period."
              },
              {
                q: "What's the difference between Premium and Lifetime?",
                a: "Premium is a subscription with core enhanced features. Lifetime includes all Premium features plus AI conversations, exports, and lifetime updates for a one-time payment."
              },
              {
                q: "Do you offer refunds?",
                a: "Yes, we offer a 30-day money-back guarantee on all purchases. Contact support if you're not satisfied."
              },
              {
                q: "Will new features be added?",
                a: "Yes! We regularly add new themes, features, and improvements. Lifetime users get early access to everything."
              }
            ].map((faq, index) => (
              <div key={index} className="space-y-2">
                <h4 className="font-semibold">{faq.q}</h4>
                <p className="text-sm opacity-80">{faq.a}</p>
              </div>
            ))}
          </div>
        </LiquidGlassCard>
      </motion.div>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <PaymentModal 
            tier={pricingTiers.find(t => t.id === selectedTier)!}
            billingCycle={billingCycle}
            onClose={() => setShowPaymentModal(false)}
            onSuccess={() => {
              setShowPaymentModal(false);
              upgradeToMembership(selectedTier as 'premium' | 'lifetime');
              trackEvent('upgrade_completed', { tier: selectedTier, billing_cycle: billingCycle });
              navigate('/settings');
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Payment Modal Component
const PaymentModal: React.FC<{
  tier: PricingTier;
  billingCycle: 'monthly' | 'yearly';
  onClose: () => void;
  onSuccess: () => void;
}> = ({ tier, billingCycle, onClose, onSuccess }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('card');
  
  const handlePayment = async () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsProcessing(false);
    onSuccess();
  };

  const amount = billingCycle === 'monthly' ? tier.price.monthly : tier.price.yearly;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <LiquidGlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">Complete Purchase</h3>
            <button onClick={onClose} className="text-2xl opacity-70 hover:opacity-100">
              ×
            </button>
          </div>

          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white/5 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Order Summary</h4>
              <div className="flex justify-between">
                <span>{tier.name} Plan</span>
                <span>${amount}</span>
              </div>
              <div className="text-sm opacity-70 mt-1">
                {billingCycle === 'monthly' ? 'Monthly billing' : tier.id === 'lifetime' ? 'One-time payment' : 'Annual billing'}
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <h4 className="font-semibold mb-3">Payment Method</h4>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-lg border transition-colors ${
                    paymentMethod === 'card' 
                      ? 'border-blue-500 bg-blue-500/20' 
                      : 'border-white/20 hover:border-white/40'
                  }`}
                >
                  💳 Card
                </button>
                <button
                  onClick={() => setPaymentMethod('paypal')}
                  className={`p-3 rounded-lg border transition-colors ${
                    paymentMethod === 'paypal' 
                      ? 'border-blue-500 bg-blue-500/20' 
                      : 'border-white/20 hover:border-white/40'
                  }`}
                >
                  🅿️ PayPal
                </button>
              </div>
            </div>

            {/* Demo Payment Form */}
            {paymentMethod === 'card' && (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="p-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="CVC"
                    className="p-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Demo Notice */}
            <div className="bg-yellow-500/20 p-3 rounded-lg border border-yellow-500/40">
              <p className="text-sm">
                <strong>Demo Mode:</strong> This is a demonstration. No actual payment will be processed.
              </p>
            </div>

            {/* Purchase Button */}
            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full btn-premium py-3"
            >
              {isProcessing ? (
                <div className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                `Complete Purchase - $${amount}`
              )}
            </button>

            <p className="text-xs text-center opacity-70">
              By completing this purchase, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </LiquidGlassCard>
      </motion.div>
    </motion.div>
  );
};

export default PremiumPage;