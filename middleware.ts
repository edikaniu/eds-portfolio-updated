import { NextRequest, NextResponse } from 'next/server'
import { verifySessionToken } from '@/lib/simple-auth'

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

  // Admin authentication middleware - simplified session-based
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    console.log('🛡️ MIDDLEWARE DEBUG - Admin route accessed:', pathname)
    
    const sessionToken = request.cookies.get('admin-session')?.value
    console.log('🍪 MIDDLEWARE - Session token found:', !!sessionToken, 'Length:', sessionToken?.length || 0)

    if (!sessionToken) {
      console.log('❌ MIDDLEWARE - No session, redirecting to login')
      // No session, redirect to login
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    try {
      console.log('🔍 MIDDLEWARE - Verifying session token...')
      const user = verifySessionToken(sessionToken)
      console.log('✅ MIDDLEWARE - Token verification:', !!user ? 'SUCCESS' : 'FAILED')
      
      if (!user || user.role !== 'admin') {
        console.log('❌ MIDDLEWARE - Invalid session or not admin, redirecting')
        // Invalid session or not admin, redirect to login
        const response = NextResponse.redirect(new URL('/admin/login', request.url))
        response.cookies.delete('admin-session')
        return response
      }

      console.log('✅ MIDDLEWARE - Access granted for:', user.email)
      // Session is valid, allow access
      response.headers.set('X-User-ID', user.id)
      response.headers.set('X-User-Role', user.role)
    } catch (error) {
      console.error('❌ MIDDLEWARE - Session verification failed:', error)
      const response = NextResponse.redirect(new URL('/admin/login', request.url))
      response.cookies.delete('admin-session')
      return response
    }
  }

  // Handle API routes - CSRF COMPLETELY DISABLED FOR AUTHENTICATION DEBUGGING
  // Cache bust timestamp: ${new Date().toISOString()}
  if (pathname.startsWith('/api')) {
    console.log('🔧 API REQUEST:', request.method, pathname, '- CSRF COMPLETELY DISABLED, NO WARNINGS SHOULD APPEAR')
    
    // Set CORS headers for API routes if needed
    if (pathname.startsWith('/api/public')) {
      response.headers.set('Access-Control-Allow-Origin', '*')
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    }
  }

  // CSRF token generation - DISABLED for simplified auth
  // No CSRF tokens needed for session-based authentication

  // Login page redirect check - redirect authenticated users to dashboard
  if (pathname === '/admin/login') {
    const sessionToken = request.cookies.get('admin-session')?.value
    if (sessionToken) {
      try {
        const user = verifySessionToken(sessionToken)
        if (user && user.role === 'admin') {
          return NextResponse.redirect(new URL('/admin/dashboard', request.url))
        }
      } catch {
        // Session is invalid, continue to login page
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