/**
 * Advanced Performance Monitoring System
 * Tracks Core Web Vitals, user interactions, and application performance
 */

interface PerformanceConfig {
  enableDevtools: boolean;
  sampleRate: number;
  thresholds: {
    fcp: number; // First Contentful Paint
    lcp: number; // Largest Contentful Paint
    fid: number; // First Input Delay
    cls: number; // Cumulative Layout Shift
  };
  reportingEndpoint?: string;
}

interface PerformanceMetrics {
  // Core Web Vitals
  fcp?: number;
  lcp?: number;
  fid?: number;
  cls?: number;
  
  // Navigation metrics
  navigationStart: number;
  domContentLoaded: number;
  loadComplete: number;
  
  // Custom metrics
  appInitialization: number;
  themeLoadTime: number;
  animationFrameRate: number;
  memoryUsage?: MemoryInfo;
  
  // User experience metrics
  interactionCount: number;
  errorCount: number;
  sessionDuration: number;
}

interface PerformanceEntry {
  metric: string;
  value: number;
  timestamp: number;
  context?: Record<string, any>;
}

export class PerformanceMonitor {
  private config: PerformanceConfig;
  private metrics: PerformanceMetrics;
  private entries: PerformanceEntry[] = [];
  private observers: Map<string, PerformanceObserver> = new Map();
  private startTime: number;
  private frameRateTracker: number | null = null;
  private isMonitoring = false;

  constructor(config: PerformanceConfig) {
    this.config = config;
    this.startTime = performance.now();
    this.metrics = {
      navigationStart: performance.timeOrigin,
      domContentLoaded: 0,
      loadComplete: 0,
      appInitialization: 0,
      themeLoadTime: 0,
      animationFrameRate: 60,
      interactionCount: 0,
      errorCount: 0,
      sessionDuration: 0,
    };
  }

  async initialize(): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      // Initialize Core Web Vitals observers
      this.initializeCoreWebVitals();
      
      // Initialize navigation timing
      this.trackNavigationTiming();
      
      // Initialize memory monitoring
      this.initializeMemoryMonitoring();
      
      // Initialize user interaction tracking
      this.initializeInteractionTracking();
      
