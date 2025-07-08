/**
 * Follow-up Conversation System
 * Manages conversational AI for premium users
 */

import ClaudeAPIService from './api.js';
import { ClaudePrompts } from '../../utils/claude-prompts.js';
import { ErrorHandler } from './errors.js';

export class ConversationManager {
  constructor() {
    this.claudeService = new ClaudeAPIService();
    this.conversations = new Map(); // sessionId -> conversation data
    this.maxConversationLength = 20; // Maximum messages per conversation
    this.maxConversationAge = 24 * 60 * 60 * 1000; // 24 hours
  }

  /**
   * Start a new conversation session
   */
  startConversation(sessionId, initialReading) {
    const conversation = {
      id: sessionId,
      startTime: Date.now(),
      initialReading: initialReading,
      messages: [
        {
          role: 'system',
          content: ClaudePrompts.generateSystemPrompt(),
          timestamp: Date.now()
        },
        {
          role: 'assistant',
          content: initialReading.interpretation,
          timestamp: Date.now()
        }
      ],
      context: {
        originalQuestion: initialReading.question,
        hexagramData: initialReading.hexagramData,
        theme: initialReading.context?.theme || 'general',
        userId: initialReading.userId
      },
      isActive: true,
      lastActivity: Date.now()
    };

    this.conversations.set(sessionId, conversation);
    return conversation;
  }

  /**
   * Add follow-up question to conversation
   */
  async addFollowUp(sessionId, followUpQuestion, userContext = {}) {
    const conversation = this.conversations.get(sessionId);
    
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    if (!this.isConversationActive(conversation)) {
      throw new Error('Conversation has expired');
    }

    try {
      // Add user message to conversation
      conversation.messages.push({
        role: 'user',
        content: followUpQuestion,
        timestamp: Date.now()
      });

      // Generate follow-up response
      const response = await this.generateFollowUpResponse(conversation, followUpQuestion, userContext);

      // Add assistant response to conversation
      conversation.messages.push({
        role: 'assistant',
        content: response.content,
        timestamp: Date.now(),
        usage: response.usage
      });

      // Update conversation metadata
      conversation.lastActivity = Date.now();
      conversation.context.conversationTurn = conversation.messages.filter(m => m.role === 'user').length;

      // Clean up old messages if conversation is too long
      this.trimConversation(conversation);

      return {
        response: response.content,
        conversation: conversation,
        usage: response.usage
      };

    } catch (error) {
      return {
        error: ErrorHandler.handleError(error, { sessionId, question: followUpQuestion }),
        conversation: conversation
      };
    }
  }

  /**
   * Generate contextual follow-up response
   */
  async generateFollowUpResponse(conversation, followUpQuestion, userContext = {}) {
    const prompt = ClaudePrompts.generateFollowUpPrompt(
      conversation.context.originalQuestion,
      conversation.initialReading.interpretation,
      followUpQuestion,
      {
        conversationTurn: conversation.context.conversationTurn || 1,
        focusArea: userContext.focusArea || 'clarification',
        userNeeds: userContext.userNeeds || 'additional guidance'
      }
    );

    return await this.claudeService.generateFollowUp(
      conversation.messages,
      followUpQuestion,
      {
        temperature: 0.7,
        maxTokens: 600
      }
    );
  }

  /**
   * Get conversation history
   */
  getConversation(sessionId) {
    return this.conversations.get(sessionId);
  }

  /**
   * Check if conversation is active and not expired
   */
  isConversationActive(conversation) {
    const now = Date.now();
    const age = now - conversation.startTime;
    const timeSinceActivity = now - conversation.lastActivity;
    
    return conversation.isActive && 
           age < this.maxConversationAge && 
           timeSinceActivity < (2 * 60 * 60 * 1000); // 2 hours of inactivity
  }

  /**
   * Trim conversation if it gets too long
   */
  trimConversation(conversation) {
    if (conversation.messages.length > this.maxConversationLength) {
      // Keep system message and initial assistant message
      const systemMessage = conversation.messages.find(m => m.role === 'system');
      const initialAssistantMessage = conversation.messages.find(m => m.role === 'assistant');
      
      // Keep the most recent messages
      const recentMessages = conversation.messages.slice(-16);
      
      conversation.messages = [
        systemMessage,
        initialAssistantMessage,
        ...recentMessages
      ].filter(Boolean);
    }
  }

  /**
   * End conversation
   */
  endConversation(sessionId) {
    const conversation = this.conversations.get(sessionId);
    if (conversation) {
      conversation.isActive = false;
      conversation.endTime = Date.now();
    }
    return conversation;
  }

  /**
   * Clean up expired conversations
   */
  cleanupExpiredConversations() {
    const now = Date.now();
    const expiredSessions = [];

    for (const [sessionId, conversation] of this.conversations.entries()) {
      if (!this.isConversationActive(conversation)) {
        expiredSessions.push(sessionId);
      }
    }

    expiredSessions.forEach(sessionId => {
      this.conversations.delete(sessionId);
    });

    return expiredSessions.length;
  }

