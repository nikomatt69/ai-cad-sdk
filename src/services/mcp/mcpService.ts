import {
  AIModelType,
  AIProviderType,
  AIRequest,
  AIResponse,
  MCPRequestParams,
  MCPResponse,
} from '../../types';

import { aiCache, AICache } from '../cache/aiCache';
import { AIAnalytics, aiAnalytics } from '../analytics/aiAnalytics';
import {
  createSemanticCacheProvider,
  ISemanticCacheProvider,
} from '../../../packages/adapters/src/cache';
import { smartRouter } from './smartRouter';

/**
 * Options for the MCP Service
 */
interface MCPOptions {
  maxRetries: number;
  retryDelay: number;
  timeoutMs: number;
  priorityLevels: {
    high: number;
    normal: number;
    low: number;
  };
  semanticCacheEnabled: boolean;
  smartRoutingEnabled: boolean;
  defaultTTL: number;
}

/**
 * Model-Completions-Protocol service
 * Enhances AI interactions with caching, prioritization, and smart routing
 */
export class MCPService {
  private requestQueue: Map<
    string,
    {
      request: AIRequest;
      priority: number;
      timestamp: number;
      resolve: (value: any) => void;
      reject: (reason: any) => void;
    }
  > = new Map();

  private processingQueue = false;
  private options: MCPOptions;
  private cache: AICache;
  private semanticCache: ISemanticCacheProvider;
  private analytics: AIAnalytics;
  private endpoint: string;

  constructor(
    cache: AICache,
    analytics: AIAnalytics,
    options?: Partial<MCPOptions>,
    endpoint?: string
  ) {
    this.cache = cache;
    this.analytics = analytics;
    this.endpoint = endpoint || '/api/ai/mcp';
    this.semanticCache = createSemanticCacheProvider();

    this.options = {
      maxRetries: 3,
      retryDelay: 1000,
      timeoutMs: 30000,
      priorityLevels: {
        high: 100,
        normal: 50,
        low: 10,
      },
      semanticCacheEnabled: true,
      smartRoutingEnabled: true,
      defaultTTL: 3600000, // 1 hour
      ...options,
    };

    // Start processing queue
    this.processQueue();
  }

  /**
   * Enqueue a request to be processed with the MCP protocol
   */
  async enqueue<T>(
    request: AIRequest,
    priority: 'high' | 'normal' | 'low' = 'normal'
  ): Promise<MCPResponse<T>> {
    const requestId = `req_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 9)}`;

    // Track analytics for the request start
    this.analytics.trackRequestStart(
      'mcp_request',
      request.model || 'unknown',
      { priority, requestType: request.metadata?.type || 'unknown' }
    );

    // Apply smart routing if enabled and no model specified
    if (this.options.smartRoutingEnabled && !request.model) {
      request.model = this.selectOptimalModel(request);

      this.analytics.trackEvent({
        eventType: 'mcp',
        eventName: 'smart_routing',
        success: true,
        metadata: {
          selectedModel: request.model,
          taskType: request.metadata?.type || 'unknown',
        },
      });
    }

    return new Promise((resolve, reject) => {
      // Add request to queue
      this.requestQueue.set(requestId, {
        request,
        priority: this.options.priorityLevels[priority],
        timestamp: Date.now(),
        resolve,
        reject,
      });

      // Setup timeout
      setTimeout(() => {
        if (this.requestQueue.has(requestId)) {
          this.requestQueue.delete(requestId);
          reject(new Error('Request timeout'));

          this.analytics.trackEvent({
            eventType: 'error',
            eventName: 'request_timeout',
            success: false,
            metadata: { requestId },
          });
        }
      }, this.options.timeoutMs);

      // Trigger queue processing if not already running
      if (!this.processingQueue) {
        this.processQueue();
      }
    });
  }

