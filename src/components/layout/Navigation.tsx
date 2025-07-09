import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../themes/ThemeProvider';
import { useAppState, useUnreadCount, usePremiumFeatures } from '../../store/AppStateProvider';
import LiquidGlassCard from '../ui/LiquidGlassCard';

interface NavigationProps {
  user: any;
  theme: any;
  updateAvailable?: boolean;
  onUpdateApp?: () => void;
  onDismissUpdate?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  user,
  theme,
  updateAvailable,
  onUpdateApp,
  onDismissUpdate,
}) => {
  const location = useLocation();
  const { setTheme, availableThemes } = useTheme();
  const { trackEvent } = useAppState();
  const unreadCount = useUnreadCount();
  const premiumFeatures = usePremiumFeatures();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigationItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/divination', label: 'Divination', icon: '🎯' },
    { path: '/history', label: 'History', icon: '📚', badge: user?.stats?.totalReadings },
    { path: '/instructions', label: 'Instructions', icon: '📖' },
    { path: '/settings', label: 'Settings', icon: '⚙️', badge: unreadCount > 0 ? unreadCount : undefined },
  ];

  const premiumItems = [
    { path: '/themes', label: 'Themes', icon: '🎨', premium: true },
    { path: '/patterns', label: 'Patterns', icon: '📊', premium: true },
    { path: '/conversation', label: 'Conversations', icon: '💬', premium: true },
  ];

  const handleThemeChange = (themeName: string) => {
    setTheme(themeName);
    setIsThemeMenuOpen(false);
    trackEvent('theme_changed', { theme: themeName });
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Main Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'py-2' : 'py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4">
          <LiquidGlassCard
            variant={isScrolled ? 'heavy' : 'medium'}
            className="px-6 py-3"
            style={{
              background: isScrolled 
                ? 'rgba(255, 255, 255, 0.05)' 
                : theme.colors.glass,
            }}
          >
            <div className="flex items-center justify-between">
              {/* Logo */}
              <Link 
                to="/" 
                className="flex items-center space-x-3 hover:scale-105 transition-transform"
                onClick={closeMobileMenu}
              >
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white"
                  style={{
                    background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
                  }}
                >
                  WO
                </div>
                <span 
                  className="text-xl font-bold gradient-text hidden sm:inline"
                  style={{ fontFamily: theme.typography.secondary }}
                >
                  Wisdom Oracle
                </span>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center space-x-1">
                {navigationItems.map((item) => (
                  <NavItem
                    key={item.path}
                    item={item}
                    isActive={location.pathname === item.path}
                    theme={theme}
                  />
                ))}

                {/* Premium Navigation */}
                {premiumFeatures.isPremium && (
                  <>
                    <div className="w-px h-6 bg-white/20 mx-2" />
                    {premiumItems.map((item) => (
                      <NavItem
                        key={item.path}
                        item={item}
                        isActive={location.pathname === item.path}
                        theme={theme}
                        isPremium={true}
                      />
                    ))}
                  </>
                )}
              </div>

              {/* Right Side Controls */}
              <div className="flex items-center space-x-3">
                {/* Theme Selector */}
                <div className="relative">
                  <button
                    onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
                    className="p-2 rounded-lg transition-all hover:scale-110"
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: `1px solid ${theme.colors.glassBorder}`,
                    }}
                    title="Change Theme"
                  >
                    🎨
                  </button>

                  <AnimatePresence>
                    {isThemeMenuOpen && (
                      <ThemeMenu
                        themes={availableThemes}
                        currentTheme={theme}
                        onThemeChange={handleThemeChange}
                        onClose={() => setIsThemeMenuOpen(false)}
                        isPremium={premiumFeatures.isPremium}
                      />
                    )}
                  </AnimatePresence>
                </div>

                {/* User Status */}
                <div className="hidden md:flex items-center space-x-2">
                  {user?.isPremium ? (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-400 to-yellow-600 text-black">
                      ✨ Premium
                    </span>
                  ) : (
                    <Link
                      to="/settings"
                      className="px-3 py-1 rounded-full text-xs font-medium transition-all hover:scale-105"
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: `1px solid ${theme.colors.glassBorder}`,
                        color: theme.colors.text,
                      }}
                    >
                      Upgrade
                    </Link>
                  )}
                </div>

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="lg:hidden p-2 rounded-lg transition-all"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: `1px solid ${theme.colors.glassBorder}`,
                  }}
                >
                  <div className="w-6 h-6 flex flex-col justify-center">
                    <motion.div
                      className="w-full h-0.5 bg-current mb-1"
                      animate={{
                        rotate: isMobileMenuOpen ? 45 : 0,
                        y: isMobileMenuOpen ? 6 : 0,
                      }}
                    />
                    <motion.div
                      className="w-full h-0.5 bg-current mb-1"
                      animate={{
                        opacity: isMobileMenuOpen ? 0 : 1,
                      }}
                    />
                    <motion.div
                      className="w-full h-0.5 bg-current"
                      animate={{
                        rotate: isMobileMenuOpen ? -45 : 0,
                        y: isMobileMenuOpen ? -6 : 0,
                      }}
                    />
                  </div>
                </button>
              </div>
            </div>
          </LiquidGlassCard>
        </div>

        {/* Update Notification */}
        <AnimatePresence>
          {updateAvailable && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-full left-4 right-4 mt-2"
            >
              <LiquidGlassCard className="p-3 flex items-center justify-between">
                <span className="text-sm">🚀 App update available</span>
                <div className="flex gap-2">
                  <button
                    onClick={onDismissUpdate}
                    className="text-xs px-3 py-1 rounded opacity-70 hover:opacity-100"
                  >
                    Later
                  </button>
                  <button
                    onClick={onUpdateApp}
                    className="text-xs px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600"
                  >
                    Update
                  </button>
                </div>
              </LiquidGlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <MobileMenu
            navigationItems={navigationItems}
            premiumItems={premiumItems}
            currentPath={location.pathname}
            theme={theme}
            user={user}
            premiumFeatures={premiumFeatures}
            onClose={closeMobileMenu}
          />
        )}
      </AnimatePresence>
    </>
  );
};

