import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT, JWTPayload } from './jwt-auth'

export function withAdminAuth(handler: (request: NextRequest, user: JWTPayload) => Promise<NextResponse>) {
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

      const payload = verifyJWT(token)
      if (!payload) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Invalid or expired token' 
          },
          { status: 401 }
        )
      }

      // Ensure user has admin role
      if (payload.role !== 'admin') {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Insufficient permissions' 
          },
          { status: 403 }
        )
      }

      // Pass the authenticated user to the handler
      return handler(request, payload)

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