import { NextRequest, NextResponse } from 'next/server'
import { cacheManager } from '../../../../lib/cache/cache-manager'
import { logger } from '../../../../lib/logger'

export async function POST(request: NextRequest) {
  try {
    logger.info('Cache cleanup requested')

    // Clear all cache
    const result = await cacheManager.clear()
    const stats = cacheManager.getStats()
    const metrics = cacheManager.getMetrics()

    if (result) {
      logger.info('Cache cleanup completed successfully')
      
      return NextResponse.json({
        success: true,
        message: 'Cache cleared successfully',
        previousStats: {
          itemsCleared: metrics.sets - metrics.deletes,
          memoryFreed: metrics.memory_usage
        },
        currentStats: stats
      })
    } else {
      return NextResponse.json({
        success: false,
        error: 'Cache cleanup failed'
      }, { status: 500 })
    }

  } catch (error) {
    logger.error('Cache cleanup failed', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Cache cleanup failed'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const stats = cacheManager.getStats()
    const metrics = cacheManager.getMetrics()

    return NextResponse.json({
      stats,
      metrics,
      recommendations: getMemoryRecommendations(stats)
    })

  } catch (error) {
    logger.error('Failed to fetch cache stats', error)
    return NextResponse.json({
      error: 'Failed to fetch cache stats'
    }, { status: 500 })
  }
}

function getMemoryRecommendations(stats: any) {
  const recommendations = []

  if (stats.hitRate < 70) {
    recommendations.push({
      type: 'warning',
      message: `Cache hit rate is low (${stats.hitRate}%). Consider reviewing caching strategy.`
    })
  }

  if (stats.memoryItems > 800) {
    recommendations.push({
      type: 'info',
      message: `High number of cached items (${stats.memoryItems}). Consider increasing cleanup frequency.`
    })
  }

  if (stats.memoryUsage > 50 * 1024 * 1024) { // 50MB
    recommendations.push({
      type: 'warning',
      message: `High memory usage (${Math.round(stats.memoryUsage / 1024 / 1024)}MB). Consider clearing cache.`
    })
  }

  return recommendations
}