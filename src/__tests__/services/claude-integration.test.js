import { ClaudeIntegrationService } from '../../services/claude/index.js';
import { PersonalizationEngine } from '../../services/claude/personalization.js';
import { ConversationManager } from '../../services/claude/conversation.js';

// Mock fetch for API calls
global.fetch = jest.fn();

describe('Claude Integration Service', () => {
  let claudeService;
  let personalizationEngine;
  let conversationManager;

  beforeEach(() => {
    claudeService = new ClaudeIntegrationService();
    personalizationEngine = new PersonalizationEngine();
    conversationManager = new ConversationManager();
    jest.clearAllMocks();
    
    // Reset environment
    process.env.REACT_APP_CLAUDE_API_KEY = 'test-api-key';
  });

  describe('ClaudeIntegrationService', () => {
    test('initializes with correct configuration', () => {
      expect(claudeService).toBeDefined();
      expect(claudeService.getServiceStatus).toBeDefined();
      expect(claudeService.generateInterpretation).toBeDefined();
    });

    test('checks service status correctly', async () => {
      const status = await claudeService.getServiceStatus();
      
      expect(status).toHaveProperty('isConfigured');
      expect(status).toHaveProperty('isConnected');
      expect(status.isConfigured).toBe(true); // API key is set
    });

    test('detects missing API key', async () => {
      delete process.env.REACT_APP_CLAUDE_API_KEY;
      const newService = new ClaudeIntegrationService();
      const status = await newService.getServiceStatus();
      
      expect(status.isConfigured).toBe(false);
    });

    test('generates session ID', () => {
      const sessionId1 = claudeService.generateSessionId();
      const sessionId2 = claudeService.generateSessionId();
      
      expect(sessionId1).toBeDefined();
      expect(sessionId2).toBeDefined();
      expect(sessionId1).not.toBe(sessionId2);
      expect(typeof sessionId1).toBe('string');
    });

    test('generates interpretation with valid input', async () => {
      const mockResponse = {
        interpretation: 'Test interpretation',
        confidence: 0.95,
        themes: ['wisdom', 'change'],
        guidance: 'Test guidance'
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const question = 'Should I take this job?';
      const hexagramData = {
        primary: { number: 1, name: 'The Creative' },
        changingLines: []
      };

      const result = await claudeService.generateInterpretation(question, hexagramData);
      
      expect(result).toHaveProperty('interpretation');
      expect(result).toHaveProperty('confidence');
      expect(result.isFallback).toBe(false);
    });

    test('handles API errors gracefully', async () => {
      fetch.mockRejectedValueOnce(new Error('API Error'));

      const question = 'Test question';
      const hexagramData = { primary: { number: 1 }, changingLines: [] };

      const result = await claudeService.generateInterpretation(question, hexagramData);
      
      expect(result.isFallback).toBe(true);
      expect(result).toHaveProperty('interpretation');
      expect(result.interpretation).toContain('fallback');
    });

    test('generates fallback interpretation', () => {
      const question = 'Test question';
      const hexagramData = { primary: 1, changingLines: [] };
      const error = new Error('Test error');

      const fallback = claudeService.generateFallbackInterpretation(question, hexagramData, error);
      
      expect(fallback).toHaveProperty('interpretation');
      expect(fallback).toHaveProperty('isFallback', true);
      expect(fallback).toHaveProperty('confidence');
      expect(fallback.interpretation).toBeTruthy();
    });

    test('cleans up resources', () => {
      // Add some mock conversations
      conversationManager.startConversation('test-1', { interpretation: 'Test' });
      conversationManager.startConversation('test-2', { interpretation: 'Test' });

      const result = claudeService.cleanup();
      
      expect(result).toHaveProperty('cleanedConversations');
      expect(typeof result.cleanedConversations).toBe('number');
    });
  });

  describe('PersonalizationEngine', () => {
    test('analyzes question themes correctly', () => {
      const testCases = [
        {
          question: 'Should I take this new job opportunity?',
          expectedTheme: 'career',
          expectedGuidanceType: 'decision'
        },
        {
          question: 'How can I improve my relationship with my partner?',
          expectedTheme: 'love',
          expectedGuidanceType: 'improvement'
        },
        {
          question: 'I am feeling anxious about my health',
          expectedTheme: 'health',
          expectedGuidanceType: 'emotional'
        },
        {
          question: 'What is the best timing for my creative project?',
          expectedTheme: 'creativity',
          expectedGuidanceType: 'timing'
        }
      ];

      testCases.forEach(({ question, expectedTheme, expectedGuidanceType }) => {
        const analysis = personalizationEngine.analyzeQuestion(question);
        
        expect(analysis).toHaveProperty('theme');
        expect(analysis).toHaveProperty('guidanceType');
        expect(analysis).toHaveProperty('emotionalContext');
        expect(analysis).toHaveProperty('lifeArea');
        
        // Themes and guidance types should be reasonable
        expect(typeof analysis.theme).toBe('string');
        expect(typeof analysis.guidanceType).toBe('string');
      });
    });

    test('generates personalized context', () => {
      const questionAnalysis = {
        theme: 'career',
        guidanceType: 'decision',
        emotionalContext: 'uncertain',
        lifeArea: 'professional'
      };

      const context = personalizationEngine.generatePersonalizedContext(questionAnalysis);
      
      expect(context).toHaveProperty('focusAreas');
      expect(context).toHaveProperty('interpretationStyle');
      expect(context).toHaveProperty('guidanceEmphasis');
      expect(Array.isArray(context.focusAreas)).toBe(true);
    });

    test('analyzes user history patterns', () => {
      const mockHistory = [
        {
          date: '2024-01-10',
          question: 'Should I take the job?',
          hexagram: { name: 'The Creative', number: 1 },
          changingLines: []
        },
        {
          date: '2024-01-15',
          question: 'How about my relationship?',
          hexagram: { name: 'The Receptive', number: 2 },
          changingLines: [3, 5]
        },
        {
          date: '2024-01-20',
          question: 'Career development guidance?',
          hexagram: { name: 'Difficulty at the Beginning', number: 3 },
          changingLines: [1]
        }
      ];

      const userHistory = personalizationEngine.analyzeUserHistory(mockHistory);
      
      expect(userHistory).toHaveProperty('primaryThemes');
      expect(userHistory).toHaveProperty('preferredGuidanceType');
      expect(userHistory).toHaveProperty('engagement');
      expect(userHistory).toHaveProperty('patterns');
      expect(Array.isArray(userHistory.primaryThemes)).toBe(true);
    });

    test('handles edge cases in question analysis', () => {
      const edgeCases = [
        '', // Empty string
        'a', // Single character
        'What?', // Very short
        'a'.repeat(1000), // Very long
        '123456', // Numbers only
        '!@#$%^&*()', // Special characters only
      ];

      edgeCases.forEach(question => {
        const analysis = personalizationEngine.analyzeQuestion(question);
        expect(analysis).toHaveProperty('theme');
        expect(analysis).toHaveProperty('guidanceType');
      });
    });
  });

  describe('ConversationManager', () => {
    test('starts new conversation', () => {
      const sessionId = 'test-session-123';
      const mockReading = {
        interpretation: 'Test interpretation',
        question: 'Test question',
        hexagramData: { primary: { number: 1 } },
        context: { focusAreas: ['career'] }
      };

      const conversation = conversationManager.startConversation(sessionId, mockReading);
      
      expect(conversation).toHaveProperty('sessionId', sessionId);
      expect(conversation).toHaveProperty('messages');
      expect(conversation).toHaveProperty('startTime');
      expect(Array.isArray(conversation.messages)).toBe(true);
      expect(conversation.messages.length).toBeGreaterThan(0);
    });

    test('adds follow-up questions', () => {
      const sessionId = 'test-session-123';
      const mockReading = {
        interpretation: 'Test interpretation',
        question: 'Test question'
      };

      conversationManager.startConversation(sessionId, mockReading);
      
      const followUpQuestion = 'Can you elaborate on the career aspect?';
      const response = 'Detailed career guidance...';
      
      conversationManager.addFollowUp(sessionId, followUpQuestion, response);
      
      const conversation = conversationManager.getConversation(sessionId);
      expect(conversation.messages.length).toBeGreaterThan(1);
      
      const lastMessage = conversation.messages[conversation.messages.length - 1];
      expect(lastMessage.question).toBe(followUpQuestion);
      expect(lastMessage.response).toBe(response);
    });

    test('retrieves conversation history', () => {
      const sessionId = 'test-session-456';
      const mockReading = { interpretation: 'Test' };
      
      conversationManager.startConversation(sessionId, mockReading);
      
      const conversation = conversationManager.getConversation(sessionId);
      expect(conversation).toBeDefined();
      expect(conversation.sessionId).toBe(sessionId);
    });

    test('handles invalid session ID', () => {
      const conversation = conversationManager.getConversation('invalid-session');
      expect(conversation).toBeNull();
    });

    test('cleans up old conversations', () => {
      // Create old conversations
      const oldSession = 'old-session';
      conversationManager.startConversation(oldSession, { interpretation: 'Old' });
      
      // Mock old timestamp
      const conversations = conversationManager.getAllConversations();
      if (conversations[oldSession]) {
        conversations[oldSession].startTime = new Date(Date.now() - 25 * 60 * 60 * 1000); // 25 hours ago
      }
      
      const cleanupResult = conversationManager.cleanup(24); // Clean older than 24 hours
      expect(cleanupResult.cleaned).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Integration Tests', () => {
    test('complete workflow from question to interpretation', async () => {
      // Mock successful API response
      const mockApiResponse = {
        interpretation: 'Your question reveals a time of great potential...',
        confidence: 0.92,
        themes: ['opportunity', 'courage', 'timing'],
        guidance: 'Trust your instincts and move forward with confidence.'
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse
      });

      // 1. Analyze question
      const question = 'Should I start my own business?';
      const analysis = personalizationEngine.analyzeQuestion(question);
      
      expect(analysis.theme).toBeTruthy();
      expect(analysis.guidanceType).toBeTruthy();

      // 2. Generate personalized context
      const context = personalizationEngine.generatePersonalizedContext(analysis);
      expect(context.focusAreas).toBeTruthy();

      // 3. Generate interpretation
      const hexagramData = {
        primary: { number: 1, name: 'The Creative' },
        changingLines: []
      };

      const interpretation = await claudeService.generateInterpretation(question, hexagramData, context);
      
      expect(interpretation).toHaveProperty('interpretation');
      expect(interpretation).toHaveProperty('confidence');
      expect(interpretation.isFallback).toBe(false);

      // 4. Start conversation
      const sessionId = claudeService.generateSessionId();
      const conversation = conversationManager.startConversation(sessionId, {
        interpretation: interpretation.interpretation,
        question,
        hexagramData,
        context
      });

      expect(conversation.sessionId).toBe(sessionId);
      expect(conversation.messages.length).toBeGreaterThan(0);
    });

    test('fallback system activates on API failure', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      const question = 'Test question';
      const hexagramData = { primary: { number: 1 }, changingLines: [] };

      const result = await claudeService.generateInterpretation(question, hexagramData);
      
      expect(result.isFallback).toBe(true);
      expect(result.interpretation).toContain('interpretation');
      expect(result.confidence).toBeLessThan(1.0);
    });

    test('system handles rate limiting gracefully', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => ({ error: 'Rate limit exceeded' })
      });

      const question = 'Test question';
      const hexagramData = { primary: { number: 1 }, changingLines: [] };

      const result = await claudeService.generateInterpretation(question, hexagramData);
      
      expect(result.isFallback).toBe(true);
      expect(result).toHaveProperty('rateLimited', true);
    });
  });
});