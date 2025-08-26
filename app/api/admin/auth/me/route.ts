import { NextRequest, NextResponse } from 'next/server'
import { verifySessionToken } from '@/lib/simple-auth'

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('admin-session')?.value

    if (!sessionToken) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'No authentication session found'
        },
        { status: 401 }
      )
    }

    const user = verifySessionToken(sessionToken)

    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid or expired session'
        },
        { status: 401 }
      )
    }

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