import { AIModelType, AIProviderType, AISDKConfig } from '../types';

// Available AI models
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

// AI providers
export const AI_PROVIDERS = {
  CLAUDE: 'claude',
  OPENAI: 'openai',
} as const;

// Mapping of models to their providers
export const MODEL_PROVIDERS: Record<AIModelType, AIProviderType> = {
  [AI_MODELS.CLAUDE_SONNET]: 'CLAUDE',
  [AI_MODELS.CLAUDE_OPUS]: 'CLAUDE',
  [AI_MODELS.CLAUDE_HAIKU]: 'CLAUDE',
  [AI_MODELS.CLAUDE_SONNET_7]: 'CLAUDE',
  [AI_MODELS.GPT_4]: 'OPENAI',
  [AI_MODELS.GPT_4_TURBO]: 'OPENAI',
  [AI_MODELS.GPT_3_5_TURBO]: 'OPENAI',
  [AI_MODELS.GPT_4O]: 'OPENAI',
  [AI_MODELS.GPT_4O_MINI]: 'OPENAI',
  [AI_MODELS.GPT_4_1]: 'OPENAI',
} as const;

// AI modes
export const AI_MODES = {
  CAD: 'cad',
  CAM: 'cam',
  GCODE: 'gcode',
  TOOLPATH: 'toolpath',
  ANALYSIS: 'analysis',
  GENERAL: 'general',
} as const;

// Default configuration
export const DEFAULT_CONFIG: AISDKConfig = {
  defaultModel: AI_MODELS.CLAUDE_SONNET_7,
  maxTokens: 4000,
  temperature: 0.7,
  cacheEnabled: true,
  analyticsEnabled: true,
  allowBrowser: true,
};

// Model capabilities
export const MODEL_CAPABILITIES = {
  // Claude models
  [AI_MODELS.CLAUDE_OPUS]: {
    maxTokens: 8000,
    bestFor: ['complex_design', 'detailed_analysis', 'high_quality_content'],
    costTier: 'high',
    tokensPerSecond: 15,
    supportedFeatures: [
      'complex_reasoning',
      'code_generation',
      'technical_analysis',
    ],
    provider: AI_PROVIDERS.CLAUDE,
  },
  [AI_MODELS.CLAUDE_SONNET]: {
    maxTokens: 4000,
    bestFor: ['general_purpose', 'design_assistance', 'balanced_performance'],
    costTier: 'medium',
    tokensPerSecond: 25,
    supportedFeatures: ['reasoning', 'code_generation', 'technical_analysis'],
    provider: AI_PROVIDERS.CLAUDE,
  },
  [AI_MODELS.CLAUDE_HAIKU]: {
    maxTokens: 2000,
    bestFor: ['quick_suggestions', 'simple_tasks', 'interactive_assistance'],
    costTier: 'low',
    tokensPerSecond: 40,
    supportedFeatures: [
      'basic_reasoning',
      'text_completion',
      'simple_assistance',
    ],
    provider: AI_PROVIDERS.CLAUDE,
  },
  [AI_MODELS.CLAUDE_SONNET_7]: {
    maxTokens: 6000,
    bestFor: ['advanced_reasoning', 'complex_design', 'enhanced_analysis'],
    costTier: 'medium',
    tokensPerSecond: 30,
    thinking: true,
    thinkingBudget: 2000,
    reasoning: true,
    reasoningBudget: 2000,
    supportedFeatures: [
      'enhanced_reasoning',
      'code_generation',
      'technical_analysis',
      'complex_reasoning',
    ],
    provider: AI_PROVIDERS.CLAUDE,
  },
  // OpenAI models
  [AI_MODELS.GPT_4]: {
    maxTokens: 8000,
    bestFor: ['complex_reasoning', 'creative_content', 'code_generation'],
    costTier: 'high',
    tokensPerSecond: 15,
    supportedFeatures: [
      'complex_reasoning',
      'code_generation',
      'technical_analysis',
    ],
    provider: AI_PROVIDERS.OPENAI,
  },
  [AI_MODELS.GPT_4_TURBO]: {
    maxTokens: 4000,
    bestFor: ['fast_reasoning', 'creative_content', 'balanced_performance'],
    costTier: 'medium-high',
    tokensPerSecond: 25,
    supportedFeatures: ['reasoning', 'code_generation', 'technical_analysis'],
    provider: AI_PROVIDERS.OPENAI,
  },
  [AI_MODELS.GPT_3_5_TURBO]: {
    maxTokens: 4000,
    bestFor: ['quick_responses', 'simple_tasks', 'cost_efficiency'],
    costTier: 'low',
    tokensPerSecond: 40,
    supportedFeatures: [
      'basic_reasoning',
      'text_completion',
      'simple_assistance',
    ],
    provider: AI_PROVIDERS.OPENAI,
  },
  [AI_MODELS.GPT_4O]: {
    maxTokens: 8000,
    bestFor: ['complex_reasoning', 'creative_content', 'code_generation'],
    costTier: 'high',
    tokensPerSecond: 15,
    provider: AI_PROVIDERS.OPENAI,
  },
  [AI_MODELS.GPT_4O_MINI]: {
    maxTokens: 4000,
    bestFor: ['quick_responses', 'simple_tasks', 'cost_efficiency'],
    costTier: 'low',
    tokensPerSecond: 40,
    provider: AI_PROVIDERS.OPENAI,
  },
  [AI_MODELS.GPT_4_1]: {
    maxTokens: 8000,
    supportedFeatures: [
      'enhanced_reasoning',
      'code_generation',
      'technical_analysis',
      'complex_reasoning',
    ],
    costTier: 'high',
    tokensPerSecond: 15,
    provider: AI_PROVIDERS.OPENAI,
  },
} as const;

