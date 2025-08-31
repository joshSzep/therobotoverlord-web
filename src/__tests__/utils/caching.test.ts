import { createCache, withCache, apiCache } from '@/utils/caching'

// Mock localStorage and sessionStorage
const mockStorage = () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn()
})

Object.defineProperty(window, 'localStorage', { value: mockStorage() })
Object.defineProperty(window, 'sessionStorage', { value: mockStorage() })

describe('Caching Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    apiCache.clear()
  })

  describe('MemoryCache', () => {
    it('stores and retrieves data', () => {
      const cache = createCache('memory', { ttl: 1000, maxSize: 10 })
      
      cache.set('key1', 'value1')
      expect(cache.get('key1')).toBe('value1')
    })

    it('respects TTL expiration', async () => {
      const cache = createCache('memory', { ttl: 50, maxSize: 10 })
      
      cache.set('key1', 'value1')
      expect(cache.get('key1')).toBe('value1')
      
      // Wait for TTL to expire
      await new Promise(resolve => setTimeout(resolve, 100))
      expect(cache.get('key1')).toBeNull()
    })

    it('enforces max size limit', () => {
      const cache = createCache('memory', { ttl: 1000, maxSize: 2 })
      
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      cache.set('key3', 'value3') // Should evict key1
      
      expect(cache.get('key1')).toBeNull()
      expect(cache.get('key2')).toBe('value2')
      expect(cache.get('key3')).toBe('value3')
    })

    it('tracks hit counts', () => {
      const cache = createCache('memory', { ttl: 1000, maxSize: 10 })
      
      cache.set('key1', 'value1')
      cache.get('key1')
      cache.get('key1')
      
      const stats = cache.getStats()
      expect(stats.entries[0]?.hits).toBe(2)
    })

    it('deletes specific keys', () => {
      const cache = createCache('memory', { ttl: 1000, maxSize: 10 })
      
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      
      expect(cache.delete('key1')).toBe(true)
      expect(cache.get('key1')).toBeNull()
      expect(cache.get('key2')).toBe('value2')
    })

    it('clears all data', () => {
      const cache = createCache('memory', { ttl: 1000, maxSize: 10 })
      
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      cache.clear()
      
      expect(cache.get('key1')).toBeNull()
      expect(cache.get('key2')).toBeNull()
      expect(cache.size()).toBe(0)
    })
  })

  describe('withCache decorator', () => {
    it('caches function results', () => {
      const cache = createCache('memory', { ttl: 1000, maxSize: 10 })
      const mockFn = jest.fn().mockReturnValue('result')
      const cachedFn = withCache(mockFn, cache)
      
      // First call
      expect(cachedFn('arg1')).toBe('result')
      expect(mockFn).toHaveBeenCalledTimes(1)
      
      // Second call should use cache
      expect(cachedFn('arg1')).toBe('result')
      expect(mockFn).toHaveBeenCalledTimes(1)
      
      // Different args should call function again
      expect(cachedFn('arg2')).toBe('result')
      expect(mockFn).toHaveBeenCalledTimes(2)
    })

    it('handles async functions', async () => {
      const cache = createCache('memory', { ttl: 1000, maxSize: 10 })
      const mockAsyncFn = jest.fn().mockResolvedValue('async result')
      const cachedFn = withCache(mockAsyncFn, cache)
      
      // First call
      const result1 = await cachedFn('arg1')
      expect(result1).toBe('async result')
      expect(mockAsyncFn).toHaveBeenCalledTimes(1)
      
      // Second call should use cache
      const result2 = await cachedFn('arg1')
      expect(result2).toBe('async result')
      expect(mockAsyncFn).toHaveBeenCalledTimes(1)
    })

    it('uses custom key generator', () => {
      const cache = createCache('memory', { ttl: 1000, maxSize: 10 })
      const mockFn = jest.fn().mockReturnValue('result')
      const keyGen = jest.fn().mockReturnValue('custom-key')
      const cachedFn = withCache(mockFn, cache, keyGen)
      
      cachedFn('arg1', 'arg2')
      
      expect(keyGen).toHaveBeenCalledWith('arg1', 'arg2')
      expect(cache.has('custom-key')).toBe(true)
    })
  })

  describe('StorageCache', () => {
    it('uses localStorage correctly', () => {
      const mockGetItem = jest.fn()
      const mockSetItem = jest.fn()
      
      Object.defineProperty(window, 'localStorage', {
        value: { ...mockStorage(), getItem: mockGetItem, setItem: mockSetItem }
      })
      
      const cache = createCache('localStorage', { ttl: 1000, maxSize: 10 })
      
      // Mock successful storage
      mockGetItem.mockReturnValue(JSON.stringify({
        data: 'stored value',
        timestamp: Date.now(),
        ttl: 1000,
        hits: 0
      }))
      
      cache.set('key1', 'value1')
      expect(mockSetItem).toHaveBeenCalled()
      
      const result = cache.get('key1')
      expect(mockGetItem).toHaveBeenCalledWith('robot-overlord:key1')
    })

    it('handles storage errors gracefully', () => {
      const mockSetItem = jest.fn().mockImplementation(() => {
        throw new Error('Storage quota exceeded')
      })
      
      Object.defineProperty(window, 'localStorage', {
        value: { ...mockStorage(), setItem: mockSetItem }
      })
      
      const cache = createCache('localStorage', { ttl: 1000, maxSize: 10 })
      
      // Should not throw error
      expect(() => cache.set('key1', 'value1')).not.toThrow()
    })

    it('falls back to memory cache when storage unavailable', () => {
      // Simulate server-side environment
      const originalWindow = global.window
      delete (global as any).window
      
      const cache = createCache('localStorage', { ttl: 1000, maxSize: 10 })
      
      cache.set('key1', 'value1')
      expect(cache.get('key1')).toBe('value1')
      
      // Restore window
      global.window = originalWindow
    })
  })

  describe('Predefined caches', () => {
    it('apiCache works correctly', () => {
      apiCache.set('api-key', { data: 'api response' })
      expect(apiCache.get('api-key')).toEqual({ data: 'api response' })
    })

    it('different cache instances are isolated', () => {
      const cache1 = createCache('memory', { ttl: 1000, maxSize: 10 })
      const cache2 = createCache('memory', { ttl: 1000, maxSize: 10 })
      
      cache1.set('key1', 'value1')
      cache2.set('key1', 'value2')
      
      expect(cache1.get('key1')).toBe('value1')
      expect(cache2.get('key1')).toBe('value2')
    })
  })
})
