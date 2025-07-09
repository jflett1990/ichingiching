import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTheme } from '../themes/ThemeProvider';
import { useAppState } from '../../store/AppStateProvider';
import LiquidGlassCard from '../ui/LiquidGlassCard';

interface OnboardingStep {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  image?: string;
  ctaText: string;
  ctaAction: () => void;
}

const PremiumOnboarding: React.FC<{
  onClose: () => void;
  onUpgrade: (tier: string) => void;
}> = ({ onClose, onUpgrade }) => {
  const { currentTheme } = useTheme();
  const { trackEvent } = useAppState();
  
  const [currentStep, setCurrentStep] = useState(0);

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Premium',
      subtitle: 'Unlock the Full Potential',
      description: 'Discover how premium features can transform your I Ching practice with advanced themes, unlimited readings, and AI-powered insights.',
      features: [
        'Unlimited readings with no daily limits',
        '5 stunning premium themes',
        'Advanced pattern analysis',
        'Priority support'
      ],
      ctaText: 'Explore Features',
      ctaAction: () => nextStep()
    },
    {
      id: 'themes',
      title: 'Premium Themes',
      subtitle: 'Express Your Style',
      description: 'Choose from 5 carefully crafted themes including Art Nouveau, Cyberpunk, Pop Art, and Traditional Zen to match your aesthetic.',
      features: [
        'Art Nouveau - Elegant organic patterns',
        'Cyberpunk - Futuristic neon aesthetics',
        'Pop Art - Bold and vibrant colors',
        'Traditional Zen - Minimalist serenity',
        'Custom theme creation (coming soon)'
      ],
      ctaText: 'See Themes',
      ctaAction: () => nextStep()
    },
    {
      id: 'analytics',
      title: 'Pattern Analysis',
      subtitle: 'Deeper Understanding',
      description: 'Gain insights into your reading patterns, discover recurring themes, and understand your spiritual journey through advanced analytics.',
      features: [
        'Hexagram frequency analysis',
        'Time pattern recognition',
        'Question theme categorization',
        'Personal growth tracking',
        'Exportable insights'
      ],
      ctaText: 'Learn More',
      ctaAction: () => nextStep()
    },
    {
      id: 'lifetime',
      title: 'Lifetime Benefits',
      subtitle: 'Ultimate Experience',
      description: 'Upgrade to Lifetime for AI conversations, reading exports, early access to features, and never pay again.',
      features: [
        'All Premium features included',
        'Unlimited AI conversations with Claude',
        'Export readings to PDF',
        'Early access to new features',
        'Lifetime updates and support',
        'One-time payment - no recurring fees'
      ],
      ctaText: 'Choose Plan',
      ctaAction: () => nextStep()
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      trackEvent('onboarding_step_completed', { step: currentStep + 1 });
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleUpgrade = (tier: string) => {
    trackEvent('onboarding_upgrade_selected', { tier, step: currentStep });
    onUpgrade(tier);
  };

  const currentStepData = steps[currentStep];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        <LiquidGlassCard className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="text-2xl">✨</div>
              <div>
                <h2 className="text-2xl font-bold text-yellow-400">Premium Features</h2>
                <p className="text-sm opacity-70">Step {currentStep + 1} of {steps.length}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-2xl opacity-70 hover:opacity-100 transition-opacity"
            >
              ×
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex gap-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`flex-1 h-2 rounded-full transition-colors ${
                    index <= currentStep 
                      ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' 
                      : 'bg-white/20'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              {/* Step Content */}
              <div className="text-center">
                <h3 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 via-purple-500 to-yellow-400 bg-clip-text text-transparent">
                  {currentStepData.title}
                </h3>
                <p className="text-xl opacity-80 mb-4">{currentStepData.subtitle}</p>
                <p className="opacity-70 max-w-2xl mx-auto">{currentStepData.description}</p>
              </div>

              {/* Features Grid */}
              <div className="grid md:grid-cols-2 gap-4">
                {currentStepData.features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-white/5"
                  >
                    <span className="text-green-400">✓</span>
                    <span className="text-sm">{feature}</span>
                  </motion.div>
                ))}
              </div>

              {/* Special content for final step */}
              {currentStep === steps.length - 1 && (
                <div className="grid md:grid-cols-2 gap-6 mt-8">
                  {/* Premium Plan */}
                  <div className="p-6 rounded-lg border border-white/20 bg-white/5">
                    <div className="text-center mb-4">
                      <h4 className="text-xl font-bold mb-2">Premium</h4>
                      <div className="text-3xl font-bold text-blue-400">$9.99</div>
                      <div className="text-sm opacity-70">per month</div>
                    </div>
                    <ul className="space-y-2 mb-6">
                      <li className="flex items-center gap-2 text-sm">
                        <span className="text-green-400">✓</span>
                        <span>All premium themes</span>
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <span className="text-green-400">✓</span>
                        <span>Unlimited readings</span>
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <span className="text-green-400">✓</span>
                        <span>Pattern analysis</span>
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <span className="text-green-400">✓</span>
                        <span>Priority support</span>
                      </li>
                    </ul>
                    <button
                      onClick={() => handleUpgrade('premium')}
                      className="w-full btn-secondary"
                    >
                      Choose Premium
                    </button>
                  </div>

                  {/* Lifetime Plan */}
                  <div className="p-6 rounded-lg border-2 border-yellow-400/50 bg-gradient-to-br from-yellow-400/10 to-purple-500/10 relative">
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-3 py-1 rounded-full text-sm font-semibold">
                        Best Value
                      </span>
                    </div>
                    <div className="text-center mb-4">
                      <h4 className="text-xl font-bold mb-2">Lifetime</h4>
                      <div className="text-3xl font-bold text-yellow-400">$299.99</div>
                      <div className="text-sm opacity-70">one-time payment</div>
                    </div>
                    <ul className="space-y-2 mb-6">
                      <li className="flex items-center gap-2 text-sm">
                        <span className="text-green-400">✓</span>
                        <span>Everything in Premium</span>
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <span className="text-green-400">✓</span>
                        <span>AI conversations</span>
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <span className="text-green-400">✓</span>
                        <span>Export readings</span>
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <span className="text-green-400">✓</span>
                        <span>Early access</span>
                      </li>
                    </ul>
                    <button
                      onClick={() => handleUpgrade('lifetime')}
                      className="w-full btn-premium"
                    >
                      Choose Lifetime
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className={`px-6 py-2 rounded-lg transition-all ${
                currentStep === 0 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-white/10'
              }`}
            >
              Previous
            </button>

            <div className="flex items-center gap-4">
              {currentStep < steps.length - 1 ? (
                <button
                  onClick={currentStepData.ctaAction}
                  className="btn-premium px-8"
                >
                  {currentStepData.ctaText}
                </button>
              ) : (
                <Link
                  to="/premium"
                  onClick={onClose}
                  className="btn-secondary px-8"
                >
                  View All Plans
                </Link>
              )}
              
              <button
                onClick={onClose}
                className="px-6 py-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </LiquidGlassCard>
      </motion.div>
    </motion.div>
  );
};

export default PremiumOnboarding;