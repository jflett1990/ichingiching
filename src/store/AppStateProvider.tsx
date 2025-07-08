import React, { createContext, useContext, useCallback, useEffect } from 'react';
import { create } from 'zustand';
import { persist, createJSONStorage, subscribeWithSelector } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { HexagramResult } from '../components/animations';

// Advanced user profile interface
interface UserProfile {
  id: string;
  email?: string;
  isPremium: boolean;
  subscriptionTier: 'free' | 'premium' | 'lifetime';
  subscriptionExpiry?: Date;
  preferences: UserPreferences;
  stats: UserStats;
  created: Date;
  lastLogin: Date;
}

interface UserPreferences {
  theme: string;
  audioEnabled: boolean;
  audioVolume: number;
  animationLevel: 'minimal' | 'standard' | 'enhanced';
  notifications: {
    updatePrompts: boolean;
    dailyWisdom: boolean;
    achievements: boolean;
  };
  privacy: {
    analytics: boolean;
    errorReporting: boolean;
    personalizedAds: boolean;
  };
  accessibility: {
    reducedMotion: boolean;
    highContrast: boolean;
    largeText: boolean;
  };
}

interface UserStats {
  totalReadings: number;
  favoriteHexagrams: number[];
  streakDays: number;
  lastReadingDate?: Date;
  averageSessionDuration: number;
  questionsAsked: number;
  followUpConversations: number;
}

interface ReadingEntry {
  id: string;
  timestamp: Date;
  question: string;
  hexagram: HexagramResult;
  interpretation: string;
  sessionId?: string;
  tags: string[];
  favorite: boolean;
  notes?: string;
  followUps?: FollowUpEntry[];
}

interface FollowUpEntry {
  id: string;
  timestamp: Date;
  question: string;
  response: string;
  sessionId: string;
}

interface AppNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actions?: Array<{
    label: string;
    action: () => void;
    style?: 'primary' | 'secondary';
  }>;
}

// Main application state interface
interface AppState {
  // User management
  user: UserProfile | null;
  isAuthenticated: boolean;
  
  // Application state
  isInitialized: boolean;
  isLoading: boolean;
  currentPage: string;
  
  // Reading history
  readings: ReadingEntry[];
  favoriteReadings: string[];
  
  // Notifications
  notifications: AppNotification[];
  unreadCount: number;
  
  // Cache and performance
  cache: Map<string, any>;
  lastSync: Date | null;
  
  // Preferences (global app preferences vs user preferences)
  preferences: UserPreferences;
}

interface AppActions {
  // Initialization
  initializeApp: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  
  // User management
  setUser: (user: UserProfile | null) => void;
  updateUserPreferences: (preferences: Partial<UserPreferences>) => void;
  upgradeToMembership: (tier: 'premium' | 'lifetime') => Promise<void>;
  
  // Reading management
  addReading: (reading: Omit<ReadingEntry, 'id' | 'timestamp'>) => void;
  updateReading: (id: string, updates: Partial<ReadingEntry>) => void;
  deleteReading: (id: string) => void;
  toggleFavoriteReading: (id: string) => void;
  searchReadings: (query: string) => ReadingEntry[];
  getReadingPatterns: () => any;
  
  // Notifications
  addNotification: (notification: Omit<AppNotification, 'id' | 'timestamp'>) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  
  // Cache management
  setCacheValue: (key: string, value: any) => void;
  getCacheValue: (key: string) => any;
  clearCache: () => void;
  
  // Analytics and tracking
  trackEvent: (event: string, properties?: Record<string, any>) => void;
  updateUserStats: (updates: Partial<UserStats>) => void;
}

type AppStore = AppState & AppActions;

