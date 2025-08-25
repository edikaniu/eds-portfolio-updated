import { NextRequest, NextResponse } from 'next/server'
import { backupSystem } from '../../../../lib/backup-system'
import { logger } from '../../../../lib/logger'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      backupId,
      selectiveTables,
      createPreRestoreBackup = true,
      validateIntegrity = true
    } = body

    if (!backupId) {
      return NextResponse.json({
        success: false,
        error: 'Backup ID is required'
      }, { status: 400 })
    }

    logger.info('Backup restore requested', { 
      backupId, 
      selectiveTables, 
      createPreRestoreBackup, 
      validateIntegrity 
    })

    const result = await backupSystem.restoreFromBackup(backupId, {
      selectiveTables,
      createPreRestoreBackup,
      validateIntegrity
    })

    if (result) {
      return NextResponse.json({
        success: true,
        message: 'Backup restored successfully',
        backupId
      })
    } else {
      return NextResponse.json({
        success: false,
        error: 'Backup restore failed'
      }, { status: 500 })
    }

  } catch (error) {
    logger.error('Backup restore failed', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Backup restore failed'
    }, { status: 500 })
  }
}