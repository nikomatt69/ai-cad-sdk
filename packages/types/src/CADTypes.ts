/**
 * CAD specific types
 */

// Basic Element Type
export interface Element {
  id: string;
  type: string;
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

// Design Context
export interface DesignContext {
  complexity: number; // 0-1 scale
  features: string[];
  elementTypes: Record<string, number>;
  boundingBox: {
    min: { x: number; y: number; z: number };
    max: { x: number; y: number; z: number };
  };
  styleMetrics: {
    colorPalette: string[];
    dominantColor: string;
    cornerStyle: 'sharp' | 'rounded' | 'mixed';
    surfaceFinish: 'smooth' | 'textured' | 'mixed';
    proportions: 'uniform' | 'varied';
    symmetry: 'symmetric' | 'asymmetric' | 'partial';
  };
  spatialRelationships: {
    primaryAxis: 'x' | 'y' | 'z' | 'none';
    connections: { type: string; count: number }[];
    hierarchy: 'flat' | 'nested' | 'layered';
    density: number; // 0-1 scale
  };
  designSystem: {
    type: 'mechanical' | 'organic' | 'architectural' | 'abstract' | 'unknown';
    gridSize: number | null;
    modularity: number; // 0-1 scale
  };
  scale: {
    category:
      | 'microscopic'
      | 'small'
      | 'medium'
      | 'large'
      | 'architectural'
      | 'unknown';
    maxDimension: number;
    typicalUnit: 'mm' | 'cm' | 'm' | 'unknown';
  };
  metadata: {
    elementCount: number;
    dominantColor: string;
    timestamp: number;
    [key: string]: any;
  };
}

// Generation Constraints
export interface GenerationConstraints {
  maxElements?: number;
  enforceStyleConsistency?: boolean;
  scaleToMatch?: boolean;
  preferredTypes?: string[];
  colorPalette?: string[];
  maxDimensions?: {
    width: number;
    height: number;
    depth: number;
  };
  symmetryType?: 'symmetric' | 'asymmetric';
  namePrefix?: string;
  [key: string]: any;
}

// Generation Options
export interface GenerationOptions {
  useCache?: boolean;
  cacheTTL?: number;
  fallbackOnError?: boolean;
  attemptFix?: boolean;
  positioning?: 'adjacent' | 'smart' | 'centered' | 'origin' | 'custom';
  includeExamples?: boolean;
  temperature?: number;
  maxTokens?: number;
  modelOverride?: string;
  [key: string]: any;
}

// Generation Result
export interface GenerationResult {
  requestId: string;
  generatedElements: Element[];
  originalDescription: string;
  designContext: DesignContext;
  appliedConstraints: GenerationConstraints;
  metadata: {
    processingTimeMs: number;
    elementCount: number;
    confidenceScore: number;
    modelUsed: string;
    [key: string]: any;
  };
  fromCache?: boolean;
  fallbackUsed?: boolean;
  emergencyFallback?: boolean;
}

// Text to CAD
export interface TextToCADRequest {
  description: string;
  context?: string[];
  constraints?: GenerationConstraints;
  style?: 'precise' | 'artistic' | 'mechanical' | 'organic';
  complexity?: 'simple' | 'moderate' | 'complex' | 'creative';
  useMCP?: boolean;
  mcpParams?: import('./AITypes').MCPRequestParams;
  structuredContext?: Record<string, any>;
}

// Design Analysis
export interface DesignAnalysisRequest {
  elements: Element[];
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
  mcpParams?: import('./AITypes').MCPRequestParams;
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

// GCode
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
  mcpParams?: import('./AITypes').MCPRequestParams;
  structuredContext?: Record<string, any>;
}
