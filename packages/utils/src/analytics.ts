import {
  AIAnalyticsEvent,
  AIProviderType,
  AIModelType,
  TokenUsage,
  AIPerformanceMetrics
} from '../../types/src';

/**
 * Analytics service for monitoring and tracking AI interactions
 */
export class AIAnalytics {
  private events: AIAnalyticsEvent[] = [];
  private metrics: AIPerformanceMetrics = {
    averageResponseTime: 0,
    successRate: 100,
    tokenUsage: 0,
    costEfficiency: 1,
    modelUsage: {} as Record<AIModelType, number>,
    errors: {
      count: 0,
      types: {},
    },
  };
  private isEnabled = true;
  private readonly MAX_EVENTS = 1000;
  private analyticsEndpoint: string | null = null;

  constructor(config?: { endpoint?: string; enabled?: boolean }) {
    this.isEnabled = config?.enabled ?? true;
    this.analyticsEndpoint = config?.endpoint ?? null;
    this.initializeMetrics();

    // Clean old events periodically
    if (typeof window !== 'undefined') {
      setInterval(() => this.pruneEvents(), 1000 * 60 * 10); // every 10 minutes
    }
  }

  /**
   * Initialize performance metrics
   */
  private initializeMetrics(): void {
    this.metrics = {
      averageResponseTime: 0,
      successRate: 100,
      tokenUsage: 0,
      costEfficiency: 1,
      modelUsage: {} as Record<AIModelType, number>,
      errors: {
        count: 0,
        types: {},
      },
    };
  }

  /**
   * Track a new AI event
   */
  trackEvent(event: Omit<AIAnalyticsEvent, 'timestamp'>): void {
    if (!this.isEnabled) return;

    const fullEvent: AIAnalyticsEvent = {
      ...event,
      timestamp: Date.now(),
    };

    this.events.push(fullEvent);

    // Update metrics in real-time
    this.updateMetrics(fullEvent);

    // Limit the size of the event history
    this.pruneEvents();

    // Send the event to the analytics backend if configured
    this.sendToAnalyticsBackend(fullEvent);
  }

  /**
   * Track the start of an AI request
   */
  trackRequestStart(
    name: string,
    model: string,
    metadata?: Record<string, any>
  ): string {
    const requestId = `req_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 9)}`;

    this.trackEvent({
      eventType: 'request',
      eventName: name,
      model,
      metadata: {
        ...metadata,
        requestId,
      },
    });

    return requestId;
  }

  /**
   * Track the completion of an AI request
   */
  trackRequestComplete(
    requestId: string,
    durationMs: number,
    success = true,
    promptTokens = 0,
    completionTokens = 0
  ): void {
    this.trackEvent({
      eventType: 'response',
      eventName: 'request_complete',
      duration: durationMs,
      success,
      promptTokens,
      completionTokens,
      metadata: { requestId },
    });
  }

  /**
   * Track user feedback on AI results
   */
  trackFeedback(requestId: string, rating: number, comment?: string): void {
    this.trackEvent({
      eventType: 'feedback',
      eventName: 'user_feedback',
      feedbackRating: rating,
      metadata: {
        requestId,
        comment,
        timestamp: Date.now(),
      },
    });
  }

  /**
   * Enable or disable analytics tracking
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Set the analytics endpoint
   */
  setEndpoint(endpoint: string | null): void {
    this.analyticsEndpoint = endpoint;
  }

  /**
   * Get current metrics
   */
  getMetrics(): AIPerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Get statistics for the dashboard
   */
  getStats(): Record<string, any> {
    const totalRequests = this.events.filter(
      (e) => e.eventType === 'request'
    ).length;
    const successfulRequests = this.events.filter(
      (e) => e.eventType === 'response' && e.success
    ).length;

    const avgDuration = this.calculateAverageResponseTime(
      this.getRecentEvents(3600)
    ); // last hour

    return {
      totalRequests,
      successRate: totalRequests
        ? (successfulRequests / totalRequests) * 100
        : 100,
      averageResponseTime: avgDuration,
      tokenUsage: this.metrics.tokenUsage,
      eventCount: this.events.length,
      errorRate: totalRequests
        ? (this.metrics.errors.count / totalRequests) * 100
        : 0,
    };
  }

  /**
   * Get recent events
   */
  getRecentEvents(seconds = 300): AIAnalyticsEvent[] {
    const cutoffTime = Date.now() - seconds * 1000;
    return this.events.filter((event) => event.timestamp >= cutoffTime);
  }

