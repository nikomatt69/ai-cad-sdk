import { AIModelType, AIProviderType } from '../../types';

/**
 * Model metadata used for smart routing
 */
interface ModelMetadata {
  provider: AIProviderType;
  contextSize: number;
  strengths: string[];
  weaknesses: string[];
  costPerInputToken: number;
  costPerOutputToken: number;
  averageResponseTimeMs: number;
  suitableFor: string[];
  capabilities: Record<string, number>; // 0-10 score for each capability
}

/**
 * Smart Router for selecting the most appropriate AI model
 */
export class SmartRouter {
  private modelsMetadata: Record<AIModelType, ModelMetadata> = {
    // Define the characteristics of each model
    'claude-3-7-sonnet-20250219': {
      provider: 'CLAUDE',
      contextSize: 200000,
      strengths: [
        'reasoning',
        'instruction following',
        'creative writing',
        'balanced performance',
      ],
      weaknesses: [
        'code generation complexity',
        'math',
        'context handling edge cases',
      ],
      costPerInputToken: 0.00000388,
      costPerOutputToken: 0.00001554,
      averageResponseTimeMs: 2000,
      suitableFor: [
        'complex reasoning',
        'creative tasks',
        'instruction following',
        'general purpose',
      ],
      capabilities: {
        reasoning: 9,
        creativity: 8,
        codeGeneration: 7,
        mathPrecision: 6,
        factualAccuracy: 8,
        contextUnderstanding: 9,
      },
    },
    'claude-3-opus-20240229': {
      provider: 'CLAUDE',
      contextSize: 180000,
      strengths: ['reasoning', 'creative writing', 'detailed analysis'],
      weaknesses: ['slower response times', 'higher cost'],
      costPerInputToken: 0.000015,
      costPerOutputToken: 0.000044,
      averageResponseTimeMs: 3500,
      suitableFor: [
        'complex reasoning',
        'detailed analysis',
        'safety critical',
      ],
      capabilities: {
        reasoning: 9.5,
        creativity: 8.5,
        codeGeneration: 8,
        mathPrecision: 7,
        factualAccuracy: 9,
        contextUnderstanding: 9.5,
      },
    },
    'claude-3-5-sonnet-20240229': {
      provider: 'CLAUDE',
      contextSize: 180000,
      strengths: ['balanced performance', 'instruction following'],
      weaknesses: ['creative writing depth'],
      costPerInputToken: 0.000003,
      costPerOutputToken: 0.000009,
      averageResponseTimeMs: 2200,
      suitableFor: ['general purpose', 'balanced requirements'],
      capabilities: {
        reasoning: 7.5,
        creativity: 7,
        codeGeneration: 7,
        mathPrecision: 6,
        factualAccuracy: 8,
        contextUnderstanding: 8,
      },
    },
    'claude-3-haiku-20240229': {
      provider: 'CLAUDE',
      contextSize: 180000,
      strengths: ['speed', 'low cost'],
      weaknesses: ['complex reasoning', 'detailed analysis'],
      costPerInputToken: 0.00000025,
      costPerOutputToken: 0.00000125,
      averageResponseTimeMs: 1000,
      suitableFor: ['simple tasks', 'quick responses', 'high throughput'],
      capabilities: {
        reasoning: 5,
        creativity: 5,
        codeGeneration: 5,
        mathPrecision: 4,
        factualAccuracy: 6,
        contextUnderstanding: 5,
      },
    },
    'gpt-4o': {
      provider: 'OPENAI',
      contextSize: 128000,
      strengths: ['speed', 'cost effective', 'code generation'],
      weaknesses: ['detailed analysis', 'longer contexts'],
      costPerInputToken: 0.000005,
      costPerOutputToken: 0.000015,
      averageResponseTimeMs: 1800,
      suitableFor: ['code tasks', 'general purpose', 'balanced requirements'],
      capabilities: {
        reasoning: 8.5,
        creativity: 8,
        codeGeneration: 9,
        mathPrecision: 8,
        factualAccuracy: 8,
        contextUnderstanding: 8.5,
      },
    },
    'gpt-4o-mini': {
      provider: 'OPENAI',
      contextSize: 128000,
      strengths: ['speed', 'very low cost'],
      weaknesses: ['complex reasoning', 'detailed analysis'],
      costPerInputToken: 0.0000015,
      costPerOutputToken: 0.000006,
      averageResponseTimeMs: 1000,
      suitableFor: ['simple tasks', 'high throughput', 'cost sensitive'],
      capabilities: {
        reasoning: 6,
        creativity: 6,
        codeGeneration: 7,
        mathPrecision: 5,
        factualAccuracy: 7,
        contextUnderstanding: 6,
      },
    },
    'gpt-4': {
      provider: 'OPENAI',
      contextSize: 8192,
      strengths: ['mature', 'reliable', 'code generation'],
      weaknesses: ['context size', 'response speed', 'higher cost'],
      costPerInputToken: 0.00003,
      costPerOutputToken: 0.00006,
      averageResponseTimeMs: 3000,
      suitableFor: ['complex tasks', 'code generation'],
      capabilities: {
        reasoning: 8,
        creativity: 7.5,
        codeGeneration: 9,
        mathPrecision: 7.5,
        factualAccuracy: 8,
        contextUnderstanding: 8,
      },
    },
    'gpt-4.1': {
      provider: 'OPENAI',
      contextSize: 16000,
      strengths: ['reliability', 'code generation', 'math'],
      weaknesses: ['context size', 'cost'],
      costPerInputToken: 0.000075,
      costPerOutputToken: 0.00012,
      averageResponseTimeMs: 4000,
      suitableFor: ['complex tasks', 'code generation', 'math'],
      capabilities: {
        reasoning: 8.5,
        creativity: 8,
        codeGeneration: 9.5,
        mathPrecision: 9,
        factualAccuracy: 8.5,
        contextUnderstanding: 8.5,
      },
    },
    'gpt-4-turbo-preview': {
      provider: 'OPENAI',
      contextSize: 128000,
      strengths: ['larger context', 'code generation'],
      weaknesses: ['higher cost', 'potentially less reliable'],
      costPerInputToken: 0.00001,
      costPerOutputToken: 0.00003,
      averageResponseTimeMs: 2500,
      suitableFor: ['long context tasks', 'code generation'],
      capabilities: {
        reasoning: 8.5,
        creativity: 8,
        codeGeneration: 9,
        mathPrecision: 8,
        factualAccuracy: 8.5,
        contextUnderstanding: 9,
      },
    },
    'gpt-3.5-turbo': {
      provider: 'OPENAI',
      contextSize: 16000,
      strengths: ['speed', 'low cost', 'reliability'],
      weaknesses: ['complex reasoning', 'detailed analysis'],
      costPerInputToken: 0.0000005,
      costPerOutputToken: 0.0000015,
      averageResponseTimeMs: 800,
      suitableFor: ['simple tasks', 'high throughput', 'cost sensitive'],
      capabilities: {
        reasoning: 5,
        creativity: 5,
        codeGeneration: 6,
        mathPrecision: 4,
        factualAccuracy: 6,
        contextUnderstanding: 5,
      },
    },
  };

