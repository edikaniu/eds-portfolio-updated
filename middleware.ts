import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

// Rate limiting store (in production, use Redis or database)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Rate limiting configuration - much more lenient for quick deployment
const RATE_LIMITS = {
  admin: { requests: 1000, windowMs: 15 * 60 * 1000 }, // 1000 requests per 15 minutes for admin
  api: { requests: 2000, windowMs: 15 * 60 * 1000 },   // 2000 requests per 15 minutes for API
  default: { requests: 5000, windowMs: 15 * 60 * 1000 } // 5000 requests per 15 minutes for other routes
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
  const clientId = request.headers.get('x-forwarded-for') || 'unknown'

  // Apply rate limiting (disabled for admin login to prevent issues)
  if (pathname !== '/admin/login') {
    const rateLimit = getRateLimit(pathname)
    if (isRateLimited(clientId, rateLimit)) {
      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: {
          'Retry-After': Math.ceil(rateLimit.windowMs / 1000).toString(),
          'X-RateLimit-Limit': rateLimit.requests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(Date.now() + rateLimit.windowMs).toISOString(),
        },
      })
    }
  }

  // Security headers for all responses
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  
  // CSP for enhanced security (adjust based on your needs)
  response.headers.set('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self' https:; " +
    "connect-src 'self' https:; " +
    "media-src 'self' https:; " +
    "object-src 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self'; " +
    "frame-ancestors 'none';"
  )

  // Handle admin routes - require authentication (but exclude login page)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const token = request.cookies.get('admin-token')?.value

    if (!token) {
      // No token, redirect to login
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    try {
      const payload = await verifyToken(token)
      if (!payload || payload.role !== 'admin') {
        // Invalid token or not admin, redirect to login
        const response = NextResponse.redirect(new URL('/admin/login', request.url))
        response.cookies.delete('admin-token')
        return response
      }

      // Token is valid, allow access
      response.headers.set('X-User-ID', payload.id || 'unknown')
      response.headers.set('X-User-Role', payload.role || 'admin')
    } catch (error) {
      console.error('Token verification failed:', error)
      const response = NextResponse.redirect(new URL('/admin/login', request.url))
      response.cookies.delete('admin-token')
      return response
    }
  }

  // Handle API routes
  if (pathname.startsWith('/api')) {
    // Generate and set CSRF token for state-changing operations
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
      // Verify CSRF token for admin API routes (but be more lenient for login and setup)
      const exemptPaths = ['/api/admin/auth/login', '/api/admin/setup', '/api/admin/test-auth']
      if (pathname.startsWith('/api/admin') && !exemptPaths.includes(pathname)) {
        const csrfToken = request.headers.get('x-csrf-token')
        const sessionCsrfToken = request.cookies.get('csrf-token')?.value

        if (!csrfToken || !sessionCsrfToken || csrfToken !== sessionCsrfToken) {
          return new NextResponse('CSRF token mismatch', { status: 403 })
        }
      }
      // For login, just check if csrf token exists but don't enforce strict matching
      else if (pathname === '/api/admin/auth/login') {
        const csrfToken = request.headers.get('x-csrf-token')
        if (!csrfToken) {
          console.warn('Login attempt without CSRF token')
        }
      }
    }

    // Set CORS headers for API routes if needed
    if (pathname.startsWith('/api/public')) {
      response.headers.set('Access-Control-Allow-Origin', '*')
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    }
  }

  // Generate CSRF token for forms
  if (!request.cookies.get('csrf-token')) {
    const csrfToken = generateCSRFToken()
    response.cookies.set('csrf-token', csrfToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
    })
  }

  // Handle admin login page - redirect if already authenticated
  if (pathname === '/admin/login') {
    const token = request.cookies.get('admin-token')?.value
    if (token) {
      try {
        const payload = await verifyToken(token)
        if (payload && payload.role === 'admin') {
          return NextResponse.redirect(new URL('/admin', request.url))
        }
      } catch {
        // Token is invalid, continue to login page
      }
    }
  }

  // Performance monitoring headers
  response.headers.set('X-Middleware-Processed', Date.now().toString())
  
  // Cache headers for static assets
  if (pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|webp|ico|woff|woff2|ttf|eot)$/)) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  }

  return response
}

// Configure which paths should be processed by this middleware
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
}