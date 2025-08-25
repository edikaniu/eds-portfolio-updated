import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/admin-middleware'
import { withErrorHandling } from '@/lib/error-handler'
import { monitoring } from '@/lib/monitoring'
import { logger } from '@/lib/logger'

async function handleMonitoringRequest(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') || 'health'

  switch (type) {
    case 'health':
      const healthData = await monitoring.getSystemHealth()
      
      logger.info('System health check requested', {
        status: healthData.status,
        totalChecks: healthData.summary.totalChecks,
        healthyChecks: healthData.summary.healthyChecks
      })
      
      return NextResponse.json({
        success: true,
        data: healthData
      })

    case 'metrics':
      const metrics = await monitoring.getSystemMetrics()
      const alerts = monitoring.checkAlerts(metrics)
      
      return NextResponse.json({
        success: true,
        data: {
          metrics,
          alerts
        }
      })

    case 'history':
      const limit = parseInt(searchParams.get('limit') || '50')
      const history = monitoring.getMetricsHistory().slice(-limit)
      
      return NextResponse.json({
        success: true,
        data: history
      })

    case 'alerts':
      const currentMetrics = await monitoring.getSystemMetrics()
      const currentAlerts = monitoring.checkAlerts(currentMetrics)
      
      return NextResponse.json({
        success: true,
        data: currentAlerts
      })

    default:
      return NextResponse.json({
        success: false,
        error: {
          code: 'INVALID_TYPE',
          message: 'Invalid monitoring type. Use: health, metrics, history, or alerts'
        }
      }, { status: 400 })
  }
}

export const GET = withAdminAuth(withErrorHandling(handleMonitoringRequest))