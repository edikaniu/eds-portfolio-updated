import { NextRequest, NextResponse } from 'next/server'
import { backupSystem } from '../../../../lib/backup-system'
import { logger } from '../../../../lib/logger'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const { 
      type = 'manual',
      includeMedia = true,
      includeSystemData = true,
      compression = true 
    } = body

    logger.info('Backup creation requested', { type, includeMedia, includeSystemData, compression })

    const manifest = await backupSystem.createBackup(type as 'manual' | 'scheduled' | 'pre-update', {
      includeMedia,
      includeSystemData,
      compression
    })

    return NextResponse.json({
      success: true,
      message: 'Backup created successfully',
      backup: manifest
    })

  } catch (error) {
    logger.error('Backup creation failed', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Backup creation failed'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')

    const backups = await backupSystem.getBackupHistory(limit)
    const statistics = await backupSystem.getBackupStatistics()

    return NextResponse.json({
      backups,
      statistics,
      count: backups.length
    })

  } catch (error) {
    logger.error('Failed to fetch backup history', error)
    return NextResponse.json({
      error: 'Failed to fetch backup history'
    }, { status: 500 })
  }
}