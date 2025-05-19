import { useState, useCallback } from 'react';
import { aiCADCore, GCodeOptimizationRequest, AIResponse } from '../';

/**
 * React hook for optimizing G-code
 */
export const useGCodeOptimization = () => {
  const [optimizedGCode, setOptimizedGCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<AIResponse<string> | null>(
    null
  );

  const optimizeGCode = useCallback(
    async (request: GCodeOptimizationRequest) => {
      setIsLoading(true);
      setError(null);

      try {
        const aiService = aiCADCore.getAIService();
        const response = await aiService.optimizeGCode(request);

        setLastResponse(response);

        if (response.success && response.data) {
          setOptimizedGCode(response.data);
          return response.data;
        } else {
          setError(response.error || 'Failed to optimize G-code');
          return '';
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        return '';
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    optimizedGCode,
    isLoading,
    error,
    optimizeGCode,
    lastResponse,
  };
};
