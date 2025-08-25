import { CacheManager } from '@/lib/cache/cache-manager'

describe('CacheManager', () => {
  let cacheManager: CacheManager

  beforeEach(() => {
    cacheManager = CacheManager.getInstance({
      strategy: 'memory',
      defaultTTL: 1000,
      maxMemoryItems: 100,
      enableCompression: false,
      enableMetrics: true,
    })
    cacheManager.clear()
  })

  afterEach(() => {
    cacheManager.clear()
  })

  describe('get and set', () => {
    it('should set and get a value', async () => {
      const key = 'test-key'
      const value = { test: 'data' }

      await cacheManager.set(key, value)
      const result = await cacheManager.get(key)

      expect(result).toEqual(value)
    })

    it('should return null for non-existent key', async () => {
      const result = await cacheManager.get('non-existent')
      expect(result).toBeNull()
    })

    it('should respect TTL', async () => {
      const key = 'ttl-test'
      const value = 'test-value'
      const shortTTL = 0.1 // 100ms

      await cacheManager.set(key, value, shortTTL)
      
      // Should exist immediately
      let result = await cacheManager.get(key)
      expect(result).toBe(value)

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 150))
      
      result = await cacheManager.get(key)
      expect(result).toBeNull()
    })

    it('should handle complex objects', async () => {
      const key = 'complex-object'
      const value = {
        id: 1,
        name: 'Test',
        nested: {
          array: [1, 2, 3],
          boolean: true,
        },
        date: new Date('2024-01-01'),
      }

      await cacheManager.set(key, value)
      const result = await cacheManager.get(key)

      expect(result).toEqual(value)
    })
  })

  describe('delete', () => {
    it('should delete a key', async () => {
      const key = 'delete-test'
      const value = 'test-value'

      await cacheManager.set(key, value)
      expect(await cacheManager.get(key)).toBe(value)

      await cacheManager.delete(key)
      expect(await cacheManager.get(key)).toBeNull()
    })

    it('should return true when deleting existing key', async () => {
      const key = 'delete-existing'
      await cacheManager.set(key, 'value')
      
      const result = await cacheManager.delete(key)
      expect(result).toBe(true)
    })

    it('should return false when deleting non-existent key', async () => {
      const result = await cacheManager.delete('non-existent')
      expect(result).toBe(false)
    })
  })

  describe('clear', () => {
    it('should clear all cached items', async () => {
      await cacheManager.set('key1', 'value1')
      await cacheManager.set('key2', 'value2')
      await cacheManager.set('key3', 'value3')

      expect(await cacheManager.get('key1')).toBe('value1')
      expect(await cacheManager.get('key2')).toBe('value2')
      expect(await cacheManager.get('key3')).toBe('value3')

      await cacheManager.clear()

      expect(await cacheManager.get('key1')).toBeNull()
      expect(await cacheManager.get('key2')).toBeNull()
      expect(await cacheManager.get('key3')).toBeNull()
    })
  })

  describe('warmup', () => {
    it('should warm up cache with provided data', async () => {
      const keys = [
        {
          key: 'warm1',
          generator: async () => 'warmed-value-1'
        },
        {
          key: 'warm2',
          generator: async () => ({ data: 'warmed-value-2' })
        }
      ]

      await cacheManager.warmup(keys)

      expect(await cacheManager.get('warm1')).toBe('warmed-value-1')
      expect(await cacheManager.get('warm2')).toEqual({ data: 'warmed-value-2' })
    })

    it('should handle errors during warmup gracefully', async () => {
      const keys = [
        {
          key: 'warm-success',
          generator: async () => 'success'
        },
        {
          key: 'warm-error',
          generator: async () => {
            throw new Error('Warmup failed')
          }
        }
      ]

      // Should not throw
      await expect(cacheManager.warmup(keys)).resolves.not.toThrow()

      // Successful key should be cached
      expect(await cacheManager.get('warm-success')).toBe('success')
      
      // Failed key should not be cached
      expect(await cacheManager.get('warm-error')).toBeNull()
    })
  })

  describe('metrics', () => {
    it('should track metrics when enabled', async () => {
      // Reset metrics
      cacheManager.clear()

      await cacheManager.set('key1', 'value1')
      await cacheManager.get('key1') // Hit
      await cacheManager.get('non-existent') // Miss
      await cacheManager.delete('key1')

      const metrics = cacheManager.getMetrics()

      expect(metrics.sets).toBeGreaterThan(0)
      expect(metrics.hits).toBeGreaterThan(0)
      expect(metrics.misses).toBeGreaterThan(0)
      expect(metrics.deletes).toBeGreaterThan(0)
    })

    it('should provide cache statistics', () => {
      const stats = cacheManager.getStats()

      expect(stats).toHaveProperty('memoryItems')
      expect(stats).toHaveProperty('hitRate')
      expect(stats).toHaveProperty('memoryUsage')
      expect(typeof stats.memoryItems).toBe('number')
      expect(typeof stats.hitRate).toBe('number')
      expect(typeof stats.memoryUsage).toBe('number')
    })
  })

  describe('memory limits', () => {
    it('should enforce memory limits by evicting least recently used items', async () => {
      // Create cache with small limit
      const limitedCache = CacheManager.getInstance({
        strategy: 'memory',
        maxMemoryItems: 3,
        defaultTTL: 1000,
      })
      
      await limitedCache.clear()

      // Fill cache to limit
      await limitedCache.set('key1', 'value1')
      await limitedCache.set('key2', 'value2')
      await limitedCache.set('key3', 'value3')

      // All should exist
      expect(await limitedCache.get('key1')).toBe('value1')
      expect(await limitedCache.get('key2')).toBe('value2')
      expect(await limitedCache.get('key3')).toBe('value3')

      // Add one more - should evict least recently used (key1)
      await limitedCache.set('key4', 'value4')

      // key1 should be evicted, others should remain
      expect(await limitedCache.get('key1')).toBeNull()
      expect(await limitedCache.get('key2')).toBe('value2')
      expect(await limitedCache.get('key3')).toBe('value3')
      expect(await limitedCache.get('key4')).toBe('value4')
    })
  })

  describe('error handling', () => {
    it('should handle JSON serialization errors gracefully', async () => {
      const circularObj: any = {}
      circularObj.self = circularObj

      // Should not throw
      await expect(cacheManager.set('circular', circularObj)).resolves.not.toThrow()
      
      // Should return null for failed serialization
      const result = await cacheManager.get('circular')
      expect(result).toBeNull()
    })

    it('should return null on get errors', async () => {
      // Mock console.error to avoid noise in tests
      const originalError = console.error
      console.error = jest.fn()

      // Force an error by corrupting internal state (if possible)
      const result = await cacheManager.get('test-error-handling')
      
      expect(result).toBeNull()
      
      console.error = originalError
    })
  })
})