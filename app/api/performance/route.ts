import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'

// Rate limiting: 60 requests per minute per IP
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
})

interface PerformanceData {
  url: string
  timestamp: string
  webVitals: {
    name: string
    value: number
    rating: 'good' | 'needs-improvement' | 'poor'
  }[]
  resources: {
    total: number
    totalSize: number
    compressed: number
    critical: number
  }
  navigation: {
    loadTime: number
    firstByte: number
    domContentLoaded: number
  }
  userAgent: string
  viewport: {
    width: number
    height: number
  }
  connection?: {
    effectiveType: string
    downlink: number
    rtt: number
  }
}

// In-memory storage for performance metrics (use database in production)
const performanceMetrics: PerformanceData[] = []
const MAX_METRICS_STORED = 1000

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = request.ip ?? '127.0.0.1'
    const { success } = await limiter.check(60, identifier)
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    const performanceData: PerformanceData = await request.json()

    // Validate required fields
    if (!performanceData.url || !performanceData.timestamp || !performanceData.webVitals) {
      return NextResponse.json(
        { success: false, error: 'Missing required performance data' },
        { status: 400 }
      )
    }

    // Store performance data (in production, save to database)
    performanceMetrics.push({
      ...performanceData,
      timestamp: new Date().toISOString(), // Use server timestamp
    })

    // Keep only the most recent metrics
    if (performanceMetrics.length > MAX_METRICS_STORED) {
      performanceMetrics.shift()
    }

    // Log performance issues
    const issues = analyzePerformanceData(performanceData)
    if (issues.length > 0) {
      logger.warn('Performance issues detected', {
        url: performanceData.url,
        issues: issues.map(issue => issue.message)
      })
    }

    // Generate recommendations
    const recommendations = generateRecommendations(performanceData)

    logger.info('Performance data collected', {
      url: performanceData.url,
      webVitalsCount: performanceData.webVitals.length,
      overallScore: calculateOverallScore(performanceData.webVitals)
    })

    return NextResponse.json({
      success: true,
      data: {
        stored: true,
        issues,
        recommendations,
        score: calculateOverallScore(performanceData.webVitals)
      }
    })

  } catch (error) {
    logger.error('Failed to process performance data', error)
    
    return NextResponse.json(
      { success: false, error: 'Failed to process performance data' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = request.ip ?? '127.0.0.1'
    const { success } = await limiter.check(30, identifier)
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url')
    const hours = parseInt(searchParams.get('hours') || '24')
    const limit = parseInt(searchParams.get('limit') || '100')

    // Filter metrics
    let filteredMetrics = performanceMetrics

    if (url) {
      filteredMetrics = filteredMetrics.filter(m => m.url.includes(url))
    }

    // Filter by time range
    const timeThreshold = new Date(Date.now() - hours * 60 * 60 * 1000)
    filteredMetrics = filteredMetrics.filter(m => 
      new Date(m.timestamp) > timeThreshold
    )

    // Limit results
    filteredMetrics = filteredMetrics.slice(-limit)

    // Generate summary statistics
    const summary = generateSummary(filteredMetrics)

    return NextResponse.json({
      success: true,
      data: {
        metrics: filteredMetrics,
        summary,
        totalRecords: filteredMetrics.length
      }
    })

  } catch (error) {
    logger.error('Failed to retrieve performance data', error)
    
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve performance data' },
      { status: 500 }
    )
  }
}

