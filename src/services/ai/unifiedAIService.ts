import {
  AIModelType,
  AIRequest,
  AIResponse,
  TextToCADRequest,
  AIDesignSuggestion,
  DesignAnalysisRequest,
  GCodeOptimizationRequest,
  Element,
} from '../../types';
import { aiCache } from '../cache/aiCache';
import { aiAnalytics } from '../analytics/aiAnalytics';
import { MCPService } from '../mcp/mcpService';
import { mcpConfigManager } from '../mcp/mcpConfigManager';
import { configManager } from '../../config';
import { v4 as uuidv4 } from 'uuid';

// Constants for system prompts
const SYSTEM_PROMPTS = {
  TEXT_TO_CAD: `You are a specialized CAD modeling AI assistant. Your task is to convert textual descriptions into valid 3D CAD elements that can be rendered in a web-based CAD application.

Output only valid JSON arrays of CAD elements without explanation or commentary.

Guidelines:
- Create geometrically valid elements with realistic dimensions, proportions, and spatial relationships
- Use a coherent design approach with moderate complexity 
- Apply a precise design style
- Ensure all elements include required properties for their type
- Position elements appropriately in 3D space with proper relative positions
- Use consistent units (mm) and scale
- For complex assemblies, use hierarchical organization`,

  DESIGN_ANALYSIS: `You are a CAD/CAM design expert specializing in design analysis. Your task is to analyze CAD design elements and provide professional recommendations for improvements.

Focus on:
- Structural integrity and mechanical design principles
- Manufacturability considerations
- Material efficiency and optimization opportunities
- Design simplification and functional improvements
- Performance characteristics

Use technical terminology appropriate for mechanical engineering and manufacturing.
Structure your response as valid JSON that can be parsed by the application.`,

  GCODE_OPTIMIZATION: `You are a CNC programming expert specialized in G-code optimization. Your task is to analyze and improve G-code for {{machineType}} machines.

Focus on:
- Removing redundant operations
- Optimizing tool paths
- Improving feed rates and speeds based on material
- Enhancing safety and reliability
- Reducing machining time
- Extending tool life

Consider:
- The specified material properties
- Tool specifications 
- Machine capabilities
- Manufacturing best practices`,

  GENERAL_ASSISTANT: `You are a helpful AI assistant for CAD/CAM software. Provide clear, concise, and technically accurate responses to help users with their design and manufacturing tasks.`,
};

/**
 * Unified AI Service
 * Provides methods for interacting with AI models, handling caching, analytics, and MCP
 */
export class UnifiedAIService {
  private defaultModel: AIModelType = 'claude-3-7-sonnet-20250219';
  private defaultMaxTokens = 4000;
  private allowBrowser = true;
  private mcpEnabled = true;
  private apiEndpoint = '/api/ai/proxy';
  private mcpService: MCPService;

  constructor(
    mcpService: MCPService,
    options?: {
      defaultModel?: AIModelType;
      defaultMaxTokens?: number;
      allowBrowser?: boolean;
      mcpEnabled?: boolean;
      apiEndpoint?: string;
    }
  ) {
    this.mcpService = mcpService;

    // Read configurations from configManager if available
    const config = configManager.getConfig();
    this.defaultModel =
      options?.defaultModel || config.defaultModel || this.defaultModel;
    this.defaultMaxTokens =
      options?.defaultMaxTokens || config.maxTokens || this.defaultMaxTokens;
    this.allowBrowser =
      options?.allowBrowser ?? config.allowBrowser ?? this.allowBrowser;
    this.mcpEnabled =
      options?.mcpEnabled ?? config.mcpEnabled ?? this.mcpEnabled;
    this.apiEndpoint = options?.apiEndpoint || this.apiEndpoint;
  }

