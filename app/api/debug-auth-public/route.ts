import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.NEXTAUTH_SECRET as string

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('admin-token')?.value
    
    let tokenDecoded = null
    let verifyResult = null
    let rawDecoded = null
    let decodeError = null
    
    if (token) {
      try {
        // Raw JWT decode without verification
        rawDecoded = jwt.decode(token)
        
        // Verify token using our function
        verifyResult = verifyToken(token)
        
        // Manual decode with verification
        tokenDecoded = jwt.verify(token, JWT_SECRET)
      } catch (error) {
        decodeError = error instanceof Error ? error.message : 'Unknown decode error'
        console.error('Token decode error:', error)
      }
    }

    const debugInfo = {
      timestamp: new Date().toISOString(),
      cookies: {
        hasAdminToken: !!token,
        tokenLength: token?.length || 0,
        tokenPreview: token ? `${token.substring(0, 20)}...` : null,
        allCookies: request.cookies.getAll().map(c => ({ 
          name: c.name, 
          hasValue: !!c.value, 
          valueLength: c.value?.length || 0,
          valuePreview: c.value ? `${c.value.substring(0, 10)}...` : null
        }))
      },
      jwt: {
        rawDecoded,
        tokenDecoded,
        verifyResult,
        decodeError,
        jwtSecretExists: !!JWT_SECRET,
        jwtSecretLength: JWT_SECRET?.length || 0
      },
      headers: {
        userAgent: request.headers.get('user-agent'),
        referer: request.headers.get('referer'),
        host: request.headers.get('host'),
        cookie: request.headers.get('cookie')?.substring(0, 100) + '...'
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET
      }
    }

    return NextResponse.json({
      success: true,
      debug: debugInfo,
      authenticated: !!verifyResult && verifyResult.role === 'admin',
      message: token ? 'Token found and analyzed' : 'No admin token found in cookies'
    })

  } catch (error) {
    console.error('Debug auth error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      debug: {
        errorType: error?.constructor?.name,
        timestamp: new Date().toISOString()
      }
    }, { status: 500 })
  }
}