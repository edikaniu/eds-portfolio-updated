export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Initialize monitoring and optimizations for Vercel deployment
    const { performanceMonitor } = await import('./lib/performance/performance-monitor')
    const { logger } = await import('./lib/logger')
    
    logger.info('Vercel instrumentation initialized', {
      runtime: process.env.NEXT_RUNTIME,
      region: process.env.VERCEL_REGION,
      deployment: process.env.VERCEL_ENV
    })

    // Initialize performance monitoring in serverless mode
    performanceMonitor.startMonitoring()

    // Track cold starts
    performanceMonitor.recordMetric({
      name: 'cold_start',
      value: Date.now(),
      timestamp: new Date(),
      tags: {
        region: process.env.VERCEL_REGION || 'unknown',
        deployment: process.env.VERCEL_ENV || 'development'
      },
      unit: 'timestamp'
    })
  }
}