  /**
   * Generic request processing with support for caching and analytics
   */
  async processRequest<T>({
    prompt,
    model = this.defaultModel,
    systemPrompt,
    temperature = 0.7,
    maxTokens = this.defaultMaxTokens,
    parseResponse,
    onProgress,
    metadata = {},
    useMCP,
    mcpParams,
  }: AIRequest): Promise<AIResponse<T>> {
    // Determine whether to use MCP
    const shouldUseMCP = useMCP ?? this.mcpEnabled;

    // If MCP is enabled, use the MCP service
    if (shouldUseMCP) {
      return this.processMCPRequest<T>({
        prompt,
        model,
        systemPrompt,
        temperature,
        maxTokens,
        parseResponse,
        onProgress,
        metadata,
        mcpParams,
      });
    }

    // Generate a cache key based on request parameters
    const cacheKey = aiCache.getKeyForRequest({
      prompt,
      model,
      systemPrompt,
      temperature,
    });

    // Check if response is already in cache
    const cachedResponse = aiCache.get<AIResponse<T>>(cacheKey);
    if (cachedResponse) {
      return {
        ...cachedResponse,
        fromCache: true,
      };
    }

    // Track request start for analytics
    const requestId = aiAnalytics.trackRequestStart('ai_request', model, {
      promptLength: prompt.length,
      ...metadata,
    });

    const startTime = Date.now();

    try {
      let fullResponse = '';
      let tokenUsage = {
        promptTokens: Math.round(prompt.length / 4), // rough estimate
        completionTokens: 0,
        totalTokens: Math.round(prompt.length / 4),
      };

      // Use API proxy instead of directly calling provider
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: maxTokens,
          temperature,
          system: systemPrompt,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'API request failed');
      }

      const data = await response.json();

      // Extract text from response
      fullResponse =
        data.content[0]?.type === 'text' ? data.content[0].text : '';

      // Get token usage from response
      if (data.usage) {
        tokenUsage = {
          promptTokens: data.usage.input_tokens,
          completionTokens: data.usage.output_tokens,
          totalTokens: data.usage.input_tokens + data.usage.output_tokens,
        };
      } else {
        // Estimate tokens if not available in response
        tokenUsage.completionTokens = Math.round(fullResponse.length / 4);
        tokenUsage.totalTokens =
          tokenUsage.promptTokens + tokenUsage.completionTokens;
      }

      // Calculate processing time
      const processingTime = Date.now() - startTime;

      // Record request completion
      aiAnalytics.trackRequestComplete(
        requestId,
        processingTime,
        true,
        tokenUsage.promptTokens,
        tokenUsage.completionTokens
      );

      // Parse response if a parsing function is provided
      let parsedData: T | null = null;
      let parsingError: Error | null = null;

      if (parseResponse && fullResponse) {
        try {
          parsedData = await parseResponse(fullResponse);
        } catch (err) {
          parsingError =
            err instanceof Error ? err : new Error('Failed to parse response');

          // Track parsing error
          aiAnalytics.trackEvent({
            eventType: 'error',
            eventName: 'parsing_error',
            success: false,
            metadata: {
              requestId,
              error: parsingError.message,
            },
          });
        }
      }

      // Prepare final response
      const finalResponse: AIResponse<T> = {
        rawResponse: fullResponse,
        data: parsedData,
        error: parsingError?.message,
        parsingError,
        processingTime,
        model,
        success: !parsingError,
        usage: tokenUsage,
        metadata: {
          ...metadata,
          requestId,
        },
      };

      // Store response in cache
      aiCache.set(cacheKey, finalResponse);