  /**
   * Process the queue based on priority and timing
   */
  private async processQueue() {
    this.processingQueue = true;

    while (this.requestQueue.size > 0) {
      // Get highest priority request
      const nextRequest = this.getNextRequest();

      if (!nextRequest) {
        break;
      }

      const { request, resolve, reject } = nextRequest;

      try {
        // Execute the request
        const result = await this.executeRequest(request);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    }

    this.processingQueue = false;
  }

  /**
   * Get the next request to process based on priority
   */
  private getNextRequest() {
    let highestPriority = -1;
    let oldestTimestamp = Infinity;
    let selectedRequestId: string | null = null;

    // Find the highest priority request
    for (const [id, entry] of Array.from(this.requestQueue.entries())) {
      if (entry.priority > highestPriority) {
        highestPriority = entry.priority;
        oldestTimestamp = entry.timestamp;
        selectedRequestId = id;
      } else if (
        entry.priority === highestPriority &&
        entry.timestamp < oldestTimestamp
      ) {
        // If same priority, take the oldest
        oldestTimestamp = entry.timestamp;
        selectedRequestId = id;
      }
    }

    if (selectedRequestId) {
      const entry = this.requestQueue.get(selectedRequestId);
      this.requestQueue.delete(selectedRequestId);
      return entry;
    }

    return null;
  }

  /**
   * Execute a request to the AI API with retries
   */
  private async executeRequest(
    request: AIRequest,
    retryCount = 0
  ): Promise<MCPResponse<any>> {
    const startTime = Date.now();
    const mcpParams: MCPRequestParams = request.mcpParams || {
      cacheStrategy: 'exact',
      cacheTTL: this.options.defaultTTL,
      storeResult: true,
    };

    // Check cache based on strategy
    let cachedResult: AIResponse<any> | null = null;
    let similarity = 1.0;

    if (
      mcpParams.cacheStrategy === 'exact' ||
      mcpParams.cacheStrategy === 'hybrid'
    ) {
      // Generate exact cache key and check
      const exactCacheKey = this.generateExactCacheKey(request);
      cachedResult = (await this.cache.get(
        exactCacheKey
      )) as AIResponse<any> | null;

      // Track cache check attempt
      this.analytics.trackEvent({
        eventType: 'mcp',
        eventName: 'exact_cache_check',
        success: !!cachedResult,
        metadata: { cacheHit: !!cachedResult },
      });
    }

    // If no exact match and semantic or hybrid is enabled, try semantic search
    if (
      !cachedResult &&
      (mcpParams.cacheStrategy === 'semantic' ||
        mcpParams.cacheStrategy === 'hybrid') &&
      this.options.semanticCacheEnabled
    ) {
      // Get semantic match
      const semanticResult = await this.semanticCache.findSimilar(
        request.prompt,
        {
          model: request.model,
          systemPrompt: request.systemPrompt,
          minSimilarity: mcpParams.minSimilarity || 0.8,
        }
      );

      if (semanticResult) {
        cachedResult = semanticResult.response;
        similarity = semanticResult.similarity;

        // Add similarity info to the response metadata
        if (cachedResult && !cachedResult.metadata) {
          cachedResult.metadata = {};
        }

        if (cachedResult && cachedResult.metadata) {
          cachedResult.metadata.similarity = similarity;
          cachedResult.metadata.cacheStrategy = 'semantic';
        }

        // Track semantic cache hit
        this.analytics.trackEvent({
          eventType: 'mcp',
          eventName: 'semantic_cache_hit',
          success: true,
          metadata: { similarity },
        });
      } else {
        // Track semantic cache miss
        this.analytics.trackEvent({
          eventType: 'mcp',
          eventName: 'semantic_cache_miss',
          success: false,
        });
      }
    }

    // If we found a cached result, return it
    if (cachedResult) {
      // Mark response as coming from cache
      cachedResult.fromCache = true;
      cachedResult.fromMCP = true;

      // Calculate estimated savings
      const savingsEstimate = {
        tokens: cachedResult.usage?.totalTokens || 500, // Default estimate
        cost: this.estimateCost(
          cachedResult.usage?.totalTokens || 500,
          request.model
        ),
        timeMs: Date.now() - startTime,
      };

      // Track successful cache hit
      this.analytics.trackEvent({
        eventType: 'mcp',
        eventName: 'cache_hit',
        success: true,
        metadata: {
          strategy: mcpParams.cacheStrategy,
          similarity,
          savingsEstimate,
        },
      });

      // Format response for cached results
      return {
        cacheHit: true,
        similarity,
        response: cachedResult,
        savingsEstimate,
      };
    }

    try {
      // Prepare request body based on provider
      const provider = this.getProviderForModel(request.model);
      const response = await this.callProviderAPI(request, provider);

      // Process the response with parser if provided
      let parsedData = null;
      let parsingError = null;

      if (request.parseResponse && response.rawResponse) {
        try {
          parsedData = await request.parseResponse(response.rawResponse);
        } catch (error) {
          parsingError =
            error instanceof Error ? error : new Error('Parsing failed');

          this.analytics.trackEvent({
            eventType: 'error',
            eventName: 'parsing_error',
            errorType: 'parsing',
            success: false,
            metadata: { error: parsingError.message },
          });
        }
      }

      // Calculate processing time
      const processingTime = Date.now() - startTime;

      // Update response with parsed data
      response.data = parsedData;
      response.error = parsingError?.message || response.error;
      response.success = !parsingError && response.success;
      response.processingTime = processingTime;
      response.fromMCP = true;

      // Store in cache if storeResult is true
      if (mcpParams.storeResult) {
        await this.storeInCaches(
          request,
          response,
          mcpParams.cacheTTL || this.options.defaultTTL
        );

        this.analytics.trackEvent({
          eventType: 'mcp',
          eventName: 'store_in_cache',
          success: true,
          metadata: {
            strategy: mcpParams.cacheStrategy,
          },
        });
      }

      // MCP response format
      return {
        cacheHit: false,
        response,
        savingsEstimate: {
          tokens: 0,
          cost: 0,
          timeMs: 0,
        },
      };
    } catch (error) {
      // Handle retries
      if (retryCount < this.options.maxRetries) {
        console.log(
          `Retrying request (${retryCount + 1}/${this.options.maxRetries})...`
        );

        // Exponential backoff
        const delay = this.options.retryDelay * Math.pow(2, retryCount);
        await new Promise((resolve) => setTimeout(resolve, delay));

        return this.executeRequest(request, retryCount + 1);
      }

      // Track error
      this.analytics.trackEvent({
        eventType: 'error',
        eventName: 'request_failed',
        errorType: error instanceof Error ? error.name : 'unknown',
        success: false,
        metadata: {
          message: error instanceof Error ? error.message : 'Unknown error',
          retries: retryCount,
        },
      });

      // Error response
      const errorResponse: AIResponse<any> = {
        rawResponse: null,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
        fromMCP: true,
      };

      return {
        cacheHit: false,
        response: errorResponse,
        savingsEstimate: {
          tokens: 0,
          cost: 0,
          timeMs: 0,
        },
      };
    }
  }

  /**
   * Call the appropriate provider API
   */
  private async callProviderAPI(
    request: AIRequest,
    provider: AIProviderType
  ): Promise<AIResponse<any>> {
    const {
      model = 'claude-3-7-sonnet-20250219',
      systemPrompt,
      prompt,
      temperature = 0.3,
      maxTokens = 4000,
    } = request;

    // Prepare request body
    let body: Record<string, any>;
    const endpoint = this.endpoint;

    // Track API call
    this.analytics.trackEvent({
      eventType: 'mcp',
      eventName: 'api_call',
      success: true,
      metadata: {
        provider,
        model,
      },
    });

    if (provider === 'CLAUDE' || provider === 'claude') {
      body = {
        model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: maxTokens,
        temperature,
        system: systemPrompt,
      };
    } else if (provider === 'OPENAI' || provider === 'openai') {
      body = {
        model,
        messages: [
          ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
          { role: 'user', content: prompt },
        ],
        max_tokens: maxTokens,
        temperature,
        ...request.openaiOptions,
        provider: 'openai', // Explicitly mark provider for routing
      };

      // Handle OpenAI-specific options
      if (request.openaiOptions?.functions) {
        body.functions = request.openaiOptions.functions;
      }

      if (request.openaiOptions?.function_call) {
        body.function_call = request.openaiOptions.function_call;
      }
    } else {
      throw new Error(`Unsupported provider: ${provider}`);
    }

    // Call API proxy
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'API request failed');
    }

