import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('admin-token')?.value
    
    // DEBUG: Log all cookies and token details
    const allCookies = request.cookies.getAll()
    console.log('=== AUTH ME DEBUG ===')
    console.log('All cookies:', allCookies.map(c => ({ name: c.name, hasValue: !!c.value, length: c.value?.length })))
    console.log('Admin token exists:', !!token)
    console.log('Admin token length:', token?.length || 0)
    console.log('Admin token preview:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN')

    if (!token) {
      console.log('❌ No token found - returning 401')
      return NextResponse.json(
        { 
          success: false, 
          message: 'No authentication token found',
          debug: {
            cookieCount: allCookies.length,
            cookieNames: allCookies.map(c => c.name)
          }
        },
        { status: 401 }
      )
    }

    console.log('🔍 Attempting to verify token...')
    const user = verifyToken(token)
    console.log('Token verification result:', !!user ? 'SUCCESS' : 'FAILED')
    
    if (user) {
      console.log('User object:', { id: user.id, email: user.email, name: user.name, role: user.role })
    }

    if (!user) {
      console.log('❌ Token verification failed - returning 401')
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid or expired token',
          debug: {
            hasToken: !!token,
            tokenLength: token?.length
          }
        },
        { status: 401 }
      )
    }

    console.log('✅ Authentication successful')
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    })

  } catch (error) {
    console.error('❌ Auth verification error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error',
        debug: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      },
      { status: 500 }
    )
  }
}