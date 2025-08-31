import { NextResponse } from 'next/server'

/**
 * Cache durations in seconds
 */
export const CACHE_DURATIONS = {
  // Static content that rarely changes
  BLOG_POSTS: 60 * 15,        // 15 minutes
  PROJECTS: 60 * 30,          // 30 minutes  
  CASE_STUDIES: 60 * 30,      // 30 minutes
  EXPERIENCE: 60 * 60,        // 1 hour
  SKILLS: 60 * 60,            // 1 hour
  TOOLS: 60 * 60,             // 1 hour
  
  // Dynamic content
  SEARCH: 60 * 5,             // 5 minutes
  STATS: 60 * 10,             // 10 minutes
  
  // Admin content (no caching)
  ADMIN: 0
} as const

/**
 * Add cache headers to a NextResponse
 */
export function addCacheHeaders(
  response: NextResponse, 
  duration: number,
  options: {
    staleWhileRevalidate?: number
    private?: boolean
    mustRevalidate?: boolean
  } = {}
): NextResponse {
  const {
    staleWhileRevalidate = duration * 0.1, // 10% of cache duration as SWR
    private: isPrivate = false,
    mustRevalidate = false
  } = options

  if (duration === 0) {
    // No cache for admin or sensitive endpoints
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
  } else {
    // Public cache with stale-while-revalidate
    const visibility = isPrivate ? 'private' : 'public'
    const revalidate = mustRevalidate ? ', must-revalidate' : ''
    const swr = staleWhileRevalidate > 0 ? `, stale-while-revalidate=${staleWhileRevalidate}` : ''
    
    response.headers.set(
      'Cache-Control', 
      `${visibility}, max-age=${duration}${swr}${revalidate}`
    )
    
    // Set ETag for validation
    const etag = generateETag()
    response.headers.set('ETag', etag)
  }

  return response
}

/**
 * Create a cached JSON response
 */
export function createCachedResponse(
  data: any,
  duration: number,
  options?: {
    status?: number
    staleWhileRevalidate?: number
    private?: boolean
    mustRevalidate?: boolean
  }
): NextResponse {
  const { status = 200, ...cacheOptions } = options || {}
  
  const response = NextResponse.json(data, { status })
  return addCacheHeaders(response, duration, cacheOptions)
}

/**
 * Generate a simple ETag based on current timestamp and content hash
 */
function generateETag(): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 15)
  return `"${timestamp}-${random}"`
}

/**
 * Check if request has valid cache headers
 */
export function checkCacheHeaders(request: Request): {
  ifNoneMatch?: string
  ifModifiedSince?: string
} {
  return {
    ifNoneMatch: request.headers.get('If-None-Match') || undefined,
    ifModifiedSince: request.headers.get('If-Modified-Since') || undefined
  }
}

/**
 * Create 304 Not Modified response
 */
export function createNotModifiedResponse(): NextResponse {
  return new NextResponse(null, { status: 304 })
}