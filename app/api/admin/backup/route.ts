import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/admin-middleware'
import { contentVersioning } from '@/lib/content-versioning'
import { logger } from '@/lib/logger'

// Get backup history
export const GET = withAdminAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')

    const backups = await contentVersioning.getBackupHistory(limit)

    return NextResponse.json({
      success: true,
      data: backups
    })

  } catch (error) {
    logger.error('Failed to get backup history', error)
    return NextResponse.json(
      { success: false, message: 'Failed to get backup history' },
      { status: 500 }
    )
  }
})

// Create a new backup
export const POST = withAdminAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'userId is required' },
        { status: 400 }
      )
    }

    const backup = await contentVersioning.createFullBackup(userId)

    return NextResponse.json({
      success: true,
      data: backup,
      message: 'Backup created successfully'
    })

  } catch (error) {
    logger.error('Failed to create backup', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create backup' },
      { status: 500 }
    )
  }
})

// Restore from backup
export const PUT = withAdminAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { backupId, userId } = body

    if (!backupId || !userId) {
      return NextResponse.json(
        { success: false, message: 'backupId and userId are required' },
        { status: 400 }
      )
    }

    const success = await contentVersioning.restoreFromBackup(backupId, userId)

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Content restored from backup successfully'
      })
    } else {
      return NextResponse.json(
        { success: false, message: 'Failed to restore from backup' },
        { status: 500 }
      )
    }

  } catch (error) {
    logger.error('Failed to restore from backup', error)
    return NextResponse.json(
      { success: false, message: 'Failed to restore from backup' },
      { status: 500 }
    )
  }
})