import { logger } from '../logger'

export type CacheStrategy = 'memory' | 'database' | 'hybrid'  // Removed redis for Vercel compatibility

export interface CacheConfig {
  strategy: CacheStrategy
  defaultTTL: number // in seconds
  maxMemoryItems: number
  enableCompression: boolean
  enableMetrics: boolean
}

export interface CacheMetrics {
  hits: number
  misses: number
  sets: number
  deletes: number
  evictions: number
  memory_usage: number
}

export interface CacheItem<T = any> {
  key: string
  value: T
  ttl: number
  createdAt: Date
  lastAccessed: Date
  accessCount: number
  compressed: boolean
  size: number
}

export class CacheManager {
  private static instance: CacheManager
  private memoryCache = new Map<string, CacheItem>()
  private config: CacheConfig
  private metrics: CacheMetrics = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    evictions: 0,
    memory_usage: 0
  }
  private cleanupInterval?: NodeJS.Timeout

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      strategy: 'memory',  // Default to memory-only for Vercel compatibility
      defaultTTL: 3600, // 1 hour
      maxMemoryItems: 1000,
      enableCompression: true,
      enableMetrics: true,
      ...config
    }

    // Note: No background cleanup process for serverless compatibility
  }

  static getInstance(config?: Partial<CacheConfig>): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager(config)
    }
    return CacheManager.instance
  }

  async get<T = any>(key: string): Promise<T | null> {
    try {
      // Try memory cache first
      const memoryItem = this.getFromMemory<T>(key)
      if (memoryItem !== null) {
        this.recordMetric('hits')
        return memoryItem
      }

      // Note: Redis caching removed for Vercel serverless compatibility

      this.recordMetric('misses')
      return null
    } catch (error) {
      logger.error('Cache get operation failed', { key, error })
      return null
    }
  }

  async set<T = any>(
    key: string, 
    value: T, 
    ttl: number = this.config.defaultTTL
  ): Promise<boolean> {
    try {
      // Simplified for Vercel serverless - memory-only caching
      const success = await this.setInMemory(key, value, ttl)

      this.recordMetric('sets')
      return success
    } catch (error) {
      logger.error('Cache set operation failed', { key, error })
      return false
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      // Simplified for Vercel serverless - memory-only caching
      const result = this.deleteFromMemory(key)

      this.recordMetric('deletes')
      return result
    } catch (error) {
      logger.error('Cache delete operation failed', { key, error })
      return false
    }
  }

  async clear(): Promise<boolean> {
    try {
      // Simplified for Vercel serverless - memory-only caching
      this.memoryCache.clear()

      this.resetMetrics()
      logger.info('Cache cleared successfully (memory-only)')
      return true
    } catch (error) {
      logger.error('Cache clear operation failed', error)
      return false
    }
  }

  async warmup(keys: Array<{ key: string; generator: () => Promise<any> }>): Promise<void> {
    logger.info('Starting cache warmup', { keysCount: keys.length })
    
    for (const { key, generator } of keys) {
      try {
        const value = await generator()
        await this.set(key, value)
        logger.debug('Cache warmed up', { key })
      } catch (error) {
        logger.error('Cache warmup failed for key', { key, error })
      }
    }

    logger.info('Cache warmup completed')
  }

  getMetrics(): CacheMetrics {
    return { ...this.metrics }
  }

  getStats(): {
    memoryItems: number
    hitRate: number
    memoryUsage: number
  } {
    const totalRequests = this.metrics.hits + this.metrics.misses
    const hitRate = totalRequests > 0 ? (this.metrics.hits / totalRequests) * 100 : 0

    return {
      memoryItems: this.memoryCache.size,
      hitRate: Math.round(hitRate * 100) / 100,
      memoryUsage: this.metrics.memory_usage
    }
  }

  private getFromMemory<T>(key: string): T | null {
    const item = this.memoryCache.get(key)
    if (!item) return null

    // Check TTL
    if (this.isExpired(item)) {
      this.memoryCache.delete(key)
      this.recordMetric('evictions')
      return null
    }

    // Update access stats
    item.lastAccessed = new Date()
    item.accessCount++

    return item.value as T
  }

  private async setInMemory<T>(key: string, value: T, ttl: number): Promise<boolean> {
    try {
      // Enforce memory limits
      if (this.memoryCache.size >= this.config.maxMemoryItems) {
        this.evictLeastRecentlyUsed()
      }

      const size = this.calculateSize(value)
      const compressed = this.config.enableCompression && size > 1024

      const item: CacheItem<T> = {
        key,
        value,
        ttl,
        createdAt: new Date(),
        lastAccessed: new Date(),
        accessCount: 1,
        compressed,
        size
      }

      this.memoryCache.set(key, item)
      this.updateMemoryUsage()
      return true
    } catch (error) {
      logger.error('Memory cache set failed', { key, error })
      return false
    }
  }

  private deleteFromMemory(key: string): boolean {
    const deleted = this.memoryCache.delete(key)
    if (deleted) {
      this.updateMemoryUsage()
    }
    return deleted
  }

  // Redis methods removed for Vercel serverless compatibility
  // Use Vercel KV or external Redis service if needed

  private isExpired(item: CacheItem): boolean {
    const now = new Date().getTime()
    const expiresAt = item.createdAt.getTime() + (item.ttl * 1000)
    return now > expiresAt
  }

  private evictLeastRecentlyUsed(): void {
    let lruKey: string | null = null
    let lruTime = Date.now()

    for (const [key, item] of this.memoryCache) {
      if (item.lastAccessed.getTime() < lruTime) {
        lruTime = item.lastAccessed.getTime()
        lruKey = key
      }
    }

    if (lruKey) {
      this.memoryCache.delete(lruKey)
      this.recordMetric('evictions')
    }
  }

  private calculateSize(value: any): number {
    try {
      return JSON.stringify(value).length * 2 // Rough estimate in bytes
    } catch {
      return 100 // Default size estimate
    }
  }

  private updateMemoryUsage(): void {
    let totalSize = 0
    for (const item of this.memoryCache.values()) {
      totalSize += item.size
    }
    this.metrics.memory_usage = totalSize
  }

  private recordMetric(type: keyof CacheMetrics): void {
    if (this.config.enableMetrics) {
      this.metrics[type]++
    }
  }

  private resetMetrics(): void {
    this.metrics = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      evictions: 0,
      memory_usage: 0
    }
  }

  // Cleanup process removed for serverless compatibility
  // Use the /api/cleanup/cache endpoint for manual cleanup

  private cleanupExpired(): void {
    let cleaned = 0
    for (const [key, item] of this.memoryCache) {
      if (this.isExpired(item)) {
        this.memoryCache.delete(key)
        cleaned++
      }
    }

    if (cleaned > 0) {
      this.updateMemoryUsage()
      logger.debug('Cleaned up expired cache items', { count: cleaned })
    }
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
    this.memoryCache.clear()
    this.resetMetrics()
  }
}

export const cacheManager = CacheManager.getInstance()