/**
 * Core types for the AI CAD SDK
 */

// === AI MODELS ===
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

// === AI PROVIDERS ===
export type AIProviderType = 'claude' | 'openai' | 'CLAUDE' | 'OPENAI';

// === AI MODES ===
export type AIMode =
  | 'cad'
  | 'cam'
  | 'gcode'
  | 'toolpath'
  | 'analysis'
  | 'general';

// === RESPONSE STYLE ===
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

// === SDK CONFIG ===
export interface AISDKConfig {
  apiKey?: string;
  defaultModel: AIModelType;
  maxTokens: number;
  temperature: number;
  cacheEnabled: boolean;
  analyticsEnabled: boolean;
  allowBrowser: boolean;
  customPrompts?: Record<string, string>;
  retryAttempts?: number;
  mcpEnabled?: boolean; // Flag for enabling MCP protocol
  mcpEndpoint?: string; // Endpoint for MCP service
  mcpApiKey?: string; // API key for MCP service
  mcpStrategy?: 'aggressive' | 'balanced' | 'conservative'; // MCP strategy
  mcpCacheLifetime?: number; // Cache duration in milliseconds
  autoModelSelection?: {
    enabled: boolean;
    preferredProvider?: AIProviderType;
    [key: string]: any;
  }; // Auto model selection settings
  openaiApiKey?: string; // OpenAI specific API key
  openaiOrgId?: string; // OpenAI organization ID
}

// === MCP REQUEST PARAMS ===
export interface MCPRequestParams {
  cacheStrategy: 'exact' | 'semantic' | 'hybrid';
  minSimilarity?: number; // For semantic searches, 0-1
  cacheTTL?: number; // Time-to-live in ms
  priority?: 'speed' | 'quality' | 'cost';
  storeResult?: boolean;
  multiProviderEnabled?: boolean;
  preferredProvider?: AIProviderType;
}

// === AI REQUESTS ===
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
  useMCP?: boolean; // Flag to use MCP for this request
  mcpParams?: MCPRequestParams; // MCP specific parameters
  // OpenAI specific parameters
  provider?: AIProviderType;
  openaiOptions?: {
    functions?: any[];
    function_call?: string;
    presence_penalty?: number;
    frequency_penalty?: number;
    top_p?: number;
    stop?: string[];
    logit_bias?: Record<string, number>;
  };
}

// === AI RESPONSES ===
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
  fromMCP?: boolean; // Indicates if the response comes from the MCP service
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

// === MCP (Model-Completions-Protocol) ===
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

// === AI ANALYTICS EVENTS ===
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

// === TOKEN USAGE ===
export interface TokenUsage {
  prompt: number;
  completion: number;
  total: number;
}

// === CONTEXT SUMMARY ===
export interface ContextSummary {
  elements: {
    count: number;
    types: Record<string, number>;
    summary: string;
  };
  documents: {
    count: number;
    summary: string;
  };
  history: {
    count: number;
    recentActions: string[];
  };
  environment: {
    browser: string;
    screen: string;
    os: string;
  };
}

// === MESSAGE CONTENT ===
export interface TextContentBlock {
  type: 'text';
  text: string;
}

export interface ImageUrl {
  url: string; // Can be http(s) URL or data URL
  detail?: 'low' | 'high' | 'auto'; // Optional detail level
}

export interface ImageContentBlock {
  type: 'image_url';
  image_url: ImageUrl;
}

// Union type for message content
export type MessageContent = string | (TextContentBlock | ImageContentBlock)[];

// === AI MESSAGES ===
export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: MessageContent;
  timestamp: number;
  name?: string; // For function/tool roles
  tool_call_id?: string; // For tool roles
  artifacts?: AIArtifact[];
  isError?: boolean; // Optional error flag
}

// === AI ARTIFACTS ===
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

// === AI ACTIONS ===
export interface AIAction {
  type: string;
  payload: any;
  description: string;
}

// === AI ASSISTANT STATE ===
export interface AIAssistantState {
  messages: AIMessage[];
  isProcessing: boolean;
  isOpen: boolean;
  error: string | null;
  context: string;
  availableActions: string[];
}

// === TEXT TO CAD REQUEST ===
export interface TextToCADRequest {
  description: string;
  context?: string[];
  constraints?: {
    maxElements?: number;
    maxDimensions?: {
      width: number;
      height: number;
      depth: number;
    };
    preferredTypes?: string[];
    mustInclude?: string[];
    mustExclude?: string[];
    [key: string]: any;
  };
  style?: 'precise' | 'artistic' | 'mechanical' | 'organic';
  complexity?: 'simple' | 'moderate' | 'complex' | 'creative';
  useMCP?: boolean;
  mcpParams?: MCPRequestParams;
  structuredContext?: Record<string, any>;
}

// === DESIGN ANALYSIS REQUEST ===
export interface DesignAnalysisRequest {
  elements: any[];
  analysisType:
    | 'structural'
    | 'manufacturability'
    | 'cost'
    | 'performance'
    | 'comprehensive';
  materialContext?: string;
  manufacturingMethod?: string;
  specificConcerns?: string[];
  useMCP?: boolean;
  mcpParams?: MCPRequestParams;
  structuredContext?: Record<string, any>;
}

// === GCODE OPTIMIZATION REQUEST ===
export interface GCodeOptimizationRequest {
  gcode: string;
  machineType: string;
  material?: string;
  toolDiameter?: number;
  optimizationGoal?: 'speed' | 'quality' | 'toolLife' | 'balanced';
  constraints?: {
    maxFeedRate?: number;
    maxSpindleSpeed?: number;
    minToolLife?: number;
    [key: string]: any;
  };
  useMCP?: boolean;
  mcpParams?: MCPRequestParams;
  structuredContext?: Record<string, any>;
}

// === AI DESIGN SUGGESTION ===
export interface AIDesignSuggestion {
  id: string;
  type: 'optimization' | 'alternative' | 'improvement' | 'warning' | 'critical';
  title: string;
  description: string;
  confidence: number;
  potentialImpact: {
    performanceGain: number;
    costReduction: number;
    manufacturabilityScore?: number;
  };
  suggestedModifications: any[];
}

// === CAD ELEMENT ===
export interface Point {
  x: number;
  y: number;
  z: number;
}

export interface Element {
  id: string;
  type: string;
  layerId: string;
  x: number;
  y: number;
  z: number;
  width?: number;
  height?: number;
  depth?: number;
  radius?: number;
  color?: string;
  rotation?: {
    x: number;
    y: number;
    z: number;
  };
  [key: string]: any;
}