function analyzePerformanceData(data: PerformanceData): Array<{
  type: 'warning' | 'error' | 'info'
  metric: string
  message: string
  recommendation: string
}> {
  const issues: Array<{
    type: 'warning' | 'error' | 'info'
    metric: string
    message: string
    recommendation: string
  }> = []

  // Analyze web vitals
  data.webVitals.forEach(vital => {
    if (vital.rating === 'poor') {
      issues.push({
        type: 'error',
        metric: vital.name,
        message: `${vital.name} is poor: ${vital.value.toFixed(0)}${vital.name === 'CLS' ? '' : 'ms'}`,
        recommendation: getWebVitalRecommendation(vital.name as any)
      })
    } else if (vital.rating === 'needs-improvement') {
      issues.push({
        type: 'warning',
        metric: vital.name,
        message: `${vital.name} needs improvement: ${vital.value.toFixed(0)}${vital.name === 'CLS' ? '' : 'ms'}`,
        recommendation: getWebVitalRecommendation(vital.name as any)
      })
    }
  })

  // Analyze resources
  if (data.resources.totalSize > 2 * 1024 * 1024) { // 2MB
    issues.push({
      type: 'warning',
      metric: 'total_size',
      message: `Large total resource size: ${formatBytes(data.resources.totalSize)}`,
      recommendation: 'Optimize images, enable compression, implement code splitting'
    })
  }

  if (data.resources.compressed / data.resources.total < 0.7) {
    issues.push({
      type: 'info',
      metric: 'compression',
      message: `Low compression ratio: ${Math.round((data.resources.compressed / data.resources.total) * 100)}%`,
      recommendation: 'Enable gzip/Brotli compression for more resources'
    })
  }

  // Analyze navigation
  if (data.navigation.loadTime > 5000) {
    issues.push({
      type: 'error',
      metric: 'load_time',
      message: `Slow page load: ${data.navigation.loadTime.toFixed(0)}ms`,
      recommendation: 'Optimize critical rendering path, reduce bundle sizes'
    })
  }

  if (data.navigation.firstByte > 1000) {
    issues.push({
      type: 'warning',
      metric: 'ttfb',
      message: `Slow server response: ${data.navigation.firstByte.toFixed(0)}ms TTFB`,
      recommendation: 'Optimize server performance, use CDN, improve database queries'
    })
  }

  return issues
}

function generateRecommendations(data: PerformanceData): Array<{
  priority: 'high' | 'medium' | 'low'
  category: string
  title: string
  description: string
  impact: string
}> {
  const recommendations: Array<{
    priority: 'high' | 'medium' | 'low'
    category: string
    title: string
    description: string
    impact: string
  }> = []

  // Check for slow web vitals
  const poorVitals = data.webVitals.filter(v => v.rating === 'poor')
  if (poorVitals.length > 0) {
    recommendations.push({
      priority: 'high',
      category: 'Core Web Vitals',
      title: 'Fix Poor Web Vitals',
      description: `${poorVitals.map(v => v.name).join(', ')} need immediate attention`,
      impact: 'Improves SEO ranking and user experience'
    })
  }

  // Check resource optimization
  if (data.resources.totalSize > 1.5 * 1024 * 1024) { // 1.5MB
    recommendations.push({
      priority: 'high',
      category: 'Resource Optimization',
      title: 'Reduce Bundle Size',
      description: 'Implement code splitting and tree shaking to reduce initial bundle size',
      impact: 'Faster page loads and better mobile experience'
    })
  }

  // Check image optimization
  const hasLargeImages = data.resources.totalSize > 500 * 1024 // Assume images if large size
  if (hasLargeImages) {
    recommendations.push({
      priority: 'medium',
      category: 'Image Optimization',
      title: 'Optimize Images',
      description: 'Use modern image formats (WebP/AVIF) and responsive images',
      impact: 'Reduces bandwidth usage and improves load times'
    })
  }

  // Check compression
  if (data.resources.compressed / data.resources.total < 0.8) {
    recommendations.push({
      priority: 'medium',
      category: 'Compression',
      title: 'Enable Compression',
      description: 'Enable gzip/Brotli compression for all text-based resources',
      impact: 'Reduces transfer size by 60-80%'
    })
  }

  // Check TTFB
  if (data.navigation.firstByte > 800) {
    recommendations.push({
      priority: 'medium',
      category: 'Server Performance',
      title: 'Improve Server Response Time',
      description: 'Optimize database queries, enable caching, consider CDN',
      impact: 'Faster initial page response and better perceived performance'
    })
  }

  // Check connection type recommendations
  if (data.connection?.effectiveType === 'slow-2g' || data.connection?.effectiveType === '2g') {
    recommendations.push({
      priority: 'high',
      category: 'Mobile Optimization',
      title: 'Optimize for Slow Connections',
      description: 'Implement aggressive resource optimization for mobile users',
      impact: 'Better experience for users on slow connections'
    })
  }

  return recommendations
}

