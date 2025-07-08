/**
 * Main Claude Integration Service
 * Orchestrates all Claude AI functionality for the I Ching app
 */

import ClaudeAPIService from './api.js';
import PersonalizationEngine from './personalization.js';
import ConversationManager from './conversation.js';
import { ClaudePrompts } from '../../utils/claude-prompts.js';
import { ErrorHandler } from './errors.js';
import { getHexagramData, formatHexagram, getHexagramTrigrams } from '../../utils/hexagram.js';

export class ClaudeIntegrationService {
  constructor() {
    this.apiService = new ClaudeAPIService();
    this.personalizationEngine = new PersonalizationEngine();
    this.conversationManager = new ConversationManager();
    this.fallbackResponses = this.initializeFallbackResponses();
  }

  /**
   * Generate complete I Ching interpretation
   */
  async generateInterpretation(question, hexagramData, userProfile = {}) {
    try {
      // Validate inputs
      if (!question || typeof question !== 'string') {
        throw new Error('Question is required and must be a string');
      }

      if (!hexagramData || !hexagramData.primary) {
        throw new Error('Hexagram data is required');
      }

      // Analyze question context
      const questionAnalysis = this.personalizationEngine.analyzeQuestion(question);
      
      // Generate personalized context
      const personalizedContext = this.personalizationEngine.generatePersonalizedContext(
        questionAnalysis,
        userProfile
      );

      // Prepare hexagram data for Claude
      const primaryHexagram = getHexagramData(hexagramData.primary);
      const secondaryHexagram = hexagramData.secondary ? 
        getHexagramData(hexagramData.secondary) : null;

      const formattedHexagramData = {
        primary: formatHexagram(primaryHexagram),
        secondary: secondaryHexagram ? formatHexagram(secondaryHexagram) : null,
        changingLines: hexagramData.changingLines || [],
        trigrams: getHexagramTrigrams(primaryHexagram)
      };

      // Generate interpretation prompt
      const prompt = ClaudePrompts.generateInterpretationPrompt(
        question,
        formattedHexagramData,
        personalizedContext
      );

      // Get interpretation from Claude
      const interpretation = await this.apiService.generateInterpretation(prompt, {
        temperature: 0.7,
        maxTokens: 1000
      });

      // Structure the response
      const response = {
        interpretation: interpretation.content,
        hexagramData: formattedHexagramData,
        context: personalizedContext,
        question: question,
        timestamp: new Date().toISOString(),
        usage: interpretation.usage,
        sessionId: this.generateSessionId()
      };

      // Initialize conversation if premium user
      if (userProfile.isPremium) {
        this.conversationManager.startConversation(response.sessionId, response);
      }

      return response;

    } catch (error) {
      console.error('Interpretation generation failed:', error);
      
      // Return fallback response
      return this.generateFallbackInterpretation(question, hexagramData, error);
    }
  }

