import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from './auth'

export function withAdminAuth(handler: (request: NextRequest, user: any) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    try {
      const token = request.cookies.get('admin-token')?.value

      if (!token) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'No authentication token found' 
          },
          { status: 401 }
        )
      }

      const user = verifyToken(token)
      if (!user) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Invalid or expired token' 
          },
          { status: 401 }
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