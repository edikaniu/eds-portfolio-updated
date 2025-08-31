import { NextRequest, NextResponse } from 'next/server'
import { verifySessionToken, SimpleUser } from './simple-auth'

export function withAdminAuth(handler: (request: NextRequest, user: SimpleUser) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    try {
      const token = request.cookies.get('admin-session')?.value

      if (!token) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'No authentication token found' 
          },
          { status: 401 }
        )
      }

      const user = verifySessionToken(token)
      if (!user) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Invalid or expired token' 
          },
          { status: 401 }
        )
      }

      // Ensure user has admin role
      if (user.role !== 'admin') {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Insufficient permissions' 
          },
          { status: 403 }
        )
      }

      // Pass the authenticated user to the handler
      return handler(request, user)

    } catch (error) {
      console.error('Admin auth middleware error:', error)
      return NextResponse.json(
        { 
          success: false, 
          message: 'Authentication failed' 
        },
        { status: 401 }
      )
    }
  }
}