  /**
   * Generate follow-up response for premium users
   */
  async generateFollowUp(sessionId, followUpQuestion, userContext = {}) {
    try {
      if (!sessionId || !followUpQuestion) {
        throw new Error('Session ID and follow-up question are required');
      }

      const result = await this.conversationManager.addFollowUp(
        sessionId,
        followUpQuestion,
        userContext
      );

      if (result.error) {
        throw new Error(result.error.message);
      }

      return {
        response: result.response,
        sessionId: sessionId,
        conversationTurn: result.conversation.context.conversationTurn,
        usage: result.usage,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Follow-up generation failed:', error);
      
      return {
        error: ErrorHandler.handleError(error, { sessionId, followUpQuestion }),
        sessionId: sessionId,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Generate hexagram explanation
   */
  async generateHexagramExplanation(hexagramNumber, context = {}) {
    try {
      const hexagram = getHexagramData(hexagramNumber);
      const formattedHexagram = formatHexagram(hexagram);
      const trigrams = getHexagramTrigrams(hexagram);

      const prompt = ClaudePrompts.generateHexagramExplanationPrompt(
        { ...formattedHexagram, trigrams },
        context
      );

      const explanation = await this.apiService.generateInterpretation(prompt, {
        temperature: 0.6,
        maxTokens: 800
      });

      return {
        explanation: explanation.content,
        hexagram: formattedHexagram,
        trigrams: trigrams,
        usage: explanation.usage,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Hexagram explanation failed:', error);
      
      return {
        error: ErrorHandler.handleError(error, { hexagramNumber }),
        hexagram: getHexagramData(hexagramNumber),
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Refine user question for better results
   */
  async refineQuestion(originalQuestion, context = {}) {
    try {
      const prompt = ClaudePrompts.generateQuestionRefinementPrompt(
        originalQuestion,
        context
      );

      const refinement = await this.apiService.generateInterpretation(prompt, {
        temperature: 0.8,
        maxTokens: 500
      });

      return {
        refinement: refinement.content,
        originalQuestion: originalQuestion,
        usage: refinement.usage,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Question refinement failed:', error);
      
      return {
        error: ErrorHandler.handleError(error, { originalQuestion }),
        originalQuestion: originalQuestion,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Analyze reading patterns for premium users
   */
  async analyzePatterns(readingHistory, context = {}) {
    try {
      if (!readingHistory || readingHistory.length === 0) {
        throw new Error('Reading history is required');
      }

      const prompt = ClaudePrompts.generatePatternAnalysisPrompt(
        readingHistory,
        context
      );

      const analysis = await this.apiService.generateInterpretation(prompt, {
        temperature: 0.6,
        maxTokens: 1000
      });

      return {
        analysis: analysis.content,
        readingCount: readingHistory.length,
        usage: analysis.usage,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Pattern analysis failed:', error);
      
      return {
        error: ErrorHandler.handleError(error, { readingCount: readingHistory.length }),
        readingCount: readingHistory.length,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Generate fallback interpretation when Claude API fails
   */
  generateFallbackInterpretation(question, hexagramData, originalError) {
    const primaryHexagram = getHexagramData(hexagramData.primary);
    const formattedHexagram = formatHexagram(primaryHexagram);
    
    const fallbackKey = `hexagram_${hexagramData.primary}`;
    const fallbackContent = this.fallbackResponses[fallbackKey] || 
      this.fallbackResponses.default;

    return {
      interpretation: fallbackContent.replace('{hexagram_name}', formattedHexagram.name),
      hexagramData: {
        primary: formattedHexagram,
        secondary: null,
        changingLines: hexagramData.changingLines || [],
        trigrams: getHexagramTrigrams(primaryHexagram)
      },
      question: question,
      timestamp: new Date().toISOString(),
      isFallback: true,
      error: ErrorHandler.handleError(originalError, { question, hexagramData }),
      sessionId: this.generateSessionId()
    };
  }

  /**
   * Initialize fallback responses for when Claude API is unavailable
   */
  initializeFallbackResponses() {
    return {
      default: `**Present Situation:** The hexagram {hexagram_name} speaks to your current circumstances and offers guidance for this moment.

**Guidance:** While our AI interpretation service is temporarily unavailable, remember that the I Ching encourages reflection and inner wisdom. Consider what this hexagram's energy might mean for your situation.

**Action Steps:** Take time to reflect on your question and trust your inner guidance. The hexagram provides a framework for contemplation, even without detailed interpretation.

*Note: This is a simplified response. Full AI interpretations will be available once service is restored.*`,
      
      hexagram_1: `**Present Situation:** The Creative represents pure creative energy and leadership potential in your current situation.

**Guidance:** This is a time for initiative and creative action. Trust your instincts and take the lead in your circumstances.

**Action Steps:** 1) Identify where you can take positive action, 2) Trust your creative abilities, 3) Move forward with confidence while remaining mindful of timing.`,
      
      hexagram_2: `**Present Situation:** The Receptive indicates a time for patience, receptivity, and allowing situations to unfold naturally.

**Guidance:** Success comes through cooperation and yielding to natural timing rather than forcing outcomes.

**Action Steps:** 1) Practice patience and observation, 2) Be open to support from others, 3) Focus on steady, consistent progress rather than dramatic changes.`
    };
  }

  /**
   * Generate unique session ID
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get service status and statistics
   */
  async getServiceStatus() {
    try {
      const isConnected = await this.apiService.validateConnection();
      const usageStats = this.apiService.getUsageStats();
      
      return {
        isConnected: isConnected,
        isConfigured: this.apiService.isConfigured(),
        usageStats: usageStats,
        activeConversations: this.conversationManager.conversations.size,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        isConnected: false,
        isConfigured: this.apiService.isConfigured(),
        error: ErrorHandler.getErrorMessage(error),
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Clean up resources
   */
  cleanup() {
    // Clean up expired conversations
    const cleanedCount = this.conversationManager.cleanupExpiredConversations();
    
    // Clear cache if needed
    if (this.apiService.cache) {
      // Keep cache, but could implement size limits here
    }
    
    return {
      cleanedConversations: cleanedCount,
      timestamp: new Date().toISOString()
    };
  }
}

export default ClaudeIntegrationService;