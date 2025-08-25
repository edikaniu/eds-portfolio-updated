<<<<<<< HEAD
import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

// Rate limiting store (in production, use Redis or database)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Rate limiting configuration
const RATE_LIMITS = {
  admin: { requests: 100, windowMs: 15 * 60 * 1000 }, // 100 requests per 15 minutes for admin
  api: { requests: 200, windowMs: 15 * 60 * 1000 },   // 200 requests per 15 minutes for API
  default: { requests: 500, windowMs: 15 * 60 * 1000 } // 500 requests per 15 minutes for other routes
}

function getRateLimit(pathname: string): { requests: number; windowMs: number } {
  if (pathname.startsWith('/admin')) return RATE_LIMITS.admin
  if (pathname.startsWith('/api')) return RATE_LIMITS.api
  return RATE_LIMITS.default
}

function isRateLimited(clientId: string, limit: { requests: number; windowMs: number }): boolean {
  const now = Date.now()
  const clientData = rateLimitStore.get(clientId)

  if (!clientData || now > clientData.resetTime) {
    // Reset the count if window has expired
    rateLimitStore.set(clientId, { count: 1, resetTime: now + limit.windowMs })
    return false
  }

  if (clientData.count >= limit.requests) {
    return true // Rate limit exceeded
  }

  // Increment count
  clientData.count++
  rateLimitStore.set(clientId, clientData)
  return false
}

function generateCSRFToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const response = NextResponse.next()

  // Get client identifier for rate limiting
  const clientId = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
  const rateLimit = getRateLimit(pathname)

  // Apply rate limiting
  if (isRateLimited(clientId, rateLimit)) {
    return new NextResponse(
      JSON.stringify({
        success: false,
        message: 'Too many requests. Please try again later.',
        error: 'RATE_LIMIT_EXCEEDED'
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': Math.ceil(rateLimit.windowMs / 1000).toString()
        }
      }
    )
  }

  // Add rate limit headers to response
  const clientData = rateLimitStore.get(clientId)
  if (clientData) {
    response.headers.set('X-RateLimit-Limit', rateLimit.requests.toString())
    response.headers.set('X-RateLimit-Remaining', Math.max(0, rateLimit.requests - clientData.count).toString())
    response.headers.set('X-RateLimit-Reset', clientData.resetTime.toString())
  }

  // CSRF protection for admin routes
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    // Check if it's a state-changing request
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
      const csrfToken = request.headers.get('X-CSRF-Token') || request.cookies.get('csrf-token')?.value
      const sessionCSRF = request.cookies.get('csrf-session')?.value

      if (!csrfToken || !sessionCSRF || csrfToken !== sessionCSRF) {
        return new NextResponse(
          JSON.stringify({
            success: false,
            message: 'CSRF token validation failed',
            error: 'CSRF_TOKEN_INVALID'
          }),
          {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      }
    }
  }

  // Admin route protection
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const token = request.cookies.get('admin-token')?.value

    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    const user = verifyToken(token)
    if (!user) {
      // Clear invalid token
      const response = NextResponse.redirect(new URL('/admin/login', request.url))
      response.cookies.delete('admin-token')
      response.cookies.delete('csrf-token')
      response.cookies.delete('csrf-session')
      return response
    }

    // Add user info to request headers for API routes
    response.headers.set('X-User-Id', user.id)
    response.headers.set('X-User-Email', user.email)
    response.headers.set('X-User-Role', user.role)
  }

  // Protected API routes
  if (pathname.startsWith('/api/admin') && !pathname.startsWith('/api/admin/auth')) {
    const token = request.cookies.get('admin-token')?.value

    if (!token) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          message: 'Authentication required',
          error: 'NO_TOKEN'
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    const user = verifyToken(token)
    if (!user) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          message: 'Invalid or expired token',
          error: 'INVALID_TOKEN'
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Add user info to request headers
    response.headers.set('X-User-Id', user.id)
    response.headers.set('X-User-Email', user.email)
    response.headers.set('X-User-Role', user.role)
  }

  // Generate and set CSRF tokens for admin sessions
  if (pathname.startsWith('/admin') && !request.cookies.get('csrf-session')) {
    const csrfToken = generateCSRFToken()
    response.cookies.set('csrf-token', csrfToken, {
      httpOnly: false, // Accessible to JavaScript for forms
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 // 24 hours
    })
    response.cookies.set('csrf-session', csrfToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 // 24 hours
    })
  }

  // Security headers (additional to Next.js config)
  response.headers.set('X-Request-ID', Math.random().toString(36).substring(2))
  
  // Add Vercel-optimized headers
  response.headers.set('X-Vercel-Region', process.env.VERCEL_REGION || 'unknown')
  response.headers.set('X-Deployment-URL', process.env.VERCEL_URL || 'localhost')
  
  // Add CORS headers for API routes
  if (pathname.startsWith('/api/')) {
    const allowedOrigins = process.env.ALLOWED_ORIGINS 
      ? process.env.ALLOWED_ORIGINS.split(',')
      : [process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000']
    
    const origin = request.headers.get('origin')
    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin)
    }
    
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token')
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 200 })
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$|.*\\.webp$).*)',
  ],
