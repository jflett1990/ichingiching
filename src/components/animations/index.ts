// Three.js Coin Toss Animation System
// Main exports for I Ching Divination App

export { default as ThreeCoinEngine } from './ThreeCoinEngine';
export { default as CoinTrioControls } from './CoinTrioControls';
export { default as CoinAudioSystem, useCoinAudio } from './CoinAudioSystem';
export { default as AnimationSequence } from './AnimationSequence';
export { default as HexagramLineDisplay } from './HexagramLineDisplay';

// Re-export utilities for convenience
export { default as LineCalculator } from '../../utils/LineCalculator';
export type { 
  CoinResult, 
  LineResult, 
  HexagramLine, 
  HexagramResult 
} from '../../utils/LineCalculator';