function generateSummary(metrics: PerformanceData[]) {
  if (metrics.length === 0) {
    return {
      averageScore: 0,
      webVitals: {},
      commonIssues: [],
      trends: {},
      deviceBreakdown: {},
      connectionBreakdown: {}
    }
  }

  // Calculate average scores
  const scores = metrics.map(m => calculateOverallScore(m.webVitals))
  const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length

  // Aggregate web vitals
  const webVitalsSummary: Record<string, { average: number; good: number; poor: number }> = {}
  
  metrics.forEach(metric => {
    metric.webVitals.forEach(vital => {
      if (!webVitalsSummary[vital.name]) {
        webVitalsSummary[vital.name] = { average: 0, good: 0, poor: 0 }
      }
      webVitalsSummary[vital.name].average += vital.value
      if (vital.rating === 'good') webVitalsSummary[vital.name].good++
      if (vital.rating === 'poor') webVitalsSummary[vital.name].poor++
    })
  })

  // Calculate averages
  Object.keys(webVitalsSummary).forEach(key => {
    const count = metrics.filter(m => m.webVitals.some(v => v.name === key)).length
    if (count > 0) {
      webVitalsSummary[key].average = webVitalsSummary[key].average / count
    }
  })

  // Find common issues
  const allIssues = metrics.flatMap(m => analyzePerformanceData(m))
  const issueFrequency: Record<string, number> = {}
  
  allIssues.forEach(issue => {
    issueFrequency[issue.metric] = (issueFrequency[issue.metric] || 0) + 1
  })

  const commonIssues = Object.entries(issueFrequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([metric, count]) => ({
      metric,
      frequency: count,
      percentage: Math.round((count / metrics.length) * 100)
    }))

  // Device breakdown
  const deviceBreakdown: Record<string, number> = {}
  metrics.forEach(metric => {
    const deviceType = getDeviceType(metric.userAgent)
    deviceBreakdown[deviceType] = (deviceBreakdown[deviceType] || 0) + 1
  })

  // Connection breakdown
  const connectionBreakdown: Record<string, number> = {}
  metrics.forEach(metric => {
    if (metric.connection) {
      const connType = metric.connection.effectiveType
      connectionBreakdown[connType] = (connectionBreakdown[connType] || 0) + 1
    }
  })

  return {
    averageScore: Math.round(averageScore),
    webVitals: webVitalsSummary,
    commonIssues,
    deviceBreakdown,
    connectionBreakdown,
    totalMetrics: metrics.length
  }
}

function calculateOverallScore(webVitals: PerformanceData['webVitals']): number {
  if (webVitals.length === 0) return 0

  let totalScore = 0
  webVitals.forEach(vital => {
    let score = 100
    if (vital.rating === 'needs-improvement') score = 60
    if (vital.rating === 'poor') score = 30
    totalScore += score
  })

  return Math.round(totalScore / webVitals.length)
}

function getWebVitalRecommendation(metric: string): string {
  const recommendations: Record<string, string> = {
    'FCP': 'Optimize critical resources, reduce render-blocking scripts, improve server response time',
    'LCP': 'Optimize largest contentful element, preload critical resources, improve server performance',
    'FID': 'Reduce JavaScript execution time, break up long tasks, use web workers for heavy computation',
    'CLS': 'Add size attributes to images/videos, avoid inserting content above existing content',
    'TTFB': 'Optimize server performance, use CDN, improve database queries',
    'INP': 'Optimize event handlers, reduce main thread blocking, use requestIdleCallback'
  }

  return recommendations[metric] || 'Optimize for better user experience'
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function getDeviceType(userAgent: string): string {
  if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
    return /iPad/.test(userAgent) ? 'tablet' : 'mobile'
  }
  return 'desktop'
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}