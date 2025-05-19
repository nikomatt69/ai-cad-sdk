import { mcpService, mcpConfigManager } from '../src/services';
import { AIRequest } from '../src/types';

/**
 * Example showing how to use the Model-Completions-Protocol (MCP) for optimizing AI interactions
 * This example demonstrates caching, prioritization, and smart routing features
 */
async function mcpExample() {
  console.log('MCP System Example');
  console.log('==================');

  // 1. Configure MCP settings
  console.log('\n1. Configuring MCP settings');
  mcpConfigManager.setStrategy('balanced');
  mcpConfigManager.setMultiProviderEnabled(true);

  // Display current configuration
  console.log(`Strategy: balanced`);
  console.log(
    `Multi-provider enabled: ${mcpConfigManager.isMultiProviderEnabled()}`
  );

  // 2. Create a high-priority interactive request
  console.log('\n2. Sending a high-priority interactive request');
  const interactiveRequest: AIRequest = {
    prompt:
      'Explain how the Model-Completions-Protocol optimizes AI interactions',
    systemPrompt:
      'You are a helpful AI assistant that specializes in explaining technical concepts clearly and concisely.',
    maxTokens: 300,
    temperature: 0.3,
    metadata: {
      type: 'interactive',
      complexity: 'medium',
    },
    mcpParams: {
      cacheStrategy: 'hybrid',
      minSimilarity: 0.8,
      storeResult: true,
    },
  };

  console.log('Sending interactive request...');
  const interactiveResponse = await mcpService.enqueue(
    interactiveRequest,
    'high'
  );
  console.log(`Response received (cache hit: ${interactiveResponse.cacheHit})`);
  console.log(
    `Content: ${interactiveResponse.response.rawResponse?.substring(0, 100)}...`
  );

  // 3. Send a very similar request to demonstrate caching
  console.log('\n3. Sending a similar request to demonstrate semantic caching');
  const similarRequest: AIRequest = {
    prompt: 'Describe how MCP helps optimize AI model interactions',
    systemPrompt:
      'You are a helpful AI assistant that specializes in explaining technical concepts clearly and concisely.',
    maxTokens: 300,
    temperature: 0.3,
    metadata: {
      type: 'interactive',
      complexity: 'medium',
    },
    mcpParams: {
      cacheStrategy: 'semantic',
      minSimilarity: 0.7,
      storeResult: true,
    },
  };

  console.log('Sending similar request...');
  const similarResponse = await mcpService.enqueue(similarRequest, 'high');
  console.log(`Response received (cache hit: ${similarResponse.cacheHit})`);

  if (similarResponse.cacheHit) {
    console.log(
      `Semantic similarity: ${similarResponse.similarity?.toFixed(2)}`
    );
    console.log(
      `Savings: ${
        similarResponse.savingsEstimate?.tokens
      } tokens, $${similarResponse.savingsEstimate?.cost.toFixed(5)}`
    );
  }

  // 4. Send a low-priority background task
  console.log('\n4. Sending a low-priority background task');
  const backgroundRequest: AIRequest = {
    prompt:
      'Generate a list of 5 best practices for using MCP in production applications',
    maxTokens: 400,
    temperature: 0.7,
    metadata: {
      type: 'background',
      complexity: 'low',
    },
  };

  console.log('Sending background request...');
  const backgroundResponse = await mcpService.enqueue(backgroundRequest, 'low');
  console.log(`Response received (cache hit: ${backgroundResponse.cacheHit})`);
  console.log(
    `Content: ${backgroundResponse.response.rawResponse?.substring(0, 100)}...`
  );

  // 5. Demonstrate smart model selection
  console.log('\n5. Demonstrating smart model selection');

  // Complex task that should select a more powerful model
  const complexRequest: AIRequest = {
    prompt:
      'Analyze the pros and cons of different caching strategies in distributed systems',
    maxTokens: 800,
    temperature: 0.3,
    metadata: {
      type: 'analysis',
      complexity: 'high',
      requiresReasoning: true,
    },
  };

  console.log('Sending complex request without specifying model...');
  const complexResponse = await mcpService.enqueue(complexRequest, 'normal');
  console.log(`Selected model: ${complexResponse.response.model}`);

  // Simple task that should select a faster, more cost-effective model
  const simpleRequest: AIRequest = {
    prompt: 'What is the purpose of a cache?',
    maxTokens: 100,
    temperature: 0.3,
    metadata: {
      type: 'factual',
      complexity: 'low',
    },
  };

  console.log('Sending simple request without specifying model...');
  const simpleResponse = await mcpService.enqueue(simpleRequest, 'normal');
  console.log(`Selected model: ${simpleResponse.response.model}`);

  // 6. Get MCP performance stats
  console.log('\n6. Getting MCP performance stats');
  const stats = await mcpService.getStats();
  console.log('MCP Stats:', JSON.stringify(stats, null, 2));
}

// Run the example
mcpExample().catch(console.error);
