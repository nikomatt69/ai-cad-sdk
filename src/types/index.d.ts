/**
 * Core types for the AI CAD SDK
 */
export type AIModelType = 'claude-3-5-sonnet-20240229' | 'claude-3-opus-20240229' | 'claude-3-haiku-20240229' | 'claude-3-7-sonnet-20250219' | 'gpt-4' | 'gpt-4.1' | 'gpt-4-turbo-preview' | 'gpt-3.5-turbo' | 'gpt-4o' | 'gpt-4o-mini';
export type AIProviderType = 'claude' | 'openai' | 'CLAUDE' | 'OPENAI';
export type AIMode = 'cad' | 'cam' | 'gcode' | 'toolpath' | 'analysis' | 'general';
export type ResponseStyle = 'concise' | 'detailed' | 'step-by-step' | 'professional' | 'creative' | 'bulleted';
export type ComplexityLevel = 'simple' | 'moderate' | 'complex';
export type AssistantRole = 'General AI' | 'CAD Expert' | 'Code Explainer' | 'Helpful Assistant' | 'CAD Assistant';
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
export interface MCPRequestParams {
    cacheStrategy: 'exact' | 'semantic' | 'hybrid';
    minSimilarity?: number;
    cacheTTL?: number;
    priority?: 'speed' | 'quality' | 'cost';
    storeResult?: boolean;
    multiProviderEnabled?: boolean;
    preferredProvider?: AIProviderType;
}
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
    role: 'user' | 'assistant' | 'system';
    content: MessageContent;
    timestamp: number;
    name?: string;
    tool_call_id?: string;
    artifacts?: AIArtifact[];
    isError?: boolean;
}
export interface AIArtifact {
    id: string;
    type: 'code' | 'json' | 'cad' | 'image' | 'markdown' | 'cad_elements' | 'tool_calls';
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
export interface DesignAnalysisRequest {
    elements: any[];
    analysisType: 'structural' | 'manufacturability' | 'cost' | 'performance' | 'comprehensive';
    materialContext?: string;
    manufacturingMethod?: string;
    specificConcerns?: string[];
    useMCP?: boolean;
    mcpParams?: MCPRequestParams;
    structuredContext?: Record<string, any>;
}
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
//# sourceMappingURL=index.d.ts.map