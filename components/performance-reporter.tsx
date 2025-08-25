"use client"

import { useEffect } from 'react'
import { usePerformanceMonitoring } from '@/lib/performance-monitoring'
import { logger } from '@/lib/logger'

interface PerformanceReporterProps {
  enabled?: boolean
  reportingInterval?: number
  batchSize?: number
}

export function PerformanceReporter({ 
  enabled = process.env.NODE_ENV === 'production',
  reportingInterval = 30000, // 30 seconds
  batchSize = 5 
}: PerformanceReporterProps) {
  const { webVitals, score } = usePerformanceMonitoring()

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return

    let reportingTimer: NodeJS.Timeout
    let pendingMetrics: any[] = []

    const collectAndSendMetrics = async () => {
      try {
        // Collect current performance data
        const performanceData = {
          url: window.location.href,
          timestamp: new Date().toISOString(),
          webVitals: Object.entries(webVitals).map(([name, metric]) => ({
            name,
            value: metric.value,
            rating: metric.rating
          })),
          resources: await collectResourceMetrics(),
          navigation: await collectNavigationMetrics(),
          userAgent: navigator.userAgent,
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight
          },
          connection: getConnectionInfo()
        }

        // Add to pending metrics
        pendingMetrics.push(performanceData)

        // Send if we have enough metrics or if this is the final batch
        if (pendingMetrics.length >= batchSize) {
          await sendMetricsBatch([...pendingMetrics])
          pendingMetrics = []
        }
      } catch (error) {
        logger.error('Failed to collect performance metrics', error)
      }
    }

    const sendMetricsBatch = async (metrics: any[]) => {
      try {
        // Send each metric individually to avoid large payloads
        for (const metric of metrics) {
          const response = await fetch('/api/performance', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(metric)
          })

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`)
          }
        }

        logger.info('Performance metrics sent successfully', { count: metrics.length })
      } catch (error) {
        logger.error('Failed to send performance metrics', error)
      }
    }

    const collectResourceMetrics = async () => {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
      const totalSize = resources.reduce((sum, resource) => sum + (resource.transferSize || 0), 0)
      const compressed = resources.filter(resource => 
        resource.transferSize < resource.decodedBodySize * 0.8
      ).length
      const critical = resources.filter(resource => 
        resource.name.includes('/app/') || 
        resource.name.includes('main') || 
        resource.name.includes('framework')
      ).length

      return {
        total: resources.length,
        totalSize,
        compressed,
        critical
      }
    }

    const collectNavigationMetrics = async () => {
      const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[]
      if (navigationEntries.length === 0) {
        return {
          loadTime: 0,
          firstByte: 0,
          domContentLoaded: 0
        }
      }

      const nav = navigationEntries[0]
      return {
        loadTime: nav.loadEventEnd - nav.navigationStart,
        firstByte: nav.responseStart - nav.requestStart,
        domContentLoaded: nav.domContentLoadedEventEnd - nav.navigationStart
      }
    }

    const getConnectionInfo = () => {
      if ('connection' in navigator) {
        const conn = (navigator as any).connection
        return {
          effectiveType: conn?.effectiveType || 'unknown',
          downlink: conn?.downlink || 0,
          rtt: conn?.rtt || 0
        }
      }
      return undefined
    }

    // Start collecting metrics after page load
    const startReporting = () => {
      // Initial collection after a delay to let the page settle
      setTimeout(collectAndSendMetrics, 5000)
      
      // Then collect periodically
      reportingTimer = setInterval(collectAndSendMetrics, reportingInterval)
    }

    // Wait for page to be fully loaded
    if (document.readyState === 'complete') {
      startReporting()
    } else {
      window.addEventListener('load', startReporting)
    }

    // Send any remaining metrics when the page is about to unload
    const handleBeforeUnload = () => {
      if (pendingMetrics.length > 0) {
        // Use sendBeacon for reliability during page unload
        const data = JSON.stringify(pendingMetrics[0]) // Send at least one metric
        navigator.sendBeacon('/api/performance', data)
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    // Cleanup
    return () => {
      clearInterval(reportingTimer)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('load', startReporting)
    }
  }, [enabled, reportingInterval, batchSize, webVitals, score])

  // This component doesn't render anything
  return null
}

// Hook for manual performance reporting
export function usePerformanceReporter() {
  const { webVitals, score } = usePerformanceMonitoring()

  const reportCurrentPerformance = async () => {
    if (typeof window === 'undefined') return

    try {
      const performanceData = {
        url: window.location.href,
        timestamp: new Date().toISOString(),
        webVitals: Object.entries(webVitals).map(([name, metric]) => ({
          name,
          value: metric.value,
          rating: metric.rating
        })),
        resources: {
          total: performance.getEntriesByType('resource').length,
          totalSize: performance.getEntriesByType('resource').reduce((sum: number, resource: any) => 
            sum + (resource.transferSize || 0), 0
          ),
          compressed: performance.getEntriesByType('resource').filter((resource: any) => 
            resource.transferSize < resource.decodedBodySize * 0.8
          ).length,
          critical: performance.getEntriesByType('resource').filter((resource: any) => 
            resource.name.includes('/app/') || 
            resource.name.includes('main') || 
            resource.name.includes('framework')
          ).length
        },
        navigation: (() => {
          const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
          return nav ? {
            loadTime: nav.loadEventEnd - nav.navigationStart,
            firstByte: nav.responseStart - nav.requestStart,
            domContentLoaded: nav.domContentLoadedEventEnd - nav.navigationStart
          } : { loadTime: 0, firstByte: 0, domContentLoaded: 0 }
        })(),
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        connection: (() => {
          if ('connection' in navigator) {
            const conn = (navigator as any).connection
            return {
              effectiveType: conn?.effectiveType || 'unknown',
              downlink: conn?.downlink || 0,
              rtt: conn?.rtt || 0
            }
          }
          return undefined
        })()
      }

      const response = await fetch('/api/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(performanceData)
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const result = await response.json()
      return result
    } catch (error) {
      logger.error('Failed to report performance data', error)
      throw error
    }
  }

  return {
    reportCurrentPerformance,
    currentScore: score,
    webVitals
  }
}