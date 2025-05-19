import { useState, useCallback } from 'react';
import { aiCADCore } from '../';

/**
 * React hook for getting AI suggestions based on current context
 */
export const useAISuggestions = (
  mode: 'cad' | 'cam' | 'gcode' | 'toolpath' | 'general' = 'general'
) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentContext, setCurrentContext] = useState<string>('');

  const generateSuggestions = useCallback(
    async (context: string) => {
      setIsLoading(true);
      setError(null);
      setCurrentContext(context);

      try {
        const aiService = aiCADCore.getAIService();
        const response = await aiService.generateSuggestions(context, mode);

        if (response.success && response.data) {
          setSuggestions(response.data);
          return response.data;
        } else {
          setError(response.error || 'Failed to generate suggestions');
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
    [mode]
  );

  return {
    suggestions,
    isLoading,
    error,
    generateSuggestions,
    currentContext,
  };
};
