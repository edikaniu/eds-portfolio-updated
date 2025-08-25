import { NextRequest, NextResponse } from 'next/server'
import { apiCache } from './api-cache'
import { performanceMonitor } from '../performance/performance-monitor'
import { logger } from '../logger'

export interface CacheMiddlewareOptions {
  ttl: number
  tags: string[]
  vary?: string[]
  staleWhileRevalidate?: number
  bypassCache?: (request: NextRequest) => boolean
  generateKey?: (request: NextRequest) => string
}

export function withCache(options: CacheMiddlewareOptions) {
  return function <T extends Function>(handler: T): T {
    return (async (request: NextRequest, context: any) => {
      const timer = performanceMonitor.startTimer('cache_middleware')
      
      try {
        // Check if cache should be bypassed
        if (options.bypassCache && options.bypassCache(request)) {
          logger.debug('Cache bypassed', { path: request.nextUrl.pathname })
          return await handler(request, context)
        }

        // Generate cache key
        const cacheKey = options.generateKey 
          ? options.generateKey(request)
          : generateDefaultCacheKey(request, options.vary)

        // Try to get from cache
        const cached = await apiCache.get(cacheKey)
        if (cached) {
          logger.debug('Cache hit', { cacheKey, path: request.nextUrl.pathname })
          
          return new NextResponse(cached.body, {
            status: 200,
            headers: {
              ...cached.headers,
              'X-Cache': 'HIT',
              'X-Cache-Key': cacheKey
            }
          })
        }

        // Execute handler
        const response = await handler(request, context)
        
        // Cache successful responses
        if (response.status === 200) {
          const body = await response.clone().text()
          const etag = apiCache.generateETag(body)
          const cacheHeaders = apiCache.getCacheHeaders(options, etag)

          // Store in cache
          await apiCache.set(cacheKey, {
            body,
            etag,
            headers: cacheHeaders
          }, options)

          // Add cache headers to response
          const headers = new Headers(response.headers)
          Object.entries(cacheHeaders).forEach(([key, value]) => {
            headers.set(key, value)
          })
          headers.set('X-Cache', 'MISS')
          headers.set('X-Cache-Key', cacheKey)

          return new NextResponse(body, {
            status: response.status,
            headers
          })
        }

        return response
      } catch (error) {
        logger.error('Cache middleware error', { error, path: request.nextUrl.pathname })
        return await handler(request, context)
      } finally {
        timer()
      }
    }) as unknown as T
  }
}

function generateDefaultCacheKey(request: NextRequest, vary?: string[]): string {
  const url = request.nextUrl
  const baseKey = `${request.method}:${url.pathname}`
  
  const params = new URLSearchParams(url.search)
  const sortedParams = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('&')

  let varyHeaders = ''
  if (vary && vary.length > 0) {
    const headerValues = vary.map(header => 
      `${header}:${request.headers.get(header) || ''}`
    ).join('|')
    varyHeaders = Buffer.from(headerValues).toString('base64')
  }

  return `${baseKey}?${sortedParams}&vary=${varyHeaders}`
}

// Specific cache configurations for different route types
export const blogCacheConfig: CacheMiddlewareOptions = {
  ttl: 300, // 5 minutes
  tags: ['blogs'],
  vary: ['Accept-Encoding'],
  staleWhileRevalidate: 600,
  bypassCache: (request) => {
    const url = request.nextUrl
    return url.searchParams.has('preview') || url.searchParams.has('draft')
  }
}

export const projectsCacheConfig: CacheMiddlewareOptions = {
  ttl: 600, // 10 minutes
  tags: ['projects'],
  vary: ['Accept-Encoding'],
  staleWhileRevalidate: 1200
}

export const caseStudiesCacheConfig: CacheMiddlewareOptions = {
  ttl: 900, // 15 minutes
  tags: ['case-studies'],
  vary: ['Accept-Encoding'],
  staleWhileRevalidate: 1800
}

export const analyticsCacheConfig: CacheMiddlewareOptions = {
  ttl: 1800, // 30 minutes
  tags: ['analytics'],
  vary: ['Accept-Encoding', 'Authorization'],
  bypassCache: (request) => {
    // Don't cache real-time analytics
    const url = request.nextUrl
    return url.searchParams.get('realtime') === 'true'
  }
}

// Cache invalidation helpers
export async function invalidateBlogCache(): Promise<void> {
  await apiCache.invalidateByTag('blogs')
  logger.info('Blog cache invalidated')
}

export async function invalidateProjectsCache(): Promise<void> {
  await apiCache.invalidateByTag('projects')
  logger.info('Projects cache invalidated')
}

export async function invalidateCaseStudiesCache(): Promise<void> {
  await apiCache.invalidateByTag('case-studies')
  logger.info('Case studies cache invalidated')
}

export async function invalidateAllContentCache(): Promise<void> {
  const promises = [
    apiCache.invalidateByTag('blogs'),
    apiCache.invalidateByTag('projects'),
    apiCache.invalidateByTag('case-studies'),
    apiCache.invalidateByTag('analytics')
  ]
  
  await Promise.all(promises)
  logger.info('All content cache invalidated')
}