// Navigation Item Component
const NavItem: React.FC<{
  item: any;
  isActive: boolean;
  theme: any;
  isPremium?: boolean;
}> = ({ item, isActive, theme, isPremium = false }) => (
  <Link
    to={item.path}
    className={`relative px-4 py-2 rounded-lg transition-all hover:scale-105 ${
      isActive ? 'scale-105' : ''
    }`}
    style={{
      background: isActive 
        ? `linear-gradient(135deg, ${theme.colors.primary}20, ${theme.colors.secondary}20)`
        : 'rgba(255, 255, 255, 0.05)',
      border: `1px solid ${isActive ? theme.colors.primary : 'rgba(255, 255, 255, 0.1)'}`,
      color: theme.colors.text,
    }}
  >
    <div className="flex items-center space-x-2">
      <span className="text-sm">{item.icon}</span>
      <span className="text-sm font-medium">{item.label}</span>
      {isPremium && <span className="text-xs">✨</span>}
      {item.badge && (
        <span className="text-xs px-1.5 py-0.5 rounded-full bg-red-500 text-white">
          {item.badge}
        </span>
      )}
    </div>
  </Link>
);

// Theme Menu Component
const ThemeMenu: React.FC<{
  themes: any[];
  currentTheme: any;
  onThemeChange: (theme: string) => void;
  onClose: () => void;
  isPremium: boolean;
}> = ({ themes, currentTheme, onThemeChange, onClose, isPremium }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9, y: -10 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.9, y: -10 }}
    className="absolute top-full right-0 mt-2 w-64 z-50"
  >
    <LiquidGlassCard className="p-4">
      <h3 className="text-sm font-semibold mb-3">Choose Theme</h3>
      <div className="space-y-2">
        {themes.map((theme) => (
          <button
            key={theme.name}
            onClick={() => onThemeChange(theme.name)}
            disabled={theme.isPremium && !isPremium}
            className={`w-full p-3 rounded-lg text-left transition-all hover:scale-105 ${
              theme.name === currentTheme.name ? 'ring-2 ring-blue-500' : ''
            } ${theme.isPremium && !isPremium ? 'opacity-50 cursor-not-allowed' : ''}`}
            style={{
              background: `linear-gradient(135deg, ${theme.colors.primary}20, ${theme.colors.secondary}20)`,
              border: `1px solid ${theme.colors.primary}40`,
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-sm">{theme.name}</div>
                <div className="text-xs opacity-70">{theme.description}</div>
              </div>
              <div className="flex items-center gap-1">
                {theme.isPremium && <span className="text-xs">✨</span>}
                {theme.name === currentTheme.name && <span className="text-xs">✓</span>}
              </div>
            </div>
          </button>
        ))}
      </div>
      {!isPremium && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <Link
            to="/settings"
            onClick={onClose}
            className="w-full btn-premium text-center block text-sm py-2"
          >
            Unlock Premium Themes
          </Link>
        </div>
      )}
    </LiquidGlassCard>
  </motion.div>
);

