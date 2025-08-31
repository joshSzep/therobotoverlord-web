"use client";

import React from "react";

// Cache configuration
interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  maxSize: number; // Maximum number of items
  staleWhileRevalidate?: boolean;
}

// Cache entry interface
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  hits: number;
}

// In-memory cache implementation
class MemoryCache<T = unknown> {
  private cache = new Map<string, CacheEntry<T>>();
  private config: CacheConfig;

  constructor(config: CacheConfig) {
    this.config = config;
  }

  set(key: string, data: T, customTtl?: number): void {
    const ttl = customTtl || this.config.ttl;

    // Remove oldest entries if cache is full
    if (this.cache.size >= this.config.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
      hits: 0,
    });
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) return null;

    const now = Date.now();
    const isExpired = now - entry.timestamp > entry.ttl;

    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    // Update hit count
    entry.hits++;
    return entry.data;
  }

  has(key: string): boolean {
    return this.cache.has(key) && this.get(key) !== null;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  getStats(): {
    size: number;
    hitRate: number;
    entries: Array<{ key: string; hits: number; age: number }>;
  } {
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      hits: entry.hits,
      age: Date.now() - entry.timestamp,
    }));

    const totalHits = entries.reduce((sum, entry) => sum + entry.hits, 0);
    const hitRate = entries.length > 0 ? totalHits / entries.length : 0;

    return {
      size: this.cache.size,
      hitRate,
      entries,
    };
  }
}

// Browser storage cache implementation
class StorageCache<T = unknown> {
  private storage: Storage;
  private prefix: string;
  private config: CacheConfig;

  constructor(storage: Storage, prefix: string, config: CacheConfig) {
    this.storage = storage;
    this.prefix = prefix;
    this.config = config;
  }

  private getKey(key: string): string {
    return `${this.prefix}:${key}`;
  }

  set(key: string, data: T, customTtl?: number): void {
    const ttl = customTtl || this.config.ttl;
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      hits: 0,
    };

    try {
      this.storage.setItem(this.getKey(key), JSON.stringify(entry));
    } catch {
      // Handle storage quota exceeded
      console.warn("Cache storage full, clearing old entries");
      this.cleanup();
      try {
        this.storage.setItem(this.getKey(key), JSON.stringify(entry));
      } catch {
        console.error("Unable to cache data");
      }
    }
  }

  get(key: string): T | null {
    try {
      const item = this.storage.getItem(this.getKey(key));
      if (!item) return null;

      const entry: CacheEntry<T> = JSON.parse(item);
      const now = Date.now();
      const isExpired = now - entry.timestamp > entry.ttl;

      if (isExpired) {
        this.storage.removeItem(this.getKey(key));
        return null;
      }

      // Update hit count
      entry.hits++;
      this.storage.setItem(this.getKey(key), JSON.stringify(entry));

      return entry.data;
    } catch {
      return null;
    }
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): boolean {
    this.storage.removeItem(this.getKey(key));
    return true;
  }

  clear(): void {
    const keys = Object.keys(this.storage).filter((key) =>
      key.startsWith(this.prefix)
    );
    keys.forEach((key) => this.storage.removeItem(key));
  }

  size(): number {
    return Object.keys(this.storage).filter((key) =>
      key.startsWith(this.prefix)
    ).length;
  }

  getStats(): {
    size: number;
    hitRate: number;
    entries: Array<{ key: string; hits: number; age: number }>;
  } {
    const keys = Object.keys(this.storage).filter((key) =>
      key.startsWith(this.prefix)
    );
    const entries = keys
      .map((key) => {
        try {
          const item = this.storage.getItem(key);
          const entry = item ? JSON.parse(item) : null;
          if (entry) {
            return {
              key: key.replace(this.prefix, ""),
              hits: entry.hits || 0,
              age: Date.now() - entry.timestamp,
            };
          }
          return null;
        } catch {
          return null;
        }
      })
      .filter((entry) => entry !== null) as Array<{
      key: string;
      hits: number;
      age: number;
    }>;

    const totalHits = entries.reduce((sum, entry) => sum + entry.hits, 0);
    const hitRate = entries.length > 0 ? totalHits / entries.length : 0;

    return {
      size: keys.length,
      hitRate,
      entries,
    };
  }

  private cleanup(): void {
    const keys = Object.keys(this.storage).filter((key) =>
      key.startsWith(this.prefix)
    );
    const entries = keys
      .map((key) => {
        try {
          const item = this.storage.getItem(key);
          const entry = item ? JSON.parse(item) : null;
          return { key, entry };
        } catch {
          return { key, entry: null };
        }
      })
      .filter(({ entry }) => entry !== null);

    // Remove expired entries first
    const now = Date.now();
    entries.forEach(({ key, entry }) => {
      if (entry && now - entry.timestamp > entry.ttl) {
        this.storage.removeItem(key);
      }
    });

    // If still over limit, remove least recently used
    const remainingKeys = Object.keys(this.storage).filter((key) =>
      key.startsWith(this.prefix)
    );
    if (remainingKeys.length > this.config.maxSize) {
      const sortedEntries = entries
        .filter(({ key }) => remainingKeys.includes(key))
        .sort((a, b) => (a.entry?.hits || 0) - (b.entry?.hits || 0));

      const toRemove = sortedEntries.slice(
        0,
        remainingKeys.length - this.config.maxSize
      );
      toRemove.forEach(({ key }) => this.storage.removeItem(key));
    }
  }
}

