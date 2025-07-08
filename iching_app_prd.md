# I Ching Divination App - Complete PRD & Implementation Guide

## Executive Summary

**App Name:** Wisdom Oracle (I Ching Divination App)

**Vision:** A grounded, practical I Ching divination app that serves spiritual seekers and curious newcomers with sophisticated, interactive experiences. Blends ancient wisdom with modern understanding through AI-powered personalization.

**Target Users:** 
- Primary: Spiritual seekers (30-45) with meditation/spiritual experience
- Secondary: Curious newcomers (25-40) interested in spiritual exploration

**Core Philosophy:** Grounded and practical wisdom over mysticism, with premium liquid glass aesthetics and highly interactive experiences.

---

## Technical Architecture

### Tech Stack
- **Frontend:** React 18+ with TypeScript
- **3D/Animation:** Three.js for premium visuals and coin physics
- **Styling:** Tailwind CSS + CSS3 animations for liquid glass effects
- **State Management:** Redux Toolkit or Zustand
- **AI Integration:** Anthropic Claude API for personalized interpretations
- **Build Tool:** Vite for fast development
- **Deployment:** Vercel/Netlify for static hosting

### Project Structure
```
src/
├── components/
│   ├── ui/                     # Reusable UI components
│   ├── divination/             # Core divination flow
│   ├── themes/                 # UI theme system
│   ├── animations/             # Three.js animations
│   └── layouts/               # Page layouts
├── pages/
│   ├── Home/                  # Landing page
│   ├── Divination/            # Main divination flow
│   ├── History/               # Reading history
│   ├── Instructions/          # Learning content
│   └── Settings/              # User preferences
├── services/
│   ├── claude/                # Claude AI interpretation logic
│   ├── iching/                # I Ching data and logic
│   └── storage/               # User data management
├── data/
│   ├── hexagrams.json         # Essential hexagram data (names, lines, unicode)
│   ├── trigrams.json         # Trigram values for hexagram calculation
│   └── themes.json           # UI theme definitions
├── utils/
│   ├── divination.js          # Coin toss logic
│   ├── hexagram.js           # Hexagram generation
│   └── claude-prompts.js      # Claude prompt templates
└── styles/
    ├── themes/               # Theme-specific styles
    └── animations/           # Animation keyframes
```

---

## Phase 1: Core Foundation

### 1.1 Project Setup
**Implementation Steps:**
1. Initialize React + TypeScript project with Vite
2. Install dependencies: Three.js, Tailwind CSS, Anthropic Claude SDK
3. Set up folder structure as specified above
4. Configure TypeScript, ESLint, and Prettier
5. Set up environment variables for Claude API keys

### 1.2 Base UI System
**Components to Build:**
- `LiquidGlassCard` - Base container with frosted glass effect
- `AnimatedButton` - Interactive buttons with hover states
- `GradientText` - Premium typography component
- `LoadingSpinner` - Elegant loading animations
- `Modal` - Overlay system for instructions/settings

**Liquid Glass CSS Base:**
```css
.liquid-glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border-radius: 16px;
}
```

### 1.3 I Ching Data Structure
**Create minimal hexagram database for Claude integration:**
```javascript
// hexagrams.json structure - essential data only
{
  "1": {
    "name": "The Creative",
    "chinese": "乾",
    "trigrams": ["heaven", "heaven"],
    "lines": [1, 1, 1, 1, 1, 1],
    "unicode": "䷀"
  },
  "2": {
    "name": "The Receptive",
    "chinese": "坤",
    "trigrams": ["earth", "earth"],
    "lines": [0, 0, 0, 0, 0, 0],
    "unicode": "䷁"
  }
  // ... all 64 hexagrams with basic info only
}

// trigrams.json - for hexagram number calculation
{
  "heaven": 7,
  "earth": 8,
  "thunder": 4,
  "wind": 5,
  "water": 6,
  "fire": 3,
  "mountain": 1,
  "lake": 2
}
```

**Note:** No interpretations stored - Claude generates all personalized interpretations dynamically based on user context and hexagram data.

---

## Phase 2: Core Divination Flow