  /**
   * Task complexity factors to consider when selecting a model
   */
  private taskComplexityFactors: Record<
    string,
    {
      description: string;
      weight: number;
    }
  > = {
    reasoning: {
      description: 'Complex reasoning or analysis tasks',
      weight: 0.25,
    },
    creativity: {
      description: 'Creative writing or content generation',
      weight: 0.2,
    },
    code: {
      description: 'Code generation, explanation, or analysis',
      weight: 0.15,
    },
    math: {
      description: 'Mathematical calculations or analysis',
      weight: 0.1,
    },
    factual: {
      description: 'Factual question answering',
      weight: 0.15,
    },
    contextHandling: {
      description: 'Understanding and utilizing context',
      weight: 0.15,
    },
  };

  /**
   * Priority factors for model selection
   */
  private priorityFactors: Record<string, number> = {
    speed: 0.33,
    quality: 0.34,
    cost: 0.33,
  };

  /**
   * Initialize with custom model ratings
   */
  constructor(
    customModelRatings?: Partial<Record<AIModelType, Partial<ModelMetadata>>>
  ) {
    // Apply custom model ratings if provided
    if (customModelRatings) {
      Object.entries(customModelRatings).forEach(([model, ratings]) => {
        const modelType = model as AIModelType;

        if (this.modelsMetadata[modelType]) {
          this.modelsMetadata[modelType] = {
            ...this.modelsMetadata[modelType],
            ...ratings,
          };
        }
      });
    }
  }

