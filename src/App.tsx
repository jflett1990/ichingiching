import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAppState } from './store/AppStateProvider';
import { useTheme } from './components/themes/ThemeProvider';
import { Navigation } from './components/layout/Navigation';
import { PageTransition } from './components/layout/PageTransition';
import { LoadingScreen } from './components/ui/LoadingScreen';
import { BackgroundEffects } from './components/ui/BackgroundEffects';
import { AppErrorBoundary } from './components/errors/AppErrorBoundary';
import { usePreloadCriticalResources } from './hooks/usePreloadCriticalResources';
import { useServiceWorkerUpdate } from './hooks/useServiceWorkerUpdate';
import { AnalyticsProvider } from './utils/analytics';

// Lazy load pages for optimal performance
const HomePage = React.lazy(() => import('./pages/Home'));
const DivinationPage = React.lazy(() => import('./pages/Divination'));
const HistoryPage = React.lazy(() => import('./pages/History'));
const InstructionsPage = React.lazy(() => import('./pages/Instructions'));
const SettingsPage = React.lazy(() => import('./pages/Settings'));
const ProfilePage = React.lazy(() => import('./pages/Profile'));

// Premium lazy-loaded pages
const ThemesPage = React.lazy(() => import('./pages/Themes'));
const PatternsPage = React.lazy(() => import('./pages/Patterns'));
const ConversationPage = React.lazy(() => import('./pages/Conversation'));

interface AppProps {
  className?: string;
}