=======
import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

// Rate limiting store (in production, use Redis or database)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Rate limiting configuration
const RATE_LIMITS = {
  admin: { requests: 100, windowMs: 15 * 60 * 1000 }, // 100 requests per 15 minutes for admin
  api: { requests: 200, windowMs: 15 * 60 * 1000 },   // 200 requests per 15 minutes for API
  default: { requests: 500, windowMs: 15 * 60 * 1000 } // 500 requests per 15 minutes for other routes
}

function getRateLimit(pathname: string): { requests: number; windowMs: number } {
  if (pathname.startsWith('/admin')) return RATE_LIMITS.admin
  if (pathname.startsWith('/api')) return RATE_LIMITS.api
  return RATE_LIMITS.default
}

function isRateLimited(clientId: string, limit: { requests: number; windowMs: number }): boolean {
  const now = Date.now()
  const clientData = rateLimitStore.get(clientId)

  if (!clientData || now > clientData.resetTime) {
    // Reset the count if window has expired
    rateLimitStore.set(clientId, { count: 1, resetTime: now + limit.windowMs })
    return false
  }

  if (clientData.count >= limit.requests) {
    return true // Rate limit exceeded
  }

  // Increment count
  clientData.count++
  rateLimitStore.set(clientId, clientData)
  return false
}

function generateCSRFToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const response = NextResponse.next()

  // Get client identifier for rate limiting
  const clientId = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
  const rateLimit = getRateLimit(pathname)

  // Apply rate limiting
  if (isRateLimited(clientId, rateLimit)) {
    return new NextResponse(
      JSON.stringify({
        success: false,
        message: 'Too many requests. Please try again later.',
        error: 'RATE_LIMIT_EXCEEDED'
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': Math.ceil(rateLimit.windowMs / 1000).toString()
        }
      }
    )
  }

  // Add rate limit headers to response
  const clientData = rateLimitStore.get(clientId)
  if (clientData) {
    response.headers.set('X-RateLimit-Limit', rateLimit.requests.toString())
    response.headers.set('X-RateLimit-Remaining', Math.max(0, rateLimit.requests - clientData.count).toString())
    response.headers.set('X-RateLimit-Reset', clientData.resetTime.toString())
  }

  // CSRF protection for admin routes
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    // Check if it's a state-changing request
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
      const csrfToken = request.headers.get('X-CSRF-Token') || request.cookies.get('csrf-token')?.value
      const sessionCSRF = request.cookies.get('csrf-session')?.value

      if (!csrfToken || !sessionCSRF || csrfToken !== sessionCSRF) {
        return new NextResponse(
          JSON.stringify({
            success: false,
            message: 'CSRF token validation failed',
            error: 'CSRF_TOKEN_INVALID'
          }),
          {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      }
    }
  }

  // Admin route protection
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const token = request.cookies.get('admin-token')?.value

    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    const user = verifyToken(token)
    if (!user) {
      // Clear invalid token
      const response = NextResponse.redirect(new URL('/admin/login', request.url))
      response.cookies.delete('admin-token')
      response.cookies.delete('csrf-token')
      response.cookies.delete('csrf-session')
      return response
    }

    // Add user info to request headers for API routes
    response.headers.set('X-User-Id', user.id)
    response.headers.set('X-User-Email', user.email)
    response.headers.set('X-User-Role', user.role)
  }

  // Protected API routes
  if (pathname.startsWith('/api/admin') && !pathname.startsWith('/api/admin/auth')) {
    const token = request.cookies.get('admin-token')?.value

    if (!token) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          message: 'Authentication required',
          error: 'NO_TOKEN'
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    const user = verifyToken(token)
    if (!user) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          message: 'Invalid or expired token',
          error: 'INVALID_TOKEN'
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Add user info to request headers
    response.headers.set('X-User-Id', user.id)
    response.headers.set('X-User-Email', user.email)
    response.headers.set('X-User-Role', user.role)
  }

  // Generate and set CSRF tokens for admin sessions
  if (pathname.startsWith('/admin') && !request.cookies.get('csrf-session')) {
    const csrfToken = generateCSRFToken()
    response.cookies.set('csrf-token', csrfToken, {
      httpOnly: false, // Accessible to JavaScript for forms
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 // 24 hours
    })
    response.cookies.set('csrf-session', csrfToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 // 24 hours
    })
  }

  // Security headers (additional to Next.js config)
  response.headers.set('X-Request-ID', Math.random().toString(36).substring(2))
  
  // Add Vercel-optimized headers
  response.headers.set('X-Vercel-Region', process.env.VERCEL_REGION || 'unknown')
  response.headers.set('X-Deployment-URL', process.env.VERCEL_URL || 'localhost')
  
  // Add CORS headers for API routes
  if (pathname.startsWith('/api/')) {
    const allowedOrigins = process.env.ALLOWED_ORIGINS 
      ? process.env.ALLOWED_ORIGINS.split(',')
      : [process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000']
    
    const origin = request.headers.get('origin')
    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin)
    }
    
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token')
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 200 })
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$|.*\\.webp$).*)',
  ],
>>>>>>> 177dc73edd19f0ab5571599bf2c6435fbada064e
}