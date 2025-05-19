import {
  aiCache,
  aiAnalytics,
  mcpService,
  mcpConfigManager,
  unifiedAIService,
  smartRouter,
} from '../services';
import { configManager } from '../config';
import { AIModelType, AISDKConfig, AIMode } from '../types';

/**
 * AI CAD SDK Core
 * Main entry point for interacting with the SDK
 */
export class AICADCore {
  private initialized = false;
  private apiKey?: string;
  private config: AISDKConfig;

  constructor(apiKey?: string, config?: Partial<AISDKConfig>) {
    this.apiKey = apiKey;
    this.config = configManager.getConfig();

    if (config) {
      this.configure(config);
    }
  }

  /**
   * Initialize the SDK
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      console.warn('AI CAD SDK already initialized');
      return;
    }

    // Configure services based on current settings
    unifiedAIService.setConfig({
      defaultModel: this.config.defaultModel,
      defaultMaxTokens: this.config.maxTokens,
      allowBrowser: this.config.allowBrowser,
      mcpEnabled: this.config.mcpEnabled,
    });

    // Configure MCP strategy
    if (this.config.mcpStrategy) {
      mcpConfigManager.setStrategy(this.config.mcpStrategy);
    }

    mcpConfigManager.setEnabled(this.config.mcpEnabled || false);

    // Configure auto model selection
    if (this.config.autoModelSelection?.enabled) {
      mcpConfigManager.setMultiProviderEnabled(true);

      if (this.config.autoModelSelection.preferredProvider) {
        mcpConfigManager.setPreferredProvider(
          this.config.autoModelSelection.preferredProvider
        );
      }
    }

    if (this.config.mcpCacheLifetime) {
      aiCache.setTTL(this.config.mcpCacheLifetime);
    }

    // Configure analytics
    aiAnalytics.setEnabled(this.config.analyticsEnabled || false);

    // Set API keys for external services
    if (this.apiKey) {
      // Set API key for main service
    }

    if (this.config.openaiApiKey) {
      // Set OpenAI API key if available
    }

    this.initialized = true;

    return Promise.resolve();
  }

  /**
   * Configure the SDK
   */
  configure(config: Partial<AISDKConfig>): void {
    // Store API key if provided
    if (config.apiKey) {
      this.apiKey = config.apiKey;
    }

    // Update config
    this.config = configManager.updateConfig(config);

    if (this.initialized) {
      // Update services with new configuration
      unifiedAIService.setConfig({
        defaultModel: this.config.defaultModel,
        defaultMaxTokens: this.config.maxTokens,
        allowBrowser: this.config.allowBrowser,
        mcpEnabled: this.config.mcpEnabled,
      });

      if (this.config.mcpStrategy) {
        mcpConfigManager.setStrategy(this.config.mcpStrategy);
      }

      mcpConfigManager.setEnabled(this.config.mcpEnabled || false);

      // Configure auto model selection
      if (this.config.autoModelSelection?.enabled) {
        mcpConfigManager.setMultiProviderEnabled(true);

        if (this.config.autoModelSelection.preferredProvider) {
          mcpConfigManager.setPreferredProvider(
            this.config.autoModelSelection.preferredProvider
          );
        }
      }

      if (this.config.mcpCacheLifetime) {
        aiCache.setTTL(this.config.mcpCacheLifetime);
      }

      aiAnalytics.setEnabled(this.config.analyticsEnabled || false);

      // Set API keys for external services
      if (this.apiKey) {
        // Set API key for main service
      }

      if (this.config.openaiApiKey) {
        // Set OpenAI API key if available
      }
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): AISDKConfig {
    return { ...this.config };
  }

  /**
   * Get default system context for a mode
   */
  getContextForMode(mode: AIMode): string {
    return configManager.getModeContext(mode);
  }

  /**
   * Get AI service
   */
  getAIService(): typeof unifiedAIService {
    this.ensureInitialized();
    return unifiedAIService;
  }

  /**
   * Get MCP service
   */
  getMCPService(): typeof mcpService {
    this.ensureInitialized();
    return mcpService;
  }

  /**
   * Get MCP config manager
   */
  getMCPConfigManager(): typeof mcpConfigManager {
    this.ensureInitialized();
    return mcpConfigManager;
  }

  /**
   * Get smart router
   */
  getSmartRouter(): typeof smartRouter {
    this.ensureInitialized();
    return smartRouter;
  }

  /**
   * Get cache service
   */
  getCacheService(): typeof aiCache {
    this.ensureInitialized();
    return aiCache;
  }

  /**
   * Get analytics service
   */
  getAnalyticsService(): typeof aiAnalytics {
    this.ensureInitialized();
    return aiAnalytics;
  }

  /**
   * Get estimated cost for a request
   */
  estimateCost(
    model: AIModelType,
    inputTokens: number,
    outputTokens: number
  ): number {
    return smartRouter.estimateCost(model, inputTokens, outputTokens);
  }

  /**
   * Get optimal model for a task
   */
  getOptimalModel(taskComplexity: 'low' | 'medium' | 'high'): AIModelType {
    return mcpConfigManager.getRecommendedModel('general', taskComplexity, []);
  }

  /**
   * Check if a model is available
   */
  isModelAvailable(model: AIModelType): boolean {
    // In una implementazione reale, questo controllerebbe se il modello è disponibile
    // tramite il provider configurato
    return !!smartRouter.getModelMetadata(model);
  }

  /**
   * Ensure the SDK is initialized
   */
  private ensureInitialized(): void {
    if (!this.initialized) {
      this.initialize().catch((error) => {
        console.error('Failed to initialize AI CAD SDK:', error);
      });
    }
  }
}

// Export singleton instance
export const aiCADCore = new AICADCore();
