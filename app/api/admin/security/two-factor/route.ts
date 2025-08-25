import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/admin-middleware'
import { withErrorHandling } from '@/lib/error-handler'
import { twoFactorAuth } from '@/lib/security/two-factor-auth'
import { logger } from '@/lib/logger'

async function handleTwoFactorRequest(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')

  switch (request.method) {
    case 'GET':
      return await handleGetRequest(request, action)
    case 'POST':
      return await handlePostRequest(request, action)
    case 'DELETE':
      return await handleDeleteRequest(request)
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

async function handleGetRequest(request: NextRequest, action: string | null): Promise<NextResponse> {
  // Get current user from auth middleware
  const userId = request.headers.get('x-user-id')
  const userEmail = request.headers.get('x-user-email')

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
    case 'status':
      const status = await twoFactorAuth.getTwoFactorStatus(userId)
      
      return NextResponse.json({
        success: true,
        data: status
      })

    case 'setup':
      try {
        const setupData = await twoFactorAuth.enableTwoFactor(userId, userEmail)
        
        return NextResponse.json({
          success: true,
          data: {
            qrCodeUrl: setupData.qrCodeUrl,
            backupCodes: setupData.backupCodes,
            message: 'Two-factor authentication setup initiated. Please verify with your authenticator app.'
          }
        })
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'Setup failed')
      }

    default:
      // Default: return current status
      const defaultStatus = await twoFactorAuth.getTwoFactorStatus(userId)
      
      return NextResponse.json({
        success: true,
        data: defaultStatus
      })
  }
}

async function handlePostRequest(request: NextRequest, action: string | null): Promise<NextResponse> {
  const userId = request.headers.get('x-user-id')
  const userEmail = request.headers.get('x-user-email')
  const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'

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

  const body = await request.json()

  switch (action) {
    case 'verify-setup':
      const { token } = body

      if (!token) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'MISSING_TOKEN',
              message: 'Verification token is required'
            }
          },
          { status: 400 }
        )
      }

      try {
        const isValid = await twoFactorAuth.verifyAndEnableTwoFactor(userId, userEmail, token)
        
        if (isValid) {
          return NextResponse.json({
            success: true,
            message: 'Two-factor authentication enabled successfully'
          })
        } else {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: 'INVALID_TOKEN',
                message: 'Invalid verification token'
              }
            },
            { status: 400 }
          )
        }
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'Verification failed')
      }

    case 'verify':
      const { verificationToken } = body

      if (!verificationToken) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'MISSING_TOKEN',
              message: 'Verification token is required'
            }
          },
          { status: 400 }
        )
      }

      try {
        const verification = await twoFactorAuth.verifyTwoFactor(
          userId, 
          userEmail, 
          verificationToken,
          ipAddress
        )
        
        if (verification.isValid) {
          return NextResponse.json({
            success: true,
            message: 'Two-factor verification successful'
          })
        } else {
          const errorResponse: any = {
            success: false,
            error: {
              code: 'VERIFICATION_FAILED',
              message: 'Two-factor verification failed'
            }
          }

          if (verification.remainingAttempts !== undefined) {
            errorResponse.error.remainingAttempts = verification.remainingAttempts
          }

          if (verification.lockoutUntil) {
            errorResponse.error.lockoutUntil = verification.lockoutUntil.toISOString()
          }

          return NextResponse.json(errorResponse, { status: 400 })
        }
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'Verification failed')
      }

    case 'regenerate-backup-codes':
      try {
        const backupCodes = await twoFactorAuth.regenerateBackupCodes(userId, userEmail)
        
        return NextResponse.json({
          success: true,
          data: {
            backupCodes
          },
          message: 'Backup codes regenerated successfully'
        })
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'Failed to regenerate backup codes')
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

async function handleDeleteRequest(request: NextRequest): Promise<NextResponse> {
  const userId = request.headers.get('x-user-id')
  const userEmail = request.headers.get('x-user-email')

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

  try {
    const success = await twoFactorAuth.disableTwoFactor(userId, userEmail)
    
    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Two-factor authentication disabled successfully'
      })
    } else {
      throw new Error('Failed to disable two-factor authentication')
    }
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Disable failed')
  }
}

export const GET = withAdminAuth(withErrorHandling(handleTwoFactorRequest))
export const POST = withAdminAuth(withErrorHandling(handleTwoFactorRequest))
export const DELETE = withAdminAuth(withErrorHandling(handleTwoFactorRequest))