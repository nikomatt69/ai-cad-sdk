import { aiCADCore, DesignAnalysisRequest, AIDesignSuggestion } from '../src';

/**
 * Example of using the AI CAD SDK to analyze a CAD design
 */
async function designAnalysisExample() {
  console.log('Initializing AI CAD SDK...');

  // Initialize the SDK with your API key and configuration
  aiCADCore.configure({
    apiKey: 'your-api-key',
    defaultModel: 'claude-3-7-sonnet-20250219',
    mcpEnabled: true,
    mcpStrategy: 'balanced',
    analyticsEnabled: true,
  });

  aiCADCore.initialize();

  // Get the AI service
  const aiService = aiCADCore.getAIService();

  // Example CAD elements to analyze
  const elements = [
    {
      id: '1',
      type: 'cube',
      layerId: 'base',
      x: 0,
      y: 0,
      z: 0,
      width: 100,
      height: 10,
      depth: 100,
      color: '#808080',
    },
    {
      id: '2',
      type: 'cylinder',
      layerId: 'legs',
      x: -40,
      y: -50,
      z: -40,
      radius: 5,
      height: 100,
      color: '#404040',
    },
    {
      id: '3',
      type: 'cylinder',
      layerId: 'legs',
      x: 40,
      y: -50,
      z: -40,
      radius: 5,
      height: 100,
      color: '#404040',
    },
    {
      id: '4',
      type: 'cylinder',
      layerId: 'legs',
      x: -40,
      y: -50,
      z: 40,
      radius: 5,
      height: 100,
      color: '#404040',
    },
    {
      id: '5',
      type: 'cylinder',
      layerId: 'legs',
      x: 40,
      y: -50,
      z: 40,
      radius: 5,
      height: 100,
      color: '#404040',
    },
  ];

  // Create a design analysis request
  const request: DesignAnalysisRequest = {
    elements,
    analysisType: 'comprehensive',
    materialContext: 'Wood and metal',
    manufacturingMethod: 'CNC machining',
    specificConcerns: [
      'Structural stability',
      'Manufacturing cost',
      'Assembly ease',
    ],
    useMCP: true,
  };

  console.log('Sending design analysis request...');

  try {
    // Process the request
    const response = await aiService.analyzeDesign(request);

    if (response.success) {
      console.log('Successfully analyzed design!');
      console.log(`Received ${response.data?.length} suggestions`);

      // Check if response came from cache via MCP
      if (response.fromCache) {
        console.log('Response retrieved from cache');
      }

      // Print token usage information
      if (response.usage) {
        console.log('Token usage:', response.usage);

        // Calculate estimated cost
        const cost = aiCADCore.estimateCost(
          response.model || 'claude-3-5-sonnet-20240229',
          response.usage.promptTokens,
          response.usage.completionTokens
        );
        console.log(`Estimated cost: $${cost.toFixed(4)}`);
      }

      // Use the suggestions in your application
      const suggestions = response.data as AIDesignSuggestion[];
      suggestions.forEach((suggestion) => {
        console.log(
          `\n[${suggestion.type.toUpperCase()}] ${
            suggestion.title
          } (Priority: ${suggestion.priority}, Confidence: ${
            suggestion.confidence
          })`
        );
        console.log(suggestion.description);
      });
    } else {
      console.error('Failed to analyze design:', response.error);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the example
designAnalysisExample().catch(console.error);
