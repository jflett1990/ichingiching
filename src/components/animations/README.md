# Three.js Coin Toss Animation System

A sophisticated Three.js-based animation system for I Ching divination with realistic coin physics, visual effects, and audio feedback.

## Overview

This system implements the traditional I Ching three-coin method with engaging 3D animations:

- **3 coins tossed simultaneously** for each of the 6 lines
- **Realistic physics simulation** using Cannon.js
- **Heads = 3 points, Tails = 2 points** (traditional scoring)
- **Visual effects** including particles, lighting, and smooth animations
- **Audio feedback** with synthesized coin flip sounds
- **Touch/click controls** optimized for mobile and desktop

## Components

### Core Animation Components

#### `ThreeCoinEngine`
- **Purpose**: Three.js physics simulation for realistic coin tumbling
- **Features**:
  - Cannon.js physics engine for realistic coin behavior
  - Simultaneous simulation of 3 coins with individual physics
  - Particle system effects during toss
  - Dynamic lighting and shadows
  - Automatic heads/tails detection based on final rotation

#### `CoinTrioControls`
- **Purpose**: Touch/click interaction system for triggering coin tosses
- **Features**:
  - Touch-friendly button with haptic feedback
  - Visual progress indicator (line 1 of 6, etc.)
  - Ripple effects and state animations
  - Responsive design for mobile and desktop

#### `CoinAudioSystem`
- **Purpose**: Synthesized audio feedback for coin tosses
- **Features**:
  - Real-time audio synthesis (no external audio files needed)
  - Metallic coin flip sounds with harmonics
  - Landing impact sounds
  - Volume control and mute functionality

#### `AnimationSequence`
- **Purpose**: Orchestrates the complete 6-toss divination sequence
- **Features**:
  - Manages state for all 6 coin tosses
  - Coordinates between visual, audio, and calculation systems
  - Handles line generation and hexagram completion
  - Progress tracking and result compilation

#### `HexagramLineDisplay`
- **Purpose**: Visual representation of hexagram lines as they're generated
- **Features**:
  - Animated line drawing with SVG paths
  - Changing line indicators with visual effects
  - Real-time hexagram building (bottom to top)
  - Transformation animations for changing lines

### Utility Components

#### `LineCalculator`
- **Purpose**: Traditional I Ching calculations and logic
- **Features**:
  - Converts coin results to line types (solid/broken, changing/stable)
  - Calculates hexagram numbers from trigram values
  - Handles line transformations for changing lines
  - Validates coin results and provides debugging info

## Usage

### Basic Implementation

```tsx
import { AnimationSequence, HexagramResult, HexagramLine } from './components/animations';

function MyDivinationApp() {
  const handleComplete = (result: HexagramResult) => {
    console.log('Hexagram complete:', result);
    // Process the complete hexagram result
  };

  const handleLineGenerated = (line: HexagramLine, lineNumber: number) => {
    console.log(`Line ${lineNumber} generated:`, line);
    // Handle individual line generation
  };

  return (
    <AnimationSequence
      onComplete={handleComplete}
      onLineGenerated={handleLineGenerated}
      audioEnabled={true}
      audioVolume={0.7}
    />
  );
}
```

### Advanced Usage with Custom Controls

```tsx
import { 
  ThreeCoinEngine, 
  CoinTrioControls, 
  CoinAudioSystem,
  LineCalculator 
} from './components/animations';

function CustomDivinationFlow() {
  const [isAnimating, setIsAnimating] = useState(false);
  const [coinResults, setCoinResults] = useState<('heads' | 'tails')[]>([]);

  const handleToss = () => {
    setIsAnimating(true);
  };

  const handleCoinsSettled = (results: ('heads' | 'tails')[]) => {
    setCoinResults(results);
    
    // Calculate line result
    const coinResult = {
      coin1: results[0],
      coin2: results[1],
      coin3: results[2]
    };
    
    const line = LineCalculator.calculateLine(coinResult, 1);
    console.log('Line result:', line);
    
    setIsAnimating(false);
  };

  return (
    <div>
      <CoinAudioSystem isActive={isAnimating} volume={0.5} />
      
      <CoinTrioControls
        isActive={!isAnimating}
        isAnimating={isAnimating}
        onTriggerToss={handleToss}
        lineNumber={1}
        totalLines={6}
      />
      
      {isAnimating && (
        <ThreeCoinEngine
          isActive={isAnimating}
          onAllCoinsSettled={handleCoinsSettled}
          onAnimationComplete={() => setIsAnimating(false)}
        />
      )}
    </div>
  );
}
```

## Traditional I Ching Calculation

The system follows the traditional three-coin method:

### Scoring System
- **Heads** = 3 points
- **Tails** = 2 points

### Line Types
- **6 points** (3 tails): Old Yin - broken line, changing ⚋→⚊
- **7 points** (2 tails, 1 head): Young Yang - solid line ⚊
- **8 points** (1 tail, 2 heads): Young Yin - broken line ⚋  
- **9 points** (3 heads): Old Yang - solid line, changing ⚊→⚋

### Hexagram Generation
1. **6 tosses** generate 6 lines (built bottom to top)
2. **Lines combine** to form 64 possible hexagrams
3. **Changing lines** create transformation to secondary hexagram
4. **Trigram calculation** determines hexagram number

## Technical Implementation

### Physics Engine
- Uses `@react-three/cannon` for realistic coin physics
- Individual coin bodies with mass, friction, and restitution
- Ground plane for collision detection
- Randomized initial forces for natural variation

### Visual Effects
- Three.js-based 3D rendering with `@react-three/fiber`
- Particle systems for magical effects during toss
- Dynamic lighting with shadows and reflections
- Smooth animations using `framer-motion`

### Audio System
- Web Audio API for real-time synthesis
- No external audio files required
- Metallic coin sounds with harmonic overtones
- Impact sounds for landing effects

### Performance Optimizations
- Efficient physics simulation with automatic cleanup
- Lazy loading of Three.js components
- Optimized particle counts for mobile devices
- Memory management for long divination sessions

## Dependencies

```json
{
  "three": "^0.156.0",
  "@react-three/fiber": "^8.14.0",
  "@react-three/drei": "^9.88.0",
  "cannon-es": "^0.20.0",
  "@react-three/cannon": "^6.6.0",
  "framer-motion": "^10.16.0"
}
```

## Demo

Run the `DemoApp` component to see the complete system in action:

```tsx
import DemoApp from './components/animations/DemoApp';

function App() {
  return <DemoApp />;
}
```

## API Reference

### HexagramResult
```typescript
interface HexagramResult {
  lines: HexagramLine[];
  changingLines: number[];
  primaryNumber: number;
  secondaryNumber?: number;
  coinHistory: CoinResult[];
}
```

### HexagramLine
```typescript
interface HexagramLine {
  position: number; // 1-6, bottom to top
  original: LineResult;
  changed?: LineResult;
}
```

### LineResult
```typescript
interface LineResult {
  sum: number;
  type: 'solid' | 'broken';
  isChanging: boolean;
  description: string;
  symbol: string;
  changingSymbol?: string;
}
```

This animation system provides a complete, engaging implementation of I Ching divination with modern web technologies while respecting traditional calculation methods.