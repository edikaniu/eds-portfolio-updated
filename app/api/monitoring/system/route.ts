import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { performanceMonitor } from '../../../../lib/performance/performance-monitor'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const stats = performanceMonitor.getPerformanceStats()
    const realTimeMetrics = performanceMonitor.getRealTimeMetrics()
    const recommendations = performanceMonitor.getRecommendations()

    // System health check
    const systemHealth = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024)
      },
      cpu: {
        loadAverage: process.platform === 'linux' ? require('os').loadavg()[0] : 0
      }
    }

    // Database connectivity check
    let databaseStatus = 'unknown'
    let databaseResponseTime = 0
    try {
      const dbStart = Date.now()
      await prisma.$queryRaw`SELECT 1 as test`
      databaseResponseTime = Date.now() - dbStart
      databaseStatus = 'healthy'
    } catch (error) {
      databaseStatus = 'unhealthy'
    }

    return NextResponse.json({
      systemHealth,
      database: {
        status: databaseStatus,
        responseTime: databaseResponseTime
      },
      performance: stats,
      realTime: realTimeMetrics,
      recommendations
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'System monitoring failed'
    }, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } finally {
    await prisma.$disconnect()
  }
}