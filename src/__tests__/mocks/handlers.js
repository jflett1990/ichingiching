import { rest } from 'msw';

// Mock handlers for API endpoints
export const handlers = [
  // Claude API mock
  rest.post('https://api.anthropic.com/v1/messages', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        id: 'msg_test_id',
        type: 'message',
        role: 'assistant',
        content: [{
          type: 'text',
          text: JSON.stringify({
            interpretation: 'This hexagram suggests a time of great creative potential and new beginnings. The energy is ripe for taking action on your question.',
            confidence: 0.92,
            themes: ['creativity', 'new beginnings', 'opportunity', 'action'],
            guidance: 'Trust in your abilities and move forward with confidence. The timing is favorable for your endeavor.',
            followUpQuestions: [
              'What specific steps should I take first?',
              'What obstacles might I encounter?',
              'How can I best prepare for this opportunity?'
            ]
          })
        }],
        model: 'claude-3-sonnet-20240229',
        stop_reason: 'end_turn',
        stop_sequence: null,
        usage: {
          input_tokens: 150,
          output_tokens: 300
        }
      })
    );
  }),

  // Error scenario for testing fallback
  rest.post('https://api.anthropic.com/v1/messages', (req, res, ctx) => {
    const url = req.url.searchParams;
    if (url.get('error') === 'rate_limit') {
      return res(
        ctx.status(429),
        ctx.json({
          type: 'error',
          error: {
            type: 'rate_limit_error',
            message: 'Rate limit exceeded'
          }
        })
      );
    }
    
    if (url.get('error') === 'network') {
      return res.networkError('Network connection failed');
    }
    
    if (url.get('error') === 'server') {
      return res(
        ctx.status(500),
        ctx.json({
          type: 'error',
          error: {
            type: 'api_error',
            message: 'Internal server error'
          }
        })
      );
    }
  }),

  // Mock health check endpoint
  rest.get('https://api.anthropic.com/v1/health', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        status: 'healthy',
        timestamp: new Date().toISOString()
      })
    );
  }),

  // Mock analytics endpoint (if any)
  rest.post('/api/analytics/track', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        eventId: 'test_event_id'
      })
    );
  }),

  // Mock user preferences endpoint
  rest.get('/api/user/preferences', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        theme: 'light',
        soundEnabled: true,
        animationsEnabled: true,
        language: 'en',
        timezone: 'UTC'
      })
    );
  }),

  rest.post('/api/user/preferences', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        message: 'Preferences updated successfully'
      })
    );
  }),

  // Mock history endpoint
  rest.get('/api/user/history', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        readings: [
          {
            id: 'reading_1',
            question: 'Should I take this job?',
            hexagram: {
              number: 1,
              name: 'The Creative',
              chinese: '乾'
            },
            changingLines: [],
            timestamp: '2024-01-15T10:30:00Z',
            interpretation: 'A time for bold action and leadership.'
          },
          {
            id: 'reading_2',
            question: 'How can I improve my relationships?',
            hexagram: {
              number: 2,
              name: 'The Receptive',
              chinese: '坤'
            },
            changingLines: [2, 4],
            timestamp: '2024-01-10T14:15:00Z',
            interpretation: 'Patience and understanding will guide you.'
          }
        ],
        totalCount: 2,
        page: 1,
        pageSize: 10
      })
    );
  }),

  // Mock feedback endpoint
  rest.post('/api/feedback', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        message: 'Thank you for your feedback',
        id: 'feedback_test_id'
      })
    );
  })
];

// Error handlers for testing error scenarios
export const errorHandlers = [
  rest.post('https://api.anthropic.com/v1/messages', (req, res, ctx) => {
    return res(
      ctx.status(401),
      ctx.json({
        type: 'error',
        error: {
          type: 'authentication_error',
          message: 'Invalid API key'
        }
      })
    );
  })
];

// Delay handlers for testing loading states
export const delayedHandlers = [
  rest.post('https://api.anthropic.com/v1/messages', (req, res, ctx) => {
    return res(
      ctx.delay(2000), // 2 second delay
      ctx.status(200),
      ctx.json({
        id: 'msg_delayed_id',
        type: 'message',
        role: 'assistant',
        content: [{
          type: 'text',
          text: JSON.stringify({
            interpretation: 'Delayed response interpretation',
            confidence: 0.88,
            themes: ['patience', 'timing'],
            guidance: 'Good things come to those who wait.'
          })
        }]
      })
    );
  })
];