// Model costs ($ per 1K tokens)
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
  [AI_MODELS.GPT_4O_MINI]: { input: 0.03, output: 0.06 },
  [AI_MODELS.GPT_4_TURBO]: { input: 0.01, output: 0.03 },
  [AI_MODELS.GPT_4_1]: { input: 0.03, output: 0.06 },
  [AI_MODELS.GPT_3_5_TURBO]: { input: 0.0005, output: 0.0015 },
};

// Default context for each AI mode
export const MODE_CONTEXTS = {
  [AI_MODES.CAD]:
    'You are a CAD design expert assistant helping users create and optimize 3D models.',
  [AI_MODES.CAM]:
    'You are a CAM programming expert helping users create efficient machining strategies.',
  [AI_MODES.GCODE]:
    'You are a G-code programming expert helping users create and optimize CNC machine instructions.',
  [AI_MODES.TOOLPATH]:
    'You are a toolpath optimization expert helping users create efficient cutting paths.',
  [AI_MODES.ANALYSIS]:
    'You are a design analysis expert helping users evaluate and improve their CAD models.',
  [AI_MODES.GENERAL]: 'You are a helpful AI assistant for CAD/CAM software.',
};

/**
 * Configuration manager for the AI CAD SDK
 */
export class ConfigManager {
  private config: AISDKConfig;

  constructor(initialConfig?: Partial<AISDKConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...initialConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): AISDKConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<AISDKConfig>): AISDKConfig {
    this.config = { ...this.config, ...newConfig };
    return this.getConfig();
  }

  /**
   * Select optimal model based on task complexity
   */
  selectOptimalModel(
    taskComplexity: 'low' | 'medium' | 'high',
    preferredProvider?: AIProviderType
  ): AIModelType {
    // If auto-selection is disabled, use default model
    if (!this.config.autoModelSelection?.enabled) {
      return this.config.defaultModel;
    }

    // If a preferred provider is specified, filter only models from that provider
    const eligibleModels: AIModelType[] = Object.entries(MODEL_CAPABILITIES)
      .filter(
        ([, capabilities]) =>
          !preferredProvider ||
          capabilities.provider.toLowerCase() ===
            preferredProvider.toLowerCase()
      )
      .map(([model]) => model as AIModelType);

    // Select model based on complexity
    switch (taskComplexity) {
      case 'high':
        // Find high performance models
        const highPerformanceModels = eligibleModels.filter(
          (model) => MODEL_CAPABILITIES[model].costTier === 'high'
        );
        return highPerformanceModels[0] || this.config.defaultModel;

      case 'medium':
        // Find medium performance models
        const mediumPerformanceModels = eligibleModels.filter(
          (model) =>
            MODEL_CAPABILITIES[model].costTier === 'medium' ||
            MODEL_CAPABILITIES[model].costTier === 'medium-high'
        );
        return mediumPerformanceModels[0] || this.config.defaultModel;

      case 'low':
        // Find low performance but efficient models
        const lowPerformanceModels = eligibleModels.filter(
          (model) => MODEL_CAPABILITIES[model].costTier === 'low'
        );
        return lowPerformanceModels[0] || this.config.defaultModel;

      default:
        return this.config.defaultModel;
    }
  }

  /**
   * Get default context for a mode
   */
  getModeContext(mode: string): string {
    return (
      MODE_CONTEXTS[mode as keyof typeof MODE_CONTEXTS] ||
      MODE_CONTEXTS[AI_MODES.GENERAL]
    );
  }

  /**
   * Estimate cost for a request
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
   * Get optimal parameters for a request based on type
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
   * Get provider for a specific model
   */
  getProviderForModel(model: AIModelType): AIProviderType {
    const capability = MODEL_CAPABILITIES[model];
    return capability?.provider === AI_PROVIDERS.OPENAI ? 'OPENAI' : 'CLAUDE';
  }

  /**
   * Get all models available for a specific provider
   */
  getModelsForProvider(provider: AIProviderType): AIModelType[] {
    return Object.entries(MODEL_CAPABILITIES)
      .filter(
        ([, capability]) =>
          capability.provider ===
          AI_PROVIDERS[provider as keyof typeof AI_PROVIDERS]
      )
      .map(([model]) => model as AIModelType);
  }
}

// Export singleton instance
export const configManager = new ConfigManager();
