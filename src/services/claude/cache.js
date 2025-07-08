/**
 * Response Cache System
 * Implements intelligent caching to reduce API calls and improve performance
 */

import { createHash } from 'crypto';

export class ResponseCache {
  constructor(options = {}) {
    this.maxSize = options.maxSize || 100;
    this.maxAge = options.maxAge || 15 * 60 * 1000; // 15 minutes
    this.cache = new Map();
    this.hitCount = 0;
    this.missCount = 0;
    
    // Clean up expired entries periodically
    this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000); // 5 minutes
  }

  /**
   * Generate cache key from prompt and options
   */
  generateKey(prompt, options = {}) {
    const normalizedPrompt = this.normalizePrompt(prompt);
    const keyData = {
      prompt: normalizedPrompt,
      model: options.model || 'claude-3-sonnet-20240229',
      temperature: options.temperature || 0.7,
      maxTokens: options.maxTokens || 1000
    };
    
    return createHash('md5').update(JSON.stringify(keyData)).digest('hex');
  }

  /**
   * Normalize prompt for better cache hits
   */
  normalizePrompt(prompt) {
    return prompt
      .trim()
      .replace(/\s+/g, ' ') // Normalize whitespace
      .toLowerCase(); // Case insensitive
  }

  /**
   * Get cached response
   */
  get(key) {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.missCount++;
      return null;
    }
    
    // Check if expired
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      this.missCount++;
      return null;
    }
    
    this.hitCount++;
    entry.lastAccessed = Date.now();
    return entry.data;
  }

  /**
   * Set cached response
   */
  set(key, data) {
    // Implement LRU eviction if cache is full
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }
    
    this.cache.set(key, {
      data: data,
      expiry: Date.now() + this.maxAge,
      lastAccessed: Date.now(),
      created: Date.now()
    });
  }

  /**
   * Evict least recently used entry
   */
  evictLRU() {
    let lruKey = null;
    let lruTime = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < lruTime) {
        lruTime = entry.lastAccessed;
        lruKey = key;
      }
    }
    
    if (lruKey) {
      this.cache.delete(lruKey);
    }
  }

  /**
   * Clean up expired entries
   */
  cleanup() {
    const now = Date.now();
    const keysToDelete = [];
    
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * Get cache hit rate
   */
  getHitRate() {
    const total = this.hitCount + this.missCount;
    return total > 0 ? (this.hitCount / total) * 100 : 0;
  }

  /**
   * Get cache size
   */
  getSize() {
    return this.cache.size;
  }

  /**
   * Clear cache
   */
  clear() {
    this.cache.clear();
    this.hitCount = 0;
    this.missCount = 0;
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: this.getHitRate(),
      hitCount: this.hitCount,
      missCount: this.missCount,
      oldestEntry: this.getOldestEntry(),
      newestEntry: this.getNewestEntry()
    };
  }

  /**
   * Get oldest cache entry timestamp
   */
  getOldestEntry() {
    let oldest = Date.now();
    for (const entry of this.cache.values()) {
      if (entry.created < oldest) {
        oldest = entry.created;
      }
    }
    return oldest;
  }

  /**
   * Get newest cache entry timestamp
   */
  getNewestEntry() {
    let newest = 0;
    for (const entry of this.cache.values()) {
      if (entry.created > newest) {
        newest = entry.created;
      }
    }
    return newest;
  }

  /**
   * Cleanup on destruction
   */
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.clear();
  }
}