  /**
   * Select the optimal model for a given task
   */
  selectModel(options: {
    taskType?: string;
    promptTokenEstimate?: number;
    outputTokenEstimate?: number;
    priority?: 'speed' | 'quality' | 'cost';
    requiredCapabilities?: string[];
    preferredProvider?: AIProviderType;
    complexityLevel?: 'low' | 'medium' | 'high';
  }): AIModelType {
    const {
      taskType = 'general',
      promptTokenEstimate = 500,
      outputTokenEstimate = 800,
      priority = 'quality',
      requiredCapabilities = [],
      preferredProvider,
      complexityLevel = 'medium',
    } = options;

    // Set priority weights
    let priorityWeights = { ...this.priorityFactors };

    if (priority === 'speed') {
      priorityWeights = { speed: 0.6, quality: 0.3, cost: 0.1 };
    } else if (priority === 'quality') {
      priorityWeights = { speed: 0.1, quality: 0.8, cost: 0.1 };
    } else if (priority === 'cost') {
      priorityWeights = { speed: 0.2, quality: 0.2, cost: 0.6 };
    }

    // Map complexity level to capability requirements
    const complexityFactors = {
      low: 3,
      medium: 6,
      high: 8,
    };

    const requiredLevel = complexityFactors[complexityLevel];

    // Score each model
    const modelScores: {
      [model in AIModelType]?: {
        totalScore: number;
        qualityScore: number;
        speedScore: number;
        costScore: number;
        meetsRequirements: boolean;
      };
    } = {};

    for (const [model, metadata] of Object.entries(this.modelsMetadata)) {
      const modelType = model as AIModelType;

      // Skip if provider doesn't match preferred provider
      if (preferredProvider && metadata.provider !== preferredProvider) {
        continue;
      }

      // Check for required capabilities
      const capabilitiesMet = requiredCapabilities.every((cap) => {
        const mappedCap = this.mapCapabilityToMetadataField(cap);
        return metadata.capabilities[mappedCap] >= requiredLevel;
      });

      if (!capabilitiesMet) {
        modelScores[modelType] = {
          totalScore: 0,
          qualityScore: 0,
          speedScore: 0,
          costScore: 0,
          meetsRequirements: false,
        };
        continue;
      }

      // Calculate quality score based on task type
      const qualityScore = this.calculateQualityScore(
        metadata,
        taskType,
        complexityLevel
      );

      // Calculate speed score (inverse of response time)
      const speedScore = 10 - metadata.averageResponseTimeMs / 500;

      // Calculate cost score (inverse of cost)
      const totalCostEstimate =
        promptTokenEstimate * metadata.costPerInputToken +
        outputTokenEstimate * metadata.costPerOutputToken;

      // Normalize cost score (lower is better, 10 = free)
      const maxCost = 0.1; // $0.10 as max cost for normalization
      const costScore =
        10 - (Math.min(totalCostEstimate, maxCost) / maxCost) * 10;

      // Calculate total score
      const totalScore =
        qualityScore * priorityWeights.quality +
        speedScore * priorityWeights.speed +
        costScore * priorityWeights.cost;

      modelScores[modelType] = {
        totalScore,
        qualityScore,
        speedScore,
        costScore,
        meetsRequirements: true,
      };
    }

    // Find the model with the highest score that meets requirements
    let bestModel = 'claude-3-7-sonnet-20250219' as AIModelType; // Default model
    let highestScore = -1;

    for (const [model, score] of Object.entries(modelScores)) {
      if (score.meetsRequirements && score.totalScore > highestScore) {
        highestScore = score.totalScore;
        bestModel = model as AIModelType;
      }
    }

    return bestModel;
  }

