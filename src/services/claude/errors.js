/**
 * Claude API Error Classes
 * Custom error types for better error handling and user feedback
 */

export class ClaudeError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'ClaudeError';
    this.details = details;
    this.timestamp = new Date().toISOString();
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      details: this.details,
      timestamp: this.timestamp
    };
  }
}

export class AuthenticationError extends ClaudeError {
  constructor(message, details = {}) {
    super(message, details);
    this.name = 'AuthenticationError';
    this.userMessage = 'Authentication failed. Please check your API configuration.';
  }
}

export class RateLimitError extends ClaudeError {
  constructor(message, details = {}) {
    super(message, details);
    this.name = 'RateLimitError';
    this.userMessage = 'Too many requests. Please wait a moment before trying again.';
    this.retryAfter = details.retryAfter || 60; // seconds
  }
}

export class NetworkError extends ClaudeError {
  constructor(message, details = {}) {
    super(message, details);
    this.name = 'NetworkError';
    this.userMessage = 'Network connection failed. Please check your internet connection.';
  }
}

export class ValidationError extends ClaudeError {
  constructor(message, details = {}) {
    super(message, details);
    this.name = 'ValidationError';
    this.userMessage = 'Invalid input provided. Please check your request.';
  }
}

/**
 * Error Handler Utility
 */
export class ErrorHandler {
  static handleError(error, context = {}) {
    console.error('Claude API Error:', error.toJSON ? error.toJSON() : error);
    
    // Log to analytics/monitoring service
    if (window.analytics) {
      window.analytics.track('claude_error', {
        error_type: error.name,
        message: error.message,
        context: context
      });
    }

    return {
      type: error.name,
      message: error.userMessage || error.message,
      canRetry: error.name === 'RateLimitError' || error.name === 'NetworkError',
      retryAfter: error.retryAfter || null
    };
  }

  static getErrorMessage(error) {
    if (error.userMessage) {
      return error.userMessage;
    }

    switch (error.name) {
      case 'AuthenticationError':
        return 'Authentication failed. Please check your API configuration.';
      case 'RateLimitError':
        return 'Too many requests. Please wait a moment before trying again.';
      case 'NetworkError':
        return 'Network connection failed. Please check your internet connection.';
      case 'ValidationError':
        return 'Invalid input provided. Please check your request.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }
}