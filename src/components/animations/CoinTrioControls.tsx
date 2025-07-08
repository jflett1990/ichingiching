import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CoinTrioControlsProps {
  isActive: boolean;
  isAnimating: boolean;
  onTriggerToss: () => void;
  lineNumber: number;
  totalLines: number;
  disabled?: boolean;
}

const CoinTrioControls: React.FC<CoinTrioControlsProps> = ({
  isActive,
  isAnimating,
  onTriggerToss,
  lineNumber,
  totalLines,
  disabled = false,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [touchPosition, setTouchPosition] = useState<{ x: number; y: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleInteractionStart = useCallback((event: React.TouchEvent | React.MouseEvent) => {
    if (disabled || isAnimating) return;

    setIsPressed(true);
    
    // Get touch/mouse position for visual feedback
    let clientX: number, clientY: number;
    if ('touches' in event) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }

    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setTouchPosition({
        x: clientX - rect.left,
        y: clientY - rect.top,
      });
    }
  }, [disabled, isAnimating]);

  const handleInteractionEnd = useCallback(() => {
    if (disabled || isAnimating) return;

    setIsPressed(false);
    setTouchPosition(null);
    onTriggerToss();
  }, [disabled, isAnimating, onTriggerToss]);

  const handleMouseLeave = useCallback(() => {
    setIsPressed(false);
    setTouchPosition(null);
  }, []);

  const buttonVariants = {
    default: {
      scale: 1,
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    pressed: {
      scale: 0.95,
      boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)',
      background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
    },
    disabled: {
      scale: 1,
      boxShadow: '0 5px 15px rgba(0, 0, 0, 0.05)',
      background: 'linear-gradient(135deg, #a0aec0 0%, #718096 100%)',
    },
  };

  const rippleVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: { 
      scale: 2, 
      opacity: 0.3,
      transition: { duration: 0.6, ease: 'easeOut' }
    },
    exit: { 
      scale: 2.5, 
      opacity: 0,
      transition: { duration: 0.3, ease: 'easeOut' }
    }
  };

  const getButtonState = () => {
    if (disabled || isAnimating) return 'disabled';
    if (isPressed) return 'pressed';
    return 'default';
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Progress indicator */}
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-600">
          Line {lineNumber} of {totalLines}
        </span>
        <div className="flex space-x-1">
          {Array.from({ length: totalLines }, (_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                i < lineNumber - 1
                  ? 'bg-green-500'
                  : i === lineNumber - 1
                  ? 'bg-blue-500'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main toss button */}
      <motion.button
        ref={buttonRef}
        variants={buttonVariants}
        animate={getButtonState()}
        className={`
          relative overflow-hidden
          w-48 h-16 rounded-2xl
          text-white font-semibold text-lg
          border-none outline-none cursor-pointer
          backdrop-blur-sm
          transition-all duration-200
          ${disabled || isAnimating ? 'cursor-not-allowed' : 'cursor-pointer'}
        `}
        onMouseDown={handleInteractionStart}
        onMouseUp={handleInteractionEnd}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleInteractionStart}
        onTouchEnd={handleInteractionEnd}
        disabled={disabled || isAnimating}
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}
      >
        {/* Ripple effect */}
        <AnimatePresence>
          {touchPosition && (
            <motion.div
              variants={rippleVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute rounded-full bg-white pointer-events-none"
              style={{
                left: touchPosition.x,
                top: touchPosition.y,
                width: 20,
                height: 20,
                transform: 'translate(-50%, -50%)',
              }}
            />
          )}
        </AnimatePresence>

        {/* Button content */}
        <div className="relative z-10 flex items-center justify-center space-x-2">
          {isAnimating ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
              />
              <span>Tossing...</span>
            </>
          ) : (
            <>
              <motion.div
                animate={{ rotateY: [0, 180, 360] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="text-2xl"
              >
                🪙
              </motion.div>
              <span>Toss 3 Coins</span>
            </>
          )}
        </div>

        {/* Shimmer effect */}
        {!disabled && !isAnimating && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        )}
      </motion.button>

      {/* Instruction text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center text-sm text-gray-600 max-w-xs"
      >
        {isAnimating
          ? 'Coins are tumbling...'
          : disabled
          ? 'Please wait for the current animation to complete'
          : lineNumber === 1
          ? 'Tap to toss 3 coins together and create your first line'
          : `Toss 3 coins for line ${lineNumber}`}
      </motion.p>

      {/* Touch feedback hint */}
      {isActive && !isAnimating && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center space-x-2 text-xs text-gray-500"
        >
          <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
          <span>Touch or click to toss</span>
        </motion.div>
      )}
    </div>
  );
};

export default CoinTrioControls;