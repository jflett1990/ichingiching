import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HexagramLine } from '../../utils/LineCalculator';

interface HexagramLineDisplayProps {
  lines: HexagramLine[];
  currentLine: number;
  isAnimating: boolean;
  isComplete: boolean;
}

interface LineDisplayProps {
  line: HexagramLine;
  index: number;
  isActive: boolean;
  isComplete: boolean;
}

const LineDisplay: React.FC<LineDisplayProps> = ({ line, index, isActive, isComplete }) => {
  const [showChanging, setShowChanging] = useState(false);

  useEffect(() => {
    if (isComplete && line.original.isChanging) {
      const timer = setTimeout(() => {
        setShowChanging(true);
      }, 2000 + index * 200);
      return () => clearTimeout(timer);
    }
  }, [isComplete, line.original.isChanging, index]);

  const lineVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8,
      pathLength: 0 
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      pathLength: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    },
    changing: {
      opacity: [1, 0.3, 1],
      scale: [1, 1.1, 1],
      transition: {
        duration: 1,
        ease: "easeInOut"
      }
    }
  };

  const getSolidLinePath = (width: number, height: number) => {
    return `M 0,${height/2} L ${width},${height/2}`;
  };

  const getBrokenLinePath = (width: number, height: number) => {
    const gap = width * 0.1;
    const segmentWidth = (width - gap) / 2;
    return `M 0,${height/2} L ${segmentWidth},${height/2} M ${segmentWidth + gap},${height/2} L ${width},${height/2}`;
  };

  const currentLineToShow = showChanging && line.changed ? line.changed : line.original;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`flex items-center justify-center py-2 ${
        isActive ? 'bg-blue-50 rounded-lg' : ''
      }`}
    >
      <div className="flex items-center space-x-4">
        {/* Line Number */}
        <div className="text-sm font-medium text-gray-500 w-8 text-center">
          {line.position}
        </div>

        {/* Line Visual */}
        <div className="relative">
          <svg width="120" height="20" viewBox="0 0 120 20">
            <motion.path
              d={
                currentLineToShow.type === 'solid'
                  ? getSolidLinePath(120, 20)
                  : getBrokenLinePath(120, 20)
              }
              stroke={
                currentLineToShow.isChanging 
                  ? "#f59e0b" 
                  : currentLineToShow.type === 'solid' 
                    ? "#1f2937" 
                    : "#6b7280"
              }
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              variants={lineVariants}
              initial="hidden"
              animate={showChanging ? "changing" : "visible"}
            />
          </svg>
          
          {/* Changing line indicator */}
          {line.original.isChanging && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="absolute -right-6 top-1/2 transform -translate-y-1/2"
            >
              <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse" />
            </motion.div>
          )}
        </div>

        {/* Line Description */}
        <div className="text-sm text-gray-600 min-w-0 flex-1">
          <div className="font-medium">
            {currentLineToShow.description}
          </div>
          {showChanging && line.changed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-amber-600 mt-1"
            >
              Changed from {line.original.description.toLowerCase()}
            </motion.div>
          )}
        </div>

        {/* Point Value */}
        <div className="text-sm font-mono text-gray-500 w-8 text-center">
          {line.original.sum}
        </div>
      </div>
    </motion.div>
  );
};

const HexagramLineDisplay: React.FC<HexagramLineDisplayProps> = ({
  lines,
  currentLine,
  isAnimating,
  isComplete,
}) => {
  const [showTransformation, setShowTransformation] = useState(false);

  useEffect(() => {
    if (isComplete) {
      const timer = setTimeout(() => {
        setShowTransformation(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isComplete]);

  // Create array of 6 positions, with completed lines filled in
  const displayLines = Array.from({ length: 6 }, (_, index) => {
    const position = index + 1;
    return lines.find(line => line.position === position);
  });

  const changingLines = lines.filter(line => line.original.isChanging);

  return (
    <div className="w-full max-w-md">
      {/* Header */}
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Hexagram Formation
        </h3>
        <p className="text-sm text-gray-600">
          {isComplete ? 'Complete hexagram' : `Building line ${currentLine}`}
        </p>
      </div>

      {/* Hexagram Lines (displayed top to bottom, but built bottom to top) */}
      <div className="space-y-1 bg-white/5 rounded-xl p-4 border border-white/10">
        {displayLines.slice().reverse().map((line, visualIndex) => {
          const actualPosition = 6 - visualIndex;
          const isActive = actualPosition === currentLine && !isComplete;
          
          if (!line) {
            // Empty line placeholder
            return (
              <div
                key={actualPosition}
                className={`flex items-center justify-center py-2 ${
                  isActive ? 'bg-blue-50 rounded-lg' : ''
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="text-sm font-medium text-gray-300 w-8 text-center">
                    {actualPosition}
                  </div>
                  <div className="w-[120px] h-[20px] border-2 border-dashed border-gray-300 rounded" />
                  <div className="text-sm text-gray-400 min-w-0 flex-1">
                    Awaiting toss...
                  </div>
                  <div className="text-sm font-mono text-gray-300 w-8 text-center">
                    ?
                  </div>
                </div>
              </div>
            );
          }

          return (
            <LineDisplay
              key={actualPosition}
              line={line}
              index={visualIndex}
              isActive={isActive}
              isComplete={isComplete}
            />
          );
        })}
      </div>

      {/* Changing Lines Summary */}
      <AnimatePresence>
        {isComplete && changingLines.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200"
          >
            <div className="text-center">
              <h4 className="text-sm font-semibold text-amber-800 mb-2">
                Changing Lines
              </h4>
              <div className="flex justify-center space-x-2 mb-2">
                {changingLines.map((line, index) => (
                  <motion.div
                    key={line.position}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center text-xs font-bold text-amber-800"
                  >
                    {line.position}
                  </motion.div>
                ))}
              </div>
              <p className="text-xs text-amber-700">
                {changingLines.length === 1 
                  ? '1 changing line creates transformation'
                  : `${changingLines.length} changing lines create transformation`
                }
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animation State Indicator */}
      <AnimatePresence>
        {isAnimating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-4 text-center"
          >
            <div className="inline-flex items-center space-x-2 text-blue-600">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"
              />
              <span className="text-sm font-medium">
                Coins are settling...
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HexagramLineDisplay;