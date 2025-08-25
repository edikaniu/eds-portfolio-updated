import { NextRequest, NextResponse } from 'next/server'
import { cacheManager } from '../../../../lib/cache/cache-manager'
import { backupSystem } from '../../../../lib/backup-system'
import { logger } from '../../../../lib/logger'

// This endpoint can be called by Vercel Cron or external schedulers
export async function POST(request: NextRequest) {
  // Verify the request is from a scheduled source
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const task = searchParams.get('task') || 'all'
    
    const results = {
      timestamp: new Date().toISOString(),
      tasks: {} as any
    }

    logger.info('Scheduled maintenance started', { task })

    // Cache cleanup
    if (task === 'all' || task === 'cache') {
      try {
        // Clean up expired items manually since we removed the background process
        let cleaned = 0
        const cache = (cacheManager as any).memoryCache
        for (const [key, item] of cache) {
          if ((cacheManager as any).isExpired(item)) {
            cache.delete(key)
            cleaned++
          }
        }
        
        if (cleaned > 0) {
          (cacheManager as any).updateMemoryUsage()
        }

        results.tasks.cache = {
          success: true,
          itemsCleaned: cleaned,
          currentItems: cache.size
        }
        
        logger.info('Cache maintenance completed', { cleaned })
      } catch (error) {
        results.tasks.cache = {
          success: false,
          error: error instanceof Error ? error.message : 'Cache cleanup failed'
        }
      }
    }

    // Automated backup (if enabled)
    if (task === 'all' || task === 'backup') {
      try {
        const shouldBackup = process.env.ENABLE_AUTO_BACKUP === 'true'
        
        if (shouldBackup) {
          const manifest = await backupSystem.createBackup('scheduled')
          results.tasks.backup = {
            success: true,
            backupId: manifest.id,
            size: manifest.size
          }
          logger.info('Scheduled backup completed', { backupId: manifest.id })
        } else {
          results.tasks.backup = {
            success: true,
            skipped: 'Auto backup not enabled'
          }
        }
      } catch (error) {
        results.tasks.backup = {
          success: false,
          error: error instanceof Error ? error.message : 'Backup failed'
        }
      }
    }

    const successCount = Object.values(results.tasks).filter((task: any) => task.success).length
    const totalTasks = Object.keys(results.tasks).length

    return NextResponse.json({
      success: successCount === totalTasks,
      message: `Maintenance completed: ${successCount}/${totalTasks} tasks successful`,
      ...results
    })

  } catch (error) {
    logger.error('Scheduled maintenance failed', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Maintenance failed',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// GET endpoint for health check
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'ready',
    timestamp: new Date().toISOString(),
    availableTasks: ['cache', 'backup', 'all']
  })
}