// Advanced store with multiple middleware
const useAppStore = create<AppStore>()(
  devtools(
    persist(
      subscribeWithSelector(
        immer((set, get) => ({
          // Initial state
          user: null,
          isAuthenticated: false,
          isInitialized: false,
          isLoading: false,
          currentPage: '/',
          readings: [],
          favoriteReadings: [],
          notifications: [],
          unreadCount: 0,
          cache: new Map(),
          lastSync: null,
          preferences: {
            theme: 'liquid-glass',
            audioEnabled: true,
            audioVolume: 0.7,
            animationLevel: 'standard',
            notifications: {
              updatePrompts: true,
              dailyWisdom: true,
              achievements: true,
            },
            privacy: {
              analytics: true,
              errorReporting: true,
              personalizedAds: false,
            },
            accessibility: {
              reducedMotion: false,
              highContrast: false,
              largeText: false,
            },
          },

          // Actions
          initializeApp: async () => {
            set((state) => {
              state.isLoading = true;
            });

            try {
              // Initialize user session
              const storedUser = localStorage.getItem('wisdom-oracle-user');
              if (storedUser) {
                const user = JSON.parse(storedUser);
                set((state) => {
                  state.user = user;
                  state.isAuthenticated = true;
                  state.preferences = { ...state.preferences, ...user.preferences };
                });
              } else {
                // Create anonymous user
                const anonymousUser: UserProfile = {
                  id: `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                  isPremium: false,
                  subscriptionTier: 'free',
                  preferences: get().preferences,
                  stats: {
                    totalReadings: 0,
                    favoriteHexagrams: [],
                    streakDays: 0,
                    averageSessionDuration: 0,
                    questionsAsked: 0,
                    followUpConversations: 0,
                  },
                  created: new Date(),
                  lastLogin: new Date(),
                };
                
                set((state) => {
                  state.user = anonymousUser;
                  state.isAuthenticated = true;
                });
              }

              // Initialize app preferences from system
              const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
              const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
              
              if (prefersReducedMotion || prefersHighContrast) {
                set((state) => {
                  if (prefersReducedMotion) {
                    state.preferences.accessibility.reducedMotion = true;
                    state.preferences.animationLevel = 'minimal';
                  }
                  if (prefersHighContrast) {
                    state.preferences.accessibility.highContrast = true;
                  }
                });
              }

              set((state) => {
                state.isInitialized = true;
                state.isLoading = false;
                state.lastSync = new Date();
              });

            } catch (error) {
              console.error('App initialization failed:', error);
              set((state) => {
                state.isLoading = false;
                state.isInitialized = true; // Still initialize to prevent infinite loading
              });
            }
          },

          setLoading: (loading: boolean) =>
            set((state) => {
              state.isLoading = loading;
            }),

          setUser: (user: UserProfile | null) =>
            set((state) => {
              state.user = user;
              state.isAuthenticated = !!user;
              if (user) {
                localStorage.setItem('wisdom-oracle-user', JSON.stringify(user));
              } else {
                localStorage.removeItem('wisdom-oracle-user');
              }
            }),

          updateUserPreferences: (preferences: Partial<UserPreferences>) =>
            set((state) => {
              if (state.user) {
                state.user.preferences = { ...state.user.preferences, ...preferences };
                state.preferences = { ...state.preferences, ...preferences };
                localStorage.setItem('wisdom-oracle-user', JSON.stringify(state.user));
              }
            }),

          upgradeToMembership: async (tier: 'premium' | 'lifetime') => {
            // This would integrate with payment processing
            set((state) => {
              if (state.user) {
                state.user.isPremium = true;
                state.user.subscriptionTier = tier;
                if (tier === 'premium') {
                  state.user.subscriptionExpiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year
                }
                localStorage.setItem('wisdom-oracle-user', JSON.stringify(state.user));
              }
            });
          },

          addReading: (reading: Omit<ReadingEntry, 'id' | 'timestamp'>) =>
            set((state) => {
              const newReading: ReadingEntry = {
                ...reading,
                id: `reading_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                timestamp: new Date(),
              };
              state.readings.unshift(newReading);
              
              // Update user stats
              if (state.user) {
                state.user.stats.totalReadings += 1;
                state.user.stats.questionsAsked += 1;
                state.user.stats.lastReadingDate = new Date();
              }
            }),

          updateReading: (id: string, updates: Partial<ReadingEntry>) =>
            set((state) => {
              const index = state.readings.findIndex(r => r.id === id);
              if (index !== -1) {
                state.readings[index] = { ...state.readings[index], ...updates };
              }
            }),

          deleteReading: (id: string) =>
            set((state) => {
              state.readings = state.readings.filter(r => r.id !== id);
              state.favoriteReadings = state.favoriteReadings.filter(fid => fid !== id);
            }),

          toggleFavoriteReading: (id: string) =>
            set((state) => {
              const reading = state.readings.find(r => r.id === id);
              if (reading) {
                reading.favorite = !reading.favorite;
                if (reading.favorite) {
                  state.favoriteReadings.push(id);
                } else {
                  state.favoriteReadings = state.favoriteReadings.filter(fid => fid !== id);
                }
              }
            }),

          searchReadings: (query: string) => {
            const { readings } = get();
            const lowercaseQuery = query.toLowerCase();
            return readings.filter(reading =>
              reading.question.toLowerCase().includes(lowercaseQuery) ||
              reading.interpretation.toLowerCase().includes(lowercaseQuery) ||
              reading.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
              reading.notes?.toLowerCase().includes(lowercaseQuery)
            );
          },

          getReadingPatterns: () => {
            const { readings, user } = get();
            // Advanced pattern analysis
            const hexagramFrequency = readings.reduce((acc, reading) => {
              const hexNum = reading.hexagram.primaryNumber;
              acc[hexNum] = (acc[hexNum] || 0) + 1;
              return acc;
            }, {} as Record<number, number>);

            const timePatterns = readings.reduce((acc, reading) => {
              const hour = reading.timestamp.getHours();
              const dayOfWeek = reading.timestamp.getDay();
              acc.hourDistribution[hour] = (acc.hourDistribution[hour] || 0) + 1;
              acc.dayDistribution[dayOfWeek] = (acc.dayDistribution[dayOfWeek] || 0) + 1;
              return acc;
            }, {
              hourDistribution: {} as Record<number, number>,
              dayDistribution: {} as Record<number, number>,
            });

            return {
              hexagramFrequency,
              timePatterns,
              totalReadings: readings.length,
              favoriteCount: readings.filter(r => r.favorite).length,
              averageQuestionLength: readings.reduce((acc, r) => acc + r.question.length, 0) / readings.length,
              mostActiveHours: Object.entries(timePatterns.hourDistribution)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 3),
            };
          },

          addNotification: (notification: Omit<AppNotification, 'id' | 'timestamp'>) =>
            set((state) => {
              const newNotification: AppNotification = {
                ...notification,
                id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                timestamp: new Date(),
                read: false,
              };
              state.notifications.unshift(newNotification);
              state.unreadCount += 1;
            }),

          markNotificationRead: (id: string) =>
            set((state) => {
              const notification = state.notifications.find(n => n.id === id);
              if (notification && !notification.read) {
                notification.read = true;
                state.unreadCount = Math.max(0, state.unreadCount - 1);
              }
            }),

          clearNotifications: () =>
            set((state) => {
              state.notifications = [];
              state.unreadCount = 0;
            }),

          setCacheValue: (key: string, value: any) =>
            set((state) => {
              state.cache.set(key, value);
            }),

          getCacheValue: (key: string) => {
            const { cache } = get();
            return cache.get(key);
          },

          clearCache: () =>
            set((state) => {
              state.cache.clear();
            }),

          trackEvent: (event: string, properties?: Record<string, any>) => {
            const { user, preferences } = get();
            if (preferences.privacy.analytics && window.gtag) {
              window.gtag('event', event, {
                ...properties,
                user_tier: user?.subscriptionTier || 'free',
                user_premium: user?.isPremium || false,
              });
            }
          },

          updateUserStats: (updates: Partial<UserStats>) =>
            set((state) => {
              if (state.user) {
                state.user.stats = { ...state.user.stats, ...updates };
                localStorage.setItem('wisdom-oracle-user', JSON.stringify(state.user));
              }
            }),
        })),
      ),
      {
        name: 'wisdom-oracle-state',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          user: state.user,
          preferences: state.preferences,
          readings: state.readings,
          favoriteReadings: state.favoriteReadings,
        }),
      }
    ),
    {
      name: 'wisdom-oracle-store',
    }
  )
);

// Context for providing store access
const AppStateContext = createContext<typeof useAppStore | null>(null);

// Provider component
export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AppStateContext.Provider value={useAppStore}>
      {children}
    </AppStateContext.Provider>
  );
};

// Hook for using app state
export const useAppState = () => {
  const store = useContext(AppStateContext);
  if (!store) {
    throw new Error('useAppState must be used within AppStateProvider');
  }
  return store();
};

// Selectors for optimized subscriptions
export const useUser = () => useAppState().user;
export const useUserStats = () => useAppState().user?.stats;
export const usePreferences = () => useAppState().preferences;
export const useReadings = () => useAppState().readings;
export const useNotifications = () => useAppState().notifications;
export const useUnreadCount = () => useAppState().unreadCount;

// Advanced selectors
export const usePremiumFeatures = () => {
  const user = useUser();
  return {
    isPremium: user?.isPremium || false,
    canAccessThemes: user?.isPremium || false,
    canUseFollowUps: user?.isPremium || false,
    canViewPatterns: user?.isPremium || false,
    hasHistoryLimit: !user?.isPremium,
    maxHistoryEntries: user?.isPremium ? Infinity : 10,
  };
};

export type { UserProfile, UserPreferences, ReadingEntry, AppNotification };