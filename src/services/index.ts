import { aiCache } from './cache/aiCache';
import { aiAnalytics } from './analytics/aiAnalytics';
import { mcpService } from './mcp/mcpService';
import { mcpConfigManager } from './mcp/mcpConfigManager';
import { smartRouter } from './mcp/smartRouter';
import { UnifiedAIService } from './ai/unifiedAIService';

// Create unified AI service instance
const unifiedAIService = new UnifiedAIService(mcpService);

// Export all services
export {
  aiCache,
  aiAnalytics,
  mcpService,
  mcpConfigManager,
  smartRouter,
  unifiedAIService,
};

// Export types
export * from '../types';