      console.info('Performance monitoring initialized');
    } catch (error) {
      console.warn('Performance monitoring initialization failed:', error);
    }
  }

  startMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.startTime = performance.now();
    
    // Start frame rate monitoring for animations
    this.startFrameRateMonitoring();
    
    // Start session duration tracking
    this.startSessionTracking();
    
    if (this.config.enableDevtools) {
      console.info('Performance monitoring started');
    }
  }

  stopMonitoring(): void {
    this.isMonitoring = false;
    
    // Stop all observers
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    
    // Stop frame rate monitoring
    if (this.frameRateTracker) {
      cancelAnimationFrame(this.frameRateTracker);
      this.frameRateTracker = null;
    }
    
    if (this.config.enableDevtools) {
      console.info('Performance monitoring stopped');
    }
  }

  trackWebVital(name: 'FCP' | 'LCP' | 'FID' | 'CLS', value: number): void {
    const metricKey = name.toLowerCase() as keyof PerformanceMetrics;
    this.metrics[metricKey] = value;
    
    this.addEntry({
      metric: name,
      value,
      timestamp: performance.now(),
      context: { isWebVital: true },
    });

    // Check against thresholds
    const threshold = this.config.thresholds[metricKey];
    if (threshold && value > threshold) {
      this.reportIssue(`${name} exceeded threshold: ${value}ms > ${threshold}ms`);
    }
  }

  trackCustomMetric(name: string, value: number, context?: Record<string, any>): void {
    this.addEntry({
      metric: name,
      value,
      timestamp: performance.now(),
      context,
    });

    // Update internal metrics
    if (name === 'app-initialization') {
      this.metrics.appInitialization = value;
    } else if (name === 'theme-load-time') {
      this.metrics.themeLoadTime = value;
    }
  }

  trackError(error: Error, context?: Record<string, any>): void {
    this.metrics.errorCount++;
    
    this.addEntry({
      metric: 'error',
      value: this.metrics.errorCount,
      timestamp: performance.now(),
      context: {
        message: error.message,
        stack: error.stack,
        ...context,
      },
    });
  }

  trackInteraction(type: string, duration?: number): void {
    this.metrics.interactionCount++;
    
    this.addEntry({
      metric: 'interaction',
      value: duration || 0,
      timestamp: performance.now(),
      context: { type, count: this.metrics.interactionCount },
    });
  }

  getMetrics(): PerformanceMetrics {
    // Update session duration
    this.metrics.sessionDuration = performance.now() - this.startTime;
    
    // Get current memory usage if available
    if ('memory' in performance) {
      this.metrics.memoryUsage = (performance as any).memory;
    }
    
    return { ...this.metrics };
  }

  getEntries(): PerformanceEntry[] {
    return [...this.entries];
  }

  generateReport(): string {
    const metrics = this.getMetrics();
    const entries = this.getEntries();
    
    const report = {
      timestamp: new Date().toISOString(),
      metrics,
      recentEntries: entries.slice(-10),
      summary: this.generateSummary(metrics),
    };
    
    return JSON.stringify(report, null, 2);
  }

  enableDevFeatures(): void {
    if (!this.config.enableDevtools) return;
    
    // Add performance debugging tools to window
    (window as any).__PERFORMANCE_MONITOR__ = {
      getMetrics: () => this.getMetrics(),
      getEntries: () => this.getEntries(),
      generateReport: () => this.generateReport(),
      clearData: () => this.clearData(),
    };
    
    // Add visual performance indicator
    this.addPerformanceIndicator();
  }

  private initializeCoreWebVitals(): void {
    // First Contentful Paint
    if ('PerformanceObserver' in window) {
      try {
        const fcpObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name === 'first-contentful-paint') {
              this.trackWebVital('FCP', entry.startTime);
            }
          }
        });
        fcpObserver.observe({ entryTypes: ['paint'] });
        this.observers.set('fcp', fcpObserver);
      } catch (error) {
        console.warn('FCP observer failed:', error);
      }
    }
  }

  private trackNavigationTiming(): void {
    if (typeof window === 'undefined') return;
    
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming;
          this.metrics.domContentLoaded = navEntry.domContentLoadedEventEnd - navEntry.navigationStart;
          this.metrics.loadComplete = navEntry.loadEventEnd - navEntry.navigationStart;
        }
      }
    });
    
    try {
      observer.observe({ entryTypes: ['navigation'] });
      this.observers.set('navigation', observer);
    } catch (error) {
      console.warn('Navigation timing observer failed:', error);
    }
  }

  private initializeMemoryMonitoring(): void {
    if (!('memory' in performance)) return;
    
    setInterval(() => {
      if (this.isMonitoring) {
        const memory = (performance as any).memory;
        this.addEntry({
          metric: 'memory-usage',
          value: memory.usedJSHeapSize,
          timestamp: performance.now(),
          context: {
            totalJSHeapSize: memory.totalJSHeapSize,
            jsHeapSizeLimit: memory.jsHeapSizeLimit,
          },
        });
      }
    }, 30000); // Every 30 seconds
  }

  private initializeInteractionTracking(): void {
    const trackInteraction = (type: string) => (event: Event) => {
      const startTime = performance.now();
      
      requestAnimationFrame(() => {
        const duration = performance.now() - startTime;
        this.trackInteraction(type, duration);
      });
    };
    
    // Track various interaction types
    ['click', 'touchstart', 'keydown'].forEach(eventType => {
      document.addEventListener(eventType, trackInteraction(eventType), { passive: true });
    });
  }

  private startFrameRateMonitoring(): void {
    let lastFrameTime = performance.now();
    let frameCount = 0;
    let fpsSum = 0;
    
    const measureFrameRate = () => {
      if (!this.isMonitoring) return;
      
      const currentTime = performance.now();
      const deltaTime = currentTime - lastFrameTime;
      
      if (deltaTime > 0) {
        const fps = 1000 / deltaTime;
        fpsSum += fps;
        frameCount++;
        
        // Update average every 60 frames
        if (frameCount >= 60) {
          this.metrics.animationFrameRate = fpsSum / frameCount;
          frameCount = 0;
          fpsSum = 0;
          
          this.addEntry({
            metric: 'frame-rate',
            value: this.metrics.animationFrameRate,
            timestamp: currentTime,
          });
        }
      }
      
      lastFrameTime = currentTime;
      this.frameRateTracker = requestAnimationFrame(measureFrameRate);
    };
    
    this.frameRateTracker = requestAnimationFrame(measureFrameRate);
  }

  private startSessionTracking(): void {
    // Track session duration periodically
    setInterval(() => {
      if (this.isMonitoring) {
        this.metrics.sessionDuration = performance.now() - this.startTime;
      }
    }, 10000); // Every 10 seconds
  }

  private addEntry(entry: PerformanceEntry): void {
    this.entries.push(entry);
    
    // Keep only last 1000 entries to prevent memory issues
    if (this.entries.length > 1000) {
      this.entries = this.entries.slice(-1000);
    }
    
    // Sample reporting to external service
    if (this.shouldReport()) {
      this.reportToService(entry);
    }
  }

  private shouldReport(): boolean {
    return Math.random() < this.config.sampleRate;
  }

  private reportToService(entry: PerformanceEntry): void {
    if (!this.config.reportingEndpoint) return;
    
    // In production, this would send data to analytics service
    if (this.config.enableDevtools) {
      console.debug('Performance entry:', entry);
    }
  }

  private reportIssue(issue: string): void {
    console.warn('Performance issue detected:', issue);
    
    this.addEntry({
      metric: 'performance-issue',
      value: 1,
      timestamp: performance.now(),
      context: { issue },
    });
  }

  private generateSummary(metrics: PerformanceMetrics): Record<string, any> {
    return {
      overallHealth: this.calculateHealthScore(metrics),
      criticalIssues: this.identifyCriticalIssues(metrics),
      recommendations: this.generateRecommendations(metrics),
    };
  }

  private calculateHealthScore(metrics: PerformanceMetrics): number {
    let score = 100;
    
    // Deduct points for poor metrics
    if (metrics.fcp && metrics.fcp > this.config.thresholds.fcp) score -= 20;
    if (metrics.lcp && metrics.lcp > this.config.thresholds.lcp) score -= 20;
    if (metrics.fid && metrics.fid > this.config.thresholds.fid) score -= 20;
    if (metrics.cls && metrics.cls > this.config.thresholds.cls) score -= 20;
    if (metrics.animationFrameRate < 50) score -= 10;
    if (metrics.errorCount > 0) score -= metrics.errorCount * 5;
    
    return Math.max(0, score);
  }

  private identifyCriticalIssues(metrics: PerformanceMetrics): string[] {
    const issues: string[] = [];
    
    if (metrics.fcp && metrics.fcp > this.config.thresholds.fcp * 2) {
      issues.push('Very slow First Contentful Paint');
    }
    
    if (metrics.animationFrameRate < 30) {
      issues.push('Poor animation performance');
    }
    
    if (metrics.errorCount > 5) {
      issues.push('High error rate');
    }
    
    return issues;
  }

  private generateRecommendations(metrics: PerformanceMetrics): string[] {
    const recommendations: string[] = [];
    
    if (metrics.appInitialization > 3000) {
      recommendations.push('Consider lazy loading non-critical features');
    }
    
    if (metrics.animationFrameRate < 55) {
      recommendations.push('Optimize animations and reduce complexity');
    }
    
    if (metrics.memoryUsage && metrics.memoryUsage.usedJSHeapSize > 50 * 1024 * 1024) {
      recommendations.push('Monitor memory usage and clean up unused objects');
    }
    
    return recommendations;
  }

  private addPerformanceIndicator(): void {
    if (typeof document === 'undefined') return;
    
    const indicator = document.createElement('div');
    indicator.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      padding: 8px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      font-family: monospace;
      font-size: 12px;
      border-radius: 4px;
      z-index: 10000;
      pointer-events: none;
    `;
    
    const updateIndicator = () => {
      if (this.isMonitoring) {
        const metrics = this.getMetrics();
        indicator.textContent = `FPS: ${Math.round(metrics.animationFrameRate)} | Errors: ${metrics.errorCount}`;
      }
    };
    
    document.body.appendChild(indicator);
    setInterval(updateIndicator, 1000);
  }

  private clearData(): void {
    this.entries = [];
    this.metrics.errorCount = 0;
    this.metrics.interactionCount = 0;
  }
}

// Utility functions for performance measurement
export const measureAsync = async <T>(
  name: string,
  asyncFn: () => Promise<T>,
  monitor?: PerformanceMonitor
): Promise<T> => {
  const start = performance.now();
  try {
    const result = await asyncFn();
    const duration = performance.now() - start;
    monitor?.trackCustomMetric(name, duration);
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    monitor?.trackCustomMetric(`${name}-error`, duration);
    throw error;
  }
};

export const measureSync = <T>(
  name: string,
  syncFn: () => T,
  monitor?: PerformanceMonitor
): T => {
  const start = performance.now();
  try {
    const result = syncFn();
    const duration = performance.now() - start;
    monitor?.trackCustomMetric(name, duration);
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    monitor?.trackCustomMetric(`${name}-error`, duration);
    throw error;
  }
};

export type { PerformanceConfig, PerformanceMetrics, PerformanceEntry };