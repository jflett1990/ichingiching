/**
 * Claude API Integration Service
 * Handles authentication, rate limiting, and API communication
 */

import { ClaudeError, RateLimitError, AuthenticationError } from './errors.js';
import { ResponseCache } from './cache.js';

class ClaudeAPIService {
  constructor() {
    this.baseURL = 'https://api.anthropic.com/v1';
    this.apiKey = process.env.REACT_APP_CLAUDE_API_KEY;
    this.model = 'claude-3-sonnet-20240229';
    this.cache = new ResponseCache();
    this.rateLimitTracker = {
      requests: 0,
      resetTime: Date.now() + 60000, // Reset every minute
      limit: 50 // Conservative limit
    };
  }

  /**
   * Check if API key is configured
   */
  isConfigured() {
    return !!this.apiKey;
  }

  /**
   * Check rate limit status
   */
  checkRateLimit() {
    const now = Date.now();
    
    // Reset counter if time window has passed
    if (now > this.rateLimitTracker.resetTime) {
      this.rateLimitTracker.requests = 0;
      this.rateLimitTracker.resetTime = now + 60000;
    }
    
    if (this.rateLimitTracker.requests >= this.rateLimitTracker.limit) {
      throw new RateLimitError('Rate limit exceeded. Please wait before making more requests.');
    }
    
    this.rateLimitTracker.requests++;
  }

  /**
   * Make authenticated request to Claude API
   */
  async makeRequest(endpoint, payload) {
    if (!this.isConfigured()) {
      throw new AuthenticationError('Claude API key not configured');
    }

    this.checkRateLimit();

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 401) {
          throw new AuthenticationError('Invalid API key');
        } else if (response.status === 429) {
          throw new RateLimitError('Rate limit exceeded');
        } else {
          throw new ClaudeError(`API request failed: ${response.status}`, errorData);
        }
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ClaudeError) {
        throw error;
      }
      throw new ClaudeError('Network error or API unavailable', { originalError: error.message });
    }
  }

  /**
   * Generate interpretation using Claude
   */
  async generateInterpretation(prompt, options = {}) {
    const cacheKey = this.cache.generateKey(prompt, options);
    
    // Check cache first
    const cachedResponse = this.cache.get(cacheKey);
    if (cachedResponse) {
      return cachedResponse;
    }

    const payload = {
      model: options.model || this.model,
      max_tokens: options.maxTokens || 1000,
      temperature: options.temperature || 0.7,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    };

    try {
      const response = await this.makeRequest('/messages', payload);
      
      const interpretation = {
        content: response.content[0].text,
        usage: response.usage,
        timestamp: new Date().toISOString()
      };

      // Cache the response
      this.cache.set(cacheKey, interpretation);
      
      return interpretation;
    } catch (error) {
      // Re-throw with additional context
      throw new ClaudeError(`Failed to generate interpretation: ${error.message}`, {
        originalError: error,
        prompt: prompt.substring(0, 200) + '...' // Truncated for logging
      });
    }
  }

  /**
   * Generate follow-up response for conversations
   */
  async generateFollowUp(conversationHistory, followUpQuestion, options = {}) {
    const payload = {
      model: options.model || this.model,
      max_tokens: options.maxTokens || 600,
      temperature: options.temperature || 0.7,
      messages: [
        ...conversationHistory,
        {
          role: 'user',
          content: followUpQuestion
        }
      ]
    };

    try {
      const response = await this.makeRequest('/messages', payload);
      
      return {
        content: response.content[0].text,
        usage: response.usage,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new ClaudeError(`Failed to generate follow-up: ${error.message}`, {
        originalError: error,
        conversationLength: conversationHistory.length
      });
    }
  }

  /**
   * Validate API connection
   */
  async validateConnection() {
    try {
      const testPayload = {
        model: this.model,
        max_tokens: 50,
        messages: [
          {
            role: 'user',
            content: 'Test connection. Respond with "OK".'
          }
        ]
      };

      const response = await this.makeRequest('/messages', testPayload);
      return response.content[0].text.includes('OK');
    } catch (error) {
      return false;
    }
  }

  /**
   * Get current usage statistics
   */
  getUsageStats() {
    return {
      requestsThisMinute: this.rateLimitTracker.requests,
      resetTime: this.rateLimitTracker.resetTime,
      cacheHitRate: this.cache.getHitRate(),
      cacheSize: this.cache.getSize()
    };
  }
}

export default ClaudeAPIService;