import {
  AIModelType,
  AIProviderType,
  AIServiceConfig,
  AIModelsConfig,
} from '../../types/src';
import { logger } from '../../utils/src';

/**
 * AI Model Types
 */
export const AI_MODELS = {
  // Claude models
  CLAUDE_SONNET: 'claude-3-5-sonnet-20240229',
  CLAUDE_OPUS: 'claude-3-opus-20240229',
  CLAUDE_HAIKU: 'claude-3-haiku-20240229',
  CLAUDE_SONNET_7: 'claude-3-7-sonnet-20250219',
  // OpenAI models
  GPT_4: 'gpt-4',
  GPT_4_1: 'gpt-4.1',
  GPT_4_TURBO: 'gpt-4-turbo-preview',
  GPT_3_5_TURBO: 'gpt-3.5-turbo',
  GPT_4O: 'gpt-4o',
  GPT_4O_MINI: 'gpt-4o-mini',
} as const;

/**
 * AI Provider Types
 */
export const AI_PROVIDERS = {
  CLAUDE: 'claude',
  OPENAI: 'openai',
} as const;

/**
 * Default configuration
 */
export const DEFAULT_CONFIG: AIServiceConfig = {
  defaultModel: AI_MODELS.CLAUDE_SONNET_7,
  maxTokens: 4000,
  temperature: 0.7,
  cacheEnabled: true,
  analyticsEnabled: true,
  allowBrowser: true,
};

/**
 * Model capabilities
 */
export const MODEL_CAPABILITIES: AIModelsConfig = {
  // Claude models
  [AI_MODELS.CLAUDE_OPUS]: {
    provider: AI_PROVIDERS.CLAUDE,
    maxTokens: 8000,
    costTier: 'high',
    tokensPerSecond: 15,
    supportedFeatures: [
      'complex_reasoning',
      'code_generation',
      'technical_analysis',
    ],
  },
  [AI_MODELS.CLAUDE_SONNET]: {
    provider: AI_PROVIDERS.CLAUDE,
    maxTokens: 4000,
    costTier: 'medium',
    tokensPerSecond: 25,
    supportedFeatures: ['reasoning', 'code_generation', 'technical_analysis'],
  },
  [AI_MODELS.CLAUDE_HAIKU]: {
    provider: AI_PROVIDERS.CLAUDE,
    maxTokens: 2000,
    costTier: 'low',
    tokensPerSecond: 40,
    supportedFeatures: [
      'basic_reasoning',
      'text_completion',
      'simple_assistance',
    ],
  },
  [AI_MODELS.CLAUDE_SONNET_7]: {
    provider: AI_PROVIDERS.CLAUDE,
    maxTokens: 6000,
    costTier: 'medium',
    tokensPerSecond: 30,
    supportedFeatures: [
      'enhanced_reasoning',
      'code_generation',
      'technical_analysis',
      'complex_reasoning',
    ],
  },
  // OpenAI models
  [AI_MODELS.GPT_4]: {
    provider: AI_PROVIDERS.OPENAI,
    maxTokens: 8000,
    costTier: 'high',
    tokensPerSecond: 15,
    supportedFeatures: [
      'complex_reasoning',
      'code_generation',
      'technical_analysis',
    ],
  },
  [AI_MODELS.GPT_4_TURBO]: {
    provider: AI_PROVIDERS.OPENAI,
    maxTokens: 4000,
    costTier: 'medium-high',
    tokensPerSecond: 25,
    supportedFeatures: ['reasoning', 'code_generation', 'technical_analysis'],
  },
  [AI_MODELS.GPT_3_5_TURBO]: {
    provider: AI_PROVIDERS.OPENAI,
    maxTokens: 4000,
    costTier: 'low',
    tokensPerSecond: 40,
    supportedFeatures: [
      'basic_reasoning',
      'text_completion',
      'simple_assistance',
    ],
  },
  [AI_MODELS.GPT_4O]: {
    provider: AI_PROVIDERS.OPENAI,
    maxTokens: 8000,
    costTier: 'high',
    tokensPerSecond: 15,
    supportedFeatures: [
      'complex_reasoning',
      'code_generation',
      'technical_analysis',
    ],
  },
  [AI_MODELS.GPT_4O_MINI]: {
    provider: AI_PROVIDERS.OPENAI,
    maxTokens: 4000,
    costTier: 'low',
    tokensPerSecond: 40,
    supportedFeatures: [
      'basic_reasoning',
      'text_completion',
      'simple_assistance',
    ],
  },
  [AI_MODELS.GPT_4_1]: {
    provider: AI_PROVIDERS.OPENAI,
    maxTokens: 8000,
    costTier: 'high',
    tokensPerSecond: 15,
    supportedFeatures: [
      'enhanced_reasoning',
      'code_generation',
      'technical_analysis',
      'complex_reasoning',
    ],
  },
};

/**
 * Model costs per 1K tokens
 */
export const MODEL_COSTS: Record<
  AIModelType,
  { input: number; output: number }
