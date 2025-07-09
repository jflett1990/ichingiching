import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { Navigation } from '../components/layout/Navigation';
import { useTheme } from '../components/themes/ThemeProvider';
import { useAppState, usePremiumFeatures } from '../store/AppStateProvider';
import { LoadingScreen } from '../components/ui/LoadingScreen';
import GlobalErrorFallback from '../components/ui/GlobalErrorFallback';
import { BackgroundEffects } from '../components/ui/BackgroundEffects';

// Lazy load all pages for better performance
const Home = React.lazy(() => import('../pages/Home'));
const Divination = React.lazy(() => import('../pages/Divination'));
const History = React.lazy(() => import('../pages/History'));
const Instructions = React.lazy(() => import('../pages/Instructions'));
const Settings = React.lazy(() => import('../pages/Settings'));
const Profile = React.lazy(() => import('../pages/Profile'));
const Themes = React.lazy(() => import('../pages/Themes'));
const Patterns = React.lazy(() => import('../pages/Patterns'));
const Conversations = React.lazy(() => import('../pages/Conversations'));
const NotFound = React.lazy(() => import('../pages/NotFound'));

// Protected Route Component
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  requiresPremium?: boolean;
}> = ({ children, requiresPremium = false }) => {
  const { user } = useAppState();
  const premiumFeatures = usePremiumFeatures();

  // Check if premium access is required
  if (requiresPremium && !premiumFeatures.isPremium) {
    return <Navigate to="/settings" replace />;
  }

  return <>{children}</>;
};

// Route Configuration
const routes = [
  {
    path: '/',
    element: Home,
    title: 'Home',
  },
  {
    path: '/divination',
    element: Divination,
    title: 'Divination',
  },
  {
    path: '/history',
    element: History,
    title: 'History',
  },
  {
    path: '/instructions',
    element: Instructions,
    title: 'Instructions',
  },
  {
    path: '/settings',
    element: Settings,
    title: 'Settings',
  },
  {
    path: '/profile',
    element: Profile,
    title: 'Profile',
  },
  // Premium routes
  {
    path: '/themes',
    element: Themes,
    title: 'Themes',
    requiresPremium: true,
  },
  {
    path: '/patterns',
    element: Patterns,
    title: 'Pattern Analysis',
    requiresPremium: true,
  },
  {
    path: '/conversations',
    element: Conversations,
    title: 'Conversations',
    requiresPremium: true,
  },
];

// App Router Component
const AppRouter: React.FC = () => {
  const { currentTheme } = useTheme();
  const { user, trackPageView } = useAppState();
  const premiumFeatures = usePremiumFeatures();

  // Track page views
  React.useEffect(() => {
    const handleRouteChange = () => {
      trackPageView(window.location.pathname);
    };
    
    window.addEventListener('popstate', handleRouteChange);
    handleRouteChange(); // Track initial page load
    
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, [trackPageView]);

  return (
    <Router>
      <ErrorBoundary 
        FallbackComponent={GlobalErrorFallback}
        onError={(error, errorInfo) => {
          console.error('Router Error:', error, errorInfo);
          // Track error in analytics
          if (user?.preferences?.analytics !== false) {
            trackPageView('/error', { error: error.message });
          }
        }}
      >
        <div className="min-h-screen relative">
          {/* Background Effects */}
          <BackgroundEffects 
            theme={currentTheme}
            enabled={user?.preferences?.particles !== false}
          />
          
          {/* Navigation */}
          <Navigation 
            user={user}
            theme={currentTheme}
            updateAvailable={false} // TODO: Implement update detection
            onUpdateApp={() => {}} // TODO: Implement update handler
            onDismissUpdate={() => {}} // TODO: Implement dismiss handler
          />
          
          {/* Main Content */}
          <main className="relative z-10 pt-20">
            <Suspense 
              fallback={
                <LoadingScreen 
                  theme={currentTheme}
                  message="Loading page..."
                  variant="full"
                />
              }
            >
              <Routes>
                {routes.map(({ path, element: Element, requiresPremium }) => (
                  <Route
                    key={path}
                    path={path}
                    element={
                      <ProtectedRoute requiresPremium={requiresPremium}>
                        <Element />
                      </ProtectedRoute>
                    }
                  />
                ))}
                
                {/* Catch-all route for 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </main>
        </div>
      </ErrorBoundary>
    </Router>
  );
};

export default AppRouter;

// Hook for navigation utilities
export const useNavigation = () => {
  const { user } = useAppState();
  const premiumFeatures = usePremiumFeatures();

  const canAccessRoute = (path: string) => {
    const premiumRoutes = ['/themes', '/patterns', '/conversations'];
    return !premiumRoutes.includes(path) || premiumFeatures.isPremium;
  };

  const getRouteTitle = (path: string) => {
    const route = routes.find(r => r.path === path);
    return route?.title || 'Unknown Page';
  };

  return {
    canAccessRoute,
    getRouteTitle,
    routes: routes.filter(route => 
      !route.requiresPremium || premiumFeatures.isPremium
    ),
  };
};

// Export route definitions for use in other components
export { routes };