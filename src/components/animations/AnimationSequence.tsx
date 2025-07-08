import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ThreeCoinEngine from './ThreeCoinEngine';
import CoinTrioControls from './CoinTrioControls';
import CoinAudioSystem from './CoinAudioSystem';
import LineCalculator, { CoinResult, HexagramResult, HexagramLine } from '../../utils/LineCalculator';
import HexagramLineDisplay from './HexagramLineDisplay';

interface AnimationSequenceProps {
  onComplete: (hexagramResult: HexagramResult) => void;
  onLineGenerated: (line: HexagramLine, lineNumber: number) => void;
  disabled?: boolean;
  audioEnabled?: boolean;
  audioVolume?: number;
}

interface TossState {
  lineNumber: number;
  isAnimating: boolean;
  coinResults: ('heads' | 'tails')[] | null;
  isComplete: boolean;
}

const AnimationSequence: React.FC<AnimationSequenceProps> = ({
  onComplete,
  onLineGenerated,
  disabled = false,
  audioEnabled = true,
  audioVolume = 0.5,
}) => {
  const [currentToss, setCurrentToss] = useState<TossState>({
    lineNumber: 1,
    isAnimating: false,
    coinResults: null,
    isComplete: false,
  });

  const [completedLines, setCompletedLines] = useState<HexagramLine[]>([]);
  const [allCoinResults, setAllCoinResults] = useState<CoinResult[]>([]);
  const [showEngine, setShowEngine] = useState(false);
  const [hexagramResult, setHexagramResult] = useState<HexagramResult | null>(null);

  // Handle toss trigger
  const handleTriggerToss = useCallback(() => {
    if (currentToss.isAnimating || currentToss.isComplete) return;

    setCurrentToss(prev => ({
      ...prev,
      isAnimating: true,
      coinResults: null,
    }));

    setShowEngine(true);
  }, [currentToss.isAnimating, currentToss.isComplete]);

  // Handle coin results from Three.js engine
  const handleCoinsSettled = useCallback((results: ('heads' | 'tails')[]) => {
    setCurrentToss(prev => ({
      ...prev,
      coinResults: results,
    }));
  }, []);

  // Handle animation complete
  const handleAnimationComplete = useCallback(() => {
    setShowEngine(false);
    
    if (currentToss.coinResults) {
      // Convert results to CoinResult format
      const coinResult: CoinResult = {
        coin1: currentToss.coinResults[0],
        coin2: currentToss.coinResults[1],
        coin3: currentToss.coinResults[2],
      };

      // Calculate the line
      const line = LineCalculator.calculateLine(coinResult, currentToss.lineNumber);
      
      // Update state
      setCompletedLines(prev => [...prev, line]);
      setAllCoinResults(prev => [...prev, coinResult]);
      
      // Notify parent component
      onLineGenerated(line, currentToss.lineNumber);

      // Check if we've completed all 6 tosses
      if (currentToss.lineNumber === 6) {
        // Generate complete hexagram
        const newAllCoinResults = [...allCoinResults, coinResult];
        const hexagram = LineCalculator.generateHexagram(newAllCoinResults);
        setHexagramResult(hexagram);
        
        setCurrentToss({
          lineNumber: 6,
          isAnimating: false,
          coinResults: null,
          isComplete: true,
        });
        
        // Notify completion
        onComplete(hexagram);
      } else {
        // Move to next line
        setCurrentToss({
          lineNumber: currentToss.lineNumber + 1,
          isAnimating: false,
          coinResults: null,
          isComplete: false,
        });
      }
    }
  }, [currentToss, allCoinResults, onLineGenerated, onComplete]);

  // Reset sequence
  const resetSequence = useCallback(() => {
    setCurrentToss({
      lineNumber: 1,
      isAnimating: false,
      coinResults: null,
      isComplete: false,
    });
    setCompletedLines([]);
    setAllCoinResults([]);
    setShowEngine(false);
    setHexagramResult(null);
  }, []);

  return (
    <div className="flex flex-col items-center space-y-6 p-6">
      {/* Audio System */}
      <CoinAudioSystem
        isActive={currentToss.isAnimating}
        volume={audioEnabled ? audioVolume : 0}
        muted={!audioEnabled}
      />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          I Ching Divination
        </h2>
        <p className="text-gray-600">
          {currentToss.isComplete 
            ? 'Hexagram complete! Review your reading below.'
            : `Generate line ${currentToss.lineNumber} of 6`}
        </p>
      </motion.div>

      {/* Hexagram Display */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
      >
        <HexagramLineDisplay
          lines={completedLines}
          currentLine={currentToss.lineNumber}
          isAnimating={currentToss.isAnimating}
          isComplete={currentToss.isComplete}
        />
      </motion.div>

      {/* Three.js Animation Engine */}
      <AnimatePresence>
        {showEngine && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="w-full max-w-2xl"
          >
            <ThreeCoinEngine
              isActive={showEngine}
              onAllCoinsSettled={handleCoinsSettled}
              onAnimationComplete={handleAnimationComplete}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <AnimatePresence>
        {!showEngine && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <CoinTrioControls
              isActive={!currentToss.isComplete}
              isAnimating={currentToss.isAnimating}
              onTriggerToss={handleTriggerToss}
              lineNumber={currentToss.lineNumber}
              totalLines={6}
              disabled={disabled || currentToss.isComplete}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current Toss Results */}
      <AnimatePresence>
        {currentToss.coinResults && !showEngine && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200"
          >
            <div className="text-center">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">
                Line {currentToss.lineNumber} Results
              </h3>
              <div className="flex justify-center space-x-4 mb-3">
                {currentToss.coinResults.map((result, index) => (
                  <motion.div
                    key={index}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                      result === 'heads' ? 'bg-yellow-400' : 'bg-gray-400'
                    }`}
                  >
                    {result === 'heads' ? '🪙' : '⚫'}
                  </motion.div>
                ))}
              </div>
              <p className="text-blue-700">
                {currentToss.coinResults.join(', ')} = {
                  LineCalculator.calculateSum({
                    coin1: currentToss.coinResults[0],
                    coin2: currentToss.coinResults[1],
                    coin3: currentToss.coinResults[2],
                  })
                } points
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Completion Actions */}
      <AnimatePresence>
        {currentToss.isComplete && hexagramResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200">
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                Hexagram Complete!
              </h3>
              <p className="text-green-700">
                {LineCalculator.getHexagramSummary(hexagramResult)}
              </p>
            </div>
            
            <button
              onClick={resetSequence}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold"
            >
              Generate New Hexagram
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Debug Info (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-8 w-full max-w-md">
          <summary className="text-sm text-gray-500 cursor-pointer">
            Debug Info
          </summary>
          <pre className="text-xs text-gray-400 mt-2 bg-gray-100 p-2 rounded">
            {JSON.stringify(
              {
                currentToss,
                completedLines: completedLines.length,
                allCoinResults: allCoinResults.length,
                hexagramResult: hexagramResult ? {
                  primaryNumber: hexagramResult.primaryNumber,
                  secondaryNumber: hexagramResult.secondaryNumber,
                  changingLines: hexagramResult.changingLines,
                } : null,
              },
              null,
              2
            )}
          </pre>
        </details>
      )}
    </div>
  );
};

export default AnimationSequence;