> = {
  // Claude models
  [AI_MODELS.CLAUDE_OPUS]: { input: 0.015, output: 0.075 },
  [AI_MODELS.CLAUDE_SONNET]: { input: 0.008, output: 0.024 },
  [AI_MODELS.CLAUDE_HAIKU]: { input: 0.002, output: 0.01 },
  [AI_MODELS.CLAUDE_SONNET_7]: { input: 0.008, output: 0.024 },
  // OpenAI models
  [AI_MODELS.GPT_4]: { input: 0.03, output: 0.06 },
  [AI_MODELS.GPT_4O]: { input: 0.03, output: 0.06 },
  [AI_MODELS.GPT_4O_MINI]: { input: 0.01, output: 0.03 },
  [AI_MODELS.GPT_4_TURBO]: { input: 0.01, output: 0.03 },
  [AI_MODELS.GPT_4_1]: { input: 0.03, output: 0.06 },
  [AI_MODELS.GPT_3_5_TURBO]: { input: 0.0005, output: 0.0015 },
};

/**
 * Configuration manager for AI services
 */
export class AIConfigManager {
  private config: AIServiceConfig;

  constructor(initialConfig?: Partial<AIServiceConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...initialConfig };
    logger.info('AIConfigManager initialized', {
      defaultModel: this.config.defaultModel,
    });
  }

  /**
   * Get the current configuration
   */
  getConfig(): AIServiceConfig {
    return { ...this.config };
  }

  /**
   * Update the configuration
   */
  updateConfig(newConfig: Partial<AIServiceConfig>): AIServiceConfig {
    this.config = { ...this.config, ...newConfig };
    logger.debug('AIConfigManager updated', { config: this.config });
    return this.getConfig();
  }

  /**
   * Select the optimal model based on task complexity
   */
  selectOptimalModel(
    taskComplexity: 'low' | 'medium' | 'high',
    preferredProvider?: AIProviderType
  ): AIModelType {
    // If auto-selection is disabled, use the default model
    if (!this.config.autoModelSelection?.enabled) {
      return this.config.defaultModel;
    }

    // If a preferred provider was specified, filter only models from that provider
    const eligibleModels: AIModelType[] = Object.entries(MODEL_CAPABILITIES)
      .filter(
        ([, capabilities]: [string, any]) =>
          !preferredProvider ||
          capabilities.provider.toLowerCase() === preferredProvider.toLowerCase()
      )
      .map(([model]) => model as AIModelType);

    // Select model based on complexity
    switch (taskComplexity) {
      case 'high':
        // Find high-performance models
        const highPerformanceModels = eligibleModels.filter(
          (model) => MODEL_CAPABILITIES[model].costTier === 'high'
        );
        return highPerformanceModels[0] || this.config.defaultModel;

      case 'medium':
        // Find medium-performance models
        const mediumPerformanceModels = eligibleModels.filter(
          (model) =>
            MODEL_CAPABILITIES[model].costTier === 'medium' ||
            MODEL_CAPABILITIES[model].costTier === 'medium-high'
        );
        return mediumPerformanceModels[0] || this.config.defaultModel;

      case 'low':
        // Find low-performance models
        const lowPerformanceModels = eligibleModels.filter(
          (model) => MODEL_CAPABILITIES[model].costTier === 'low'
        );
        return lowPerformanceModels[0] || this.config.defaultModel;

      default:
        return this.config.defaultModel;
    }
  }

  /**
   * Calculate the estimated cost for a request
   */
  estimateCost(
    model: AIModelType,
    inputTokens: number,
    outputTokens: number
  ): number {
    const costs = MODEL_COSTS[model] || MODEL_COSTS[AI_MODELS.CLAUDE_SONNET];

    return (
      (inputTokens / 1000) * costs.input + (outputTokens / 1000) * costs.output
    );
  }

  /**
   * Get optimal parameters for a request based on its type
   */
  getOptimalParameters(requestType: string): {
    model: AIModelType;
    temperature: number;
    maxTokens: number;
  } {
    switch (requestType) {
      case 'text_to_cad':
        return {
          model: AI_MODELS.CLAUDE_SONNET_7,
          temperature: 0.5,
          maxTokens: 6000,
        };
      case 'design_analysis':
        return {
          model: AI_MODELS.CLAUDE_SONNET_7,
          temperature: 0.3,
          maxTokens: 4000,
        };
      case 'gcode_optimization':
        return {
          model: AI_MODELS.CLAUDE_SONNET_7,
          temperature: 0.2,
          maxTokens: 4000,
        };
      case 'suggestions':
        return {
          model: AI_MODELS.CLAUDE_SONNET_7,
          temperature: 0.7,
          maxTokens: 1000,
        };
      case 'chat':
        return {
          model: AI_MODELS.CLAUDE_SONNET_7,
          temperature: 0.7,
          maxTokens: 2000,
        };
      default:
        return {
          model: this.config.defaultModel,
          temperature: this.config.temperature,
          maxTokens: this.config.maxTokens,
        };
    }
  }

  /**
   * Determine the provider for a specific model
   */
  getProviderForModel(model: AIModelType): AIProviderType {
    const capability = MODEL_CAPABILITIES[model];
    return capability?.provider as AIProviderType;
  }

  /**
   * Get all available models for a specific provider
   */
  getModelsForProvider(provider: AIProviderType): AIModelType[] {
    return Object.entries(MODEL_CAPABILITIES)
      .filter(
        ([_, capability]) => MODEL_CAPABILITIES[_ as AIModelType].provider === provider
      )
      .map(([model]) => model as AIModelType);
  }

  /**
   * Get capabilities for a specific model
   */
  getModelCapabilities(model: AIModelType): any {
    return MODEL_CAPABILITIES[model] || {};
  }

  /**
   * Check if a model is valid
   */
  isValidModel(model: string): model is AIModelType {
    return Object.values(AI_MODELS).includes(model as AIModelType);
  }
}

// Export a singleton instance
export const aiConfigManager = new AIConfigManager();
