import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTheme } from '../components/themes/ThemeProvider';
import { useAppState } from '../store/AppStateProvider';
import LiquidGlassCard from '../components/ui/LiquidGlassCard';

const NotFoundPage: React.FC = () => {
  const { currentTheme } = useTheme();
  const { trackEvent } = useAppState();

  React.useEffect(() => {
    trackEvent('page_not_found', { path: window.location.pathname });
  }, [trackEvent]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl w-full"
      >
        <LiquidGlassCard size="lg" className="p-8 text-center">
          
          {/* Animated 404 */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-8"
          >
            <div 
              className="text-8xl font-bold gradient-text mb-4"
              style={{ fontFamily: currentTheme.typography.secondary }}
            >
              404
            </div>
            <div className="w-32 h-1 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
          </motion.div>

          {/* Title and Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold mb-4">
              Page Not Found
            </h1>
            <p className="text-lg opacity-80 mb-2">
              The path you seek cannot be found in this digital realm.
            </p>
            <p className="text-sm opacity-60">
              Like the I Ching teaches, sometimes we must change direction to find our way.
            </p>
          </motion.div>

          {/* I Ching Wisdom Quote */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mb-8"
          >
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-6 rounded-lg border border-white/10">
              <div className="text-4xl mb-2">☯</div>
              <blockquote className="text-sm italic opacity-80 mb-2">
                "The I Ching teaches us that when we encounter obstacles, 
                it is often a sign to pause, reflect, and find a new path forward."
              </blockquote>
              <cite className="text-xs opacity-60">- Ancient Wisdom</cite>
            </div>
          </motion.div>

          {/* Navigation Options */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                to="/"
                className="p-4 rounded-lg transition-all hover:scale-105 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30"
              >
                <div className="text-2xl mb-2">🏠</div>
                <div className="font-semibold">Return Home</div>
                <div className="text-sm opacity-70">Start your journey anew</div>
              </Link>
              
              <Link
                to="/divination"
                className="p-4 rounded-lg transition-all hover:scale-105 bg-gradient-to-r from-green-500/20 to-teal-500/20 border border-green-500/30"
              >
                <div className="text-2xl mb-2">🎯</div>
                <div className="font-semibold">Seek Guidance</div>
                <div className="text-sm opacity-70">Consult the I Ching</div>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                to="/instructions"
                className="p-4 rounded-lg transition-all hover:scale-105 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30"
              >
                <div className="text-2xl mb-2">📚</div>
                <div className="font-semibold">Learn More</div>
                <div className="text-sm opacity-70">Understanding the I Ching</div>
              </Link>
              
              <Link
                to="/history"
                className="p-4 rounded-lg transition-all hover:scale-105 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30"
              >
                <div className="text-2xl mb-2">📖</div>
                <div className="font-semibold">Your History</div>
                <div className="text-sm opacity-70">Past readings & insights</div>
              </Link>
            </div>
          </motion.div>

          {/* Help Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.5 }}
            className="mt-8 pt-8 border-t border-white/10"
          >
            <div className="flex items-center justify-center space-x-6 text-sm opacity-60">
              <button
                onClick={() => window.history.back()}
                className="hover:opacity-100 transition-opacity"
              >
                ← Go Back
              </button>
              <span>•</span>
              <button
                onClick={() => window.location.reload()}
                className="hover:opacity-100 transition-opacity"
              >
                🔄 Refresh Page
              </button>
              <span>•</span>
              <Link
                to="/settings"
                className="hover:opacity-100 transition-opacity"
              >
                ⚙️ Settings
              </Link>
            </div>
          </motion.div>

          {/* Floating Particles Effect */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-blue-400 rounded-full"
                initial={{ 
                  x: Math.random() * 100 + '%',
                  y: '100%',
                  opacity: 0 
                }}
                animate={{
                  y: '-10%',
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>
        </LiquidGlassCard>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;