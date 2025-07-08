import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../components/themes/ThemeProvider';
import { useAppState } from '../store/AppStateProvider';
import { AnimationSequence, HexagramResult } from '../components/animations';
import LiquidGlassCard from '../components/ui/LiquidGlassCard';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { currentTheme } = useTheme();
  const { user, addReading } = useAppState();
  const [demoResult, setDemoResult] = useState<HexagramResult | null>(null);
  const [isDemo, setIsDemo] = useState(false);

  const handleStartDivination = () => {
    navigate('/divination');
  };

  const handleDemoComplete = (result: HexagramResult) => {
    setDemoResult(result);
    // Don't save demo readings to history
  };

  const handleTryDemo = () => {
    setIsDemo(true);
    setDemoResult(null);
  };

  const resetDemo = () => {
    setIsDemo(false);
    setDemoResult(null);
  };

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 py-20">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Hero Content */}
          <div className="text-center lg:text-left z-10">
            <h1 
              className="text-5xl lg:text-6xl font-bold mb-6 gradient-text leading-tight"
              style={{ fontFamily: currentTheme.typography.secondary }}
            >
              Wisdom Oracle
            </h1>
            
            <p 
              className="text-xl lg:text-2xl mb-8 opacity-90"
              style={{ color: currentTheme.colors.textSecondary }}
            >
              Experience the ancient wisdom of the I Ching through cutting-edge 
              technology and AI-powered interpretations.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button
                onClick={handleStartDivination}
                className="btn-premium text-lg px-8 py-4"
              >
                Begin Your Reading
              </button>
              
              <button
                onClick={handleTryDemo}
                className="px-8 py-4 rounded-lg font-semibold transition-all hover:scale-105"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: `1px solid ${currentTheme.colors.glassBorder}`,
                  color: currentTheme.colors.text,
                }}
              >
                Try Demo
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-12">
              <div className="text-center">
                <div 
                  className="text-3xl font-bold gradient-text"
                  style={{ fontFamily: currentTheme.typography.secondary }}
                >
                  64
                </div>
                <p className="text-sm opacity-70">Hexagrams</p>
              </div>
              <div className="text-center">
                <div 
                  className="text-3xl font-bold gradient-text"
                  style={{ fontFamily: currentTheme.typography.secondary }}
                >
                  {user?.stats?.totalReadings || 0}
                </div>
                <p className="text-sm opacity-70">Your Readings</p>
              </div>
              <div className="text-center">
                <div 
                  className="text-3xl font-bold gradient-text"
                  style={{ fontFamily: currentTheme.typography.secondary }}
                >
                  AI
                </div>
                <p className="text-sm opacity-70">Powered</p>
              </div>
            </div>
          </div>

          {/* Interactive Demo */}
          <div className="relative">
            <LiquidGlassCard size="lg" className="p-8">
              {!isDemo ? (
                <div className="text-center">
                  <h3 className="text-2xl font-semibold mb-4">
                    Experience the Three.js Coin Animation
                  </h3>
                  <p className="opacity-80 mb-6">
                    See our revolutionary 3-coin toss system in action with realistic physics
                  </p>
                  <button
                    onClick={handleTryDemo}
                    className="btn-premium"
                  >
                    Try Interactive Demo
                  </button>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold">Interactive Demo</h3>
                    <button
                      onClick={resetDemo}
                      className="text-sm opacity-70 hover:opacity-100 transition-opacity"
                    >
                      Reset
                    </button>
                  </div>
                  
                  <AnimationSequence
                    onComplete={handleDemoComplete}
                    onLineGenerated={(line, num) => console.log(`Demo line ${num}:`, line)}
                    audioEnabled={user?.preferences?.audioEnabled ?? true}
                    audioVolume={user?.preferences?.audioVolume ?? 0.7}
                  />

                  {demoResult && (
                    <div className="mt-6 p-4 rounded-lg bg-black/10">
                      <h4 className="font-semibold mb-2">Demo Complete!</h4>
                      <p className="text-sm opacity-80">
                        Hexagram #{demoResult.primaryNumber} generated
                        {demoResult.changingLines.length > 0 && 
                          ` with ${demoResult.changingLines.length} changing lines`
                        }
                      </p>
                      <button
                        onClick={handleStartDivination}
                        className="btn-premium mt-4 w-full"
                      >
                        Start Real Reading
                      </button>
                    </div>
                  )}
                </div>
              )}
            </LiquidGlassCard>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 
            className="text-4xl font-bold text-center mb-16 gradient-text"
            style={{ fontFamily: currentTheme.typography.secondary }}
          >
            Premium Features
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <LiquidGlassCard className="p-6 text-center">
              <div 
                className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${currentTheme.colors.primary}, ${currentTheme.colors.secondary})`,
                }}
              >
                <span className="text-white text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Realistic Physics</h3>
              <p className="opacity-80">
                Experience authentic coin tosses with advanced Three.js physics simulation
              </p>
            </LiquidGlassCard>

            <LiquidGlassCard className="p-6 text-center">
              <div 
                className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${currentTheme.colors.secondary}, ${currentTheme.colors.accent})`,
                }}
              >
                <span className="text-white text-2xl">🤖</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">AI Interpretations</h3>
              <p className="opacity-80">
                Get personalized insights powered by Claude AI for deeper understanding
              </p>
            </LiquidGlassCard>

            <LiquidGlassCard className="p-6 text-center">
              <div 
                className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${currentTheme.colors.accent}, ${currentTheme.colors.primary})`,
                }}
              >
                <span className="text-white text-2xl">🎨</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Premium Themes</h3>
              <p className="opacity-80">
                Choose from 5 stunning themes including Art Nouveau and Cyberpunk
              </p>
            </LiquidGlassCard>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <LiquidGlassCard size="xl" className="p-12">
            <h2 
              className="text-3xl lg:text-4xl font-bold mb-6 gradient-text"
              style={{ fontFamily: currentTheme.typography.secondary }}
            >
              Ready to Discover Your Path?
            </h2>
            
            <p 
              className="text-xl mb-8 opacity-90"
              style={{ color: currentTheme.colors.textSecondary }}
            >
              Join thousands who have found clarity through our modern approach to ancient wisdom.
            </p>

            <button
              onClick={handleStartDivination}
              className="btn-premium text-xl px-12 py-5"
            >
              Begin Your Journey
            </button>
          </LiquidGlassCard>
        </div>
      </section>
    </div>
  );
};

export default HomePage;