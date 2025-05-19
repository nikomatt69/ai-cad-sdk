/**
 * Interface for cached items
 */
interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  hash: string;
}

/**
 * Cache options
 */
interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of items in cache
  storageKey?: string; // Key for localStorage (if persistence enabled)
  persistToDisk?: boolean; // Enable persistence to localStorage
}

/**
 * AI caching service
 * Supports in-memory storage and optional persistence to localStorage
 */
export class AICache {
  private cache: Map<string, CacheItem<any>> = new Map();
  private options: Required<CacheOptions>;

  constructor(options: CacheOptions = {}) {
    this.options = {
      ttl: options.ttl || 1000 * 60 * 30, // 30 minutes default
      maxSize: options.maxSize || 100, // 100 items default
      storageKey: options.storageKey || 'ai_cache',
      persistToDisk: options.persistToDisk || false,
    };

    // Load cache from localStorage if persistence is enabled
    if (this.options.persistToDisk) {
      this.loadFromStorage();
    }

    // Set up periodic cache cleaning
    if (typeof window !== 'undefined') {
      setInterval(() => this.clearExpired(), 1000 * 60 * 5); // Every 5 minutes
    }
  }

  /**
   * Generate a cache key from a request payload
   */
  getKeyForRequest(payload: any): string {
    try {
      const payloadString = JSON.stringify(payload);

      // Create a hash from the payload string
      const hash = this.hashString(payloadString);

      // Return the formatted key
      return `cache-${hash}`;
    } catch (error) {
      console.error('Error generating cache key:', error, 'Payload:', payload);
      // Handle error, e.g., return an invalid key to avoid caching
      return `cache-error-${Date.now()}-${Math.random()}`;
    }
  }

  /**
   * Get an item from the cache if it exists and isn't expired
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key);

    if (!item) return null;

    const now = Date.now();

    // Check if the item is expired
    if (now > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  /**
   * Store an item in the cache
   */
  set<T>(key: string, data: T, customTtl?: number): void {
    const now = Date.now();
    const ttl = customTtl || this.options.ttl;

    // Ensure we don't exceed maximum size
    if (this.cache.size >= this.options.maxSize) {
      // Remove oldest or expired item
      this.removeOldestItem();
    }

    // Create new cache item
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: now,
      expiresAt: now + ttl,
      hash: key,
    };

    // Store the item
    this.cache.set(key, cacheItem);

    // Save cache if persistence is enabled
    if (this.options.persistToDisk) {
      this.saveToStorage();
    }
  }

  /**
   * Check if a key exists and isn't expired
   */
  has(key: string): boolean {
    const item = this.cache.get(key);

    if (!item) return false;

    // Check if the item is expired
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Clear all items from the cache
   */
  clear(): void {
    this.cache.clear();

    if (this.options.persistToDisk && typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.options.storageKey);
    }
  }

  /**
   * Clear expired items from the cache
   */
  clearExpired(): void {
    const now = Date.now();
    let expired = 0;

    this.cache.forEach((item, key) => {
      if (now > item.expiresAt) {
        this.cache.delete(key);
        expired++;
      }
    });

    // Save if items were deleted and persistence is enabled
    if (expired > 0 && this.options.persistToDisk) {
      this.saveToStorage();
    }
  }

  /**
   * Set the default time-to-live
   */
  setTTL(ttl: number): void {
    this.options.ttl = ttl;
  }

  /**
   * Set the maximum cache size
   */
  setMaxSize(maxSize: number): void {
    this.options.maxSize = maxSize;

    // If the cache is already larger than the new size, remove oldest items
    while (this.cache.size > maxSize) {
      this.removeOldestItem();
    }
  }

  /**
   * Enable/disable persistence to localStorage
   */
  setPersistence(enable: boolean): void {
    this.options.persistToDisk = enable;

    if (enable) {
      this.saveToStorage();
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): Record<string, any> {
    const now = Date.now();
    const total = this.cache.size;
    let expired = 0;
    let averageAge = 0;

    this.cache.forEach((item) => {
      if (now > item.expiresAt) {
        expired++;
      }
      averageAge += now - item.timestamp;
    });

    averageAge = total > 0 ? averageAge / total : 0;

    return {
      totalItems: total,
      expiredItems: expired,
      averageAge: averageAge / 1000, // in seconds
      maxSize: this.options.maxSize,
      ttl: this.options.ttl / 1000, // in seconds
      memoryUsage: this.estimateMemoryUsage(),
    };
  }

  /**
   * Remove the oldest item from the cache
   */
  private removeOldestItem(): void {
    let oldestKey: string | null = null;
    let oldestTimestamp = Date.now();

    this.cache.forEach((item, key) => {
      if (item.timestamp < oldestTimestamp) {
        oldestTimestamp = item.timestamp;
        oldestKey = key;
      }
    });

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Estimate the memory usage of the cache
   */
  private estimateMemoryUsage(): number {
    let totalBytes = 0;

    this.cache.forEach((item) => {
      // Approximate estimation of each item's size
      // Base overhead for the object
      let itemSize = 200;

      // Add the size of the data
      const dataStr = JSON.stringify(item.data);
      itemSize += dataStr.length * 2; // UTF-16 = 2 bytes per character

      totalBytes += itemSize;
    });

    return totalBytes;
  }

  /**
   * Save the cache to localStorage
   */
  private saveToStorage(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    try {
      // Filter non-expired items
      const now = Date.now();
      const serializable: Record<string, CacheItem<any>> = {};

      this.cache.forEach((item, key) => {
        if (now <= item.expiresAt) {
          serializable[key] = item;
        }
      });

      localStorage.setItem(
        this.options.storageKey,
        JSON.stringify(serializable)
      );
    } catch (error) {
      console.error('Failed to save AI cache to localStorage:', error);
    }
  }

  /**
   * Load the cache from localStorage
   */
  private loadFromStorage(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    try {
      const cached = localStorage.getItem(this.options.storageKey);

      if (cached) {
        const items = JSON.parse(cached) as Record<string, CacheItem<any>>;
        const now = Date.now();

        Object.entries(items).forEach(([key, item]) => {
          // Only load non-expired items
          if (now <= item.expiresAt) {
            this.cache.set(key, item);
          }
        });
      }
    } catch (error) {
      console.error('Failed to load AI cache from localStorage:', error);
    }
  }

  /**
   * Create a hash from a string
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit int
    }
    return Math.abs(hash).toString(16);
  }
}

// Export a singleton instance
export const aiCache = new AICache({
  ttl: 1000 * 60 * 60, // 1 hour
  maxSize: 50,
  persistToDisk: true,
});
