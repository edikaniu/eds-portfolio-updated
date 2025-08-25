import { NextRequest, NextResponse } from 'next/server'
import { cacheManager } from './cache-manager'
import { logger } from '../logger'

export interface ApiCacheConfig {
  ttl: number
  tags: string[]
  vary?: string[]
  staleWhileRevalidate?: number
  revalidateOnBackground?: boolean
}

export interface CacheHeaders {
  'Cache-Control': string
  'ETag'?: string
  'Last-Modified'?: string
  'Vary'?: string
}

export class ApiCache {
  private static instance: ApiCache
  private taggedKeys = new Map<string, Set<string>>()

  static getInstance(): ApiCache {
    if (!ApiCache.instance) {
      ApiCache.instance = new ApiCache()
    }
    return ApiCache.instance
  }

  async get<T = any>(key: string): Promise<T | null> {
    return await cacheManager.get<T>(key)
  }

  async set<T = any>(key: string, value: T, config: ApiCacheConfig): Promise<boolean> {
    // Store the cached value
    const success = await cacheManager.set(key, value, config.ttl)

    // Track tags for invalidation
    if (success && config.tags.length > 0) {
      this.addTaggedKey(key, config.tags)
    }

    return success
  }

  async invalidateByTag(tag: string): Promise<number> {
    const keys = this.taggedKeys.get(tag)
    if (!keys || keys.size === 0) return 0

    let invalidatedCount = 0
    for (const key of keys) {
      const deleted = await cacheManager.delete(key)
      if (deleted) {
        invalidatedCount++
        this.removeKeyFromTags(key)
      }
    }

    this.taggedKeys.delete(tag)
    logger.info('Cache invalidated by tag', { tag, count: invalidatedCount })
    return invalidatedCount
  }

  async invalidateByPattern(pattern: string): Promise<number> {
    // For now, we'll implement a simple prefix match
    // In production, you might want more sophisticated pattern matching
    const regex = new RegExp(pattern.replace('*', '.*'))
    let invalidatedCount = 0

    // Check all tagged keys
    for (const [tag, keys] of this.taggedKeys) {
      const keysToDelete = new Set<string>()
      
      for (const key of keys) {
        if (regex.test(key)) {
          const deleted = await cacheManager.delete(key)
          if (deleted) {
            invalidatedCount++
            keysToDelete.add(key)
          }
        }
      }

      // Remove deleted keys from tag tracking
      for (const key of keysToDelete) {
        keys.delete(key)
      }

      if (keys.size === 0) {
        this.taggedKeys.delete(tag)
      }
    }

    logger.info('Cache invalidated by pattern', { pattern, count: invalidatedCount })
    return invalidatedCount
  }

  createCacheKey(prefix: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((sorted, key) => {
        sorted[key] = params[key]
        return sorted
      }, {} as Record<string, any>)

    return `${prefix}:${Buffer.from(JSON.stringify(sortedParams)).toString('base64')}`
  }

  generateETag(data: any): string {
    const hash = require('crypto')
      .createHash('md5')
      .update(JSON.stringify(data))
      .digest('hex')
    return `"${hash}"`
  }

  getCacheHeaders(config: ApiCacheConfig, etag?: string): CacheHeaders {
    const headers: CacheHeaders = {
      'Cache-Control': this.buildCacheControl(config)
    }

    if (etag) {
      headers['ETag'] = etag
    }

    headers['Last-Modified'] = new Date().toUTCString()

    if (config.vary && config.vary.length > 0) {
      headers['Vary'] = config.vary.join(', ')
    }

    return headers
  }

  shouldRevalidate(request: NextRequest, etag?: string): boolean {
    const ifNoneMatch = request.headers.get('if-none-match')
    
    if (ifNoneMatch && etag) {
      return ifNoneMatch !== etag
    }

    const ifModifiedSince = request.headers.get('if-modified-since')
    if (ifModifiedSince) {
      const modifiedTime = new Date(ifModifiedSince)
      const now = new Date()
      // Consider anything modified in the last minute as not modified
      return (now.getTime() - modifiedTime.getTime()) > 60000
    }

    return true
  }

