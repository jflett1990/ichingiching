import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../components/themes/ThemeProvider';
import { useAppState, usePremiumFeatures } from '../store/AppStateProvider';
import LiquidGlassCard from '../components/ui/LiquidGlassCard';
import { LoadingScreen } from '../components/ui/LoadingScreen';

interface SettingsSection {
  id: string;
  title: string;
  icon: string;
  description: string;
  premium?: boolean;
}

const SettingsPage: React.FC = () => {
  const { currentTheme, setTheme, availableThemes } = useTheme();
  const { user, updateUser, clearUserData, trackEvent } = useAppState();
  const premiumFeatures = usePremiumFeatures();
  const [activeSection, setActiveSection] = useState('general');
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const sections: SettingsSection[] = [
    {
      id: 'general',
      title: 'General',
      icon: '⚙️',
      description: 'Basic app preferences and settings',
    },
    {
      id: 'appearance',
      title: 'Appearance',
      icon: '🎨',
      description: 'Themes, colors, and visual preferences',
    },
    {
      id: 'reading',
      title: 'Reading',
      icon: '📖',
      description: 'Divination and interpretation preferences',
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: '🔔',
      description: 'Alerts and reminder settings',
    },
    {
      id: 'premium',
      title: 'Premium',
      icon: '✨',
      description: 'Subscription and premium features',
      premium: true,
    },
    {
      id: 'data',
      title: 'Data & Privacy',
      icon: '🔒',
      description: 'Data management and privacy settings',
    },
  ];

  const handleSetting = async (key: string, value: any) => {
    setIsLoading(true);
    try {
      await updateUser({
        preferences: {
          ...user?.preferences,
          [key]: value,
        },
      });
      trackEvent('setting_changed', { key, value });
    } catch (error) {
      console.error('Failed to update setting:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsLoading(true);
    try {
      await clearUserData();
      trackEvent('account_deleted');
      // Redirect to home or login page
    } catch (error) {
      console.error('Failed to delete account:', error);
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen theme={currentTheme} message="Saving settings..." />;
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <LiquidGlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 
                  className="text-3xl font-bold gradient-text mb-2"
                  style={{ fontFamily: currentTheme.typography.secondary }}
                >
                  Settings
                </h1>
                <p className="opacity-80">
                  Customize your I Ching experience
                </p>
              </div>
              
              {!premiumFeatures.isPremium && (
                <button className="btn-premium">
                  ✨ Upgrade to Premium
                </button>
              )}
            </div>
          </LiquidGlassCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <LiquidGlassCard className="p-4">
              <nav className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full p-3 rounded-lg text-left transition-all ${
                      activeSection === section.id 
                        ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/50' 
                        : 'hover:bg-white/10'
                    }`}
                    style={{
                      border: activeSection === section.id 
                        ? `1px solid ${currentTheme.colors.primary}` 
                        : '1px solid transparent'
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{section.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{section.title}</span>
                          {section.premium && !premiumFeatures.isPremium && (
                            <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded">
                              Premium
                            </span>
                          )}
                        </div>
                        <p className="text-xs opacity-70 mt-1">{section.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </nav>
            </LiquidGlassCard>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {activeSection === 'general' && (
                <GeneralSettings
                  user={user}
                  onSettingChange={handleSetting}
                  theme={currentTheme}
                />
              )}
              
              {activeSection === 'appearance' && (
                <AppearanceSettings
                  currentTheme={currentTheme}
                  availableThemes={availableThemes}
                  onThemeChange={setTheme}
                  user={user}
                  onSettingChange={handleSetting}
                  isPremium={premiumFeatures.isPremium}
                />
              )}
              
              {activeSection === 'reading' && (
                <ReadingSettings
                  user={user}
                  onSettingChange={handleSetting}
                  theme={currentTheme}
                />
              )}
              
              {activeSection === 'notifications' && (
                <NotificationSettings
                  user={user}
                  onSettingChange={handleSetting}
                  theme={currentTheme}
                />
              )}
              
              {activeSection === 'premium' && (
                <PremiumSettings
                  user={user}
                  premiumFeatures={premiumFeatures}
                  theme={currentTheme}
                />
              )}
              
              {activeSection === 'data' && (
                <DataSettings
                  user={user}
                  onSettingChange={handleSetting}
                  onDeleteAccount={() => setShowDeleteConfirm(true)}
                  theme={currentTheme}
                />
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowDeleteConfirm(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
              >
                <LiquidGlassCard className="p-6">
                  <h3 className="text-xl font-semibold mb-4 text-red-400">
                    Delete Account
                  </h3>
                  <p className="opacity-80 mb-6">
                    This action cannot be undone. All your readings, preferences, and data will be permanently deleted.
                  </p>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteAccount}
                      className="flex-1 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors"
                    >
                      Delete Account
                    </button>
                  </div>
                </LiquidGlassCard>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// General Settings Component
const GeneralSettings: React.FC<{
  user: any;
  onSettingChange: (key: string, value: any) => void;
  theme: any;
}> = ({ user, onSettingChange, theme }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="space-y-6"
  >
    <LiquidGlassCard className="p-6">
      <h3 className="text-xl font-semibold mb-4">General Settings</h3>
      
      <div className="space-y-6">
        {/* Language */}
        <div>
          <label className="block text-sm font-medium mb-2">Language</label>
          <select
            value={user?.preferences?.language || 'en'}
            onChange={(e) => onSettingChange('language', e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
            <option value="zh">中文</option>
          </select>
        </div>

        {/* Auto-save readings */}
        <div className="flex items-center justify-between">
          <div>
            <label className="font-medium">Auto-save readings</label>
            <p className="text-sm opacity-70">Automatically save all your readings to history</p>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={user?.preferences?.autoSave !== false}
              onChange={(e) => onSettingChange('autoSave', e.target.checked)}
            />
            <span className="slider round"></span>
          </label>
        </div>

        {/* Show tips */}
        <div className="flex items-center justify-between">
          <div>
            <label className="font-medium">Show helpful tips</label>
            <p className="text-sm opacity-70">Display guidance and tips throughout the app</p>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={user?.preferences?.showTips !== false}
              onChange={(e) => onSettingChange('showTips', e.target.checked)}
            />
            <span className="slider round"></span>
          </label>
        </div>

        {/* Analytics */}
        <div className="flex items-center justify-between">
          <div>
            <label className="font-medium">Analytics</label>
            <p className="text-sm opacity-70">Help improve the app by sharing usage data</p>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={user?.preferences?.analytics !== false}
              onChange={(e) => onSettingChange('analytics', e.target.checked)}
            />
            <span className="slider round"></span>
          </label>
        </div>
      </div>
    </LiquidGlassCard>
  </motion.div>
);

// Appearance Settings Component
const AppearanceSettings: React.FC<{
  currentTheme: any;
  availableThemes: any[];
  onThemeChange: (theme: string) => void;
  user: any;
  onSettingChange: (key: string, value: any) => void;
  isPremium: boolean;
}> = ({ currentTheme, availableThemes, onThemeChange, user, onSettingChange, isPremium }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="space-y-6"
  >
    <LiquidGlassCard className="p-6">
      <h3 className="text-xl font-semibold mb-4">Appearance</h3>
      
      <div className="space-y-6">
        {/* Theme Selection */}
        <div>
          <label className="block text-sm font-medium mb-4">Theme</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableThemes.map((theme) => (
              <button
                key={theme.name}
                onClick={() => onThemeChange(theme.name)}
                disabled={theme.isPremium && !isPremium}
                className={`p-4 rounded-lg border transition-all ${
                  theme.name === currentTheme.name 
                    ? 'border-blue-500 bg-blue-500/20' 
                    : 'border-white/20 hover:border-white/40'
                } ${theme.isPremium && !isPremium ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{theme.name}</span>
                  <div className="flex items-center gap-2">
                    {theme.isPremium && <span className="text-xs">✨</span>}
                    {theme.name === currentTheme.name && <span className="text-xs">✓</span>}
                  </div>
                </div>
                <p className="text-sm opacity-70 text-left">{theme.description}</p>
                <div className="flex gap-1 mt-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ background: theme.colors.primary }}
                  />
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ background: theme.colors.secondary }}
                  />
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ background: theme.colors.accent }}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Animations */}
        <div className="flex items-center justify-between">
          <div>
            <label className="font-medium">Animations</label>
            <p className="text-sm opacity-70">Enable smooth transitions and effects</p>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={user?.preferences?.animations !== false}
              onChange={(e) => onSettingChange('animations', e.target.checked)}
            />
            <span className="slider round"></span>
          </label>
        </div>

        {/* Particle Effects */}
        <div className="flex items-center justify-between">
          <div>
            <label className="font-medium">Particle Effects</label>
            <p className="text-sm opacity-70">Show floating particles in background</p>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={user?.preferences?.particles !== false}
              onChange={(e) => onSettingChange('particles', e.target.checked)}
            />
            <span className="slider round"></span>
          </label>
        </div>

        {/* Font Size */}
        <div>
          <label className="block text-sm font-medium mb-2">Font Size</label>
          <select
            value={user?.preferences?.fontSize || 'medium'}
            onChange={(e) => onSettingChange('fontSize', e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>
      </div>
    </LiquidGlassCard>
  </motion.div>
);

// Reading Settings Component
const ReadingSettings: React.FC<{
  user: any;
  onSettingChange: (key: string, value: any) => void;
  theme: any;
}> = ({ user, onSettingChange, theme }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="space-y-6"
  >
    <LiquidGlassCard className="p-6">
      <h3 className="text-xl font-semibold mb-4">Reading Preferences</h3>
      
      <div className="space-y-6">
        {/* Audio */}
        <div className="flex items-center justify-between">
          <div>
            <label className="font-medium">Audio Effects</label>
            <p className="text-sm opacity-70">Play sounds during coin tosses</p>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={user?.preferences?.audioEnabled !== false}
              onChange={(e) => onSettingChange('audioEnabled', e.target.checked)}
            />
            <span className="slider round"></span>
          </label>
        </div>

        {/* Audio Volume */}
        {user?.preferences?.audioEnabled !== false && (
          <div>
            <label className="block text-sm font-medium mb-2">Audio Volume</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={user?.preferences?.audioVolume || 0.7}
              onChange={(e) => onSettingChange('audioVolume', parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs opacity-70 mt-1">
              <span>Silent</span>
              <span>Loud</span>
            </div>
          </div>
        )}

        {/* Interpretation Detail */}
        <div>
          <label className="block text-sm font-medium mb-2">Interpretation Detail</label>
          <select
            value={user?.preferences?.interpretationDetail || 'balanced'}
            onChange={(e) => onSettingChange('interpretationDetail', e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="brief">Brief</option>
            <option value="balanced">Balanced</option>
            <option value="detailed">Detailed</option>
          </select>
        </div>

        {/* Default Tags */}
        <div>
          <label className="block text-sm font-medium mb-2">Default Tags</label>
          <input
            type="text"
            placeholder="career, relationships, personal growth (comma separated)"
            value={user?.preferences?.defaultTags?.join(', ') || ''}
            onChange={(e) => onSettingChange('defaultTags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
            className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </LiquidGlassCard>
  </motion.div>
);

// Notification Settings Component
const NotificationSettings: React.FC<{
  user: any;
  onSettingChange: (key: string, value: any) => void;
  theme: any;
}> = ({ user, onSettingChange, theme }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="space-y-6"
  >
    <LiquidGlassCard className="p-6">
      <h3 className="text-xl font-semibold mb-4">Notifications</h3>
      
      <div className="space-y-6">
        {/* Daily Reflection */}
        <div className="flex items-center justify-between">
          <div>
            <label className="font-medium">Daily Reflection Reminder</label>
            <p className="text-sm opacity-70">Get reminded to reflect on your day</p>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={user?.preferences?.dailyReflection || false}
              onChange={(e) => onSettingChange('dailyReflection', e.target.checked)}
            />
            <span className="slider round"></span>
          </label>
        </div>

        {/* Reading Reminders */}
        <div className="flex items-center justify-between">
          <div>
            <label className="font-medium">Reading Reminders</label>
            <p className="text-sm opacity-70">Gentle reminders to consult the I Ching</p>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={user?.preferences?.readingReminders || false}
              onChange={(e) => onSettingChange('readingReminders', e.target.checked)}
            />
            <span className="slider round"></span>
          </label>
        </div>

        {/* Reminder Frequency */}
        {user?.preferences?.readingReminders && (
          <div>
            <label className="block text-sm font-medium mb-2">Reminder Frequency</label>
            <select
              value={user?.preferences?.reminderFrequency || 'weekly'}
              onChange={(e) => onSettingChange('reminderFrequency', e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        )}

        {/* App Updates */}
        <div className="flex items-center justify-between">
          <div>
            <label className="font-medium">App Updates</label>
            <p className="text-sm opacity-70">Notify about new features and improvements</p>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={user?.preferences?.appUpdates !== false}
              onChange={(e) => onSettingChange('appUpdates', e.target.checked)}
            />
            <span className="slider round"></span>
          </label>
        </div>
      </div>
    </LiquidGlassCard>
  </motion.div>
);

// Premium Settings Component
const PremiumSettings: React.FC<{
  user: any;
  premiumFeatures: any;
  theme: any;
}> = ({ user, premiumFeatures, theme }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="space-y-6"
  >
    <LiquidGlassCard className="p-6">
      <h3 className="text-xl font-semibold mb-4">Premium Subscription</h3>
      
      {premiumFeatures.isPremium ? (
        <div className="space-y-6">
          {/* Current Plan */}
          <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 p-4 rounded-lg border border-yellow-500/40">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-yellow-300">✨ Premium Active</span>
              <span className="text-sm opacity-70">
                Expires: {new Date(user?.premium?.expiresAt).toLocaleDateString()}
              </span>
            </div>
            <p className="text-sm opacity-80">
              You have access to all premium features including advanced themes, pattern analysis, and unlimited conversations.
            </p>
          </div>

          {/* Usage Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-400">∞</div>
              <div className="text-sm opacity-70">Monthly Readings</div>
            </div>
            <div className="bg-white/5 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-400">5</div>
              <div className="text-sm opacity-70">Premium Themes</div>
            </div>
          </div>

          {/* Manage Subscription */}
          <div className="flex gap-4">
            <button className="flex-1 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
              Update Payment
            </button>
            <button className="flex-1 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
              Cancel Subscription
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Free Plan */}
          <div className="bg-white/5 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Free Plan</span>
              <span className="text-sm opacity-70">Current</span>
            </div>
            <p className="text-sm opacity-80">
              You have access to basic features with some limitations.
            </p>
          </div>

          {/* Premium Benefits */}
          <div>
            <h4 className="font-medium mb-3">Premium Benefits</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-green-400">✓</span>
                <span className="text-sm">Unlimited readings</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-green-400">✓</span>
                <span className="text-sm">5 premium themes</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-green-400">✓</span>
                <span className="text-sm">Advanced pattern analysis</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-green-400">✓</span>
                <span className="text-sm">Conversation with AI</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-green-400">✓</span>
                <span className="text-sm">Guided meditation</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-green-400">✓</span>
                <span className="text-sm">Priority support</span>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border border-white/20">
              <div className="text-lg font-semibold mb-1">Monthly</div>
              <div className="text-2xl font-bold text-blue-400">$9.99</div>
              <div className="text-sm opacity-70">per month</div>
            </div>
            <div className="p-4 rounded-lg border border-yellow-500/40 bg-yellow-500/10">
              <div className="text-lg font-semibold mb-1">Yearly</div>
              <div className="text-2xl font-bold text-yellow-400">$99.99</div>
              <div className="text-sm opacity-70">per year (17% off)</div>
            </div>
          </div>

          <button className="w-full btn-premium">
            Upgrade to Premium
          </button>
        </div>
      )}
    </LiquidGlassCard>
  </motion.div>
);

// Data Settings Component
const DataSettings: React.FC<{
  user: any;
  onSettingChange: (key: string, value: any) => void;
  onDeleteAccount: () => void;
  theme: any;
}> = ({ user, onSettingChange, onDeleteAccount, theme }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="space-y-6"
  >
    <LiquidGlassCard className="p-6">
      <h3 className="text-xl font-semibold mb-4">Data & Privacy</h3>
      
      <div className="space-y-6">
        {/* Data Usage */}
        <div>
          <h4 className="font-medium mb-3">Data Usage</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm opacity-70">Readings stored</span>
              <span className="text-sm font-medium">{user?.stats?.totalReadings || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm opacity-70">Account created</span>
              <span className="text-sm font-medium">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
              </span>
            </div>
          </div>
        </div>

        {/* Export Data */}
        <div>
          <h4 className="font-medium mb-3">Export Data</h4>
          <p className="text-sm opacity-70 mb-4">
            Download all your readings and data in JSON format.
          </p>
          <button className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
            Export My Data
          </button>
        </div>

        {/* Delete Account */}
        <div>
          <h4 className="font-medium mb-3 text-red-400">Delete Account</h4>
          <p className="text-sm opacity-70 mb-4">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          <button
            onClick={onDeleteAccount}
            className="px-4 py-2 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-colors"
          >
            Delete Account
          </button>
        </div>
      </div>
    </LiquidGlassCard>
  </motion.div>
);

export default SettingsPage;