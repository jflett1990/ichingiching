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
              className="text-5xl lg:text-7xl font-bold mb-8 text-luxury text-luxury-spacing leading-tight animate-fade-in float-gentle"
              style={{ fontFamily: currentTheme.typography.secondary }}
            >
              Wisdom Oracle
            </h1>
            
            <p 
              className="text-xl lg:text-2xl mb-10 opacity-90 text-premium-spacing animate-slide-up"
              style={{ 
                color: currentTheme.colors.textSecondary,
                animationDelay: '0.2s'
              }}
            >
              Experience the ancient wisdom of the I Ching through cutting-edge 
              technology and AI-powered interpretations.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <button
                onClick={handleStartDivination}
                className="btn-luxury text-lg px-10 py-5 hover-lift focus-luxury"
              >
                Begin Your Journey
              </button>
              
              <button
                onClick={handleTryDemo}
                className="btn-glass text-lg px-10 py-5 hover-glow focus-luxury"
              >
                Try Interactive Demo
              </button>
            </div>

            {/* Enhanced Stats */}
            <div className="grid grid-cols-3 gap-8 mt-16">
              <div className="text-center glass-luxury p-6 rounded-2xl hover-lift">
                <div 
                  className="text-4xl font-bold text-luxury mb-2 animate-glow-pulse"
                  style={{ fontFamily: currentTheme.typography.secondary }}
                >
                  64
                </div>
                <p className="text-sm opacity-80 text-premium-spacing uppercase tracking-wider">Ancient Hexagrams</p>
              </div>
              <div className="text-center glass-luxury p-6 rounded-2xl hover-lift">
                <div 
                  className="text-4xl font-bold text-premium mb-2"
                  style={{ fontFamily: currentTheme.typography.secondary }}
                >
                  {user?.stats?.totalReadings || 0}
                </div>
                <p className="text-sm opacity-80 text-premium-spacing uppercase tracking-wider">Your Insights</p>
              </div>
              <div className="text-center glass-luxury p-6 rounded-2xl hover-lift">
                <div 
                  className="text-4xl font-bold text-shimmer mb-2"
                  style={{ fontFamily: currentTheme.typography.secondary }}
                >
                  AI
                </div>
                <p className="text-sm opacity-80 text-premium-spacing uppercase tracking-wider">Powered Wisdom</p>
              </div>
            </div>
          </div>

          {/* Enhanced Interactive Demo */}
          <div className="relative">
            <LiquidGlassCard 
              variant="luxury" 
              size="xl" 
              className="p-10"
              floating={true}
              glow={true}
            >
              {!isDemo ? (
                <div className="text-center">
                  <h3 className="text-3xl font-bold mb-6 text-premium">
                    Experience Our Revolutionary Coin Physics
                  </h3>
                  <p className="opacity-90 mb-8 text-lg text-premium-spacing">
                    Witness the magic of realistic Three.js physics simulation 
                    combined with ancient divination wisdom
                  </p>
                  <button
                    onClick={handleTryDemo}
                    className="btn-luxury text-xl px-12 py-6 hover-lift"
                  >
                    Launch Interactive Demo
                  </button>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-bold text-luxury">Live Demo Experience</h3>
                    <button
                      onClick={resetDemo}
                      className="btn-glass px-6 py-3 text-sm hover-glow"
                    >
                      Reset Demo
                    </button>
                  </div>
                  
                  <AnimationSequence
                    onComplete={handleDemoComplete}
                    onLineGenerated={(line, num) => console.log(`Demo line ${num}:`, line)}
                    audioEnabled={user?.preferences?.audioEnabled ?? true}
                    audioVolume={user?.preferences?.audioVolume ?? 0.7}
                  />

                  {demoResult && (
                    <LiquidGlassCard variant="crystal" className="mt-8 p-6">
                      <h4 className="font-bold mb-3 text-luxury text-xl">Demo Complete!</h4>
                      <p className="text-base opacity-90 mb-6">
                        Hexagram #{demoResult.primaryNumber} has been generated
                        {demoResult.changingLines.length > 0 && 
                          ` with ${demoResult.changingLines.length} changing lines`
                        }
                      </p>
                      <button
                        onClick={handleStartDivination}
                        className="btn-luxury w-full text-lg py-4"
                      >
                        Begin Your Real Reading
                      </button>
                    </LiquidGlassCard>
                  )}
                </div>
              )}
            </LiquidGlassCard>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 
            className="text-5xl lg:text-6xl font-bold text-center mb-20 text-luxury text-shimmer"
            style={{ fontFamily: currentTheme.typography.secondary }}
          >
            Luxury Features
          </h2>

          <div className="grid md:grid-cols-3 gap-10">
            <LiquidGlassCard 
              variant="ultra" 
              className="p-8 text-center"
              interactive={true}
              floating={true}
            >
              <div 
                className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center shadow-luxury"
                style={{
                  background: `linear-gradient(135deg, ${currentTheme.colors.primary}, ${currentTheme.colors.secondary})`,
                }}
              >
                <span className="text-white text-3xl">🎯</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-premium">Quantum Physics Engine</h3>
              <p className="opacity-90 text-lg text-premium-spacing">
                Experience authentic coin tosses with our revolutionary Three.js physics simulation featuring real-world gravity and momentum
              </p>
            </LiquidGlassCard>

            <LiquidGlassCard 
              variant="ultra" 
              className="p-8 text-center"
              interactive={true}
              floating={true}
              shimmer={true}
            >
              <div 
                className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center shadow-luxury"
                style={{
                  background: `linear-gradient(135deg, ${currentTheme.colors.secondary}, ${currentTheme.colors.accent})`,
                }}
              >
                <span className="text-white text-3xl">🤖</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-luxury">AI-Powered Wisdom</h3>
              <p className="opacity-90 text-lg text-premium-spacing">
                Receive profound insights powered by Claude AI, delivering personalized interpretations that resonate with your soul
              </p>
            </LiquidGlassCard>

            <LiquidGlassCard 
              variant="ultra" 
              className="p-8 text-center"
              interactive={true}
              floating={true}
              glow={true}
            >
              <div 
                className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center shadow-luxury"
                style={{
                  background: `linear-gradient(135deg, ${currentTheme.colors.accent}, ${currentTheme.colors.primary})`,
                }}
              >
                <span className="text-white text-3xl">🎨</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-shimmer">Luxe Design Themes</h3>
              <p className="opacity-90 text-lg text-premium-spacing">
                Immerse yourself in 5 meticulously crafted themes including Art Nouveau elegance and Cyberpunk sophistication
              </p>
            </LiquidGlassCard>
          </div>
        </div>
      </section>

      {/* Luxury CTA Section */}
      <section className="py-32 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <LiquidGlassCard 
            variant="luxury" 
            size="2xl" 
            className="p-16"
            glow={true}
            floating={true}
            shimmer={true}
          >
            <h2 
              className="text-4xl lg:text-6xl font-bold mb-8 text-luxury text-luxury-spacing"
              style={{ fontFamily: currentTheme.typography.secondary }}
            >
              Ready to Unlock Ancient Wisdom?
            </h2>
            
            <p 
              className="text-2xl mb-12 opacity-95 text-premium-spacing"
              style={{ color: currentTheme.colors.textSecondary }}
            >
              Join thousands of seekers who have discovered profound insights through our 
              luxurious fusion of ancient wisdom and cutting-edge technology.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <button
                onClick={handleStartDivination}
                className="btn-luxury text-xl px-16 py-6 hover-lift focus-luxury"
              >
                Begin Your Sacred Journey
              </button>
              
              <div className="text-center">
                <p className="text-sm opacity-70 mb-2 uppercase tracking-wider">Trusted by</p>
                <p className="text-2xl font-bold text-shimmer">10,000+ Seekers</p>
              </div>
            </div>
          </LiquidGlassCard>
        </div>
      </section>
    </div>
  );
};

export default HomePage;