const App: React.FC<AppProps> = ({ className = '' }) => {
  const { currentTheme, isLoading: themeLoading } = useTheme();
  const { 
    user, 
    preferences, 
    isInitialized,
    initializeApp 
  } = useAppState();
  
  // Advanced resource preloading
  const { isPreloading, preloadProgress } = usePreloadCriticalResources();
  
  // Service worker update notifications
  const { 
    updateAvailable, 
    updateApp, 
    dismissUpdate 
  } = useServiceWorkerUpdate();

  // Initialize application state
  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  // Show loading screen during initialization
  if (!isInitialized || themeLoading || isPreloading) {
    return (
      <LoadingScreen 
        progress={preloadProgress}
        theme={currentTheme}
        message="Initializing Wisdom Oracle..."
      />
    );
  }

  // Dynamic CSS custom properties for theme
  const themeStyles = {
    '--primary-color': currentTheme.colors.primary,
    '--secondary-color': currentTheme.colors.secondary,
    '--background-color': currentTheme.colors.background,
    '--text-color': currentTheme.colors.text,
    '--glass-background': currentTheme.colors.glass,
    '--blur-intensity': currentTheme.effects.blur,
  } as React.CSSProperties;

  return (
    <AnalyticsProvider>
      <div 
        className={`app-container ${className}`}
        style={themeStyles}
        data-theme={currentTheme.name.toLowerCase().replace(/\s+/g, '-')}
      >
        {/* Dynamic background effects based on theme */}
        <BackgroundEffects theme={currentTheme} />
        
        <Router>
          <AppErrorBoundary>
            {/* Advanced navigation with theme integration */}
            <Navigation 
              user={user}
              theme={currentTheme}
              updateAvailable={updateAvailable}
              onUpdateApp={updateApp}
              onDismissUpdate={dismissUpdate}
            />
            
            {/* Main content area with sophisticated transitions */}
            <main className="main-content">
              <AnimatePresence mode="wait">
                <Suspense 
                  fallback={
                    <PageTransition>
                      <LoadingScreen 
                        theme={currentTheme}
                        message="Loading page..."
                        variant="minimal"
                      />
                    </PageTransition>
                  }
                >
                  <Routes>
                    {/* Public routes */}
                    <Route 
                      path="/" 
                      element={
                        <PageTransition>
                          <HomePage />
                        </PageTransition>
                      } 
                    />
                    
                    <Route 
                      path="/divination" 
                      element={
                        <PageTransition>
                          <DivinationPage />
                        </PageTransition>
                      } 
                    />
                    
                    <Route 
                      path="/instructions" 
                      element={
                        <PageTransition>
                          <InstructionsPage />
                        </PageTransition>
                      } 
                    />
                    
                    {/* User routes */}
                    <Route 
                      path="/history" 
                      element={
                        <PageTransition>
                          <HistoryPage />
                        </PageTransition>
                      } 
                    />
                    
                    <Route 
                      path="/settings" 
                      element={
                        <PageTransition>
                          <SettingsPage />
                        </PageTransition>
                      } 
                    />
                    
                    <Route 
                      path="/profile" 
                      element={
                        <PageTransition>
                          <ProfilePage />
                        </PageTransition>
                      } 
                    />
                    
                    {/* Premium routes with access control */}
                    {user?.isPremium && (
                      <>
                        <Route 
                          path="/themes" 
                          element={
                            <PageTransition>
                              <ThemesPage />
                            </PageTransition>
                          } 
                        />
                        
                        <Route 
                          path="/patterns" 
                          element={
                            <PageTransition>
                              <PatternsPage />
                            </PageTransition>
                          } 
                        />
                        
                        <Route 
                          path="/conversation/:sessionId?" 
                          element={
                            <PageTransition>
                              <ConversationPage />
                            </PageTransition>
                          } 
                        />
                      </>
                    )}
                    
                    {/* Fallback redirect */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Suspense>
              </AnimatePresence>
            </main>
          </AppErrorBoundary>
        </Router>
        
        {/* Global modals and overlays */}
        {updateAvailable && (
          <UpdateNotification 
            onUpdate={updateApp}
            onDismiss={dismissUpdate}
            theme={currentTheme}
          />
        )}
        
        {/* Development tools */}
        {import.meta.env.DEV && (
          <DevTools 
            theme={currentTheme}
            user={user}
            preferences={preferences}
          />
        )}
      </div>
    </AnalyticsProvider>
  );
};

// Sophisticated update notification component
const UpdateNotification: React.FC<{
  onUpdate: () => void;
  onDismiss: () => void;
  theme: any;
}> = ({ onUpdate, onDismiss, theme }) => (
  <div 
    className="fixed bottom-4 left-4 right-4 md:left-auto md:w-96 z-50"
    style={{
      background: theme.colors.glass,
      backdropFilter: `blur(${theme.effects.blur})`,
      border: `1px solid ${theme.colors.glassBorder}`,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
    }}
  >
    <div className="flex items-center justify-between">
      <div>
        <h4 className="font-semibold text-sm" style={{ color: theme.colors.text }}>
          Update Available
        </h4>
        <p className="text-xs opacity-80" style={{ color: theme.colors.textSecondary }}>
          A new version is ready to install
        </p>
      </div>
      <div className="flex gap-2 ml-4">
        <button
          onClick={onDismiss}
          className="px-3 py-1 text-xs rounded opacity-80 hover:opacity-100 transition-opacity"
          style={{
            background: 'rgba(0, 0, 0, 0.1)',
            color: theme.colors.text,
          }}
        >
          Later
        </button>
        <button
          onClick={onUpdate}
          className="px-3 py-1 text-xs rounded font-medium transition-all"
          style={{
            background: theme.colors.primary,
            color: 'white',
          }}
        >
          Update
        </button>
      </div>
    </div>
  </div>
);

// Development tools for debugging
const DevTools: React.FC<{
  theme: any;
  user: any;
  preferences: any;
}> = ({ theme, user, preferences }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  
  if (!import.meta.env.DEV) return null;
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full text-xs font-mono"
        style={{
          background: theme.colors.glass,
          backdropFilter: `blur(${theme.effects.blur})`,
          border: `1px solid ${theme.colors.glassBorder}`,
          color: theme.colors.text,
        }}
      >
        DEV
      </button>
      
      {isOpen && (
        <div 
          className="absolute bottom-12 right-0 w-80 max-h-96 overflow-auto p-4 text-xs font-mono"
          style={{
            background: theme.colors.glass,
            backdropFilter: `blur(${theme.effects.blur})`,
            border: `1px solid ${theme.colors.glassBorder}`,
            borderRadius: theme.borderRadius.lg,
            color: theme.colors.text,
          }}
        >
          <div className="space-y-2">
            <div>
              <strong>Theme:</strong> {theme.name}
            </div>
            <div>
              <strong>User:</strong> {user?.isPremium ? 'Premium' : 'Free'}
            </div>
            <div>
              <strong>Performance:</strong>
              <pre className="text-xs mt-1 opacity-80">
                {JSON.stringify((window as any).__WISDOM_ORACLE_DEV__?.getPerformanceMetrics?.() || {}, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;