  /**
   * Calculate quality score based on task type and complexity
   */
  private calculateQualityScore(
    metadata: ModelMetadata,
    taskType: string,
    complexityLevel: 'low' | 'medium' | 'high'
  ): number {
    // Map task type to relevant capabilities
    const relevantCapabilities = this.getRelevantCapabilities(taskType);
    const complexityMultiplier = { low: 0.7, medium: 1.0, high: 1.3 }[
      complexityLevel
    ];

    // Calculate weighted capability score
    let weightedScore = 0;
    let totalWeight = 0;

    for (const [capability, weight] of Object.entries(relevantCapabilities)) {
      if (metadata.capabilities[capability]) {
        weightedScore += metadata.capabilities[capability] * weight;
        totalWeight += weight;
      }
    }

    // Normalize score to 0-10 range and apply complexity multiplier
    return totalWeight > 0
      ? (weightedScore / totalWeight) * complexityMultiplier
      : 5; // Default middle score if no relevant capabilities
  }

  /**
   * Map task type to relevant model capabilities
   */
  private getRelevantCapabilities(taskType: string): Record<string, number> {
    // Default general weights
    const defaultWeights: Record<string, number> = {
      reasoning: 0.2,
      creativity: 0.2,
      codeGeneration: 0.15,
      mathPrecision: 0.15,
      factualAccuracy: 0.15,
      contextUnderstanding: 0.15,
    };

    // Task-specific capability weights
    const taskWeights: Record<string, Record<string, number>> = {
      general: defaultWeights,
      code: {
        codeGeneration: 0.5,
        reasoning: 0.2,
        contextUnderstanding: 0.2,
        factualAccuracy: 0.1,
      },
      creative: {
        creativity: 0.5,
        contextUnderstanding: 0.2,
        reasoning: 0.2,
        factualAccuracy: 0.1,
      },
      analysis: {
        reasoning: 0.4,
        factualAccuracy: 0.3,
        contextUnderstanding: 0.2,
        mathPrecision: 0.1,
      },
      math: {
        mathPrecision: 0.5,
        reasoning: 0.3,
        factualAccuracy: 0.2,
      },
      factual: {
        factualAccuracy: 0.6,
        contextUnderstanding: 0.2,
        reasoning: 0.2,
      },
      cad: {
        reasoning: 0.3,
        factualAccuracy: 0.3,
        codeGeneration: 0.2,
        contextUnderstanding: 0.2,
      },
    };

    // Return the specific task weights or default weights
    return taskWeights[taskType] || defaultWeights;
  }

  /**
   * Map user-friendly capability name to internal metadata field
   */
  private mapCapabilityToMetadataField(capability: string): string {
    const mapping: Record<string, string> = {
      reasoning: 'reasoning',
      creative: 'creativity',
      code: 'codeGeneration',
      math: 'mathPrecision',
      factual: 'factualAccuracy',
      context: 'contextUnderstanding',
      // Add more mappings as needed
    };

    return mapping[capability] || capability;
  }

  /**
   * Get metadata for a specific model
   */
  getModelMetadata(model: AIModelType): ModelMetadata | undefined {
    return this.modelsMetadata[model];
  }

  /**
   * Get provider for a model
   */
  getProviderForModel(model: AIModelType): AIProviderType {
    return this.modelsMetadata[model]?.provider || 'CLAUDE';
  }

  /**
   * Estimate cost for a request
   */
  estimateCost(
    model: AIModelType,
    inputTokens: number,
    outputTokens: number
  ): number {
    const metadata = this.modelsMetadata[model];

    if (!metadata) {
      return 0;
    }

    return (
      inputTokens * metadata.costPerInputToken +
      outputTokens * metadata.costPerOutputToken
    );
  }
}

// Export a singleton instance
export const smartRouter = new SmartRouter();