  /**
   * Get conversation statistics
   */
  getConversationStats(sessionId) {
    const conversation = this.conversations.get(sessionId);
    if (!conversation) return null;

    const userMessages = conversation.messages.filter(m => m.role === 'user');
    const assistantMessages = conversation.messages.filter(m => m.role === 'assistant');
    const totalUsage = assistantMessages.reduce((sum, msg) => {
      if (msg.usage) {
        return {
          input_tokens: sum.input_tokens + (msg.usage.input_tokens || 0),
          output_tokens: sum.output_tokens + (msg.usage.output_tokens || 0)
        };
      }
      return sum;
    }, { input_tokens: 0, output_tokens: 0 });

    return {
      id: sessionId,
      duration: Date.now() - conversation.startTime,
      messageCount: conversation.messages.length,
      userMessageCount: userMessages.length,
      assistantMessageCount: assistantMessages.length,
      totalUsage: totalUsage,
      isActive: conversation.isActive,
      lastActivity: conversation.lastActivity,
      theme: conversation.context.theme
    };
  }
}

/**
 * Conversation Context Analyzer
 * Analyzes conversation flow and suggests improvements
 */
export class ConversationAnalyzer {
  constructor() {
    this.patterns = {
      clarification: ['what', 'how', 'why', 'explain', 'unclear', 'don\'t understand'],
      deeper_insight: ['more about', 'deeper', 'elaborate', 'tell me more', 'expand'],
      practical_application: ['how do i', 'what should i do', 'practical', 'action', 'steps'],
      emotional_support: ['worried', 'scared', 'anxious', 'concerned', 'comfort'],
      validation: ['am i right', 'correct', 'good idea', 'wise', 'should i'],
      timing: ['when', 'how long', 'timing', 'ready', 'wait']
    };
  }

  /**
   * Analyze follow-up question intent
   */
  analyzeFollowUpIntent(question) {
    const normalizedQuestion = question.toLowerCase();
    const intents = [];

    for (const [intent, keywords] of Object.entries(this.patterns)) {
      const score = keywords.reduce((count, keyword) => {
        return count + (normalizedQuestion.includes(keyword) ? 1 : 0);
      }, 0);

      if (score > 0) {
        intents.push({ intent, score });
      }
    }

    intents.sort((a, b) => b.score - a.score);
    return intents.length > 0 ? intents[0].intent : 'general';
  }

  /**
   * Suggest conversation improvements
   */
  suggestConversationFlow(conversation) {
    const suggestions = [];
    const userMessages = conversation.messages.filter(m => m.role === 'user');
    
    if (userMessages.length > 5) {
      suggestions.push({
        type: 'summary',
        message: 'Consider summarizing the key insights from this conversation'
      });
    }

    const recentIntents = userMessages.slice(-3).map(msg => 
      this.analyzeFollowUpIntent(msg.content)
    );

    if (recentIntents.every(intent => intent === 'clarification')) {
      suggestions.push({
        type: 'clarification',
        message: 'User seems to need clearer explanations'
      });
    }

    if (recentIntents.includes('practical_application')) {
      suggestions.push({
        type: 'action_focus',
        message: 'User is seeking practical next steps'
      });
    }

    return suggestions;
  }

  /**
   * Generate conversation summary
   */
  generateConversationSummary(conversation) {
    const userMessages = conversation.messages.filter(m => m.role === 'user');
    const keyThemes = userMessages.map(msg => this.analyzeFollowUpIntent(msg.content));
    
    return {
      originalQuestion: conversation.context.originalQuestion,
      followUpCount: userMessages.length,
      keyThemes: [...new Set(keyThemes)],
      duration: Date.now() - conversation.startTime,
      mainConcerns: this.extractMainConcerns(userMessages),
      resolution: this.assessResolution(conversation)
    };
  }

  /**
   * Extract main concerns from user messages
   */
  extractMainConcerns(userMessages) {
    // Simple keyword extraction - could be enhanced with NLP
    const concerns = [];
    const commonConcerns = ['worry', 'fear', 'doubt', 'confusion', 'uncertainty', 'stress'];
    
    userMessages.forEach(msg => {
      commonConcerns.forEach(concern => {
        if (msg.content.toLowerCase().includes(concern)) {
          concerns.push(concern);
        }
      });
    });

    return [...new Set(concerns)];
  }

  /**
   * Assess conversation resolution
   */
  assessResolution(conversation) {
    const lastUserMessage = conversation.messages
      .filter(m => m.role === 'user')
      .slice(-1)[0];

    if (!lastUserMessage) return 'incomplete';

    const content = lastUserMessage.content.toLowerCase();
    const resolutionIndicators = ['thank you', 'helpful', 'clear', 'understand', 'makes sense'];
    const continuationIndicators = ['but', 'however', 'what about', 'still confused'];

    const hasResolution = resolutionIndicators.some(indicator => content.includes(indicator));
    const hasContinuation = continuationIndicators.some(indicator => content.includes(indicator));

    if (hasResolution && !hasContinuation) return 'resolved';
    if (hasContinuation) return 'ongoing';
    return 'unclear';
  }
}

export default ConversationManager;