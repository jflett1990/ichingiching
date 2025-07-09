import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../components/themes/ThemeProvider';
import { useAppState, usePremiumFeatures } from '../store/AppStateProvider';
import { AnimationSequence, HexagramResult } from '../components/animations';
import LiquidGlassCard from '../components/ui/LiquidGlassCard';
import { LoadingScreen } from '../components/ui/LoadingScreen';
import ClaudeIntegrationService from '../services/claude';

interface DivinationState {
  step: 'question' | 'meditation' | 'tossing' | 'result' | 'interpretation';
  question: string;
  hexagramResult: HexagramResult | null;
  interpretation: any | null;
  isLoading: boolean;
  error: string | null;
}

const DivinationPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentTheme } = useTheme();
  const { user, addReading, trackEvent } = useAppState();
  const premiumFeatures = usePremiumFeatures();
  
  const [state, setState] = useState<DivinationState>({
    step: 'question',
    question: '',
    hexagramResult: null,
    interpretation: null,
    isLoading: false,
    error: null,
  });

  const [meditationTimer, setMeditationTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const claudeService = new ClaudeIntegrationService();

  // Question formation handlers
  const handleQuestionSubmit = useCallback(async () => {
    if (!state.question.trim()) return;

    trackEvent('question_submitted', { question_length: state.question.length });

    if (premiumFeatures.isPremium) {
      setState(prev => ({ ...prev, step: 'meditation' }));
    } else {
      setState(prev => ({ ...prev, step: 'tossing' }));
    }
  }, [state.question, premiumFeatures.isPremium, trackEvent]);

  const handleMeditationComplete = useCallback(() => {
    setState(prev => ({ ...prev, step: 'tossing' }));
    setIsTimerRunning(false);
    setMeditationTimer(0);
  }, []);

  // Hexagram generation handlers
  const handleHexagramComplete = useCallback(async (result: HexagramResult) => {
    setState(prev => ({ ...prev, hexagramResult: result, step: 'interpretation', isLoading: true }));
    
    try {
      trackEvent('hexagram_generated', { 
        hexagram: result.primaryNumber,
        changing_lines: result.changingLines.length 
      });

      // Get AI interpretation
      const interpretation = await claudeService.generateInterpretation(
        state.question,
        {
          primary: result.primaryNumber,
          secondary: result.secondaryNumber,
          changingLines: result.changingLines,
        },
        {
          isPremium: user?.isPremium || false,
          previousReadings: user?.stats?.totalReadings || 0,
        }
      );

      setState(prev => ({ 
        ...prev, 
        interpretation, 
        isLoading: false,
        step: 'result' 
      }));

      // Save to history
      addReading({
        question: state.question,
        hexagram: result,
        interpretation: interpretation.interpretation,
        tags: [],
        favorite: false,
      });

    } catch (error) {
      console.error('Failed to get interpretation:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to generate interpretation. Please try again.',
        isLoading: false 
      }));
    }
  }, [state.question, user, claudeService, addReading, trackEvent]);

  const handleStartOver = useCallback(() => {
    setState({
      step: 'question',
      question: '',
      hexagramResult: null,
      interpretation: null,
      isLoading: false,
      error: null,
    });
  }, []);

  // Meditation timer effect
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && meditationTimer > 0) {
      interval = setInterval(() => {
        setMeditationTimer(prev => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            handleMeditationComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, meditationTimer, handleMeditationComplete]);

  if (state.isLoading) {
    return (
      <LoadingScreen
        theme={currentTheme}
        message="Generating your interpretation..."
        variant="full"
      />
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Progress Indicator */}
        <div className="mb-8">
          <LiquidGlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h1 
                className="text-2xl font-bold gradient-text"
                style={{ fontFamily: currentTheme.typography.secondary }}
              >
                I Ching Divination
              </h1>
              <button
                onClick={() => navigate('/history')}
                className="text-sm opacity-70 hover:opacity-100 transition-opacity"
              >
                View History
              </button>
            </div>
            
            <ProgressIndicator currentStep={state.step} isPremium={premiumFeatures.isPremium} />
          </LiquidGlassCard>
        </div>

        <AnimatePresence mode="wait">
          {/* Question Formation Step */}
          {state.step === 'question' && (
            <QuestionFormation
              question={state.question}
              onQuestionChange={(question) => setState(prev => ({ ...prev, question }))}
              onSubmit={handleQuestionSubmit}
              isPremium={premiumFeatures.isPremium}
              theme={currentTheme}
            />
          )}

          {/* Meditation Step (Premium) */}
          {state.step === 'meditation' && (
            <MeditationStep
              timer={meditationTimer}
              isRunning={isTimerRunning}
              onStartTimer={(duration) => {
                setMeditationTimer(duration);
                setIsTimerRunning(true);
              }}
              onSkip={handleMeditationComplete}
              theme={currentTheme}
            />
          )}

          {/* Coin Tossing Step */}
          {state.step === 'tossing' && (
            <CoinTossStep
              question={state.question}
              onComplete={handleHexagramComplete}
              theme={currentTheme}
              user={user}
            />
          )}

          {/* Result Display */}
          {state.step === 'result' && state.hexagramResult && state.interpretation && (
            <ResultDisplay
              question={state.question}
              hexagramResult={state.hexagramResult}
              interpretation={state.interpretation}
              onStartOver={handleStartOver}
              onSaveToFavorites={() => {/* TODO: Implement */}}
              isPremium={premiumFeatures.isPremium}
              theme={currentTheme}
            />
          )}
        </AnimatePresence>

        {/* Error Display */}
        {state.error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6"
          >
            <LiquidGlassCard className="p-6 border-red-500/50">
              <div className="flex items-center space-x-3">
                <span className="text-red-500 text-xl">⚠️</span>
                <div>
                  <h3 className="font-semibold text-red-400">Error</h3>
                  <p className="text-sm opacity-80">{state.error}</p>
                </div>
              </div>
              <button
                onClick={() => setState(prev => ({ ...prev, error: null }))}
                className="mt-4 btn-premium"
              >
                Try Again
              </button>
            </LiquidGlassCard>
          </motion.div>
        )}
      </div>
    </div>
  );
};

