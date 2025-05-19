import { aiCADCore, TextToCADRequest, Element } from '../src';

/**
 * Example of using the AI CAD SDK to convert text to CAD elements
 */
async function textToCADExample() {
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

  // Create a text to CAD request
  const request: TextToCADRequest = {
    description: 'A simple chair with four legs, a seat, and a backrest.',
    constraints: {
      maxElements: 10,
      preferredTypes: ['cube', 'cylinder'],
    },
    style: 'precise',
    complexity: 'moderate',
    useMCP: true, // Use Model-Completions-Protocol for efficiency
  };

  console.log('Sending text to CAD request...');

  try {
    // Process the request
    const response = await aiService.textToCAD(request);

    if (response.success) {
      console.log('Successfully generated CAD elements!');
      console.log(`Generated ${response.data?.length} elements`);
      console.log('First element:', response.data?.[0]);

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

      // Use the generated elements in your application
      const elements = response.data as Element[];
      elements.forEach((element) => {
        console.log(
          `- ${element.type} at (${element.x}, ${element.y}, ${element.z})`
        );
      });
    } else {
      console.error('Failed to generate CAD elements:', response.error);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the example
textToCADExample().catch(console.error);
