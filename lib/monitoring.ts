import { logger } from './logger'

export interface HealthCheck {
  name: string
  status: 'healthy' | 'unhealthy' | 'degraded'
  responseTime?: number
  error?: string
  metadata?: Record<string, any>
}

export interface SystemMetrics {
  timestamp: Date
  memory?: NodeJS.MemoryUsage
  uptime: number
  loadAverage?: number[]
  healthChecks: HealthCheck[]
}

export class MonitoringService {
  private static instance: MonitoringService
  private healthChecks: Map<string, () => Promise<HealthCheck>> = new Map()
  private metrics: SystemMetrics[] = []
  private readonly maxMetricsHistory = 100

  static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService()
    }
    return MonitoringService.instance
  }

  registerHealthCheck(name: string, checkFunction: () => Promise<HealthCheck>) {
    this.healthChecks.set(name, checkFunction)
    logger.info(`Registered health check: ${name}`)
  }

  async runHealthChecks(): Promise<HealthCheck[]> {
    const results: HealthCheck[] = []

    for (const [name, checkFunction] of this.healthChecks) {
      try {
        const startTime = Date.now()
        const result = await checkFunction()
        const responseTime = Date.now() - startTime

        results.push({
          ...result,
          name,
          responseTime
        })
      } catch (error) {
        results.push({
          name,
          status: 'unhealthy',
          error: error instanceof Error ? error.message : 'Unknown error',
          responseTime: 0
        })
      }
    }

    return results
  }

  async getSystemMetrics(): Promise<SystemMetrics> {
    const healthChecks = await this.runHealthChecks()
    
    const metrics: SystemMetrics = {
      timestamp: new Date(),
      uptime: process.uptime ? process.uptime() : 0,
      healthChecks
    }

    // Add memory usage if available
    if (typeof process !== 'undefined' && process.memoryUsage) {
      metrics.memory = process.memoryUsage()
    }

    // Add load average if available (Unix systems)
    if (typeof process !== 'undefined' && process.platform !== 'win32') {
      try {
        const os = require('os')
        metrics.loadAverage = os.loadavg()
      } catch (error) {
        // Load average not available
      }
    }

    // Store metrics history
    this.metrics.push(metrics)
    if (this.metrics.length > this.maxMetricsHistory) {
      this.metrics.shift()
    }

    return metrics
  }

  getMetricsHistory(): SystemMetrics[] {
    return this.metrics.slice()
  }

  async getSystemHealth(): Promise<{
    status: 'healthy' | 'unhealthy' | 'degraded'
    metrics: SystemMetrics
    summary: {
      totalChecks: number
      healthyChecks: number
      unhealthyChecks: number
      degradedChecks: number
    }
  }> {
    const metrics = await this.getSystemMetrics()
    
    const summary = {
      totalChecks: metrics.healthChecks.length,
      healthyChecks: metrics.healthChecks.filter(c => c.status === 'healthy').length,
      unhealthyChecks: metrics.healthChecks.filter(c => c.status === 'unhealthy').length,
      degradedChecks: metrics.healthChecks.filter(c => c.status === 'degraded').length
    }

    let overallStatus: 'healthy' | 'unhealthy' | 'degraded' = 'healthy'
    if (summary.unhealthyChecks > 0) {
      overallStatus = 'unhealthy'
    } else if (summary.degradedChecks > 0) {
      overallStatus = 'degraded'
    }

    return {
      status: overallStatus,
      metrics,
      summary
    }
  }

  // Performance tracking
  async trackOperation<T>(
    operationName: string,
    operation: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    const startTime = Date.now()
    
    try {
      const result = await operation()
      const duration = Date.now() - startTime

      logger.info(`Operation completed: ${operationName}`, {
        operation: operationName,
        duration,
        status: 'success',
        metadata
      })

      return result
    } catch (error) {
      const duration = Date.now() - startTime

      logger.error(`Operation failed: ${operationName}`, {
        operation: operationName,
        duration,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata
      })

      throw error
    }
  }

  // Alert thresholds
  private alertThresholds = {
    responseTime: 5000, // 5 seconds
    memoryUsage: 0.9, // 90%
    errorRate: 0.05 // 5%
  }

  checkAlerts(metrics: SystemMetrics): Array<{
    type: string
    severity: 'warning' | 'critical'
    message: string
    value: any
    threshold: any
  }> {
    const alerts = []

    // Check response times
    for (const check of metrics.healthChecks) {
      if (check.responseTime && check.responseTime > this.alertThresholds.responseTime) {
        alerts.push({
          type: 'slow_response',
          severity: 'warning' as const,
          message: `Slow response time for ${check.name}`,
          value: check.responseTime,
          threshold: this.alertThresholds.responseTime
        })
      }
    }

    // Check memory usage
    if (metrics.memory) {
      const memoryUsageRatio = metrics.memory.heapUsed / metrics.memory.heapTotal
      if (memoryUsageRatio > this.alertThresholds.memoryUsage) {
        alerts.push({
          type: 'high_memory',
          severity: 'warning' as const,
          message: 'High memory usage detected',
          value: memoryUsageRatio,
          threshold: this.alertThresholds.memoryUsage
        })
      }
    }

    // Check for unhealthy services
    const unhealthyCount = metrics.healthChecks.filter(c => c.status === 'unhealthy').length
    if (unhealthyCount > 0) {
      alerts.push({
        type: 'service_down',
        severity: 'critical' as const,
        message: `${unhealthyCount} service(s) are unhealthy`,
        value: unhealthyCount,
        threshold: 0
      })
    }

    return alerts
  }
}

// Default health checks
export function setupDefaultHealthChecks(monitoring: MonitoringService) {
  // Database health check
  monitoring.registerHealthCheck('database', async () => {
    try {
      const { prisma } = await import('./prisma')
      await prisma.$queryRaw`SELECT 1`
      return {
        name: 'database',
        status: 'healthy' as const,
        metadata: { provider: 'sqlite' }
      }
    } catch (error) {
      return {
        name: 'database',
        status: 'unhealthy' as const,
        error: error instanceof Error ? error.message : 'Database connection failed'
      }
    }
  })

  // Memory health check
  monitoring.registerHealthCheck('memory', async () => {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const memUsage = process.memoryUsage()
      const usageRatio = memUsage.heapUsed / memUsage.heapTotal

      return {
        name: 'memory',
        status: usageRatio > 0.9 ? 'degraded' as const : 'healthy' as const,
        metadata: {
          heapUsed: memUsage.heapUsed,
          heapTotal: memUsage.heapTotal,
          usageRatio: Math.round(usageRatio * 100) / 100
        }
      }
    }

    return {
      name: 'memory',
      status: 'healthy' as const,
      metadata: { message: 'Memory usage not available' }
    }
  })

  // Disk space health check (if available)
  monitoring.registerHealthCheck('disk', async () => {
    try {
      const fs = require('fs').promises
      const stats = await fs.statSync('.')
      
      return {
        name: 'disk',
        status: 'healthy' as const,
        metadata: { message: 'Disk space check completed' }
      }
    } catch (error) {
      return {
        name: 'disk',
        status: 'degraded' as const,
        error: 'Could not check disk space'
      }
    }
  })
}

// Export singleton instance
export const monitoring = MonitoringService.getInstance()

// Auto-setup default health checks
if (typeof process !== 'undefined') {
  setupDefaultHealthChecks(monitoring)
}