### 2.1 Question Formation System
**Free Version (Free-form):**
- Simple text input with character limit
- Basic validation for meaningful questions
- Gentle suggestions for improvement

**Premium Version (Guided + Meditation):**
- Multi-step guided process
- Meditation timers between steps
- Breathing exercises integration
- Question refinement suggestions

**Components:**
- `QuestionInput` - Basic free-form input
- `GuidedQuestionFlow` - Premium step-by-step process
- `MeditationTimer` - Breathing and pause guidance
- `QuestionRefinement` - AI-powered suggestions

### 2.2 Coin Toss Animation System
**Three.js Implementation:**
1. **Physics Engine:** Realistic tumbling for 3 coins simultaneously
2. **Tactile Controls:** Touch/click to throw all 3 coins together
3. **Visual Effects:** Particle systems, lighting, synchronized tumbling
4. **Audio:** Subtle coin flip sounds for trio

**Core Components:**
- `ThreeCoinEngine` - Three.js physics for simultaneous 3-coin tosses
- `CoinTrioControls` - Touch/click interaction for 3-coin throws
- `LineCalculator` - Sum coins and determine line type
- `AnimationSequence` - Orchestrate 6 three-coin tosses

**Traditional I Ching Coin Method:**
- **Heads = 3 points, Tails = 2 points**
- **6 points (3 tails):** Old Yin - broken line, changing ⚋→⚊
- **7 points (2 tails, 1 head):** Young Yang - solid line ⚊
- **8 points (1 tail, 2 heads):** Young Yin - broken line ⚋
- **9 points (3 heads):** Old Yang - solid line, changing ⚊→⚋

**Animation Sequence:**
1. User taps to throw 3 coins for line 1
2. Three coins tumble together with physics
3. Coins land, system calculates sum (6-9)
4. Line 1 draws based on result (solid/broken, changing/stable)
5. Repeat 5 more times for complete hexagram
6. Reveal changing lines and transformations

### 2.3 Hexagram Generation
**Logic Implementation:**
```javascript
// Core divination logic - Traditional 3-coin method
function generateHexagram(allThreeCoinsResults) {
  const lines = [];
  const changingLines = [];
  
  // Process each of the 6 three-coin tosses
  allThreeCoinsResults.forEach((threeCoins, index) => {
    // Calculate sum: heads = 3, tails = 2
    const sum = threeCoins.reduce((total, coin) => {
      return total + (coin === 'heads' ? 3 : 2);
    }, 0);
    
    // Determine line type based on traditional I Ching values
    let lineType, isChanging;
    switch(sum) {
      case 6: // Old Yin - broken, changing
        lineType = 0; // broken
        isChanging = true;
        break;
      case 7: // Young Yang - solid, stable
        lineType = 1; // solid
        isChanging = false;
        break;
      case 8: // Young Yin - broken, stable
        lineType = 0; // broken
        isChanging = false;
        break;
      case 9: // Old Yang - solid, changing
        lineType = 1; // solid
        isChanging = true;
        break;
    }
    
    lines.push(lineType);
    if (isChanging) {
      changingLines.push(index + 1); // Line numbers 1-6
    }
  });
  
  const hexagramNumber = calculateHexagramNumber(lines);
  
  return {
    primary: hexagramNumber,
    lines: lines,
    changing: changingLines,
    secondary: changingLines.length > 0 ? 
      generateChangedHexagram(lines, changingLines) : null,
    coinResults: allThreeCoinsResults // Store for history
  };
}

// Generate the transformed hexagram if changing lines exist
function generateChangedHexagram(originalLines, changingLineNumbers) {
  const changedLines = [...originalLines];
  
  changingLineNumbers.forEach(lineNum => {
    const index = lineNum - 1;
    changedLines[index] = changedLines[index] === 1 ? 0 : 1; // Flip line
  });
  
  return calculateHexagramNumber(changedLines);
}
```

---

## Phase 3: AI-Powered Interpretations

### 3.1 Personalization Engine
**Question Context Analysis:**
- Extract key themes from user's question
- Identify life areas (relationships, career, health, etc.)
- Determine guidance type needed (decision, understanding, timing)

