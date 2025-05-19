/**
 * Core AI model types and configurations
 */

// AI Model Types
export type AIModelType =
  // Claude models
  | 'claude-3-5-sonnet-20240229'
  | 'claude-3-opus-20240229'
  | 'claude-3-haiku-20240229'
  | 'claude-3-7-sonnet-20250219'
  // OpenAI models
  | 'gpt-4'
  | 'gpt-4.1'
  | 'gpt-4-turbo-preview'
  | 'gpt-3.5-turbo'
  | 'gpt-4o'
  | 'gpt-4o-mini';

// Provider Types
export type AIProviderType = 'claude' | 'openai';

// Response Customization
export type ResponseStyle =
  | 'concise'
  | 'detailed'
  | 'step-by-step'
  | 'professional'
  | 'creative'
  | 'bulleted';
export type ComplexityLevel = 'simple' | 'moderate' | 'complex';
export type AssistantRole =
  | 'General AI'
  | 'CAD Expert'
  | 'Code Explainer'
  | 'Helpful Assistant'
  | 'CAD Assistant';

// Message Types
export type MessageRole = 'user' | 'assistant' | 'system';

// Content Block Types
export interface TextContentBlock {
  type: 'text';
  text: string;
}

export interface ImageUrl {
  url: string;
  detail?: 'low' | 'high' | 'auto';
}

export interface ImageContentBlock {
  type: 'image_url';
  image_url: ImageUrl;
}

export type MessageContent = string | (TextContentBlock | ImageContentBlock)[];

export interface AIMessage {
  id: string;
  role: MessageRole;
  content: MessageContent;
  timestamp: number;
  name?: string;
  tool_call_id?: string;
  artifacts?: AIArtifact[];
  isError?: boolean;
}

// AI Requests & Responses
export interface AIRequest {
  prompt: string;
  model?: AIModelType;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  parseResponse?: (text: string) => Promise<any>;
  onProgress?: (text: string) => void;
  retryCount?: number;
  metadata?: Record<string, any>;
  useMCP?: boolean;
  mcpParams?: MCPRequestParams;
  provider?: AIProviderType;
  openaiOptions?: Record<string, any>;
}

export interface AIResponse<T = any> {
  rawResponse: string | null;
  data: T | null;
  error?: string;
  parsingError?: Error | null;
  processingTime?: number;
  model?: AIModelType;
  provider?: AIProviderType;
  success: boolean;
  fromCache?: boolean;
  fromMCP?: boolean;
  warnings?: string[];
  suggestions?: string[];
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    cost?: number;
  };
  metadata?: Record<string, any>;
}

// MCP (Model Caching Protocol)
export interface MCPRequestParams {
  cacheStrategy: 'exact' | 'semantic' | 'hybrid';
  minSimilarity?: number;
  cacheTTL?: number;
  priority?: 'speed' | 'quality' | 'cost';
  storeResult?: boolean;
  multiProviderEnabled?: boolean;
  preferredProvider?: AIProviderType;
}

export interface MCPResponse<T = any> {
  cacheHit: boolean;
  similarity?: number;
  response: AIResponse<T>;
  savingsEstimate?: {
    tokens: number;
    cost: number;
    timeMs: number;
  };
}

// Utils
export interface AIAnalyticsEvent {
  eventType: 'request' | 'response' | 'error' | 'feedback' | 'mcp';
  eventName: string;
  timestamp: number;
  duration?: number;
  model?: string;
  promptTokens?: number;
  completionTokens?: number;
  success?: boolean;
  errorType?: string;
  feedbackRating?: number;
  metadata?: Record<string, any>;
}

export interface TokenUsage {
  prompt: number;
  completion: number;
  total: number;
}

// Artifacts
export interface AIArtifact {
  id: string;
  type:
    | 'code'
    | 'json'
    | 'cad'
    | 'image'
    | 'markdown'
    | 'cad_elements'
    | 'tool_calls';
  content: any;
  language?: string;
  title?: string;
}

export interface AIAction {
  type: string;
  payload: any;
  description: string;
}

export interface AIAssistantState {
  messages: AIMessage[];
  isProcessing: boolean;
  isOpen: boolean;
  error: string | null;
  context: string;
  availableActions: string[];
}
