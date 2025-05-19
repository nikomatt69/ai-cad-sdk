
import { aiCADCore } from './core';
import {
  aiCache,
  aiAnalytics,
  mcpService,
  mcpConfigManager,
  smartRouter,
  unifiedAIService,
} from './services';

// Export main SDK
export default aiCADCore;

// Export services
export {
  aiCADCore,
  aiCache,
  aiAnalytics,
  mcpService,
  mcpConfigManager,
  smartRouter,
  unifiedAIService,
};

// Export types
export * from './types';

// Export hooks (for React)
export * from './hooks';