    const data = await response.json();
    let content;

    // Parse response based on provider
    if (provider === 'CLAUDE' || provider === 'claude') {
      content = data.content[0]?.type === 'text' ? data.content[0].text : '';
    } else {
      // OpenAI format
      content = data.choices?.[0]?.message?.content || '';
    }

    // Format usage info based on provider
    let usage = {
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
    };

    if (provider === 'CLAUDE' || provider === 'claude') {
      usage = {
        promptTokens: data.usage?.input_tokens || 0,
        completionTokens: data.usage?.output_tokens || 0,
        totalTokens:
          (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
      };
    } else {
      usage = {
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0,
      };
    }

    // Format response
    return {
      rawResponse: content,
      data: null, // To be filled by parser
      success: true,
      model,
      provider,
      usage,
    };
  }

  /**
   * Generate an exact cache key based on request
   */
  private generateExactCacheKey(request: AIRequest): string {
    const { prompt, model, systemPrompt, temperature } = request;
    return `mcp:exact:${model}:${temperature}:${systemPrompt}:${prompt}`;
  }

  /**
   * Store response in both exact and semantic cache if applicable
   */
  private async storeInCaches(
    request: AIRequest,
    response: AIResponse<any>,
    ttl: number
  ): Promise<void> {
    const mcpParams: MCPRequestParams = request.mcpParams || {
      cacheStrategy: 'exact',
      cacheTTL: ttl,
      storeResult: true,
    };

    // Store in exact cache
    if (
      mcpParams.cacheStrategy === 'exact' ||
      mcpParams.cacheStrategy === 'hybrid'
    ) {
      const exactCacheKey = this.generateExactCacheKey(request);
      await this.cache.set(exactCacheKey, response, ttl);
    }

    // Store in semantic cache
    if (
      (mcpParams.cacheStrategy === 'semantic' ||
        mcpParams.cacheStrategy === 'hybrid') &&
      this.options.semanticCacheEnabled
    ) {
      await this.semanticCache.store(request.prompt, response, {
        model: request.model,
        systemPrompt: request.systemPrompt,
        ttl,
      });
    }
  }

