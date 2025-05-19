import {
  AICADConfig,
  AIModelType,
  AIProviderType,
  AIRequest,
  AIResponse,
  Element,
  TextToCADRequest,
  DesignAnalysisRequest,
  GCodeOptimizationRequest,
} from '../../types/src/index';

/**
 * Internal type definitions for the core package
 */

export interface AIAdapter {
  sendRequest<T>(request: AIRequest): Promise<AIResponse<T>>;
  isCompatible(model: AIModelType): boolean;
  getProvider(): AIProviderType;
  getModels(): AIModelType[];
}

export interface AIProvider {
  id: AIProviderType;
  name: string;
  adapter: AIAdapter;
  defaultModel: AIModelType;
  apiKey?: string;
}

export interface AdapterFactory {
  createAdapter(config: AICADConfig): AIAdapter;
}

export interface TextToCADService {
  generateElements(request: TextToCADRequest): Promise<AIResponse<Element[]>>;
  parseResponse(text: string): Promise<Element[]>;
}

export interface DesignAnalysisService {
  analyzeDesign(request: DesignAnalysisRequest): Promise<AIResponse<any>>;
  parseResponse(text: string): Promise<any>;
}

export interface GCodeService {
  optimizeGCode(request: GCodeOptimizationRequest): Promise<AIResponse<string>>;
  parseResponse(text: string): Promise<string>;
}
