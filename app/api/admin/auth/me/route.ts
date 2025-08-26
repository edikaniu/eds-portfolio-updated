import { NextRequest, NextResponse } from 'next/server'
import { verifySessionToken } from '@/lib/simple-auth'

export async function GET(request: NextRequest) {
  try {
    // Debug: Check all cookies
    const allCookies = request.cookies.getAll()
    console.log('🍪 AUTH/ME DEBUG - All cookies received:', allCookies.map(c => ({ 
      name: c.name, 
      hasValue: !!c.value,
      valueLength: c.value?.length || 0 
    })))
    
    const sessionToken = request.cookies.get('admin-session')?.value
    console.log('🔍 Session token found:', !!sessionToken, 'Length:', sessionToken?.length || 0)

    if (!sessionToken) {
      console.log('❌ No session token - returning 401')
      return NextResponse.json(
        { 
          success: false, 
          message: 'No authentication session found',
          debug: {
            cookieCount: allCookies.length,
            cookieNames: allCookies.map(c => c.name)
          }
        },
        { status: 401 }
      )
    }

    console.log('🔍 Verifying session token...')
    const user = verifySessionToken(sessionToken)
    console.log('✅ Token verification result:', !!user ? 'SUCCESS' : 'FAILED')

    if (!user) {
      console.log('❌ Token verification failed')
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid or expired session'
        },
        { status: 401 }
      )
    }

    console.log('✅ Auth successful for user:', user.email)
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
    console.error('Auth verification error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error'
      },
      { status: 500 }
    )
  }
}