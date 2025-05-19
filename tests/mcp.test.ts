import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mcpService, mcpConfigManager, smartRouter } from '../src/services';
import { AIRequest } from '../src/types';
import { aiCADCore } from '../src/core';

// Mock fetch
global.fetch = vi.fn();

describe('MCP System', () => {
  beforeEach(() => {
    vi.resetAllMocks();

    // Mock successful API response
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({
        content: [{ type: 'text', text: 'This is a test response' }],
        usage: {
          input_tokens: 100,
          output_tokens: 50,
        },
      }),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should enqueue and process a request', async () => {
    const request: AIRequest = {
      prompt: 'Test prompt',
      model: 'claude-3-7-sonnet-20250219',
      temperature: 0.5,
    };
    const aiService = aiCADCore.getAIService();
    const response = await aiService.processRequest(request);

    expect(response).toBeDefined();
    expect(response.data).toBe('This is a test response');
    expect(response.success).toBe(true);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('should prioritize requests correctly', async () => {
    // Create a high priority request
    const highPriorityRequest: AIRequest = {
      prompt: 'High priority',
      model: 'claude-3-7-sonnet-20250219',
      metadata: { type: 'interactive' },
    };

    // Create a low priority request
    const lowPriorityRequest: AIRequest = {
      prompt: 'Low priority',
      model: 'claude-3-7-sonnet-20250219',
      metadata: { type: 'background' },
    };

    // Queue both requests
    const [highResponse, lowResponse] = await Promise.all([
      mcpService.enqueue(highPriorityRequest, 'high'),
      mcpService.enqueue(lowPriorityRequest, 'low'),
    ]);

    // Both should be processed
    expect(highResponse).toBeDefined();
    expect(lowResponse).toBeDefined();
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('should select appropriate model based on task complexity', () => {
    // Test with different complexity levels
    const lowComplexityModel = mcpConfigManager.getRecommendedModel(
      'general',
      'low'
    );
    const mediumComplexityModel = mcpConfigManager.getRecommendedModel(
      'general',
      'medium'
    );
    const highComplexityModel = mcpConfigManager.getRecommendedModel(
      'general',
      'high'
    );

    // Higher complexity should select more powerful models
    expect(
      smartRouter.getModelMetadata(lowComplexityModel)?.capabilities.reasoning
    ).toBeLessThanOrEqual(
      smartRouter.getModelMetadata(mediumComplexityModel)?.capabilities
        .reasoning || 0
    );

    expect(
      smartRouter.getModelMetadata(mediumComplexityModel)?.capabilities
        .reasoning
    ).toBeLessThanOrEqual(
      smartRouter.getModelMetadata(highComplexityModel)?.capabilities
        .reasoning || 0
    );
  });

  it('should handle different strategy configurations', () => {
    // Test with different strategies
    mcpConfigManager.setStrategy('aggressive');
    const aggressiveParams = mcpConfigManager.getMCPParams();

    mcpConfigManager.setStrategy('balanced');
    const balancedParams = mcpConfigManager.getMCPParams();

    mcpConfigManager.setStrategy('conservative');
    const conservativeParams = mcpConfigManager.getMCPParams();

    // Aggressive should have lowest similarity threshold
    expect(aggressiveParams.minSimilarity).toBeLessThan(
      balancedParams.minSimilarity || 0
    );
    expect(balancedParams.minSimilarity).toBeLessThan(
      conservativeParams.minSimilarity || 0
    );

    // Conservative should use exact matching
    expect(conservativeParams.cacheStrategy).toBe('exact');
  });

  it('should handle multi-provider configuration', () => {
    // Enable multi-provider support
    mcpConfigManager.setMultiProviderEnabled(true);
    expect(mcpConfigManager.isMultiProviderEnabled()).toBe(true);

    // Set preferred provider
    mcpConfigManager.setPreferredProvider('CLAUDE');
    expect(mcpConfigManager.getPreferredProvider()).toBe('CLAUDE');

    // Check if it's reflected in MCP params
    const params = mcpConfigManager.getMCPParams();
    expect(params.multiProviderEnabled).toBe(true);
    expect(params.preferredProvider).toBe('CLAUDE');
  });
});
