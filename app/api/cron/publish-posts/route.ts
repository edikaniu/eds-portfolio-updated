import { NextRequest, NextResponse } from 'next/server'
import { contentScheduler } from '@/lib/content-scheduler'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
  try {
    // Verify the cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    logger.info('Starting scheduled post publication cron job')

    const results = await contentScheduler.publishScheduledPosts()

    // Clean up old drafts (older than 30 days)
    const cleanedUp = await contentScheduler.cleanupExpiredDrafts(30)

    const response = {
      success: true,
      published: results.published,
      failed: results.failed.length,
      failedIds: results.failed,
      cleanedUpDrafts: cleanedUp,
      timestamp: new Date().toISOString()
    }

    logger.info('Scheduled post publication cron job completed', response)

    return NextResponse.json(response)

  } catch (error) {
    logger.error('Scheduled post publication cron job failed', error)
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Cron job failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  return GET(request)
}