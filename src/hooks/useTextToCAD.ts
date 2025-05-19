import { useState, useCallback } from 'react';
import { aiCADCore, TextToCADRequest, Element, AIResponse } from '../';

/**
 * React hook for converting text to CAD elements
 */
export const useTextToCAD = () => {
  const [elements, setElements] = useState<Element[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<AIResponse<
    Element[]
  > | null>(null);

  const generateFromText = useCallback(async (request: TextToCADRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const aiService = aiCADCore.getAIService();
      const response = await aiService.textToCAD(request);

      setLastResponse(response);

      if (response.success && response.data) {
        setElements(response.data);
        return response.data;
      } else {
        setError(response.error || 'Failed to generate CAD elements');
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
  }, []);

  return {
    elements,
    isLoading,
    error,
    generateFromText,
    lastResponse,
  };
};
