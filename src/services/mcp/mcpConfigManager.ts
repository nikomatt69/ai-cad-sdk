import { MCPRequestParams, AIModelType, AIProviderType } from '../../types';
import { smartRouter } from './smartRouter';

/**
 * MCP Strategy configurations
 */
interface MCPStrategyConfig {
  cacheStrategy: 'exact' | 'semantic' | 'hybrid';
  minSimilarity: number;
  cacheTTL: number;
  priority: 'speed' | 'quality' | 'cost';
  storeResult: boolean;
}

/**
 * MCP Configuration Manager
 * Manages settings specific to the Model-Completions-Protocol
 */
export class MCPConfigManager {
  private strategyConfigs: Record<
    'aggressive' | 'balanced' | 'conservative',
    MCPStrategyConfig
  > = {
    aggressive: {
      cacheStrategy: 'hybrid',
      minSimilarity: 0.65,
      cacheTTL: 86400000, // 24 hours
      priority: 'speed',
      storeResult: true,
    },
    balanced: {
      cacheStrategy: 'semantic',
      minSimilarity: 0.8,
      cacheTTL: 43200000, // 12 hours
      priority: 'quality',
      storeResult: true,
    },
    conservative: {
      cacheStrategy: 'exact',
      minSimilarity: 0.95,
      cacheTTL: 3600000, // 1 hour
      priority: 'quality',
      storeResult: true,
    },
  };

  private currentStrategy: 'aggressive' | 'balanced' | 'conservative' =
    'balanced';
  private enabled = true;
  private multiProviderEnabled = false;
  private preferredProvider?: AIProviderType;
  private modelCapabilitiesMap: Record<string, string[]> = {
    creative: ['creativity'],
    reasoning: ['reasoning'],
    code: ['codeGeneration'],
    math: ['mathPrecision'],
    factual: ['factualAccuracy'],
    contextual: ['contextUnderstanding'],
  };

  constructor(options?: {
    strategy?: 'aggressive' | 'balanced' | 'conservative';
    enabled?: boolean;
    multiProviderEnabled?: boolean;
    preferredProvider?: AIProviderType;
  }) {
    if (options?.strategy) {
      this.currentStrategy = options.strategy;
    }

    if (options?.enabled !== undefined) {
      this.enabled = options.enabled;
    }

    if (options?.multiProviderEnabled !== undefined) {
      this.multiProviderEnabled = options.multiProviderEnabled;
    }

    if (options?.preferredProvider) {
      this.preferredProvider = options.preferredProvider;
    }
  }

  /**
   * Get MCP request parameters based on the current strategy
   */
  getMCPParams(): MCPRequestParams {
    return {
      ...this.strategyConfigs[this.currentStrategy],
      multiProviderEnabled: this.multiProviderEnabled,
      preferredProvider: this.preferredProvider,
    };
  }

  /**
   * Get parameters for a specific strategy
   */
  getStrategyParams(
    strategy: 'aggressive' | 'balanced' | 'conservative'
  ): MCPRequestParams {
    return {
      ...this.strategyConfigs[strategy],
      multiProviderEnabled: this.multiProviderEnabled,
      preferredProvider: this.preferredProvider,
    };
  }

  /**
   * Update strategy configuration
   */
  updateStrategyConfig(
    strategy: 'aggressive' | 'balanced' | 'conservative',
    config: Partial<MCPStrategyConfig>
  ): void {
    this.strategyConfigs[strategy] = {
      ...this.strategyConfigs[strategy],
      ...config,
    };
  }

  /**
   * Set current strategy
   */
  setStrategy(strategy: 'aggressive' | 'balanced' | 'conservative'): void {
    this.currentStrategy = strategy;
  }

  /**
   * Enable or disable MCP
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Check if MCP is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Enable or disable multi-provider support
   */
  setMultiProviderEnabled(enabled: boolean): void {
    this.multiProviderEnabled = enabled;
  }

  /**
   * Get multi-provider enabled state
   */
  isMultiProviderEnabled(): boolean {
    return this.multiProviderEnabled;
  }

