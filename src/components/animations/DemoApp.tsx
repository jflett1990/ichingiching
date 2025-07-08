import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AnimationSequence, HexagramResult, HexagramLine } from './index';

/**
 * Demo App showing how to use the Three.js Coin Toss Animation System
 * This component demonstrates the complete I Ching divination flow
 */
const DemoApp: React.FC = () => {
  const [hexagramResult, setHexagramResult] = useState<HexagramResult | null>(null);
  const [currentLine, setCurrentLine] = useState<HexagramLine | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isComplete, setIsComplete] = useState(false);

  const handleHexagramComplete = (result: HexagramResult) => {
    setHexagramResult(result);
    setIsComplete(true);
    console.log('Hexagram complete:', result);
  };

  const handleLineGenerated = (line: HexagramLine, lineNumber: number) => {
    setCurrentLine(line);
    console.log(`Line ${lineNumber} generated:`, line);
  };

  const resetDemo = () => {
    setHexagramResult(null);
    setCurrentLine(null);
    setIsComplete(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">
            I Ching Divination
          </h1>
          <p className="text-white/80">
            Three.js Coin Toss Animation System Demo
          </p>
        </motion.div>

        {/* Audio Controls */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center mb-6"
        >
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              audioEnabled
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-600 text-white hover:bg-gray-700'
            }`}
          >
            {audioEnabled ? '🔊 Audio On' : '🔇 Audio Off'}
          </button>
        </motion.div>

        {/* Main Animation Sequence */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 mb-8"
        >
          <AnimationSequence
            onComplete={handleHexagramComplete}
            onLineGenerated={handleLineGenerated}
            audioEnabled={audioEnabled}
            audioVolume={0.7}
          />
        </motion.div>

        {/* Results Display */}
        {hexagramResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 mb-8"
          >
            <h2 className="text-2xl font-bold text-white mb-4 text-center">
              Your Hexagram
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Primary Hexagram */}
              <div className="bg-white/5 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Primary Hexagram
                </h3>
                <div className="text-white/80">
                  <p>Number: #{hexagramResult.primaryNumber}</p>
                  <div className="mt-2 font-mono text-sm">
                    {hexagramResult.lines.slice().reverse().map((line, index) => (
                      <div key={index} className="mb-1">
                        {line.original.symbol} {line.original.description}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Secondary Hexagram (if changing lines exist) */}
              {hexagramResult.secondaryNumber && (
                <div className="bg-white/5 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Transformed Hexagram
                  </h3>
                  <div className="text-white/80">
                    <p>Number: #{hexagramResult.secondaryNumber}</p>
                    <p className="text-sm mt-1">
                      Changing lines: {hexagramResult.changingLines.join(', ')}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Coin History */}
            <div className="mt-6 bg-white/5 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-white mb-2">
                Coin Toss History
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                {hexagramResult.coinHistory.map((toss, index) => (
                  <div key={index} className="text-white/80">
                    <span className="font-medium">Line {index + 1}:</span> {toss.coin1}, {toss.coin2}, {toss.coin3}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Reset Button */}
        {isComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <button
              onClick={resetDemo}
              className="px-8 py-3 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-xl transition-all backdrop-blur-sm border border-white/30"
            >
              Start New Reading
            </button>
          </motion.div>
        )}

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center text-white/60 text-sm"
        >
          <p>
            Click "Toss 3 Coins" to generate each line of your hexagram.
            The coins will tumble with realistic physics and settle to reveal your line.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default DemoApp;