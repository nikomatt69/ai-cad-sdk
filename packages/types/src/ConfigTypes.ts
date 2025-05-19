import { AIModelType, AIProviderType } from './AITypes';

/**
 * Configuration types for the AI CAD SDK
 */
export interface AICADConfig {
  apiKeys: {
    claude?: string;
    openai?: string;
  };
  defaultModel: AIModelType;
  defaultProvider?: AIProviderType;
  cache?: {
    enabled: boolean;
    ttl: number;
    strategy?: 'memory' | 'localStorage' | 'custom';
    maxSize?: number;
  };
  analytics?: {
    enabled: boolean;
    endpoint?: string;
    sampleRate?: number;
    anonymize?: boolean;
  };
  mcp?: {
    enabled: boolean;
    strategy: 'aggressive' | 'balanced' | 'conservative';
    cacheTTL: number;
  };
  debug?: boolean;
}

export interface AIServiceConfig {
  apiKey?: string;
  defaultModel: AIModelType;
  maxTokens: number;
  temperature: number;
  cacheEnabled: boolean;
  analyticsEnabled: boolean;
  allowBrowser: boolean;
  customPrompts?: Record<string, string>;
  retryAttempts?: number;
  mcpEnabled?: boolean;
  mcpEndpoint?: string;
  mcpApiKey?: string;
  mcpStrategy?: 'aggressive' | 'balanced' | 'conservative';
  mcpCacheLifetime?: number;
  autoModelSelection?: {
    enabled: boolean;
    preferredProvider?: AIProviderType;
    [key: string]: any;
  };
  openaiApiKey?: string;
  openaiOrgId?: string;
}

export interface PromptConfig {
  system: string;
  user: string;
}

export interface AIModelsConfig {
  [modelName: string]: {
    provider: AIProviderType;
    maxTokens: number;
    costTier: 'low' | 'medium' | 'medium-high' | 'high';
    tokensPerSecond: number;
    supportedFeatures: string[];
  };
}
