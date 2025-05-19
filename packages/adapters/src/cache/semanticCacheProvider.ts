import { AIResponse } from "./AITypes";



/**
 * Interface for semantic cache hit result
 */
export interface SemanticCacheResult<T = any> {
  response: AIResponse<T>;
  similarity: number;
  cacheKey: string;
}

/**
 * Interface for semantic cache provider
 */
export interface ISemanticCacheProvider {
  /**
   * Find similar cached responses based on semantic similarity
   */
  findSimilar(
    query: string,
    options: {
      model?: string;
      systemPrompt?: string;
      minSimilarity: number;
    }
  ): Promise<SemanticCacheResult | null>;

  /**
   * Store a response in the semantic cache
   */
  store(
    query: string,
    response: AIResponse<any>,
    options: {
      model?: string;
      systemPrompt?: string;
      ttl: number;
    }
  ): Promise<string>;

  /**
   * Clear the semantic cache
   */
  clear(): Promise<void>;

  /**
   * Get statistics about the semantic cache
   */
  getStats(): Promise<{
    totalEmbeddings: number;
    totalCacheEntries: number;
    memoryUsageBytes: number;
  }>;
}

/**
 * Basic implementation of a semantic cache provider
 * Uses a simple vector similarity approach
 */
export class BasicSemanticCacheProvider implements ISemanticCacheProvider {
  private cache: Map<
    string,
    {
      embedding: number[];
      response: AIResponse<any>;
      expiresAt: number;
      query: string;
      systemPrompt?: string;
      model?: string;
    }
  > = new Map();

  /**
   * Simple embedding function (for demo purposes)
   * In production, you would use a proper embedding model API
   */
  private async getEmbedding(text: string): Promise<number[]> {
    // This is a very basic embedding function for demonstration
    // Real implementation would call an embedding API
    const embedding: number[] = [];
    const words = text.toLowerCase().split(/\s+/);

    // Create a simple bag-of-words style embedding
    // This is NOT a production-ready embedding method
    const uniqueWords = Array.from(new Set(words));

    // Generate a vector of 128 dimensions as a simple hash-based embedding
    for (let i = 0; i < 128; i++) {
      let sum = 0;
      for (const word of uniqueWords) {
        // Use character codes for a simple hash
        const hash = this.simpleHash(word, i);
        sum += hash;
      }
      embedding.push(sum / 100);
    }

    // Normalize the embedding
    const magnitude = Math.sqrt(
      embedding.reduce((sum, val) => sum + val * val, 0)
    );
    return embedding.map((val) => val / magnitude);
  }

  /**
   * Simple hash function for demonstration
   */
  private simpleHash(str: string, seed: number): number {
    let hash = seed;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash = hash & hash; // Convert to 32-bit int
    }
    return hash;
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
      throw new Error('Vectors must have the same dimensions');
    }

    let dotProduct = 0;
    let magA = 0;
    let magB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      magA += vecA[i] * vecA[i];
      magB += vecB[i] * vecB[i];
    }

    magA = Math.sqrt(magA);
    magB = Math.sqrt(magB);

    if (magA === 0 || magB === 0) {
      return 0;
    }

    return dotProduct / (magA * magB);
  }

  /**
   * Find similar responses in the cache using semantic similarity
   */
  async findSimilar(
    query: string,
    options: {
      model?: string;
      systemPrompt?: string;
      minSimilarity: number;
    }
  ): Promise<SemanticCacheResult | null> {
    // Get embedding for the query
    const queryEmbedding = await this.getEmbedding(query);

    let highestSimilarity = -1;
    let bestMatch: SemanticCacheResult | null = null;
    const now = Date.now();

    // Clean up expired entries
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt < now) {
        this.cache.delete(key);
        continue;
      }

      // Skip if model doesn't match (if specified)
      if (options.model && entry.model && entry.model !== options.model) {
        continue;
      }

      // Calculate similarity
      const similarity = this.cosineSimilarity(queryEmbedding, entry.embedding);

      if (
        similarity > highestSimilarity &&
        similarity >= options.minSimilarity
      ) {
        highestSimilarity = similarity;

        bestMatch = {
          response: entry.response,
          similarity,
          cacheKey: key,
        };
      }
    }

    return bestMatch;
  }

  /**
   * Store a response in the semantic cache
   */
  async store(
    query: string,
    response: AIResponse<any>,
    options: {
      model?: string;
      systemPrompt?: string;
      ttl: number;
    }
  ): Promise<string> {
    const embedding = await this.getEmbedding(query);
    const cacheKey = `semantic:${Date.now()}:${this.simpleHash(query, 0)}`;

    this.cache.set(cacheKey, {
      embedding,
      response,
      query,
      systemPrompt: options.systemPrompt,
      model: options.model,
      expiresAt: Date.now() + options.ttl,
    });

    return cacheKey;
  }

  /**
   * Clear the semantic cache
   */
  async clear(): Promise<void> {
    this.cache.clear();
  }

  /**
   * Get statistics about the semantic cache
   */
  async getStats(): Promise<{
    totalEmbeddings: number;
    totalCacheEntries: number;
    memoryUsageBytes: number;
  }> {
    // Rough estimation of memory usage
    let memoryUsageBytes = 0;

    this.cache.forEach((entry) => {
      // Each number in embedding is 8 bytes (64-bit float)
      memoryUsageBytes += entry.embedding.length * 8;

      // Rough estimation for response size
      memoryUsageBytes += JSON.stringify(entry.response).length * 2;

      // String memory
      memoryUsageBytes += entry.query.length * 2;
      memoryUsageBytes += (entry.systemPrompt?.length || 0) * 2;
      memoryUsageBytes += (entry.model?.length || 0) * 2;

      // Other overhead
      memoryUsageBytes += 100;
    });

    return {
      totalEmbeddings: this.cache.size,
      totalCacheEntries: this.cache.size,
      memoryUsageBytes,
    };
  }
}

/**
 * Factory function to create a semantic cache provider
 */
export function createSemanticCacheProvider(): ISemanticCacheProvider {
  return new BasicSemanticCacheProvider();
}