// Cache factory
export const createCache = <T = unknown>(
  type: "memory" | "localStorage" | "sessionStorage",
  config: CacheConfig,
  prefix = "robot-overlord"
) => {
  switch (type) {
    case "memory":
      return new MemoryCache<T>(config);
    case "localStorage":
      if (typeof window !== "undefined") {
        return new StorageCache<T>(localStorage, prefix, config);
      }
      return new MemoryCache<T>(config);
    case "sessionStorage":
      if (typeof window !== "undefined") {
        return new StorageCache<T>(sessionStorage, prefix, config);
      }
      return new MemoryCache<T>(config);
    default:
      return new MemoryCache<T>(config);
  }
};

// Predefined caches for different use cases
export const apiCache = createCache("memory", {
  ttl: 5 * 60 * 1000, // 5 minutes
  maxSize: 100,
  staleWhileRevalidate: true,
});

export const userDataCache = createCache("localStorage", {
  ttl: 30 * 60 * 1000, // 30 minutes
  maxSize: 50,
});

export const sessionCache = createCache("sessionStorage", {
  ttl: 60 * 60 * 1000, // 1 hour
  maxSize: 200,
});

export const staticDataCache = createCache("localStorage", {
  ttl: 24 * 60 * 60 * 1000, // 24 hours
  maxSize: 20,
});

// Cache decorator for functions
export const withCache = <T extends (...args: unknown[]) => unknown>(
  fn: T,
  cache: MemoryCache | StorageCache,
  keyGenerator?: (...args: Parameters<T>) => string
): T => {
  return ((...args: Parameters<T>) => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);

    // Try to get from cache first
    const cached = cache.get(key);
    if (cached !== null) {
      return cached;
    }

    // Execute function and cache result
    const result = fn(...args);

    // Handle promises
    if (result instanceof Promise) {
      return result.then((data) => {
        cache.set(key, data);
        return data;
      });
    }

    cache.set(key, result);
    return result;
  }) as T;
};

// React hook for caching
export const useCache = <T>(
  key: string,
  fetcher: () => Promise<T> | T,
  options: {
    cache?: MemoryCache<T> | StorageCache<T>;
    ttl?: number;
    enabled?: boolean;
  } = {}
) => {
  const { cache = apiCache, ttl, enabled = true } = options;

  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (!enabled) return;

    const fetchData = async () => {
      // Try cache first
      const cached = cache.get(key);
      if (cached !== null && cached !== undefined) {
        setData(cached as T);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await fetcher();
        cache.set(key, result, ttl);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [key, enabled, cache, ttl, fetcher]);

  const invalidate = React.useCallback(() => {
    cache.delete(key);
    setData(null);
  }, [cache, key]);

  const refresh = React.useCallback(async () => {
    cache.delete(key);
    setLoading(true);
    setError(null);

    try {
      const result = await fetcher();
      cache.set(key, result, ttl);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setLoading(false);
    }
  }, [cache, key, fetcher, ttl]);

  return {
    data,
    loading,
    error,
    invalidate,
    refresh,
  };
};

// Service Worker cache strategies (for production)
export const registerServiceWorker = () => {
  if (typeof window !== "undefined" && "serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("SW registered: ", registration);
        })
        .catch((registrationError) => {
          console.log("SW registration failed: ", registrationError);
        });
    });
  }
};

const cacheUtils = {
  createCache,
  withCache,
  useCache,
  apiCache,
  userDataCache,
  sessionCache,
  staticDataCache,
  registerServiceWorker,
};

export default cacheUtils;
