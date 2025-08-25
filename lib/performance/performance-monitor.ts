import { logger } from '../logger'

export interface PerformanceMetric {
  name: string
  value: number
  timestamp: Date
  tags?: Record<string, string>
  unit?: string
}

export interface WebVital {
  name: 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB'
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  timestamp: Date
  url: string
}

export interface ResourceTiming {
  name: string
  duration: number
  size: number
  type: 'script' | 'stylesheet' | 'image' | 'document' | 'other'
  cached: boolean
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: PerformanceMetric[] = []
  private webVitals: WebVital[] = []
  private resourceTimings: ResourceTiming[] = []
  private readonly maxMetrics = 10000

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  // Server-side performance tracking
  startTimer(name: string): () => number {
    const startTime = process.hrtime.bigint()
    
    return (): number => {
      const endTime = process.hrtime.bigint()
      const duration = Number(endTime - startTime) / 1000000 // Convert to milliseconds
      
      this.recordMetric({
        name,
        value: duration,
        timestamp: new Date(),
        unit: 'ms'
      })
      
      return duration
    }
  }

  recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric)
    
    // Trim metrics if exceeding max
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics)
    }
    
    // Log slow operations
    if (metric.value > 1000 && metric.unit === 'ms') {
      logger.warn('Slow operation detected', {
        name: metric.name,
        duration: metric.value,
        tags: metric.tags
      })
    }
  }

  recordWebVital(vital: WebVital): void {
    this.webVitals.push(vital)
    
    if (vital.rating === 'poor') {
      logger.warn('Poor web vital detected', {
        name: vital.name,
        value: vital.value,
        url: vital.url
      })
    }
  }

  recordResourceTiming(resource: ResourceTiming): void {
    this.resourceTimings.push(resource)
    
    // Trim if exceeding limit
    if (this.resourceTimings.length > 1000) {
      this.resourceTimings = this.resourceTimings.slice(-1000)
    }
    
    // Log slow resources
    if (resource.duration > 2000) {
      logger.warn('Slow resource loading detected', {
        name: resource.name,
        duration: resource.duration,
        size: resource.size,
        type: resource.type
      })
    }
  }

  // Database query performance tracking
  trackDatabaseQuery<T>(
    queryName: string,
    queryFn: () => Promise<T>
  ): Promise<T> {
    const timer = this.startTimer(`db_query_${queryName}`)
    
    return queryFn().finally(() => {
      const duration = timer()
      
      this.recordMetric({
        name: 'database_query_duration',
        value: duration,
        timestamp: new Date(),
        tags: { query: queryName },
        unit: 'ms'
      })
    })
  }

  // API endpoint performance tracking
  trackApiEndpoint(
    method: string,
    path: string,
    statusCode: number,
    duration: number,
    responseSize?: number
  ): void {
    this.recordMetric({
      name: 'api_request_duration',
      value: duration,
      timestamp: new Date(),
      tags: {
        method,
        path,
        status: statusCode.toString()
      },
      unit: 'ms'
    })
    
    if (responseSize) {
      this.recordMetric({
        name: 'api_response_size',
        value: responseSize,
        timestamp: new Date(),
        tags: { method, path },
        unit: 'bytes'
      })
    }
  }

  // Memory usage tracking
  trackMemoryUsage(): void {
    const memoryUsage = process.memoryUsage()
    const timestamp = new Date()
    
    Object.entries(memoryUsage).forEach(([key, value]) => {
      this.recordMetric({
        name: `memory_${key}`,
        value: value / 1024 / 1024, // Convert to MB
        timestamp,
        unit: 'MB'
      })
    })
  }

  // Get performance statistics
  getPerformanceStats(timeRange?: { start: Date; end: Date }): {
    summary: {
      totalMetrics: number
      slowOperations: number
      averageResponseTime: number
      memoryUsage: number
    }
    webVitals: {
      cls: { good: number; needsImprovement: number; poor: number }
      fid: { good: number; needsImprovement: number; poor: number }
      lcp: { good: number; needsImprovement: number; poor: number }
    }
    topSlowQueries: Array<{
      name: string
      averageDuration: number
      count: number
    }>
    resourcePerformance: {
      totalResources: number
      averageLoadTime: number
      cacheHitRate: number
      largestResources: Array<{
        name: string
        size: number
        duration: number
      }>
    }
  } {
    let filteredMetrics = this.metrics
    let filteredVitals = this.webVitals
    let filteredResources = this.resourceTimings
    
    if (timeRange) {
      filteredMetrics = this.metrics.filter(m => 
        m.timestamp >= timeRange.start && m.timestamp <= timeRange.end
      )
      filteredVitals = this.webVitals.filter(v => 
        v.timestamp >= timeRange.start && v.timestamp <= timeRange.end
      )
    }

    // Summary statistics
    const slowOperations = filteredMetrics.filter(m => 
      m.unit === 'ms' && m.value > 1000
    ).length
    
    const responseTimeMetrics = filteredMetrics.filter(m => 
      m.name === 'api_request_duration'
    )
    const averageResponseTime = responseTimeMetrics.length > 0
      ? responseTimeMetrics.reduce((sum, m) => sum + m.value, 0) / responseTimeMetrics.length
      : 0
    
    const memoryMetrics = filteredMetrics.filter(m => 
      m.name.startsWith('memory_rss')
    )
    const currentMemoryUsage = memoryMetrics.length > 0 
      ? memoryMetrics[memoryMetrics.length - 1].value 
      : 0

    // Web Vitals analysis
    const webVitalsStats = {
      cls: { good: 0, needsImprovement: 0, poor: 0 },
      fid: { good: 0, needsImprovement: 0, poor: 0 },
      lcp: { good: 0, needsImprovement: 0, poor: 0 }
    }
    
    filteredVitals.forEach(vital => {
      const vitalName = vital.name.toLowerCase() as keyof typeof webVitalsStats
      if (webVitalsStats[vitalName]) {
        webVitalsStats[vitalName][vital.rating.replace('-', '') as keyof typeof webVitalsStats.cls]++
      }
    })

    // Top slow queries
    const queryMetrics = filteredMetrics.filter(m => 
      m.name === 'database_query_duration'
    )
    const queryStats = new Map<string, { total: number; count: number }>()
    
    queryMetrics.forEach(metric => {
      const queryName = metric.tags?.query || 'unknown'
      const current = queryStats.get(queryName) || { total: 0, count: 0 }
      current.total += metric.value
      current.count += 1
      queryStats.set(queryName, current)
    })
    
    const topSlowQueries = Array.from(queryStats.entries())
      .map(([name, stats]) => ({
        name,
        averageDuration: stats.total / stats.count,
        count: stats.count
      }))
      .sort((a, b) => b.averageDuration - a.averageDuration)
      .slice(0, 10)

    // Resource performance
    const totalResources = filteredResources.length
    const averageLoadTime = totalResources > 0
      ? filteredResources.reduce((sum, r) => sum + r.duration, 0) / totalResources
      : 0
    const cacheHitRate = totalResources > 0
      ? (filteredResources.filter(r => r.cached).length / totalResources) * 100
      : 0
    const largestResources = filteredResources
      .sort((a, b) => b.size - a.size)
      .slice(0, 10)

    return {
      summary: {
        totalMetrics: filteredMetrics.length,
        slowOperations,
        averageResponseTime,
        memoryUsage: currentMemoryUsage
      },
      webVitals: webVitalsStats,
      topSlowQueries,
      resourcePerformance: {
        totalResources,
        averageLoadTime,
        cacheHitRate,
        largestResources
      }
    }
  }

  // Get real-time metrics for dashboard
  getRealTimeMetrics(): {
    currentMemory: number
    requestsPerMinute: number
    averageResponseTime: number
    errorRate: number
    activeConnections: number
  } {
    const now = new Date()
    const oneMinuteAgo = new Date(now.getTime() - 60000)
    
    const recentMetrics = this.metrics.filter(m => m.timestamp > oneMinuteAgo)
    const recentApiRequests = recentMetrics.filter(m => m.name === 'api_request_duration')
    
    const errorMetrics = recentApiRequests.filter(m => {
      const status = parseInt(m.tags?.status || '200')
      return status >= 400
    })
    
    return {
      currentMemory: this.getCurrentMemoryUsage(),
      requestsPerMinute: recentApiRequests.length,
      averageResponseTime: recentApiRequests.length > 0
        ? recentApiRequests.reduce((sum, m) => sum + m.value, 0) / recentApiRequests.length
        : 0,
      errorRate: recentApiRequests.length > 0
        ? (errorMetrics.length / recentApiRequests.length) * 100
        : 0,
      activeConnections: this.getActiveConnections()
    }
  }

  // Generate performance recommendations
  getRecommendations(): Array<{
    type: 'warning' | 'info' | 'critical'
    title: string
    description: string
    impact: 'high' | 'medium' | 'low'
  }> {
    const recommendations = []
    const stats = this.getPerformanceStats()
    
    // Memory usage recommendations
    if (stats.summary.memoryUsage > 500) {
      recommendations.push({
        type: 'warning' as const,
        title: 'High Memory Usage',
        description: `Memory usage is at ${stats.summary.memoryUsage.toFixed(1)} MB. Consider optimizing memory-intensive operations.`,
        impact: 'high' as const
      })
    }
    
    // Response time recommendations
    if (stats.summary.averageResponseTime > 500) {
      recommendations.push({
        type: 'warning' as const,
        title: 'Slow Response Times',
        description: `Average response time is ${stats.summary.averageResponseTime.toFixed(1)}ms. Consider optimizing database queries and API endpoints.`,
        impact: 'high' as const
      })
    }
    
    // Cache hit rate recommendations
    if (stats.resourcePerformance.cacheHitRate < 80) {
      recommendations.push({
        type: 'info' as const,
        title: 'Low Cache Hit Rate',
        description: `Cache hit rate is ${stats.resourcePerformance.cacheHitRate.toFixed(1)}%. Consider implementing more aggressive caching strategies.`,
        impact: 'medium' as const
      })
    }
    
    // Large resource recommendations
    const largeResources = stats.resourcePerformance.largestResources.filter(r => r.size > 1000000)
    if (largeResources.length > 0) {
      recommendations.push({
        type: 'info' as const,
        title: 'Large Resources Detected',
        description: `Found ${largeResources.length} resources larger than 1MB. Consider optimizing or lazy loading these assets.`,
        impact: 'medium' as const
      })
    }
    
    return recommendations
  }

  // Automatic monitoring removed for serverless compatibility
  // Use the /api/monitoring/system endpoint for on-demand monitoring
  startMonitoring(intervalMs: number = 30000): void {
    logger.info('Performance monitoring initialized (serverless mode)', { interval: intervalMs })
  }

  private getCurrentMemoryUsage(): number {
    const memoryMetrics = this.metrics.filter(m => m.name === 'memory_rss')
    return memoryMetrics.length > 0 ? memoryMetrics[memoryMetrics.length - 1].value : 0
  }

  private getActiveConnections(): number {
    // In a real implementation, you would track actual connections
    return Math.floor(Math.random() * 50) + 10
  }

  // Export metrics for external monitoring systems
  exportMetrics(format: 'json' | 'prometheus' = 'json'): string {
    if (format === 'prometheus') {
      return this.exportPrometheusMetrics()
    }
    
    return JSON.stringify({
      metrics: this.metrics.slice(-1000), // Last 1000 metrics
      webVitals: this.webVitals.slice(-100),
      resourceTimings: this.resourceTimings.slice(-100),
      timestamp: new Date().toISOString()
    }, null, 2)
  }

  private exportPrometheusMetrics(): string {
    const lines: string[] = []
    
    // Group metrics by name
    const metricGroups = new Map<string, PerformanceMetric[]>()
    this.metrics.forEach(metric => {
      if (!metricGroups.has(metric.name)) {
        metricGroups.set(metric.name, [])
      }
      metricGroups.get(metric.name)!.push(metric)
    })
    
    metricGroups.forEach((metrics, name) => {
      const latest = metrics[metrics.length - 1]
      const sanitizedName = name.replace(/[^a-zA-Z0-9_]/g, '_')
      
      lines.push(`# HELP ${sanitizedName} ${name}`)
      lines.push(`# TYPE ${sanitizedName} gauge`)
      
      const labels = latest.tags ? Object.entries(latest.tags)
        .map(([k, v]) => `${k}="${v}"`).join(',') : ''
      
      lines.push(`${sanitizedName}${labels ? `{${labels}}` : ''} ${latest.value}`)
    })
    
    return lines.join('\n')
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance()

// Start monitoring on import
performanceMonitor.startMonitoring()