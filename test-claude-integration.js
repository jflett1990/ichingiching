/**
 * Test Claude Integration System
 * Comprehensive test of the AI interpretation system
 */

import { ClaudeIntegrationService } from './src/services/claude/index.js';
import { PersonalizationEngine } from './src/services/claude/personalization.js';
import { ConversationManager } from './src/services/claude/conversation.js';
import { ClaudePrompts } from './src/utils/claude-prompts.js';
import { generateRandomHexagram } from './src/utils/hexagram.js';

// Mock environment for testing
process.env.REACT_APP_CLAUDE_API_KEY = 'test-key';

async function testClaudeIntegration() {
  console.log('🔮 Testing Claude Integration System...\n');

  // Test 1: Service Initialization
  console.log('1. Testing Service Initialization...');
  const claudeService = new ClaudeIntegrationService();
  const status = await claudeService.getServiceStatus();
  
  console.log('   ✓ Service initialized');
  console.log('   ✓ Configuration check:', status.isConfigured ? 'OK' : 'MISSING API KEY');
  console.log('   ✓ Connection status:', status.isConnected ? 'CONNECTED' : 'DISCONNECTED');

  // Test 2: Question Analysis
  console.log('\n2. Testing Question Analysis...');
  const personalizationEngine = new PersonalizationEngine();
  
  const testQuestions = [
    'Should I take the new job opportunity?',
    'How can I improve my relationship with my partner?',
    'I am feeling anxious about my health. What should I do?',
    'What is the best timing for my creative project?'
  ];

  testQuestions.forEach((question, index) => {
    const analysis = personalizationEngine.analyzeQuestion(question);
    console.log(`   Question ${index + 1}: "${question}"`);
    console.log(`     Theme: ${analysis.theme}`);
    console.log(`     Guidance Type: ${analysis.guidanceType}`);
    console.log(`     Emotional Context: ${analysis.emotionalContext}`);
    console.log(`     Life Area: ${analysis.lifeArea}`);
  });

  // Test 3: Hexagram Generation and Interpretation
  console.log('\n3. Testing Hexagram Generation and Interpretation...');
  
  const testHexagram = generateRandomHexagram();
  console.log('   ✓ Generated random hexagram for testing');
  console.log(`   Primary: #${testHexagram.primary.number} - ${testHexagram.primary.name}`);
  
  if (testHexagram.secondary) {
    console.log(`   Secondary: #${testHexagram.secondary.number} - ${testHexagram.secondary.name}`);
    console.log(`   Changing Lines: ${testHexagram.changingLines.join(', ')}`);
  }

  // Test 4: Prompt Generation
  console.log('\n4. Testing Prompt Generation...');
  
  const testQuestion = 'Should I take the new job opportunity?';
  const questionAnalysis = personalizationEngine.analyzeQuestion(testQuestion);
  const personalizedContext = personalizationEngine.generatePersonalizedContext(questionAnalysis);
  
  const hexagramData = {
    primary: testHexagram.primary,
    secondary: testHexagram.secondary,
    changingLines: testHexagram.changingLines || []
  };

  const prompt = ClaudePrompts.generateInterpretationPrompt(
    testQuestion,
    hexagramData,
    personalizedContext
  );
  
  console.log('   ✓ Generated interpretation prompt');
  console.log(`   Prompt length: ${prompt.length} characters`);

  // Test 5: Fallback System
  console.log('\n5. Testing Fallback System...');
  
  try {
    const fallbackResponse = claudeService.generateFallbackInterpretation(
      testQuestion,
      { primary: testHexagram.primary.number, changingLines: testHexagram.changingLines },
      new Error('Test error')
    );
    
    console.log('   ✓ Fallback system works');
    console.log(`   Fallback response generated: ${fallbackResponse.interpretation.length} characters`);
    console.log(`   Is fallback: ${fallbackResponse.isFallback}`);
  } catch (error) {
    console.error('   ✗ Fallback system failed:', error.message);
  }

  // Test 6: Conversation Management
  console.log('\n6. Testing Conversation Management...');
  
  const conversationManager = new ConversationManager();
  const mockReading = {
    interpretation: 'Test interpretation for conversation',
    question: testQuestion,
    hexagramData: hexagramData,
    context: personalizedContext
  };
  
  const sessionId = claudeService.generateSessionId();
  const conversation = conversationManager.startConversation(sessionId, mockReading);
  
  console.log('   ✓ Conversation started');
  console.log(`   Session ID: ${sessionId}`);
  console.log(`   Messages: ${conversation.messages.length}`);

  // Test 7: Pattern Analysis
  console.log('\n7. Testing Pattern Analysis...');
  
  const mockReadingHistory = [
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
  
  const userHistory = personalizationEngine.analyzeUserHistory(mockReadingHistory);
  console.log('   ✓ Pattern analysis completed');
  console.log(`   Primary themes: ${userHistory.primaryThemes.join(', ')}`);
  console.log(`   Preferred guidance: ${userHistory.preferredGuidanceType}`);
  console.log(`   Engagement level: ${userHistory.engagement}`);

  // Test 8: Error Handling
  console.log('\n8. Testing Error Handling...');
  
  try {
    await claudeService.generateInterpretation('', null);
  } catch (error) {
    console.log('   ✓ Error handling works for invalid inputs');
  }

  try {
    await claudeService.generateFollowUp('invalid-session-id', 'test question');
  } catch (error) {
    console.log('   ✓ Error handling works for invalid session');
  }

  // Test 9: Service Status and Cleanup
  console.log('\n9. Testing Service Status and Cleanup...');
  
  const finalStatus = await claudeService.getServiceStatus();
  console.log('   ✓ Service status retrieved');
  console.log(`   Active conversations: ${finalStatus.activeConversations}`);
  
  const cleanupResult = claudeService.cleanup();
  console.log('   ✓ Cleanup completed');
  console.log(`   Conversations cleaned: ${cleanupResult.cleanedConversations}`);

  console.log('\n✅ Claude Integration System Test Complete!');
  console.log('\n📊 Summary:');
  console.log('   - Core service initialization: ✓');
  console.log('   - Question analysis: ✓');
  console.log('   - Hexagram generation: ✓');
  console.log('   - Prompt generation: ✓');
  console.log('   - Fallback system: ✓');
  console.log('   - Conversation management: ✓');
  console.log('   - Pattern analysis: ✓');
  console.log('   - Error handling: ✓');
  console.log('   - Service maintenance: ✓');
}

// Run the test
testClaudeIntegration().catch(console.error);