  async warmupCache(routes: Array<{
    key: string
    generator: () => Promise<any>
    config: ApiCacheConfig
  }>): Promise<void> {
    logger.info('Starting API cache warmup', { routesCount: routes.length })

    const warmupPromises = routes.map(async ({ key, generator, config }) => {
      try {
        const data = await generator()
        await this.set(key, data, config)
        logger.debug('API cache warmed up', { key })
      } catch (error) {
        logger.error('API cache warmup failed', { key, error })
      }
    })

    await Promise.allSettled(warmupPromises)
    logger.info('API cache warmup completed')
  }

  getStats(): {
    taggedKeysCount: number
    totalKeys: number
    memoryStats: ReturnType<typeof cacheManager.getStats>
  } {
    let totalKeys = 0
    for (const keys of this.taggedKeys.values()) {
      totalKeys += keys.size
    }

    return {
      taggedKeysCount: this.taggedKeys.size,
      totalKeys,
      memoryStats: cacheManager.getStats()
    }
  }

  private addTaggedKey(key: string, tags: string[]): void {
    for (const tag of tags) {
      if (!this.taggedKeys.has(tag)) {
        this.taggedKeys.set(tag, new Set())
      }
      this.taggedKeys.get(tag)!.add(key)
    }
  }

  private removeKeyFromTags(key: string): void {
    for (const [tag, keys] of this.taggedKeys) {
      keys.delete(key)
      if (keys.size === 0) {
        this.taggedKeys.delete(tag)
      }
    }
  }

  private buildCacheControl(config: ApiCacheConfig): string {
    const parts: string[] = []

    if (config.ttl > 0) {
      parts.push(`max-age=${config.ttl}`)
    } else {
      parts.push('no-cache')
    }

    if (config.staleWhileRevalidate) {
      parts.push(`stale-while-revalidate=${config.staleWhileRevalidate}`)
    }

    if (config.revalidateOnBackground) {
      parts.push('stale-if-error=300')
    }

    return parts.join(', ')
  }
}

export const apiCache = ApiCache.getInstance()

// Middleware function for caching API responses
export function withApiCache(config: ApiCacheConfig) {
  return function <T extends Function>(handler: T): T {
    return (async (request: NextRequest, context: any) => {
      try {
        // Generate cache key based on request
        const cacheKey = apiCache.createCacheKey(
          `api:${request.method}:${request.nextUrl.pathname}`,
          {
            search: request.nextUrl.search,
            headers: config.vary?.reduce((acc, header) => {
              acc[header] = request.headers.get(header)
              return acc
            }, {} as Record<string, string | null>) || {}
          }
        )

        // Try to get cached response
        const cached = await apiCache.get(cacheKey)
        if (cached && !apiCache.shouldRevalidate(request, cached.etag)) {
          logger.debug('Serving from API cache', { cacheKey })
          
          return new NextResponse(cached.body, {
            status: 200,
            headers: {
              ...cached.headers,
              'X-Cache': 'HIT'
            }
          })
        }

        // Execute the original handler
        const response = await handler(request, context)

        // Cache successful responses
        if (response.status === 200) {
          const body = await response.text()
          const etag = apiCache.generateETag(body)
          const cacheHeaders = apiCache.getCacheHeaders(config, etag)

          // Store in cache
          await apiCache.set(cacheKey, {
            body,
            etag,
            headers: cacheHeaders
          }, config)

          return new NextResponse(body, {
            status: response.status,
            headers: {
              ...cacheHeaders,
              'X-Cache': 'MISS',
              'Content-Type': response.headers.get('Content-Type') || 'application/json'
            }
          })
        }

        return response
      } catch (error) {
        logger.error('API cache middleware error', error)
        return handler(request, context)
      }
    }) as unknown as T
  }
}