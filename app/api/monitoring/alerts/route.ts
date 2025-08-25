import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { performanceMonitor } from '../../../../lib/performance/performance-monitor'
import { logger } from '../../../../lib/logger'

const prisma = new PrismaClient()

interface AlertThresholds {
  cpuUsage: number
  memoryUsage: number
  responseTime: number
  errorRate: number
}

const defaultThresholds: AlertThresholds = {
  cpuUsage: 80,
  memoryUsage: 85,
  responseTime: 2000,
  errorRate: 5
}

export async function GET(request: NextRequest) {
  try {
    const realTimeMetrics = performanceMonitor.getRealTimeMetrics()
    const recommendations = performanceMonitor.getRecommendations()
    
    // Check for alerts based on thresholds
    const alerts = []
    const thresholds = defaultThresholds

    // CPU usage alert
    if (realTimeMetrics.currentMemory > (thresholds.memoryUsage * 10)) { // Convert to MB approximation
      alerts.push({
        type: 'memory',
        level: 'warning',
        message: `High memory usage: ${realTimeMetrics.currentMemory}MB`,
        timestamp: new Date().toISOString(),
        value: realTimeMetrics.currentMemory,
        threshold: thresholds.memoryUsage * 10
      })
    }

    // Response time alert
    if (realTimeMetrics.averageResponseTime > thresholds.responseTime) {
      alerts.push({
        type: 'response_time',
        level: 'warning',
        message: `Slow average response time: ${realTimeMetrics.averageResponseTime}ms`,
        timestamp: new Date().toISOString(),
        value: realTimeMetrics.averageResponseTime,
        threshold: thresholds.responseTime
      })
    }

    // Error rate alert
    if (realTimeMetrics.errorRate > thresholds.errorRate) {
      alerts.push({
        type: 'error_rate',
        level: 'critical',
        message: `High error rate: ${realTimeMetrics.errorRate}%`,
        timestamp: new Date().toISOString(),
        value: realTimeMetrics.errorRate,
        threshold: thresholds.errorRate
      })
    }

    // Database connectivity alert
    let databaseAlert = null
    try {
      const dbStart = Date.now()
      await prisma.$queryRaw`SELECT 1 as test`
      const responseTime = Date.now() - dbStart
      
      if (responseTime > 1000) {
        databaseAlert = {
          type: 'database',
          level: 'warning',
          message: `Slow database response: ${responseTime}ms`,
          timestamp: new Date().toISOString(),
          value: responseTime,
          threshold: 1000
        }
      }
    } catch (error) {
      databaseAlert = {
        type: 'database',
        level: 'critical',
        message: `Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString()
      }
    }

    if (databaseAlert) {
      alerts.push(databaseAlert)
    }

    return NextResponse.json({
      alerts,
      alertCount: alerts.length,
      criticalCount: alerts.filter(a => a.level === 'critical').length,
      warningCount: alerts.filter(a => a.level === 'warning').length,
      recommendations,
      thresholds,
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })

  } catch (error) {
    logger.error('Alert monitoring failed', error)
    return NextResponse.json({
      error: 'Alert monitoring failed',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, message, webhookUrl } = body

    if (!type || !message) {
      return NextResponse.json({
        error: 'Missing required fields: type and message'
      }, { status: 400 })
    }

    // Send webhook notification if URL provided
    if (webhookUrl) {
      const webhookPayload = {
        text: `🚨 **Production Alert**\n\n**Type:** ${type}\n**Message:** ${message}\n**Time:** ${new Date().toISOString()}`,
        timestamp: new Date().toISOString()
      }

      try {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(webhookPayload)
        })

        if (!response.ok) {
          throw new Error(`Webhook failed: ${response.status}`)
        }

        logger.info('Alert webhook sent successfully', { type, message })
      } catch (error) {
        logger.error('Failed to send alert webhook', { type, message, error })
      }
    }

    // Log the alert
    logger.warn('Manual alert triggered', { type, message })

    return NextResponse.json({
      success: true,
      message: 'Alert processed successfully',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    logger.error('Failed to process alert', error)
    return NextResponse.json({
      error: 'Failed to process alert'
    }, { status: 500 })
  }
}