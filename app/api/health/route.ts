import { NextRequest, NextResponse } from 'next/server'
import { withErrorHandling } from '@/lib/error-handler'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

async function handleHealthCheck(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now()
  const checks: Record<string, any> = {}

  // Database health check
  try {
    await prisma.$queryRaw`SELECT 1`
    checks.database = {
      status: 'healthy',
      responseTime: `${Date.now() - startTime}ms`
    }
  } catch (error) {
    checks.database = {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Database connection failed',
      responseTime: `${Date.now() - startTime}ms`
    }
  }

  // Memory usage check
  if (typeof process !== 'undefined' && process.memoryUsage) {
    const memUsage = process.memoryUsage()
    checks.memory = {
      status: 'healthy',
      usage: {
        heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
        external: `${Math.round(memUsage.external / 1024 / 1024)}MB`,
        rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`
      }
    }
  }

  // Environment checks
  checks.environment = {
    status: 'healthy',
    nodeEnv: process.env.NODE_ENV,
    version: process.version
  }

  // API response time
  checks.api = {
    status: 'healthy',
    responseTime: `${Date.now() - startTime}ms`
  }

  const overallStatus = Object.values(checks).every(check => check.status === 'healthy') 
    ? 'healthy' : 'degraded'

  const response = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime ? `${Math.floor(process.uptime())}s` : 'unknown',
    checks
  }

  logger.info('Health check completed', { 
    status: overallStatus, 
    responseTime: `${Date.now() - startTime}ms` 
  })

  return NextResponse.json(response, { 
    status: overallStatus === 'healthy' ? 200 : 503 
  })
}

export const GET = withErrorHandling(handleHealthCheck)