**Claude AI Prompt System:**
```javascript
// Claude prompt template
const interpretationPrompt = `
You are a wise I Ching interpreter blending ancient wisdom with modern understanding. You provide grounded, practical guidance that respects both traditional teachings and contemporary psychological insights.

User's Question: "${question}"
Hexagram: ${hexagram.name} (${hexagram.chinese}) - #${hexagram.number}
Traditional Lines: ${hexagram.lines.map(line => line ? '⚊' : '⚋').join(' ')}
Changing Lines: ${changingLines.length > 0 ? changingLines.join(', ') : 'None'}
${changingLines.length > 0 ? `Transformed Hexagram: ${secondaryHexagram.name} (#${secondaryHexagram.number})` : ''}

Provide a grounded, practical interpretation that:
1. Directly addresses the user's specific question and context
2. Blends traditional I Ching wisdom with modern psychological understanding
3. Offers actionable, practical guidance they can apply
4. Maintains a respectful, non-prescriptive tone that empowers the user
5. If changing lines exist, explain their significance and the transformation

Structure your response as:
- **Present Situation:** What the primary hexagram reveals about their current state
- **Guidance:** Practical wisdom and recommendations
${changingLines.length > 0 ? '- **Transformation:** What the changing lines and secondary hexagram suggest about potential developments' : ''}
- **Action Steps:** Specific, grounded steps they can consider