  /**
   * Update metrics based on a new event
   */
  private updateMetrics(event: AIAnalyticsEvent): void {
    const recentEvents = this.getRecentEvents(1800); // last 30 minutes

    // Update average response time
    if (event.eventType === 'response' && event.duration) {
      const responseTimes = recentEvents
        .filter((e) => e.eventType === 'response' && e.duration)
        .map((e) => e.duration || 0);

      this.metrics.averageResponseTime =
        responseTimes.length > 0
          ? responseTimes.reduce((sum, time) => sum + time, 0) /
            responseTimes.length
          : 0;
    }

    // Update success rate
    if (event.eventType === 'response') {
      const responses = recentEvents.filter((e) => e.eventType === 'response');
      const successful = responses.filter((e) => e.success).length;

      this.metrics.successRate =
        responses.length > 0 ? (successful / responses.length) * 100 : 100;
    }

    // Update model usage
    if (
      event.eventType === 'request' &&
      event.model &&
      this.isValidModel(event.model as AIModelType)
    ) {
      const model = event.model as AIModelType;
      this.metrics.modelUsage[model] =
        (this.metrics.modelUsage[model] || 0) + 1;
    }

    // Update token usage
    if (event.promptTokens || event.completionTokens) {
      const promptTokens = event.promptTokens || 0;
      const completionTokens = event.completionTokens || 0;

      this.metrics.tokenUsage += promptTokens + completionTokens;
    }

    // Update error statistics
    if (event.eventType === 'error') {
      this.metrics.errors.count++;

      if (event.errorType) {
        this.metrics.errors.types[event.errorType] =
          (this.metrics.errors.types[event.errorType] || 0) + 1;
      }
    }

    // Calculate cost efficiency
    this.updateCostEfficiency(recentEvents);
  }

  /**
   * Calculate cost efficiency
   */
  private updateCostEfficiency(events: AIAnalyticsEvent[]): void {
    const modelCosts: Record<AIModelType, number> = {
      'claude-3-opus-20240229': 0.15,
      'claude-3-5-sonnet-20240229': 0.08,
      'claude-3-haiku-20240229': 0.03,
      'claude-3-7-sonnet-20250219': 0.08,
      'gpt-4o': 0.08,
      'gpt-4o-mini': 0.08,
      'gpt-4.1': 0.15,
      'gpt-4': 0.08,
      'gpt-4-turbo-preview': 0.08,
      'gpt-3.5-turbo': 0.08,
    };

    let totalCost = 0;
    let totalSuccessTokens = 0;

    events.forEach((event) => {
      if (event.eventType === 'response' && event.model) {
        const model = event.model as AIModelType;
        const tokens =
          (event.promptTokens || 0) + (event.completionTokens || 0);
        const cost = ((modelCosts[model] || 0.08) * tokens) / 1000; // cost per 1000 tokens

        totalCost += cost;

        if (event.success) {
          totalSuccessTokens += tokens;
        }
      }
    });

    // Efficiency = successful tokens per dollar
    this.metrics.costEfficiency =
      totalCost > 0 ? totalSuccessTokens / totalCost : 1;
  }

  /**
   * Limit the number of stored events
   */
  private pruneEvents(): void {
    if (this.events.length > this.MAX_EVENTS) {
      this.events = this.events.slice(-this.MAX_EVENTS);
    }
  }

  /**
   * Check if a model is valid
   */
  private isValidModel(model: string): model is AIModelType {
    return [
      'claude-3-opus-20240229',
      'claude-3-5-sonnet-20240229',
      'claude-3-haiku-20240229',
      'claude-3-7-sonnet-20250219',
      'gpt-4',
      'gpt-4.1',
      'gpt-4-turbo-preview',
      'gpt-3.5-turbo',
      'gpt-4o',
      'gpt-4o-mini',
    ].includes(model);
  }

  /**
   * Calculate average response time for a set of events
   */
  private calculateAverageResponseTime(events: AIAnalyticsEvent[]): number {
    const responseTimes = events
      .filter(
        (event) =>
          event.eventType === 'response' && event.duration !== undefined
      )
      .map((event) => event.duration || 0);

    return responseTimes.length > 0
      ? responseTimes.reduce((sum, time) => sum + time, 0) /
          responseTimes.length
      : 0;
  }

  /**
   * Send events to the analytics backend
   */
  private sendToAnalyticsBackend(event: AIAnalyticsEvent): void {
    if (typeof window === 'undefined' || !this.analyticsEndpoint) {
      return;
    }

    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon(this.analyticsEndpoint, JSON.stringify(event));
      } else {
        // Fallback to fetch if sendBeacon is not available
        fetch(this.analyticsEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event),
          keepalive: true,
        }).catch((e) =>
          console.error('Failed to send analytics event via fetch:', e)
        );
      }
    } catch (e) {
      console.error('Failed to send analytics event:', e);
    }
  }
}

// Export a singleton instance
export const aiAnalytics = new AIAnalytics();