  /**
   * Estimate cost based on tokens used and model
   */
  private estimateCost(tokens: number, model?: AIModelType): number {
    return smartRouter.estimateCost(
      model || 'claude-3-7-sonnet-20250219',
      tokens * 0.7,
      tokens * 0.3
    );
  }

  /**
   * Get provider for a model
   */
  private getProviderForModel(model?: AIModelType): AIProviderType {
    if (!model) return 'CLAUDE';
    return smartRouter.getProviderForModel(model);
  }

  /**
   * Select the optimal model based on request metadata and MCP settings
   */
  private selectOptimalModel(request: AIRequest): AIModelType {
    const metadata = request.metadata || {};
    const mcpParams: MCPRequestParams = request.mcpParams || {
      cacheStrategy: 'exact',
      cacheTTL: this.options.defaultTTL,
      storeResult: true,
    };

    // Determine task complexity
    let complexityLevel: 'low' | 'medium' | 'high' = 'medium';

    if (metadata.complexity === 'simple' || metadata.complexity === 'low') {
      complexityLevel = 'low';
    } else if (
      metadata.complexity === 'complex' ||
      metadata.complexity === 'high'
    ) {
      complexityLevel = 'high';
    }

    // Extract task type
    const taskType = metadata.type || 'general';

    // Map required capabilities from metadata
    const requiredCapabilities: string[] = [];

    if (metadata.requiresReasoning) requiredCapabilities.push('reasoning');
    if (metadata.requiresCreativity) requiredCapabilities.push('creative');
    if (metadata.requiresCode) requiredCapabilities.push('code');
    if (metadata.requiresMath) requiredCapabilities.push('math');
    if (metadata.requiresFactual) requiredCapabilities.push('factual');

    // Estimate token usage
    const promptTokenEstimate =
      metadata.promptTokens || request.prompt.length / 4;
    const outputTokenEstimate = metadata.expectedOutputTokens || 800;

    // Select model
    return smartRouter.selectModel({
      taskType,
      promptTokenEstimate,
      outputTokenEstimate,
      priority: mcpParams?.priority || 'quality',
      requiredCapabilities,
      preferredProvider: mcpParams?.preferredProvider || 'CLAUDE',
      complexityLevel,
    });
  }

  /**
   * Enable or disable semantic caching
   */
  setSemanticCacheEnabled(enabled: boolean): void {
    this.options.semanticCacheEnabled = enabled;
  }

  /**
   * Enable or disable smart routing
   */
  setSmartRoutingEnabled(enabled: boolean): void {
    this.options.smartRoutingEnabled = enabled;
  }

  /**
   * Set the default time-to-live for cache entries
   */
  setDefaultTTL(ttl: number): void {
    this.options.defaultTTL = ttl;
  }

  /**
   * Get the current MCP service settings
   */
  getSettings(): Partial<MCPOptions> {
    return {
      semanticCacheEnabled: this.options.semanticCacheEnabled,
      smartRoutingEnabled: this.options.smartRoutingEnabled,
      defaultTTL: this.options.defaultTTL,
      maxRetries: this.options.maxRetries,
      priorityLevels: this.options.priorityLevels,
    };
  }

  /**
   * Get performance stats for the MCP service
   */
  async getStats(): Promise<Record<string, any>> {
    // Get cache stats
    const exactCacheStats = this.cache.getStats();
    const semanticCacheStats = await this.semanticCache.getStats();

    return {
      exactCache: exactCacheStats,
      semanticCache: semanticCacheStats,
      activeRequests: this.requestQueue.size,
      settings: this.getSettings(),
    };
  }
}

// Export a singleton instance with the default cache
export const mcpService = new MCPService(aiCache, aiAnalytics);
