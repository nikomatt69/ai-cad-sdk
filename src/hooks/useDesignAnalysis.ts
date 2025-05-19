import { useState, useCallback } from 'react';
import {
  aiCADCore,
  AIDesignSuggestion,
  DesignAnalysisRequest,
  AIResponse,
  Element,
} from '../';

/**
 * React hook for analyzing CAD designs and getting suggestions
 */
export const useDesignAnalysis = () => {
  const [suggestions, setSuggestions] = useState<AIDesignSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<AIResponse<
    AIDesignSuggestion[]
  > | null>(null);

  const analyzeDesign = useCallback(
    async (
      elements: Element[],
      options?: Omit<DesignAnalysisRequest, 'elements'>
    ) => {
      setIsLoading(true);
      setError(null);

      try {
        const aiService = aiCADCore.getAIService();

        const request: DesignAnalysisRequest = {
          elements,
          ...options,
          analysisType: options?.analysisType || 'comprehensive',
        };

        const response = await aiService.analyzeDesign(request);

        setLastResponse(response);

        if (response.success && response.data) {
          setSuggestions(response.data);
          return response.data;
        } else {
          setError(response.error || 'Failed to analyze design');
          return [];
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    suggestions,
    isLoading,
    error,
    analyzeDesign,
    lastResponse,
  };
};