  /**
   * Set preferred provider
   */
  setPreferredProvider(provider?: AIProviderType): void {
    this.preferredProvider = provider;
  }

  /**
   * Get preferred provider
   */
  getPreferredProvider(): AIProviderType | undefined {
    return this.preferredProvider;
  }

  /**
   * Determine MCP priority based on request metadata
   */
  getPriorityFromMetadata(
    metadata: Record<string, any> = {}
  ): 'high' | 'normal' | 'low' {
    const requestType = metadata?.type || '';

    // High priority requests
    if (
      requestType.includes('message') ||
      requestType.includes('critical') ||
      requestType.includes('interactive') ||
      metadata.priority === 'high'
    ) {
      return 'high';
    }

    // Low priority requests
    if (
      requestType.includes('background') ||
      requestType.includes('batch') ||
      requestType.includes('analysis') ||
      metadata.priority === 'low'
    ) {
      return 'low';
    }

    // Default to normal priority
    return 'normal';
  }

  /**
   * Get model recommendation based on current settings and task
   */
  getRecommendedModel(
    taskType: string,
    taskComplexity: 'low' | 'medium' | 'high' = 'medium',
    requiredCapabilities: string[] = []
  ): AIModelType {
    // Map task capabilities
    const mappedCapabilities = this.mapCapabilities(requiredCapabilities);

    // Get model recommendation from smart router
    return smartRouter.selectModel({
      taskType,
      complexityLevel: taskComplexity,
      requiredCapabilities: mappedCapabilities,
      preferredProvider: this.preferredProvider,
      priority: this.strategyConfigs[this.currentStrategy].priority,
    });
  }

  /**
   * Check if a model is appropriate for a given task
   */
  isModelSuitableForTask(
    model: AIModelType,
    taskType: string,
    taskComplexity: 'low' | 'medium' | 'high' = 'medium',
    requiredCapabilities: string[] = []
  ): boolean {
    const recommendedModel = this.getRecommendedModel(
      taskType,
      taskComplexity,
      requiredCapabilities
    );

    // If the recommended model is the same as the provided one, it's suitable
    if (recommendedModel === model) {
      return true;
    }

    // Get metadata for both models
    const recommendedMetadata = smartRouter.getModelMetadata(recommendedModel);
    const providedMetadata = smartRouter.getModelMetadata(model);

    if (!recommendedMetadata || !providedMetadata) {
      return false;
    }

    // Check if the provided model has capabilities equal or better than the recommended one
    for (const [capability, score] of Object.entries(
      recommendedMetadata.capabilities
    )) {
      if (providedMetadata.capabilities[capability] < score * 0.8) {
        return false;
      }
    }

    return true;
  }

  /**
   * Map capability names to internal capability names
   */
  private mapCapabilities(capabilities: string[]): string[] {
    return capabilities.flatMap((cap) => {
      const mappedCaps = this.modelCapabilitiesMap[cap.toLowerCase()];
      return mappedCaps || [cap];
    });
  }

  /**
   * Get estimated cost for a model with specific token usage
   */
  getEstimatedCost(
    model: AIModelType,
    promptTokens: number,
    completionTokens: number
  ): number {
    return smartRouter.estimateCost(model, promptTokens, completionTokens);
  }

  /**
   * Get cost comparison for different models
   */
  getModelCostComparison(
    promptTokens: number,
    completionTokens: number
  ): Record<string, number> {
    const models: AIModelType[] = [
      'claude-3-7-sonnet-20250219',
      'claude-3-opus-20240229',
      'claude-3-5-sonnet-20240229',
      'claude-3-haiku-20240229',
      'gpt-4o',
      'gpt-4o-mini',
    ];

    const costs: Record<string, number> = {};

    for (const model of models) {
      costs[model] = this.getEstimatedCost(
        model,
        promptTokens,
        completionTokens
      );
    }

    return costs;
  }
}

// Export a singleton instance
export const mcpConfigManager = new MCPConfigManager();
