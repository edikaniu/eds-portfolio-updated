import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/admin-middleware'
import { withErrorHandling } from '@/lib/error-handler'
import { backupSystem } from '@/lib/backup-system'
import { logger } from '@/lib/logger'

async function handleBackupSystemRequest(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')

  switch (request.method) {
    case 'GET':
      return await handleGetRequest(action, searchParams)
    case 'POST':
      return await handlePostRequest(request, action)
    case 'DELETE':
      return await handleDeleteRequest(searchParams)
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

async function handleGetRequest(action: string | null, searchParams: URLSearchParams): Promise<NextResponse> {
  switch (action) {
    case 'history':
      const limit = parseInt(searchParams.get('limit') || '50')
      const history = await backupSystem.getBackupHistory(limit)
      
      return NextResponse.json({
        success: true,
        data: history
      })

    case 'recovery-points':
      const recoveryPoints = await backupSystem.getRecoveryPoints()
      
      return NextResponse.json({
        success: true,
        data: recoveryPoints
      })

    case 'statistics':
      const stats = await backupSystem.getBackupStatistics()
      
      return NextResponse.json({
        success: true,
        data: stats
      })

    case 'validate':
      const backupId = searchParams.get('backupId')
      if (!backupId) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'MISSING_BACKUP_ID',
              message: 'Backup ID is required for validation'
            }
          },
          { status: 400 }
        )
      }

      const isValid = await backupSystem.validateBackupIntegrity(backupId)
      
      return NextResponse.json({
        success: true,
        data: {
          backupId,
          isValid,
          message: isValid ? 'Backup integrity verified' : 'Backup integrity check failed'
        }
      })

    default:
      // Default: return system status
      const defaultStats = await backupSystem.getBackupStatistics()
      const recentHistory = await backupSystem.getBackupHistory(5)
      
      return NextResponse.json({
        success: true,
        data: {
          statistics: defaultStats,
          recentBackups: recentHistory,
          status: 'operational'
        }
      })
  }
}

async function handlePostRequest(request: NextRequest, action: string | null): Promise<NextResponse> {
  const body = await request.json()

  switch (action) {
    case 'create':
      const {
        type = 'manual',
        includeMedia = true,
        includeSystemData = true,
        compression = true
      } = body

      logger.info('Manual backup creation requested', {
        type,
        includeMedia,
        includeSystemData,
        compression
      })

      const backup = await backupSystem.createBackup(type, {
        includeMedia,
        includeSystemData,
        compression
      })

      return NextResponse.json({
        success: true,
        data: backup,
        message: 'Backup created successfully'
      })

    case 'restore':
      const {
        backupId,
        selectiveTables = [],
        createPreRestoreBackup = true,
        validateIntegrity = true
      } = body

      if (!backupId) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'MISSING_BACKUP_ID',
              message: 'Backup ID is required for restore'
            }
          },
          { status: 400 }
        )
      }

      logger.info('Backup restore requested', {
        backupId,
        selectiveTables,
        createPreRestoreBackup,
        validateIntegrity
      })

      const restoreSuccess = await backupSystem.restoreFromBackup(backupId, {
        selectiveTables: selectiveTables.length > 0 ? selectiveTables : undefined,
        createPreRestoreBackup,
        validateIntegrity
      })

      return NextResponse.json({
        success: restoreSuccess,
        message: restoreSuccess ? 'Restore completed successfully' : 'Restore failed'
      })

    case 'schedule':
      const {
        schedule = 'daily',
        retention = 30,
        includeMedia: scheduleIncludeMedia = true,
        includeSystemData: scheduleIncludeSystemData = true,
        compression: scheduleCompression = true,
        destinations = ['local']
      } = body

      await backupSystem.scheduleBackups({
        schedule,
        retention,
        includeMedia: scheduleIncludeMedia,
        includeSystemData: scheduleIncludeSystemData,
        compression: scheduleCompression,
        destinations
      })

      return NextResponse.json({
        success: true,
        message: 'Backup schedule updated successfully'
      })

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

async function handleDeleteRequest(searchParams: URLSearchParams): Promise<NextResponse> {
  const backupId = searchParams.get('backupId')

  if (!backupId) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'MISSING_BACKUP_ID',
          message: 'Backup ID is required for deletion'
        }
      },
      { status: 400 }
    )
  }

  logger.info('Backup deletion requested', { backupId })

  const deleteSuccess = await backupSystem.deleteBackup(backupId)

  return NextResponse.json({
    success: deleteSuccess,
    message: deleteSuccess ? 'Backup deleted successfully' : 'Failed to delete backup'
  })
}

export const GET = withAdminAuth(withErrorHandling(handleBackupSystemRequest))
export const POST = withAdminAuth(withErrorHandling(handleBackupSystemRequest))
export const DELETE = withAdminAuth(withErrorHandling(handleBackupSystemRequest))