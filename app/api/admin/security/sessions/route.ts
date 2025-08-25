import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/admin-middleware'
import { withErrorHandling } from '@/lib/error-handler'
import { sessionManager } from '@/lib/security/session-manager'
import { logger } from '@/lib/logger'

async function handleSessionsRequest(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')

  switch (request.method) {
    case 'GET':
      return await handleGetRequest(request, action, searchParams)
    case 'POST':
      return await handlePostRequest(request, action)
    case 'DELETE':
      return await handleDeleteRequest(request, searchParams)
    default:
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'METHOD_NOT_ALLOWED',
            message: 'Method not allowed'
          }
        },
        { status: 405 }
      )
  }
}

async function handleGetRequest(
  request: NextRequest, 
  action: string | null, 
  searchParams: URLSearchParams
): Promise<NextResponse> {
  const userId = request.headers.get('x-user-id')

  if (!userId) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User information not found'
        }
      },
      { status: 401 }
    )
  }

  switch (action) {
    case 'list':
      try {
        const sessions = await sessionManager.getUserSessions(userId)
        
        // Remove sensitive information for client
        const safeSessions = sessions.map(session => ({
          id: session.id,
          ipAddress: maskIP(session.ipAddress),
          userAgent: session.userAgent,
          isActive: session.isActive,
          isTwoFactorVerified: session.isTwoFactorVerified,
          lastActivity: session.lastActivity,
          expiresAt: session.expiresAt,
          createdAt: session.createdAt,
          location: session.location,
          deviceInfo: session.deviceInfo
        }))

        return NextResponse.json({
          success: true,
          data: safeSessions
        })
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'Failed to get sessions')
      }

    case 'current':
      const sessionId = request.headers.get('x-session-id')
      
      if (!sessionId) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'MISSING_SESSION_ID',
              message: 'Session ID not found'
            }
          },
          { status: 400 }
        )
      }

      try {
        const session = await sessionManager.getSession(sessionId)
        
        if (!session) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: 'SESSION_NOT_FOUND',
                message: 'Session not found'
              }
            },
            { status: 404 }
          )
        }

        // Return safe session data
        const safeSession = {
          id: session.id,
          ipAddress: maskIP(session.ipAddress),
          userAgent: session.userAgent,
          isActive: session.isActive,
          isTwoFactorVerified: session.isTwoFactorVerified,
          lastActivity: session.lastActivity,
          expiresAt: session.expiresAt,
          createdAt: session.createdAt,
          location: session.location,
          deviceInfo: session.deviceInfo
        }

        return NextResponse.json({
          success: true,
          data: safeSession
        })
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'Failed to get current session')
      }

    case 'analytics':
      try {
        const days = parseInt(searchParams.get('days') || '30')
        const analytics = await sessionManager.getSessionAnalytics(days)
        
        return NextResponse.json({
          success: true,
          data: analytics
        })
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'Failed to get session analytics')
      }

    default:
      // Default: return user sessions list
      try {
        const sessions = await sessionManager.getUserSessions(userId)
        const analytics = await sessionManager.getSessionAnalytics(7)
        
        const safeSessions = sessions.map(session => ({
          id: session.id,
          ipAddress: maskIP(session.ipAddress),
          userAgent: session.userAgent,
          isActive: session.isActive,
          isTwoFactorVerified: session.isTwoFactorVerified,
          lastActivity: session.lastActivity,
          expiresAt: session.expiresAt,
          createdAt: session.createdAt,
          location: session.location,
          deviceInfo: session.deviceInfo
        }))

        return NextResponse.json({
          success: true,
          data: {
            sessions: safeSessions,
            analytics: {
              totalActiveSessions: analytics.totalActiveSessions,
              averageSessionDuration: analytics.averageSessionDuration
            }
          }
        })
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'Failed to get session data')
      }
  }
}

async function handlePostRequest(request: NextRequest, action: string | null): Promise<NextResponse> {
  const userId = request.headers.get('x-user-id')
  const userEmail = request.headers.get('x-user-email')
  const currentSessionId = request.headers.get('x-session-id')

  if (!userId || !userEmail) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User information not found'
        }
      },
      { status: 401 }
    )
  }

  switch (action) {
    case 'invalidate-all':
      try {
        const body = await request.json()
        const keepCurrent = body.keepCurrent !== false

        const invalidatedCount = await sessionManager.invalidateAllUserSessions(
          userId, 
          keepCurrent ? currentSessionId || undefined : undefined
        )

        return NextResponse.json({
          success: true,
          data: {
            invalidatedCount
          },
          message: `${invalidatedCount} sessions invalidated`
        })
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'Failed to invalidate sessions')
      }

    case 'update-two-factor':
      const body = await request.json()
      const { verified } = body

      if (!currentSessionId) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'MISSING_SESSION_ID',
              message: 'Session ID not found'
            }
          },
          { status: 400 }
        )
      }

      try {
        await sessionManager.updateTwoFactorStatus(currentSessionId, verified === true)

        return NextResponse.json({
          success: true,
          message: `Two-factor status updated to ${verified ? 'verified' : 'unverified'}`
        })
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'Failed to update two-factor status')
      }

    case 'extend':
      if (!currentSessionId) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'MISSING_SESSION_ID',
              message: 'Session ID not found'
            }
          },
          { status: 400 }
        )
      }

      try {
        await sessionManager.updateLastActivity(currentSessionId)

        return NextResponse.json({
          success: true,
          message: 'Session extended successfully'
        })
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'Failed to extend session')
      }

    default:
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_ACTION',
            message: 'Invalid action specified'
          }
        },
        { status: 400 }
      )
  }
}

async function handleDeleteRequest(
  request: NextRequest, 
  searchParams: URLSearchParams
): Promise<NextResponse> {
  const userId = request.headers.get('x-user-id')
  const currentSessionId = request.headers.get('x-session-id')
  const targetSessionId = searchParams.get('sessionId')

  if (!userId) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User information not found'
        }
      },
      { status: 401 }
    )
  }

  if (!targetSessionId) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'MISSING_SESSION_ID',
          message: 'Session ID is required'
        }
      },
      { status: 400 }
    )
  }

  // Prevent users from invalidating their current session through this endpoint
  if (targetSessionId === currentSessionId) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CANNOT_INVALIDATE_CURRENT_SESSION',
          message: 'Cannot invalidate current session. Use logout instead.'
        }
      },
      { status: 400 }
    )
  }

  try {
    // Verify the session belongs to the current user
    const session = await sessionManager.getSession(targetSessionId)
    
    if (!session || session.userId !== userId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'SESSION_NOT_FOUND',
            message: 'Session not found or access denied'
          }
        },
        { status: 404 }
      )
    }

    await sessionManager.invalidateSession(targetSessionId, 'user_requested')

    logger.info('Session invalidated by user', { 
      sessionId: targetSessionId,
      requestedBy: userId
    })

    return NextResponse.json({
      success: true,
      message: 'Session invalidated successfully'
    })
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to invalidate session')
  }
}

function maskIP(ipAddress: string): string {
  const parts = ipAddress.split('.')
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.${parts[2]}.xxx`
  }
  return 'xxx.xxx.xxx.xxx'
}

export const GET = withAdminAuth(withErrorHandling(handleSessionsRequest))
export const POST = withAdminAuth(withErrorHandling(handleSessionsRequest))
export const DELETE = withAdminAuth(withErrorHandling(handleSessionsRequest))