// Progress Indicator Component
const ProgressIndicator: React.FC<{ currentStep: string; isPremium: boolean }> = ({ 
  currentStep, 
  isPremium 
}) => {
  const steps = isPremium 
    ? ['question', 'meditation', 'tossing', 'result']
    : ['question', 'tossing', 'result'];
  
  const stepLabels = {
    question: 'Question',
    meditation: 'Meditation',
    tossing: 'Coin Toss',
    result: 'Result',
  };

  const currentIndex = steps.indexOf(currentStep);

  return (
    <div className="flex items-center space-x-2">
      {steps.map((step, index) => (
        <React.Fragment key={step}>
          <div className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                index <= currentIndex 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                  : 'bg-gray-600 text-gray-300'
              }`}
            >
              {index < currentIndex ? '✓' : index + 1}
            </div>
            <span className={`ml-2 text-sm ${index <= currentIndex ? 'opacity-100' : 'opacity-50'}`}>
              {stepLabels[step]}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className="flex-1 h-px bg-gray-600 mx-4" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

// Question Formation Component
const QuestionFormation: React.FC<{
  question: string;
  onQuestionChange: (question: string) => void;
  onSubmit: () => void;
  isPremium: boolean;
  theme: any;
}> = ({ question, onQuestionChange, onSubmit, isPremium, theme }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
  >
    <LiquidGlassCard size="lg" className="p-8">
      <h2 className="text-2xl font-semibold mb-6 text-center">
        What guidance do you seek?
      </h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-3">
            Enter your question
          </label>
          <textarea
            value={question}
            onChange={(e) => onQuestionChange(e.target.value)}
            placeholder="Ask about a decision, situation, or path forward. Be specific and thoughtful..."
            className="w-full h-32 p-4 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            style={{
              color: theme.colors.text,
              fontFamily: theme.typography.primary,
            }}
          />
          <div className="flex justify-between mt-2 text-xs opacity-60">
            <span>{question.length} characters</span>
            <span>Recommended: 50-200 characters</span>
          </div>
        </div>

        {isPremium && (
          <div className="bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 p-4 rounded-lg border border-yellow-500/20">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-yellow-400">✨</span>
              <span className="text-sm font-medium text-yellow-300">Premium Enhancement</span>
            </div>
            <p className="text-sm opacity-80">
              Your premium subscription includes guided meditation and enhanced question refinement.
            </p>
          </div>
        )}

        <div className="space-y-3">
          <h3 className="text-sm font-medium">Tips for effective questions:</h3>
          <ul className="text-sm opacity-80 space-y-1">
            <li>• Focus on yourself and your choices</li>
            <li>• Ask about approach rather than outcome</li>
            <li>• Be open to unexpected insights</li>
            <li>• Avoid yes/no questions</li>
          </ul>
        </div>

        <button
          onClick={onSubmit}
          disabled={!question.trim()}
          className="w-full btn-premium py-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPremium ? 'Continue to Meditation' : 'Begin Coin Toss'}
        </button>
      </div>
    </LiquidGlassCard>
  </motion.div>
);

// Meditation Step Component (Premium)
const MeditationStep: React.FC<{
  timer: number;
  isRunning: boolean;
  onStartTimer: (duration: number) => void;
  onSkip: () => void;
  theme: any;
}> = ({ timer, isRunning, onStartTimer, onSkip, theme }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
  >
    <LiquidGlassCard size="lg" className="p-8 text-center">
      <div className="mb-6">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
          <span className="text-2xl">🧘</span>
        </div>
        <h2 className="text-2xl font-semibold mb-2">Center Yourself</h2>
        <p className="opacity-80">
          Take a moment to focus your mind and clarify your intention.
        </p>
      </div>

      {!isRunning && timer === 0 ? (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            {[1, 3, 5].map((minutes) => (
              <button
                key={minutes}
                onClick={() => onStartTimer(minutes * 60)}
                className="p-4 rounded-lg transition-all hover:scale-105"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: `1px solid ${theme.colors.glassBorder}`,
                }}
              >
                <div className="text-lg font-semibold">{minutes}m</div>
                <div className="text-xs opacity-70">
                  {minutes === 1 ? 'Quick' : minutes === 3 ? 'Standard' : 'Deep'}
                </div>
              </button>
            ))}
          </div>
          <button
            onClick={onSkip}
            className="text-sm opacity-70 hover:opacity-100 transition-opacity"
          >
            Skip meditation
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div 
            className="w-32 h-32 mx-auto rounded-full flex items-center justify-center text-3xl font-bold"
            style={{
              background: `conic-gradient(${theme.colors.primary} ${((timer / (5 * 60)) * 360)}deg, rgba(255,255,255,0.1) 0deg)`,
            }}
          >
            {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
          </div>
          <div className="space-y-2">
            <p className="text-lg">Breathe deeply and focus on your question</p>
            <p className="text-sm opacity-70">Let your mind settle and your intention clarify</p>
          </div>
          <button
            onClick={onSkip}
            className="text-sm opacity-70 hover:opacity-100 transition-opacity"
          >
            End meditation early
          </button>
        </div>
      )}
    </LiquidGlassCard>
  </motion.div>
);

// Coin Toss Step Component
const CoinTossStep: React.FC<{
  question: string;
  onComplete: (result: HexagramResult) => void;
  theme: any;
  user: any;
}> = ({ question, onComplete, theme, user }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
  >
    <LiquidGlassCard size="lg" className="p-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold mb-2">Generate Your Hexagram</h2>
        <p className="opacity-80 mb-4">
          Focus on your question while tossing the coins
        </p>
        <div className="p-4 bg-black/20 rounded-lg">
          <p className="text-sm italic">"{question}"</p>
        </div>
      </div>

      <AnimationSequence
        onComplete={onComplete}
        onLineGenerated={(line, lineNumber) => {
          console.log(`Line ${lineNumber} generated:`, line);
        }}
        audioEnabled={user?.preferences?.audioEnabled ?? true}
        audioVolume={user?.preferences?.audioVolume ?? 0.7}
      />
    </LiquidGlassCard>
  </motion.div>
);

// Result Display Component
const ResultDisplay: React.FC<{
  question: string;
  hexagramResult: HexagramResult;
  interpretation: any;
  onStartOver: () => void;
  onSaveToFavorites: () => void;
  isPremium: boolean;
  theme: any;
}> = ({ question, hexagramResult, interpretation, onStartOver, isPremium, theme }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="space-y-6"
  >
    {/* Question Recap */}
    <LiquidGlassCard className="p-6">
      <h3 className="font-semibold mb-2">Your Question</h3>
      <p className="italic opacity-80">"{question}"</p>
    </LiquidGlassCard>

    {/* Hexagram Display */}
    <LiquidGlassCard className="p-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-4">
          Hexagram #{hexagramResult.primaryNumber}
        </h3>
        {/* Hexagram visualization would go here */}
        <div className="space-y-1 my-6">
          {hexagramResult.lines.slice().reverse().map((line, index) => (
            <div key={index} className="flex justify-center">
              <div 
                className={`h-2 ${line.original.value === 1 ? 'w-16' : 'w-6'} bg-current`}
                style={{ color: theme.colors.primary }}
              />
              {line.original.value === 0 && (
                <div className="w-4" />
              )}
              {line.original.value === 0 && (
                <div 
                  className="h-2 w-6 bg-current"
                  style={{ color: theme.colors.primary }}
                />
              )}
            </div>
          ))}
        </div>
        {hexagramResult.changingLines.length > 0 && (
          <p className="text-sm opacity-70">
            Changing lines: {hexagramResult.changingLines.join(', ')}
          </p>
        )}
      </div>
    </LiquidGlassCard>

    {/* AI Interpretation */}
    <LiquidGlassCard className="p-6">
      <h3 className="text-xl font-semibold mb-4">Interpretation</h3>
      <div className="prose prose-invert max-w-none">
        <div 
          className="whitespace-pre-line"
          dangerouslySetInnerHTML={{ __html: interpretation.interpretation }}
        />
      </div>
      
      {isPremium && (
        <div className="mt-6 pt-6 border-t border-white/10">
          <button className="btn-premium">
            💬 Ask Follow-up Questions
          </button>
        </div>
      )}
    </LiquidGlassCard>

    {/* Actions */}
    <LiquidGlassCard className="p-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <button onClick={onStartOver} className="btn-premium flex-1">
          New Reading
        </button>
        <button 
          className="flex-1 px-6 py-3 rounded-lg font-semibold transition-all"
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: `1px solid ${theme.colors.glassBorder}`,
          }}
        >
          ⭐ Save to Favorites
        </button>
        <button 
          className="flex-1 px-6 py-3 rounded-lg font-semibold transition-all"
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: `1px solid ${theme.colors.glassBorder}`,
          }}
        >
          📤 Share
        </button>
      </div>
    </LiquidGlassCard>
  </motion.div>
);

export default DivinationPage;