import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // Basic health checks
    const healthChecks = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
      checks: {
        database: { status: 'unknown', responseTime: 0 },
        memory: { status: 'unknown', usage: 0, limit: 0 },
        nodeVersion: process.version,
        platform: process.platform,
      }
    }

    // Database connectivity check
    try {
      const dbStartTime = Date.now()
      await prisma.$queryRaw`SELECT 1 as test`
      const dbResponseTime = Date.now() - dbStartTime
      
      healthChecks.checks.database = {
        status: 'healthy',
        responseTime: dbResponseTime
      }
    } catch (dbError) {
      healthChecks.checks.database = {
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        error: dbError instanceof Error ? dbError.message : 'Database connection failed'
      }
      healthChecks.status = 'unhealthy'
    }

    // Memory usage check
    const memoryUsage = process.memoryUsage()
    const memoryUsageMB = Math.round(memoryUsage.heapUsed / 1024 / 1024)
    const memoryLimitMB = Math.round(memoryUsage.heapTotal / 1024 / 1024)
    
    healthChecks.checks.memory = {
      status: memoryUsageMB > 400 ? 'warning' : 'healthy', // Warning at 400MB
      usage: memoryUsageMB,
      limit: memoryLimitMB,
      rss: Math.round(memoryUsage.rss / 1024 / 1024),
      external: Math.round(memoryUsage.external / 1024 / 1024)
    }

    const responseTime = Date.now() - startTime
    
    return NextResponse.json({
      ...healthChecks,
      responseTime: `${responseTime}ms`
    }, {
      status: healthChecks.status === 'healthy' ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    const responseTime = Date.now() - startTime
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Health check failed',
      responseTime: `${responseTime}ms`
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