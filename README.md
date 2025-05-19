# AI CAD SDK

A comprehensive SDK for integrating AI functionality into CAD/CAM applications, with a focus on performance and efficiency through the Model-Completions-Protocol (MCP).

## Features

- **Text to CAD**: Convert natural language descriptions into CAD elements
- **Design Analysis**: Get AI-powered feedback and suggestions for improving designs
- **G-code Optimization**: Automatically optimize G-code for CNC machines
- **Contextual Suggestions**: Receive real-time suggestions based on current design context
- **Efficient Processing**: Leverage the Model-Completions-Protocol (MCP) for caching, prioritization, and smart routing
- **Analytics**: Track AI performance metrics and optimize costs

## Installation

```bash
npm install ai-cad-sdk
```

## Quick Start

```typescript
import aiCADSDK, { TextToCADRequest } from 'ai-cad-sdk';

// Initialize the SDK
aiCADSDK.configure({
  apiKey: 'your-api-key',
  defaultModel: 'claude-3-7-sonnet-20250219',
  mcpEnabled: true
});

aiCADSDK.initialize();

// Get the AI service
const aiService = aiCADSDK.getAIService();

// Convert text to CAD elements
async function createModelFromText() {
  const request: TextToCADRequest = {
    description: 'A simple chair with four legs, a seat, and a backrest.',
    style: 'precise',
    complexity: 'moderate'
  };
  
  const response = await aiService.textToCAD(request);
  
  if (response.success) {
    console.log(`Generated ${response.data.length} elements`);
    return response.data; // Use elements in your application
  } else {
    console.error('Error:', response.error);
    return [];
  }
}
```

## Model-Completions-Protocol (MCP)

The Model-Completions-Protocol (MCP) is a core feature of the AI CAD SDK that optimizes AI interactions through smart caching, prioritization, and routing. This system provides several key benefits:

### 1. Smart Caching

MCP includes both exact and semantic caching capabilities:

```typescript
import { mcpConfigManager } from 'ai-cad-sdk';

// Set caching strategy
mcpConfigManager.updateStrategyConfig('balanced', {
  cacheStrategy: 'semantic', // 'exact', 'semantic', or 'hybrid'
  minSimilarity: 0.8,        // Threshold for semantic matching (0.0 to 1.0)
  cacheTTL: 43200000         // Cache lifetime in milliseconds (12 hours)
});
```

### 2. Request Prioritization

MCP prioritizes requests based on their importance:

```typescript
import { mcpService } from 'ai-cad-sdk';

// High priority (interactive user request)
await mcpService.enqueue(userRequest, 'high');

// Normal priority (standard request)
await mcpService.enqueue(standardRequest, 'normal');

// Low priority (background task)
await mcpService.enqueue(backgroundTask, 'low');
```

### 3. Multi-Provider Smart Routing

MCP can now automatically select the best AI model based on task requirements:

```typescript
import { mcpConfigManager } from 'ai-cad-sdk';

// Enable multi-provider support
mcpConfigManager.setMultiProviderEnabled(true);

// Set preferred provider (optional)
mcpConfigManager.setPreferredProvider('CLAUDE');

// The MCP will now intelligently route requests between providers (Claude and OpenAI)
// based on task complexity, required capabilities, and performance needs
```

When using smart routing, provide metadata about your task:

```typescript
const response = await aiService.generateContent({
  prompt: "Explain how gears work in mechanical systems",
  metadata: {
    type: 'technical_explanation',   // Task type
    complexity: 'medium',            // Task complexity
    requiresReasoning: true,         // Required capabilities
    requiresFactual: true
  },
  useMCP: true
});

// MCP will automatically select the most appropriate model based on these requirements
```

### 4. Performance Monitoring

MCP tracks key performance metrics:

```typescript
import { mcpService } from 'ai-cad-sdk';

// Get MCP performance stats
const stats = await mcpService.getStats();
console.log(stats);
```

### 5. Pre-configured Strategies

MCP provides three pre-configured strategies:

```typescript
import { mcpConfigManager } from 'ai-cad-sdk';

// 1. Aggressive: Prioritizes speed and cache hits
mcpConfigManager.setStrategy('aggressive');

// 2. Balanced: Good balance between speed and quality
mcpConfigManager.setStrategy('balanced');

// 3. Conservative: Prioritizes quality and accuracy
mcpConfigManager.setStrategy('conservative');
```

## Core Services

### AI Service

The unified AI service provides methods for all AI interactions:

```typescript
// Get the AI service
const aiService = aiCADCore.getAIService();

// Text to CAD
const cadResponse = await aiService.textToCAD({
  description: 'A mechanical assembly with gears and bearings',
  complexity: 'complex'
});

// Design analysis
const analysisResponse = await aiService.analyzeDesign({
  elements: myCADElements,
  analysisType: 'manufacturability'
});

// G-code optimization
const gcodeResponse = await aiService.optimizeGCode({
  gcode: myGCode,
  machineType: 'cnc_mill',
  material: 'aluminum'
});

// Generate suggestions
const suggestionsResponse = await aiService.generateSuggestions(
  'Current user is designing a chair with uneven leg heights',
  'cad'
);
```

### MCP Service

For direct access to the MCP functionality:

```typescript
// Get the MCP service
const mcpService = aiCADCore.getMCPService();

// Enqueue a request with priority
const result = await mcpService.enqueue(myRequest, 'high');

// Configure MCP settings
mcpService.setSemanticCacheEnabled(true);
mcpService.setSmartRoutingEnabled(true);
mcpService.setDefaultTTL(3600000); // 1 hour
```

### Smart Router

The new Smart Router component selects the optimal AI model for each task:

```typescript
import { smartRouter } from 'ai-cad-sdk';

// Get model recommendation
const recommendedModel = smartRouter.selectModel({
  taskType: 'code',
  complexityLevel: 'high',
  priority: 'quality',
  requiredCapabilities: ['reasoning', 'code'],
  promptTokenEstimate: 1000,
  outputTokenEstimate: 1500
});

// Get model metadata
const modelInfo = smartRouter.getModelMetadata(recommendedModel);
console.log(`Selected model: ${recommendedModel}`);
console.log(`Provider: ${modelInfo.provider}`);
console.log(`Strengths: ${modelInfo.strengths.join(', ')}`);

// Estimate cost
const estimatedCost = smartRouter.estimateCost(
  recommendedModel,
  1000, // input tokens
  1500  // output tokens
);
console.log(`Estimated cost: $${estimatedCost.toFixed(4)}`);
```

### Cache Service

Manage the AI response cache:

```typescript
// Get the cache service
const cacheService = aiCADCore.getCacheService();

// Configure cache
cacheService.setMaxSize(100);
cacheService.setTTL(3600000); // 1 hour

// Get cache statistics
const stats = cacheService.getStats();
console.log(`Cache size: ${stats.totalItems}, Memory usage: ${stats.memoryUsage} bytes`);
```

### Analytics Service

Track and analyze AI usage:

```typescript
// Get the analytics service
const analyticsService = aiCADCore.getAnalyticsService();

// Get performance metrics
const metrics = analyticsService.getMetrics();
console.log(`Success rate: ${metrics.successRate}%, Avg response time: ${metrics.averageResponseTime}ms`);

// Track custom event
analyticsService.trackEvent({
  eventType: 'custom',
  eventName: 'user_approved_suggestion',
  success: true,
  metadata: { suggestionId: '123' }
});
```

## Examples

Check out the [examples](./examples) directory for more usage examples:

- [Text to CAD](./examples/textToCAD.ts)
- [Design Analysis](./examples/designAnalysis.ts)
- [MCP System](./examples/mcpExample.ts)

## Best Practices

1. **Enable MCP**: Turn on MCP for most production applications to benefit from its optimizations.
2. **Choose Right Strategy**: Select a strategy that matches your quality/speed requirements.
3. **Set Appropriate TTL**: Configure cache TTL based on how frequently your data or requirements change.
4. **Monitor Performance**: Regularly check analytics to identify optimization opportunities.
5. **Provide Metadata**: When making AI requests, include metadata about task type and complexity to allow better model selection.
6. **Use Multi-provider**: Enable multi-provider support to leverage the strengths of different AI models for various tasks.

## License

MIT