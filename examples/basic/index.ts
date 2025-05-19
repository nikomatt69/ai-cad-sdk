// Basic example showing how to use the AI CAD SDK
import { AICADClient } from '@ai-cad-sdk/core';

async function main() {
  // Initialize the client
  const client = new AICADClient({
    apiKeys: {
      claude: process.env.CLAUDE_API_KEY || '',
      openai: process.env.OPENAI_API_KEY || '',
    },
    defaultModel: 'claude-3-7-sonnet-20250219',
    cache: { enabled: true },
  });

  try {
    // Example 1: Convert text to CAD elements
    console.log('Converting text to CAD elements...');
    const textToCadResult = await client.textToCAD(
      'A simple chair with four legs and a backrest',
      {
        style: 'precise',
        complexity: 'moderate',
        constraints: {
          maxElements: 10,
          preferredTypes: ['cube', 'cylinder'],
          colorPalette: ['#8B4513', '#A0522D'], // Brown wooden colors
        },
      }
    );

    if (textToCadResult.success && textToCadResult.data) {
      console.log(`Generated ${textToCadResult.data.length} CAD elements`);
      console.log('First element:', textToCadResult.data[0]);
    } else {
      console.error('Failed to generate CAD elements:', textToCadResult.error);
    }

    // Example 2: Analyze CAD design
    if (textToCadResult.success && textToCadResult.data) {
      console.log('\nAnalyzing the generated design...');
      const analysisResult = await client.analyzeDesign(textToCadResult.data, {
        analysisType: 'comprehensive',
        materialContext: 'Wood, standard grade',
        manufacturingMethod: 'CNC milling',
      });

      if (analysisResult.success && analysisResult.data) {
        console.log('Design analysis suggestions:');
        analysisResult.data.forEach((suggestion, index) => {
          console.log(
            `${index + 1}. ${suggestion.title} (${
              suggestion.type
            }, confidence: ${suggestion.confidence})`
          );
          console.log(`   ${suggestion.description}`);
        });
      } else {
        console.error('Failed to analyze design:', analysisResult.error);
      }
    }

    // Example 3: Optimize G-code
    console.log('\nOptimizing G-code...');
    const sampleGcode = `G21 G90
G0 Z5
G0 X0 Y0
G1 Z-1 F100
G1 X100 Y0 F200
G1 X100 Y100
G1 X0 Y100
G1 X0 Y0
G0 Z5`;

    const gcodeResult = await client.optimizeGCode(sampleGcode, {
      machineType: 'generic-cnc',
      material: 'aluminum',
      optimizationGoal: 'balanced',
    });

    if (gcodeResult.success) {
      console.log('Optimized G-code:');
      console.log(gcodeResult.data);

      console.log('\nProcessing time:', gcodeResult.processingTime, 'ms');
      console.log('Token usage:', gcodeResult.usage?.totalTokens);
    } else {
      console.error('Failed to optimize G-code:', gcodeResult.error);
    }
  } catch (error) {
    console.error('Error in example:', error);
  }
}

main().catch(console.error);
