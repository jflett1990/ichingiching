import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTheme } from '../themes/ThemeProvider';
import { useAppState, usePremiumFeatures } from '../../store/AppStateProvider';
import LiquidGlassCard from '../ui/LiquidGlassCard';

interface SubscriptionUsage {
  readingsThisMonth: number;
  conversationsThisMonth: number;
  themesUnlocked: number;
  patternsGenerated: number;
  exportCount: number;
}

const PremiumSubscriptionManager: React.FC = () => {
  const { currentTheme } = useTheme();
  const { user, updateUserPreferences, trackEvent } = useAppState();
  const premiumFeatures = usePremiumFeatures();
  
  const [usage, setUsage] = useState<SubscriptionUsage>({
    readingsThisMonth: 0,
    conversationsThisMonth: 0,
    themesUnlocked: 0,
    patternsGenerated: 0,
    exportCount: 0
  });
  
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showUpdatePaymentModal, setShowUpdatePaymentModal] = useState(false);

  useEffect(() => {
    // Calculate usage from user data
    if (user) {
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      // In a real app, this would come from backend analytics
      setUsage({
        readingsThisMonth: user.stats?.totalReadings || 0,
        conversationsThisMonth: user.stats?.followUpConversations || 0,
        themesUnlocked: 5, // Premium users get all 5 themes
        patternsGenerated: Math.floor((user.stats?.totalReadings || 0) / 5),
        exportCount: 0 // Would track actual exports
      });
    }
  }, [user]);

  const handleCancelSubscription = async () => {
    try {
      trackEvent('subscription_cancel_attempt');
      // In real implementation, this would call API to cancel subscription
      console.log('Cancellation request sent');
      setShowCancelModal(false);
    } catch (error) {
      console.error('Cancellation failed:', error);
    }
  };

  const handleUpdatePayment = async () => {
    try {
      trackEvent('payment_update_attempt');
      // In real implementation, this would open Stripe billing portal
      console.log('Payment update initiated');
      setShowUpdatePaymentModal(false);
    } catch (error) {
      console.error('Payment update failed:', error);
    }
  };

  if (!premiumFeatures.isPremium) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <LiquidGlassCard className="p-6 text-center">
          <div className="text-4xl mb-4">✨</div>
          <h3 className="text-xl font-semibold mb-3">Upgrade to Premium</h3>
          <p className="opacity-80 mb-6">
            Unlock advanced features, premium themes, and unlimited possibilities
          </p>
          <Link to="/premium" className="btn-premium">
            View Premium Plans
          </Link>
        </LiquidGlassCard>
      </motion.div>
    );
  }

  const subscriptionExpiry = user?.subscriptionExpiry ? new Date(user.subscriptionExpiry) : null;
  const daysUntilExpiry = subscriptionExpiry ? 
    Math.ceil((subscriptionExpiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Subscription Status */}
      <LiquidGlassCard className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold mb-2 text-yellow-400">
              ✨ Premium Active
            </h3>
            <p className="opacity-80">
              {user?.subscriptionTier === 'lifetime' 
                ? 'Lifetime Access - Never Expires' 
                : `${user?.subscriptionTier || 'Premium'} Plan`
              }
            </p>
            {subscriptionExpiry && (
              <p className="text-sm opacity-70 mt-1">
                {daysUntilExpiry && daysUntilExpiry > 0 
                  ? `${daysUntilExpiry} days remaining`
                  : 'Expires soon - please renew'
                }
              </p>
            )}
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-yellow-400">
              {user?.subscriptionTier === 'lifetime' ? '∞' : 'ACTIVE'}
            </div>
            {subscriptionExpiry && (
              <div className="text-sm opacity-70">
                Until {subscriptionExpiry.toLocaleDateString()}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link to="/themes" className="btn-secondary text-center">
            🎨 Explore Themes
          </Link>
          <Link to="/patterns" className="btn-secondary text-center">
            📊 View Patterns
          </Link>
        </div>
      </LiquidGlassCard>

      {/* Usage Analytics */}
      <LiquidGlassCard className="p-6">
        <h3 className="text-xl font-semibold mb-6">Usage This Month</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400 mb-1">
              {usage.readingsThisMonth}
            </div>
            <div className="text-sm opacity-70">Readings</div>
            <div className="text-xs text-green-400 mt-1">Unlimited</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400 mb-1">
              {usage.themesUnlocked}
            </div>
            <div className="text-sm opacity-70">Themes</div>
            <div className="text-xs text-green-400 mt-1">All Unlocked</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-1">
              {usage.patternsGenerated}
            </div>
            <div className="text-sm opacity-70">Patterns</div>
            <div className="text-xs text-green-400 mt-1">Advanced</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-400 mb-1">
              {user?.subscriptionTier === 'lifetime' ? usage.conversationsThisMonth : '—'}
            </div>
            <div className="text-sm opacity-70">AI Chats</div>
            <div className="text-xs text-green-400 mt-1">
              {user?.subscriptionTier === 'lifetime' ? 'Unlimited' : 'Lifetime Only'}
            </div>
          </div>
        </div>
      </LiquidGlassCard>

      {/* Premium Features Status */}
      <LiquidGlassCard className="p-6">
        <h3 className="text-xl font-semibold mb-6">Premium Features</h3>
        
        <div className="space-y-4">
          {[
            { name: 'Premium Themes', available: true, description: '5 exclusive themes unlocked' },
            { name: 'Unlimited Readings', available: true, description: 'No limits on daily readings' },
            { name: 'Pattern Analysis', available: true, description: 'Deep insights into your readings' },
            { name: 'Enhanced Animations', available: true, description: 'Advanced Three.js effects' },
            { name: 'Priority Support', available: true, description: 'Fast email response' },
            { 
              name: 'AI Conversations', 
              available: user?.subscriptionTier === 'lifetime', 
              description: user?.subscriptionTier === 'lifetime' ? 'Follow-up questions with Claude AI' : 'Available with Lifetime plan'
            },
            { 
              name: 'Export Readings', 
              available: user?.subscriptionTier === 'lifetime', 
              description: user?.subscriptionTier === 'lifetime' ? 'Save readings as PDF' : 'Available with Lifetime plan'
            },
            { 
              name: 'Early Access', 
              available: user?.subscriptionTier === 'lifetime', 
              description: user?.subscriptionTier === 'lifetime' ? 'First access to new features' : 'Available with Lifetime plan'
            }
          ].map((feature, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
              <div className="flex items-center gap-3">
                <span className={feature.available ? 'text-green-400' : 'text-gray-400'}>
                  {feature.available ? '✓' : '○'}
                </span>
                <div>
                  <div className="font-medium">{feature.name}</div>
                  <div className="text-sm opacity-70">{feature.description}</div>
                </div>
              </div>
              {!feature.available && (
                <Link to="/premium" className="text-sm text-blue-400 hover:text-blue-300">
                  Upgrade
                </Link>
              )}
            </div>
          ))}
        </div>
      </LiquidGlassCard>

      {/* Account Management */}
      {user?.subscriptionTier !== 'lifetime' && (
        <LiquidGlassCard className="p-6">
          <h3 className="text-xl font-semibold mb-6">Manage Subscription</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
              <div>
                <div className="font-medium">Update Payment Method</div>
                <div className="text-sm opacity-70">Change your billing information</div>
              </div>
              <button
                onClick={() => setShowUpdatePaymentModal(true)}
                className="btn-secondary"
              >
                Update
              </button>
            </div>
            
            <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
              <div>
                <div className="font-medium">View Billing History</div>
                <div className="text-sm opacity-70">Download invoices and receipts</div>
              </div>
              <button
                onClick={() => trackEvent('billing_history_viewed')}
                className="btn-secondary"
              >
                View
              </button>
            </div>
            
            <div className="flex items-center justify-between p-4 rounded-lg bg-red-500/10 border border-red-500/20">
              <div>
                <div className="font-medium text-red-400">Cancel Subscription</div>
                <div className="text-sm opacity-70">You'll keep access until your billing period ends</div>
              </div>
              <button
                onClick={() => setShowCancelModal(true)}
                className="px-4 py-2 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </LiquidGlassCard>
      )}

      {/* Upgrade to Lifetime CTA */}
      {user?.subscriptionTier === 'premium' && (
        <LiquidGlassCard className="p-6 bg-gradient-to-br from-yellow-400/10 to-purple-500/10 border-yellow-400/30">
          <div className="text-center">
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="text-xl font-semibold mb-3">Upgrade to Lifetime</h3>
            <p className="opacity-80 mb-6">
              Get AI conversations, exports, and never pay again. One-time payment of $299.99
            </p>
            <Link to="/premium" className="btn-premium">
              Upgrade to Lifetime
            </Link>
          </div>
        </LiquidGlassCard>
      )}

      {/* Modals */}
      {showCancelModal && (
        <CancelSubscriptionModal 
          onClose={() => setShowCancelModal(false)}
          onConfirm={handleCancelSubscription}
          subscriptionTier={user?.subscriptionTier}
        />
      )}
      
      {showUpdatePaymentModal && (
        <UpdatePaymentModal 
          onClose={() => setShowUpdatePaymentModal(false)}
          onConfirm={handleUpdatePayment}
        />
      )}
    </motion.div>
  );
};

// Cancel Subscription Modal
const CancelSubscriptionModal: React.FC<{
  onClose: () => void;
  onConfirm: () => void;
  subscriptionTier?: string;
}> = ({ onClose, onConfirm, subscriptionTier }) => (
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
        <h3 className="text-xl font-bold mb-4">Cancel Subscription?</h3>
        
        <div className="space-y-4 mb-6">
          <p className="opacity-80">
            Are you sure you want to cancel your {subscriptionTier} subscription?
          </p>
          
          <div className="bg-yellow-500/20 p-3 rounded-lg border border-yellow-500/40">
            <p className="text-sm">
              <strong>What happens next:</strong>
            </p>
            <ul className="text-sm mt-2 space-y-1 opacity-80">
              <li>• You'll keep premium access until your billing period ends</li>
              <li>• No more charges will be made</li>
              <li>• You can reactivate anytime before expiration</li>
            </ul>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 btn-secondary"
          >
            Keep Subscription
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-colors"
          >
            Cancel Subscription
          </button>
        </div>
      </LiquidGlassCard>
    </motion.div>
  </motion.div>
);

// Update Payment Modal
const UpdatePaymentModal: React.FC<{
  onClose: () => void;
  onConfirm: () => void;
}> = ({ onClose, onConfirm }) => (
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
        <h3 className="text-xl font-bold mb-4">Update Payment Method</h3>
        
        <div className="space-y-4 mb-6">
          <p className="opacity-80">
            You'll be redirected to our secure billing portal to update your payment information.
          </p>
          
          <div className="bg-blue-500/20 p-3 rounded-lg border border-blue-500/40">
            <p className="text-sm">
              <strong>Secure & Safe:</strong> All payment processing is handled by Stripe, 
              the industry standard for secure online payments.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 btn-premium"
          >
            Open Billing Portal
          </button>
        </div>
      </LiquidGlassCard>
    </motion.div>
  </motion.div>
);

export default PremiumSubscriptionManager;