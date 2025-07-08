/**
 * Fallback Mechanism
 * Provides alternative responses when Claude API is unavailable
 */

import { getHexagramData, formatHexagram, getHexagramTrigrams } from '../../utils/hexagram.js';
import { ErrorHandler } from './errors.js';

export class FallbackService {
  constructor() {
    this.staticInterpretations = this.initializeStaticInterpretations();
    this.generalGuidance = this.initializeGeneralGuidance();
  }

  /**
   * Generate fallback interpretation
   */
  generateFallbackInterpretation(question, hexagramData, context = {}) {
    try {
      const primaryHexagram = getHexagramData(hexagramData.primary);
      const formattedHexagram = formatHexagram(primaryHexagram);
      const trigrams = getHexagramTrigrams(primaryHexagram);

      // Get static interpretation for this hexagram
      const staticInterpretation = this.getStaticInterpretation(hexagramData.primary);
      
      // Customize based on context
      const customizedInterpretation = this.customizeInterpretation(
        staticInterpretation,
        context,
        formattedHexagram
      );

      // Handle changing lines
      const changingLinesGuidance = this.getChangingLinesGuidance(
        hexagramData.changingLines,
        hexagramData.secondary
      );

      return {
        interpretation: customizedInterpretation,
        changingLinesGuidance: changingLinesGuidance,
        hexagramData: {
          primary: formattedHexagram,
          secondary: hexagramData.secondary ? 
            formatHexagram(getHexagramData(hexagramData.secondary)) : null,
          changingLines: hexagramData.changingLines || [],
          trigrams: trigrams
        },
        question: question,
        context: context,
        isFallback: true,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return this.generateMinimalFallback(question, hexagramData, error);
    }
  }

  /**
   * Get static interpretation for hexagram
   */
  getStaticInterpretation(hexagramNumber) {
    const interpretation = this.staticInterpretations[hexagramNumber];
    if (!interpretation) {
      return this.staticInterpretations.default;
    }
    return interpretation;
  }

  /**
   * Customize interpretation based on context
   */
  customizeInterpretation(baseInterpretation, context, hexagram) {
    let customized = baseInterpretation;

    // Replace placeholders
    customized = customized.replace(/{hexagram_name}/g, hexagram.name);
    customized = customized.replace(/{hexagram_chinese}/g, hexagram.chinese);
    customized = customized.replace(/{hexagram_number}/g, hexagram.number);

    // Adjust based on question theme
    if (context.theme) {
      customized = this.adjustForTheme(customized, context.theme);
    }

    // Adjust based on emotional context
    if (context.emotionalContext) {
      customized = this.adjustForEmotionalContext(customized, context.emotionalContext);
    }

    return customized;
  }

  /**
   * Adjust interpretation for specific themes
   */
  adjustForTheme(interpretation, theme) {
    const themeAdjustments = {
      'relationships': {
        'situation': 'your relationships and interpersonal dynamics',
        'guidance': 'in your connections with others',
        'action': 'in how you relate to others'
      },
      'career': {
        'situation': 'your professional situation and career path',
        'guidance': 'in your work and professional development',
        'action': 'in your career decisions'
      },
      'health': {
        'situation': 'your well-being and health journey',
        'guidance': 'regarding your physical and mental wellness',
        'action': 'for your health and self-care'
      },
      'finances': {
        'situation': 'your financial circumstances and resources',
        'guidance': 'regarding money and material security',
        'action': 'in your financial decisions'
      }
    };

    const adjustments = themeAdjustments[theme];
    if (adjustments) {
      interpretation = interpretation.replace(/your situation/g, adjustments.situation);
      interpretation = interpretation.replace(/general guidance/g, adjustments.guidance);
      interpretation = interpretation.replace(/your actions/g, adjustments.action);
    }

    return interpretation;
  }

  /**
   * Adjust interpretation for emotional context
   */
  adjustForEmotionalContext(interpretation, emotionalContext) {
    const emotionalAdjustments = {
      'anxious': {
        prefix: 'Take a deep breath and remember that ',
        tone: 'reassuring and grounding'
      },
      'confused': {
        prefix: 'Clarity will come through patience and reflection. ',
        tone: 'clarifying and supportive'
      },
      'frustrated': {
        prefix: 'This frustration is temporary and can be transformed. ',
        tone: 'encouraging and empowering'
      }
    };

    const adjustment = emotionalAdjustments[emotionalContext];
    if (adjustment) {
      interpretation = adjustment.prefix + interpretation;
    }

    return interpretation;
  }

  /**
   * Get guidance for changing lines
   */
  getChangingLinesGuidance(changingLines, secondaryHexagram) {
    if (!changingLines || changingLines.length === 0) {
      return null;
    }

    const guidance = {
      changingLines: changingLines,
      guidance: this.getChangingLineInterpretation(changingLines.length),
      transformation: secondaryHexagram ? 
        `The situation is evolving toward ${formatHexagram(getHexagramData(secondaryHexagram)).name}, indicating a significant shift in energy and circumstances.` : 
        null
    };

    return guidance;
  }

  /**
   * Get interpretation for changing lines
   */
  getChangingLineInterpretation(changeCount) {
    const interpretations = {
      1: 'A single changing line indicates a focused area of transformation. Pay attention to this specific aspect of your situation.',
      2: 'Two changing lines suggest a balanced transformation involving complementary forces in your life.',
      3: 'Three changing lines point to significant change and the need for careful navigation through this transition.',
      4: 'Four changing lines indicate major upheaval requiring patience and steady progress through uncertainty.',
      5: 'Five changing lines suggest near-complete transformation with only one stable element remaining.',
      6: 'All lines changing represents total transformation and the beginning of an entirely new cycle.'
    };

    return interpretations[changeCount] || interpretations[1];
  }

  /**
   * Generate minimal fallback when even static interpretations fail
   */
  generateMinimalFallback(question, hexagramData, error) {
    const hexagram = getHexagramData(hexagramData.primary);
    
    return {
      interpretation: `**Present Situation:** The hexagram ${hexagram.name} (${hexagram.chinese}) speaks to your current circumstances.

**Guidance:** While detailed interpretation is temporarily unavailable, this hexagram invites you to reflect on your question and trust your inner wisdom.

**Action Steps:** 1) Take time for quiet reflection, 2) Consider what this hexagram's energy might mean for your situation, 3) Trust your intuition and inner guidance.

*Note: This is a simplified response. Full interpretations will be available once service is restored.*`,
      
      hexagramData: {
        primary: formatHexagram(hexagram),
        secondary: null,
        changingLines: hexagramData.changingLines || [],
        trigrams: getHexagramTrigrams(hexagram)
      },
      question: question,
      isFallback: true,
      isMinimal: true,
      error: ErrorHandler.handleError(error, { question, hexagramData }),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Initialize static interpretations for key hexagrams
   */
  initializeStaticInterpretations() {
    return {
      // Key hexagrams with static interpretations
      1: `**Present Situation:** The Creative represents pure creative energy and leadership potential in your current situation. This hexagram speaks to initiative, creative power, and the drive to manifest your vision.

**Guidance:** This is a time for taking the lead and trusting your creative abilities. The energy supports new beginnings and bold action. Success comes through maintaining integrity and staying true to your highest principles.

**Action Steps:** 1) Identify where you can take positive initiative, 2) Trust your creative instincts and vision, 3) Move forward with confidence while remaining mindful of timing and preparation.`,

      2: `**Present Situation:** The Receptive indicates a time for patience, receptivity, and allowing situations to unfold naturally. This hexagram emphasizes the power of yielding, supporting, and working with natural forces.

**Guidance:** Success comes through cooperation, patience, and yielding to natural timing rather than forcing outcomes. This is a time to be supportive rather than directive, to listen rather than speak.

**Action Steps:** 1) Practice patience and careful observation, 2) Be open to support from others and offer support in return, 3) Focus on steady, consistent progress rather than dramatic changes.`,

      11: `**Present Situation:** Peace represents a time of harmony, balance, and positive flow in your circumstances. This hexagram indicates that opposing forces are working together constructively.

**Guidance:** Enjoy this period of balance while remaining aware that all situations are temporary. Use this harmonious time to build foundations for the future and nurture important relationships.

**Action Steps:** 1) Appreciate and make use of current harmony, 2) Build strong foundations for the future, 3) Share your good fortune with others and maintain gratitude.`,

      12: `**Present Situation:** Standstill indicates a period of stagnation or blockage where progress seems difficult. This hexagram suggests that opposing forces are not cooperating, creating temporary obstacles.

**Guidance:** This is a time for patience and inner work rather than external action. Focus on personal development and preparation for when conditions improve. Avoid forcing situations that aren't ready to move.

**Action Steps:** 1) Focus on inner development and self-reflection, 2) Prepare for future opportunities without forcing current ones, 3) Maintain hope and patience during this temporary phase.`,

      64: `**Present Situation:** Before Completion indicates you are very close to achieving your goal but haven't quite reached it yet. This hexagram speaks to being on the threshold of success while remaining vigilant.

**Guidance:** Continue your efforts with sustained focus and attention to detail. Success is near, but premature celebration or relaxation of effort could lead to setbacks. Stay committed to the process.

**Action Steps:** 1) Maintain focus and discipline even though success seems near, 2) Pay attention to final details and preparations, 3) Stay committed to your principles and process until completion.`,

      // Default fallback
      default: `**Present Situation:** The hexagram {hexagram_name} speaks to your current circumstances and offers guidance for this moment.

**Guidance:** While detailed interpretation is temporarily unavailable, this hexagram invites you to reflect on your question and consider what its energy might mean for your situation.

**Action Steps:** 1) Take time for quiet reflection on your question, 2) Consider how this hexagram's energy might apply to your circumstances, 3) Trust your inner wisdom and intuition.

*Note: This is a simplified response. Full AI interpretations will be available once service is restored.*`
    };
  }

  /**
   * Initialize general guidance phrases
   */
  initializeGeneralGuidance() {
    return {
      themes: {
        relationships: 'in your connections with others',
        career: 'in your professional development',
        health: 'regarding your well-being',
        finances: 'in your material circumstances',
        personal_growth: 'in your personal development',
        creativity: 'in your creative expression',
        travel: 'in your journeys and explorations',
        education: 'in your learning and growth',
        decision_making: 'in your choices and decisions',
        timing: 'regarding timing and patience'
      },
      
      emotions: {
        anxious: 'Take a deep breath and remember that this anxiety is temporary.',
        confused: 'Clarity will come through patience and reflection.',
        frustrated: 'This frustration can be transformed into constructive action.',
        excited: 'Channel this positive energy wisely.',
        curious: 'Your openness to learning will serve you well.'
      },

      actions: {
        understanding: 'Seek deeper understanding through contemplation.',
        decision: 'Consider all factors before making your choice.',
        action: 'Take thoughtful, purposeful action.',
        timing: 'Be patient and wait for the right moment.',
        validation: 'Trust your inner wisdom and judgment.'
      }
    };
  }

  /**
   * Check if fallback is needed
   */
  shouldUseFallback(error) {
    const fallbackTriggers = [
      'NetworkError',
      'AuthenticationError',
      'RateLimitError',
      'ClaudeError'
    ];

    return fallbackTriggers.some(trigger => 
      error.name === trigger || error.message.includes(trigger)
    );
  }

  /**
   * Get fallback service status
   */
  getStatus() {
    return {
      isAvailable: true,
      staticInterpretations: Object.keys(this.staticInterpretations).length,
      generalGuidance: Object.keys(this.generalGuidance).length,
      timestamp: new Date().toISOString()
    };
  }
}

export default FallbackService;