// Mobile Menu Component
const MobileMenu: React.FC<{
  navigationItems: any[];
  premiumItems: any[];
  currentPath: string;
  theme: any;
  user: any;
  premiumFeatures: any;
  onClose: () => void;
}> = ({ navigationItems, premiumItems, currentPath, theme, user, premiumFeatures, onClose }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-40 lg:hidden"
    onClick={onClose}
  >
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      className="absolute top-0 right-0 h-full w-80 max-w-[90vw]"
      onClick={(e) => e.stopPropagation()}
    >
      <LiquidGlassCard className="h-full p-6 rounded-none">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-lg font-bold gradient-text">Menu</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-all"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: `1px solid ${theme.colors.glassBorder}`,
            }}
          >
            ✕
          </button>
        </div>

        <div className="space-y-2 mb-6">
          {navigationItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`w-full p-4 rounded-lg transition-all block ${
                currentPath === item.path ? 'scale-105' : ''
              }`}
              style={{
                background: currentPath === item.path 
                  ? `linear-gradient(135deg, ${theme.colors.primary}20, ${theme.colors.secondary}20)`
                  : 'rgba(255, 255, 255, 0.05)',
                border: `1px solid ${currentPath === item.path ? theme.colors.primary : 'rgba(255, 255, 255, 0.1)'}`,
              }}
            >
              <div className="flex items-center space-x-3">
                <span>{item.icon}</span>
                <span className="font-medium">{item.label}</span>
                {item.badge && (
                  <span className="text-xs px-2 py-1 rounded-full bg-red-500 text-white ml-auto">
                    {item.badge}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>

        {premiumFeatures.isPremium && (
          <>
            <div className="border-t border-white/10 pt-6 mb-6">
              <h3 className="text-sm font-semibold mb-3 text-yellow-400">✨ Premium Features</h3>
              <div className="space-y-2">
                {premiumItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={`w-full p-4 rounded-lg transition-all block ${
                      currentPath === item.path ? 'scale-105' : ''
                    }`}
                    style={{
                      background: currentPath === item.path 
                        ? `linear-gradient(135deg, ${theme.colors.primary}20, ${theme.colors.secondary}20)`
                        : 'rgba(255, 255, 255, 0.05)',
                      border: `1px solid ${currentPath === item.path ? theme.colors.primary : 'rgba(255, 255, 255, 0.1)'}`,
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <span>{item.icon}</span>
                      <span className="font-medium">{item.label}</span>
                      <span className="text-xs">✨</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="border-t border-white/10 pt-6">
          <div className="flex items-center space-x-3 mb-4">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white"
              style={{
                background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
              }}
            >
              {user?.email ? user.email[0].toUpperCase() : 'U'}
            </div>
            <div>
              <div className="font-medium">{user?.email || 'Anonymous User'}</div>
              <div className="text-sm opacity-70">
                {user?.isPremium ? '✨ Premium Member' : 'Free Account'}
              </div>
            </div>
          </div>
          
          {!premiumFeatures.isPremium && (
            <Link
              to="/settings"
              onClick={onClose}
              className="w-full btn-premium text-center block"
            >
              Upgrade to Premium
            </Link>
          )}
        </div>
      </LiquidGlassCard>
    </motion.div>
  </motion.div>
);