Keep the interpretation 250-350 words, warm but practical in tone.
`;

// Claude API integration
async function getClaudeInterpretation(question, hexagramData) {
  const response = await fetch('/api/claude/interpret', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.CLAUDE_API_KEY}`
    },
    body: JSON.stringify({
      prompt: interpretationPrompt,
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1000,
      temperature: 0.7
    })
  });
  
  return await response.json();
}
```

### 3.2 Follow-up System (Premium)
**Conversational AI Features:**
- Natural language follow-up questions using Claude's conversational abilities
- Contextual drilling into specific aspects
- Guided exploration prompts
- Application and action planning

**Implementation:**
- `ClaudeFollowUpChat` - Conversational interface powered by Claude
- `ContextualDrilling` - Click-to-explore specific parts with Claude explanations
- `GuidedPrompts` - Claude-generated follow-up questions based on the reading
- `ConversationHistory` - Track dialogue context for coherent conversations

**Claude Follow-up Prompt Template:**
```javascript
const followUpPrompt = `
Continue the I Ching consultation as a wise, practical interpreter.

Original Question: "${originalQuestion}"
Original Reading: "${originalInterpretation}"
User's Follow-up: "${followUpQuestion}"

Provide a thoughtful response that:
- Builds on the original reading context
- Addresses their specific follow-up question
- Maintains the grounded, practical tone
- Offers additional actionable insights
- Keeps the conversation flowing naturally

Response should be 150-250 words, conversational yet wise.
`;
```

---

## Phase 4: Premium Theme System

### 4.1 Theme Architecture
**Base Theme Structure:**
```javascript
// themes.json
{
  "liquid-glass": {
    "name": "Liquid Glass",
    "colors": {
      "primary": "#667eea",
      "secondary": "#764ba2",
      "background": "#f7fafc",
      "glass": "rgba(255, 255, 255, 0.1)"
    },
    "typography": {
      "primary": "Inter",
      "secondary": "Playfair Display"
    },
    "animations": {
      "duration": "300ms",
      "easing": "cubic-bezier(0.4, 0, 0.2, 1)"
    }
  },
  "art-nouveau": {
    "name": "Art Nouveau",
    "colors": {
      "primary": "#d4af37",
      "secondary": "#8b4513",
      "background": "#2f1b14",
      "glass": "rgba(212, 175, 55, 0.1)"
    },
    "typography": {
      "primary": "Cinzel",
      "secondary": "Cormorant Garamond"
    },
    "decorative": {
      "patterns": "organic-flourishes",
      "borders": "ornate-frames"
    }
  },
  "cyberpunk": {
    "name": "Cyberpunk",
    "colors": {
      "primary": "#00ffff",
      "secondary": "#ff00ff",
      "background": "#0a0a0a",
      "glass": "rgba(0, 255, 255, 0.1)"
    },
    "effects": {
      "glow": true,
      "scanlines": true,
      "holographic": true
    }
  },
  "pop-art": {
    "name": "Pop Art",
    "colors": {
      "primary": "#ff6b6b",
      "secondary": "#4ecdc4",
      "background": "#ffe66d",
      "glass": "rgba(255, 107, 107, 0.1)"
    },
    "effects": {
      "bold-shadows": true,
      "high-contrast": true,
      "comic-style": true
    }
  },
  "traditional-zen": {
    "name": "Traditional Zen",
    "colors": {
      "primary": "#2d3748",
      "secondary": "#4a5568",
      "background": "#f7fafc",
      "glass": "rgba(45, 55, 72, 0.1)"
    },
    "typography": {
      "primary": "Noto Sans",
      "secondary": "Noto Serif"
    },
    "effects": {
      "ink-brush": true,
      "paper-texture": true
    }
  }
}
```

### 4.2 Dynamic Theme System
**Components:**
- `ThemeProvider` - Context for theme management
- `ThemeSelector` - Premium theme chooser
- `DynamicStyles` - Runtime style generation
- `ThemePreview` - Theme demonstration

---

## Phase 5: History & Learning System

### 5.1 History Tab
**Features:**
- **Reading Log:** Chronological list of all readings
- **Search & Filter:** By date, question themes, hexagrams
- **Favorites:** Bookmark meaningful readings
- **Pattern Analysis:** Recurring themes and hexagrams (Premium)
- **Export:** Save readings as PDF/text

**Data Structure:**
```javascript
// reading history
{
  "id": "uuid",
  "timestamp": "2024-01-15T10:30:00Z",
  "question": "Should I take the new job opportunity?",
  "hexagram": {
    "primary": 1,
    "secondary": 43,
    "changing_lines": [2, 5]
  },
  "interpretation": "...",
  "follow_ups": [...],
  "favorite": false,
  "tags": ["career", "decision"]
}
```

### 5.2 Instructions Tab
**Content Organization:**
- **I Ching Basics:** What it is, how it works, historical background
- **Hexagram Guide:** All 64 hexagrams with names and visual representations
- **Question Crafting:** How to ask better questions for clearer guidance
- **Understanding Readings:** How to interpret and apply Claude's guidance
- **Changing Lines:** What they mean and how transformations work

**Interactive Elements:**
- **Hexagram Explorer:** Click any hexagram to see its basic info and ask Claude for explanation
- **Question Examples:** Good vs. poor question examples with explanations
- **Practice Mode:** Try readings with sample questions to learn the process

**Note:** All detailed explanations and interpretations generated dynamically by Claude when requested.

---

## Phase 6: Monetization Integration

### 6.1 Tier System Implementation
**Free Tier:**
- Basic question formation (free-form)
- Standard coin toss animation
- Core hexagram interpretation
- Limited history (last 10 readings)
- Basic instructions

**Premium Upgrade (One-time):**
- All UI themes (Art Nouveau, Cyberpunk, Pop Art, Zen)
- Guided question formation with meditation
- Enhanced coin toss animations
- Full reading history with search
- Pattern analysis and insights
- Favorites and tagging system

**Subscription (Monthly/Annual):**
- Follow-up questions and conversation
- Advanced AI interpretations
- Priority support
- Early access to new features
- Export capabilities

### 6.2 Payment Integration
**Components:**
- `PaymentGateway` - Stripe/PayPal integration
- `SubscriptionManager` - Handle recurring payments
- `FeatureGating` - Control access to premium features
- `UpgradePrompts` - Contextual upgrade suggestions

---

## Phase 7: User Experience Details

### 7.1 Micro-Interactions
**Animation Specifications:**
- **Card Hover:** Subtle lift and glow (200ms)
- **Button Press:** Scale down 95% then bounce back (150ms)
- **Loading States:** Gentle pulse on glass elements
- **Page Transitions:** Slide with backdrop blur
- **Hexagram Drawing:** Lines appear sequentially with ink effect

### 7.2 Accessibility Features
- **Screen Reader Support:** Full ARIA labels
- **Keyboard Navigation:** Tab through all interactions
- **High Contrast Mode:** Alternative color schemes
- **Text Scaling:** Support for 200% zoom
- **Motion Reduction:** Respect prefers-reduced-motion

### 7.3 Responsive Design
**Breakpoints:**
- Mobile: 320px - 768px (primary target)
- Tablet: 768px - 1024px
- Desktop: 1024px+ (enhanced experience)

**Mobile-First Considerations:**
- Touch targets minimum 44px
- Swipe gestures for navigation
- Optimized Three.js performance
- Reduced particle effects on low-end devices

---

## Phase 8: Performance & Optimization

### 8.1 Loading Strategy
**Progressive Loading:**
1. **Shell:** Basic UI and hexagram database loads first
2. **Core:** Essential divination components and trigram data
3. **Themes:** Premium themes load on demand
4. **3D Assets:** Three.js resources lazy-loaded
5. **Claude Integration:** AI interpretation system loads after core functionality

### 8.2 Performance Targets
- **First Contentful Paint:** < 1.5s
- **Largest Contentful Paint:** < 2.5s
- **Time to Interactive:** < 3.5s
- **Cumulative Layout Shift:** < 0.1

### 8.3 Optimization Techniques
- **Code Splitting:** Route-based and component-based
- **Image Optimization:** WebP format, lazy loading
- **Three.js Optimization:** LOD models, texture compression
- **Caching:** Service worker for offline capability

---

## Phase 9: Testing & Quality Assurance

### 9.1 Testing Strategy
**Unit Tests:**
- Hexagram generation logic and coin-to-line calculations
- Trigram combination to hexagram number conversion
- Claude prompt formatting and API integration
- Theme switching functionality
- Payment processing

**Integration Tests:**
- Complete divination flow
- Premium feature access
- Cross-theme compatibility
- API integrations

**User Testing:**
- Usability testing with target personas
- Accessibility compliance testing
- Performance testing on various devices
- A/B testing for conversion optimization

### 9.2 Quality Metrics
- **Functionality:** All features work as specified
- **Performance:** Meets loading time targets
- **Accessibility:** WCAG 2.1 AA compliance
- **Design:** Matches premium aesthetic goals
- **Monetization:** Conversion funnel optimization

---

## Phase 10: Deployment & Launch

### 10.1 Deployment Pipeline
1. **Development:** Local development with hot reload
2. **Staging:** Full production simulation
3. **Testing:** Automated and manual QA
4. **Production:** Optimized build deployment

### 10.2 Launch Checklist
- [ ] All features implemented and tested
- [ ] Premium themes fully functional
- [ ] Payment processing verified
- [ ] AI integrations optimized
- [ ] Analytics and monitoring configured
- [ ] Privacy policy and terms of service
- [ ] App store optimization (if applicable)
- [ ] Marketing assets prepared

---

## Development Priorities

### Phase 1 (Foundation): 
Core divination flow, basic UI, hexagram database

### Phase 2 (Interaction): 
Three.js coin toss, AI integration, interpretation system

### Phase 3 (Premium): 
Theme system, guided questions, follow-up conversations

### Phase 4 (Complete): 
History/instructions, monetization, optimization

---

## Success Metrics

### User Engagement:
- Daily active users
- Session duration
- Return usage rate
- Reading completion rate

### Monetization:
- Free-to-premium conversion rate
- Subscription retention rate
- Average revenue per user
- Lifetime value

### Quality:
- User satisfaction scores
- App store ratings
- Performance metrics
- Support ticket volume

---

## Technical Considerations

### AI Integration:
- Anthropic Claude API rate limiting and usage optimization
- Prompt optimization for cost efficiency and response quality
- Response caching for similar question patterns
- Graceful fallback to base interpretations if Claude API unavailable

### Performance:
- Three.js optimization for mobile
- Progressive Web App capabilities
- Offline functionality for core features
- Memory management for animations

### Security:
- API key protection
- User data encryption
- Payment security compliance
- Privacy regulation adherence

---

This PRD provides a complete blueprint for agentic development of a premium I Ching divination app. Each phase builds upon the previous, with clear implementation steps, technical specifications, and quality standards. The result will be a sophisticated, highly interactive app that serves spiritual seekers with grounded, practical wisdom through beautiful, liquid glass aesthetics and engaging user experiences.