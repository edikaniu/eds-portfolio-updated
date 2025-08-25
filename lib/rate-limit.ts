import { NextRequest } from 'next/server'

// Simple in-memory rate limiting store
// In production, use Redis or a proper database
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export interface RateLimitConfig {
  requests: number
  windowMs: number
}

export function rateLimit(config: RateLimitConfig) {
  return (request: NextRequest) => {
    const identifier = getIdentifier(request)
    const now = Date.now()
    
    // Get current rate limit data
    const currentData = rateLimitStore.get(identifier)
    
    // Reset if window expired
    if (!currentData || now > currentData.resetTime) {
      rateLimitStore.set(identifier, {
        count: 1,
        resetTime: now + config.windowMs
      })
      return {
        success: true,
        remaining: config.requests - 1,
        resetTime: now + config.windowMs
      }
    }
    
    // Check if limit exceeded
    if (currentData.count >= config.requests) {
      return {
        success: false,
        remaining: 0,
        resetTime: currentData.resetTime
      }
    }
    
    // Increment count
    currentData.count++
    rateLimitStore.set(identifier, currentData)
    
    return {
      success: true,
      remaining: config.requests - currentData.count,
      resetTime: currentData.resetTime
    }
  }
}

function getIdentifier(request: NextRequest): string {
  // Use IP address as identifier
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : request.ip
  return ip || 'unknown'
}

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}, 60000) // Cleanup every minute