      return finalResponse;
    } catch (error) {
      // Track error
      aiAnalytics.trackEvent({
        eventType: 'error',
        eventName: 'api_error',
        errorType: error instanceof Error ? error.name : 'unknown',
        success: false,
        metadata: {
          requestId,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      });

      // Return error response
      return {
        rawResponse: null,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
        usage: {
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
        },
        metadata: {
          ...metadata,
          requestId,
        },
      };
    }
  }

  /**
   * Process a request via the MCP protocol
   */
  private async processMCPRequest<T>(
    request: AIRequest
  ): Promise<AIResponse<T>> {
    // Configure MCP params based on selected strategy
    const defaultMCPParams = mcpConfigManager.getMCPParams();

    // Merge default params with provided ones (if any)
    const mcpParams = {
      ...defaultMCPParams,
      ...(request.mcpParams || {}),
    };

    // Add MCP params to request
    const mcpRequest: AIRequest = {
      ...request,
      mcpParams,
    };

    try {
      // Determine priority based on request type
      const priority = mcpConfigManager.getPriorityFromMetadata(
        request.metadata
      );

      // Send request via MCP service
      const mcpResponse = await this.mcpService.enqueue<T>(
        mcpRequest,
        priority
      );

      // Record MCP analytics if cache was used
      if (mcpResponse.cacheHit) {
        aiAnalytics.trackEvent({
          eventType: 'mcp',
          eventName: 'cache_hit',
          success: true,
          metadata: {
            similarity: mcpResponse.similarity,
            savings: mcpResponse.savingsEstimate,
          },
        });
      }

      return {
        ...mcpResponse.response,
        fromMCP: true,
      };
    } catch (error) {
      console.error('MCP request failed:', error);

      // Fallback to standard request processing
      console.log('Falling back to standard request processing');

      // Remove MCP params and retry with standard processing
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { mcpParams, useMCP, ...standardRequest } = request;
      return this.processRequest<T>(standardRequest);
    }
  }

  /**
   * Convert text description to CAD elements
   */
  async textToCAD(request: TextToCADRequest): Promise<AIResponse<Element[]>> {
    const {
      description,
      constraints,
      style = 'precise',
      complexity = 'moderate',
      context = [],
      structuredContext,
    } = request;

    // Build system prompt
    const systemPrompt = SYSTEM_PROMPTS.TEXT_TO_CAD.replace(
      'moderate complexity',
      complexity + ' complexity'
    ).replace('precise style', style + ' style');

    // Build user prompt
    let userPrompt = `Create a 3D CAD model based on this description:

${description}

Generate a complete array of CAD elements that form this model. Each element must include all required properties for its type. Format your response ONLY as a valid JSON array without any explanations or commentary.`;

    if (constraints) {
      userPrompt += '\n\nConstraints:\n' + JSON.stringify(constraints, null, 2);
    }

    if (context && context.length > 0) {
      userPrompt += '\n\nReference Context:\n';
      const maxContextLength = 5000; // Limit context size
      context.forEach((contextItem, index) => {
        const truncatedContext =
          contextItem.length > maxContextLength
            ? contextItem.substring(0, maxContextLength) +
              '... [content truncated]'
            : contextItem;
        userPrompt += `\n--- Context Document ${
          index + 1
        } ---\n${truncatedContext}\n`;
      });
      userPrompt += '\n\nPlease consider the above reference context...';
    }

    // Add structured context if available
    if (structuredContext && Object.keys(structuredContext).length > 0) {
      userPrompt +=
        '\n\nStructured Context Information:\n' +
        JSON.stringify(structuredContext, null, 2);
      userPrompt +=
        '\n\nPlease use this structured context to guide your element generation.';
    }

    // Process the request
    return this.processRequest<Element[]>({
      prompt: userPrompt,
      systemPrompt,
      model: 'claude-3-7-sonnet-20250219',
      temperature: complexity === 'creative' ? 0.8 : 0.5,
      maxTokens: this.defaultMaxTokens,
      parseResponse: this.parseTextToCADResponse,
      metadata: {
        type: 'text_to_cad',
        description: description.substring(0, 100),
        complexity,
        style,
        contextCount: context?.length || 0,
      },
      useMCP: request.useMCP,
      mcpParams: request.mcpParams,
    });
  }

  /**
   * Analyze CAD design and provide suggestions
   */
  async analyzeDesign(
    request: DesignAnalysisRequest
  ): Promise<AIResponse<AIDesignSuggestion[]>> {
    const {
      elements,
      analysisType = 'comprehensive',
      materialContext,
      manufacturingMethod,
      specificConcerns = [],
      structuredContext,
    } = request;

    // Build user prompt
    let userPrompt = `Analyze the following CAD/CAM design elements:
    
${JSON.stringify(elements, null, 2)}
  
Provide suggestions in the following categories:
1. Structural improvements
2. Manufacturing optimizations 
3. Material efficiency
4. Design simplification
5. Performance enhancements
  
Focus on ${analysisType} analysis.`;

    if (materialContext) {
      userPrompt += `\n\nMaterial context: ${materialContext}`;
    }

    if (manufacturingMethod) {
      userPrompt += `\n\nManufacturing method: ${manufacturingMethod}`;
    }

    if (specificConcerns.length > 0) {
      userPrompt += `\n\nSpecific concerns to address:\n- ${specificConcerns.join(
        '\n- '
      )}`;
    }

    userPrompt += `\n\nFor each suggestion, include:
- A clear title
- Detailed description
- Confidence score (0-1)
- Priority (low, medium, high)
- Type (optimization, warning, critical)
  
Format your response as JSON with an array of suggestions.`;

    // Add structured context if available
    if (structuredContext && Object.keys(structuredContext).length > 0) {
      userPrompt +=
        '\n\nStructured Context Information:\n' +
        JSON.stringify(structuredContext, null, 2);
    }

    // Process the request
    return this.processRequest<AIDesignSuggestion[]>({
      prompt: userPrompt,
      systemPrompt: SYSTEM_PROMPTS.DESIGN_ANALYSIS,
      model: 'claude-3-7-sonnet-20250219',
      temperature: 0.3,
      maxTokens: this.defaultMaxTokens,
      parseResponse: this.parseDesignResponse,
      metadata: {
        type: 'design_analysis',
        elementCount: elements.length,
        analysisType,
      },
      useMCP: request.useMCP,
      mcpParams: request.mcpParams,
    });
  }

  /**
   * Optimize G-code for CNC machines
   */
  async optimizeGCode(
    request: GCodeOptimizationRequest
  ): Promise<AIResponse<string>> {
    const {
      gcode,
      machineType,
      material = 'unknown material',
      optimizationGoal = 'balanced',
      constraints = {},
      structuredContext,
    } = request;

    // Build system prompt
    const systemPrompt = SYSTEM_PROMPTS.GCODE_OPTIMIZATION.replace(
      '{{machineType}}',
      machineType
    );

    // Build user prompt
    let constraintsStr = `- Optimize for ${optimizationGoal}
- Maintain part accuracy and quality
- Ensure safe machine operation
- Follow ${machineType} best practices`;

    if (Object.keys(constraints).length > 0) {
      constraintsStr +=
        '\n- ' +
        Object.entries(constraints)
          .map(([key, value]) => `${key}: ${value}`)
          .join('\n- ');
    }

    let userPrompt = `Analyze and optimize the following G-code for a ${machineType} machine working with ${material} material:

\`\`\`
${gcode.length > 5000 ? gcode.substring(0, 5000) + '\n...[truncated]' : gcode}
\`\`\`

Consider these specific constraints and goals:
${constraintsStr}

Provide the optimized G-code along with specific improvements made and estimated benefits in terms of time savings, tool life, and quality improvements.`;

    // Add structured context if available
    if (structuredContext && Object.keys(structuredContext).length > 0) {
      userPrompt +=
        '\n\nStructured Context Information:\n' +
        JSON.stringify(structuredContext, null, 2);
    }

    // Process the request
    return this.processRequest<string>({
      prompt: userPrompt,
      systemPrompt,
      model: 'claude-3-5-sonnet-20240229',
      temperature: 0.3,
      maxTokens: this.defaultMaxTokens,
      parseResponse: (text) => Promise.resolve(text), // No special parsing needed
      metadata: {
        type: 'gcode_optimization',
        machineType,
        material,
        codeLength: gcode.length,
        optimizationGoal,
      },
      useMCP: request.useMCP,
      mcpParams: request.mcpParams,
    });
  }

  /**
   * Generate suggestions based on current context
   */
  async generateSuggestions(
    context: string,
    mode: string
  ): Promise<AIResponse<string[]>> {
    const prompt = `Based on the current ${mode} context, generate 3-5 helpful suggestions.
    
Context details:
${context}
    
Provide suggestions as a JSON array of strings. Each suggestion should be clear, specific, and actionable.`;

    const systemPrompt = `You are an AI CAD/CAM assistant helping users with ${mode} tasks. Generate helpful context-aware suggestions.`;

    return this.processRequest<string[]>({
      prompt,
      systemPrompt,
      model: 'claude-3-haiku-20240229' as AIModelType, // Use fastest model for suggestions
      temperature: 0.7,
      maxTokens: 1000,
      parseResponse: this.parseSuggestionsResponse,
      metadata: {
        type: 'suggestions',
        mode,
      },
    });
  }

  /**
   * Process general assistant message
   */
  async processMessage(
    message: string,
    mode: string
  ): Promise<AIResponse<string>> {
    let contextPrefix = '';

    // Add context based on mode
    switch (mode) {
      case 'cad':
        contextPrefix =
          'You are an expert CAD design assistant helping with 3D modeling. ';
        break;
      case 'cam':
        contextPrefix =
          'You are an expert CAM programming assistant helping with CNC manufacturing. ';
        break;
      case 'gcode':
        contextPrefix =
          'You are an expert G-code programming assistant helping with CNC code. ';
        break;
      case 'toolpath':
        contextPrefix =
          'You are an expert toolpath optimization assistant for CNC machines. ';
        break;
      default:
        contextPrefix = 'You are a helpful CAD/CAM software assistant. ';
    }

    return this.processRequest<string>({
      prompt: message,
      systemPrompt:
        contextPrefix +
        'Provide helpful, concise, and accurate responses to the user.',
      model: 'claude-3-5-sonnet-20240229',
      temperature: 0.7,
      maxTokens: 4000,
      parseResponse: (text) => Promise.resolve(text),
      metadata: {
        type: 'assistant_message',
        mode,
        messageLength: message.length,
      },
    });
  }

  /**
   * Configure service parameters
   */
  setConfig(config: {
    defaultModel?: AIModelType;
    defaultMaxTokens?: number;
    allowBrowser?: boolean;
    mcpEnabled?: boolean;
    apiEndpoint?: string;
  }): void {
    if (config.defaultModel) this.defaultModel = config.defaultModel;
    if (config.defaultMaxTokens)
      this.defaultMaxTokens = config.defaultMaxTokens;
    if (config.allowBrowser !== undefined)
      this.allowBrowser = config.allowBrowser;
    if (config.mcpEnabled !== undefined) this.mcpEnabled = config.mcpEnabled;
    if (config.apiEndpoint) this.apiEndpoint = config.apiEndpoint;
  }

  /**
   * Parse text to CAD elements response
   */
  private parseTextToCADResponse = async (text: string): Promise<Element[]> => {
    try {
      // Look for JSON blocks in response
      const jsonMatch =
        text.match(/```json\n([\s\S]*?)\n```/) ||
        text.match(/\[\s*\{[\s\S]*\}\s*\]/);

      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      const json = jsonMatch[1] || jsonMatch[0];
      const elements = JSON.parse(json);

      // Validate and augment elements with default values
      return elements.map((el: any) => ({
        id: el.id || uuidv4(),
        type: el.type || 'cube',
        layerId: el.layerId || 'default',
        x: el.x ?? 0,
        y: el.y ?? 0,
        z: el.z ?? 0,
        width: el.width ?? 50,
        height: el.height ?? 50,
        depth: el.depth ?? 50,
        radius: el.radius ?? 25,
        color: el.color ?? '#1e88e5',
        ...(el.rotation && {
          rotation: {
            x: el.rotation.x ?? 0,
            y: el.rotation.y ?? 0,
            z: el.rotation.z ?? 0,
          },
        }),
        ...el,
      }));
    } catch (error) {
      console.error('Failed to parse CAD elements:', error);
      throw error;
    }
  };

  /**
   * Parse design analysis response
   */
  private parseDesignResponse = async (
    text: string
  ): Promise<AIDesignSuggestion[]> => {
    try {
      // Look for JSON in various formats
      const jsonMatch =
        text.match(/```json\n([\s\S]*?)\n```/) ||
        text.match(/```\n([\s\S]*?)\n```/) ||
        text.match(/\[\s*\{[\s\S]*\}\s*\]/);

      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      const json = jsonMatch[1] || jsonMatch[0];
      const parsed = JSON.parse(json);

      // Handle both direct arrays and nested objects
      if (Array.isArray(parsed)) {
        return parsed.map((suggestion) => ({
          id: suggestion.id || uuidv4(),
          ...suggestion,
        }));
      } else if (parsed.suggestions) {
        return parsed.suggestions.map((suggestion: any) => ({
          id: suggestion.id || uuidv4(),
          ...suggestion,
        }));
      } else {
        throw new Error('Unexpected JSON format in design response');
      }
    } catch (error) {
      console.error('Failed to parse design response:', error);
      throw error;
    }
  };

  /**
   * Parse suggestions response
   */
  private parseSuggestionsResponse = async (
    text: string
  ): Promise<string[]> => {
    try {
      // Look for JSON in various formats
      const jsonMatch =
        text.match(/```json\n([\s\S]*?)\n```/) ||
        text.match(/\[\s*"[\s\S]*"\s*\]/) ||
        text.match(/\[\s*\{[\s\S]*\}\s*\]/);

      if (!jsonMatch) {
        // If no JSON found, extract bullet points
        const bulletPoints = text.match(/[-*]\s+([^\n]+)/g);
        if (bulletPoints) {
          return bulletPoints.map((point) =>
            point.replace(/^[-*]\s+/, '').trim()
          );
        }

        // Otherwise split by lines
        return text
          .split('\n')
          .map((line) => line.trim())
          .filter((line) => line.length > 0);
      }

      const json = jsonMatch[1] || jsonMatch[0];
      const parsed = JSON.parse(json);

      // Handle both string arrays and object arrays
      if (Array.isArray(parsed)) {
        if (typeof parsed[0] === 'string') {
          return parsed;
        } else if (typeof parsed[0] === 'object') {
          return parsed.map(
            (item) =>
              item.text ||
              item.suggestion ||
              item.description ||
              JSON.stringify(item)
          );
        }
      }

      throw new Error('Unexpected JSON format in suggestions response');
    } catch (error) {
      console.error('Failed to parse suggestions:', error);
      return [];
    }
  };
}
