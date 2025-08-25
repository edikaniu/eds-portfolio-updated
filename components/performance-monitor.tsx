"use client"

import { useEffect, useState } from 'react'
import { useBundleAnalysis } from '@/lib/bundle-analysis'
import { usePerformanceMonitoring, getPerformanceMonitor } from '@/lib/performance-monitoring'

interface PerformanceMonitorProps {
  enabled?: boolean
  showInDevelopment?: boolean
}

export function PerformanceMonitor({ 
  enabled = process.env.NODE_ENV === 'development',
  showInDevelopment = true 
}: PerformanceMonitorProps) {
  const [mounted, setMounted] = useState(false)
  const { metrics, report } = useBundleAnalysis()
  const { webVitals, score } = usePerformanceMonitoring()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!enabled || !mounted) return

    // Log performance report after initial load
    const timer = setTimeout(() => {
      if (process.env.NODE_ENV === 'development' && showInDevelopment) {
        console.group('📊 Bundle Performance Report')
        console.log('Total Bundle Size:', `${report.totalSizeKB.toFixed(2)} KB`)
        console.log('Critical Bundle Size:', `${report.criticalSizeKB.toFixed(2)} KB`)
        console.log('Bundle Count:', report.bundleCount)
        console.log('Average Load Time:', `${report.averageLoadTime.toFixed(2)} ms`)
        console.log('Compression Ratio:', `${report.compressionRatio.toFixed(1)}%`)
        
        if (report.recommendations.length > 0) {
          console.group('💡 Optimization Recommendations')
          report.recommendations.forEach((rec, index) => {
            console.warn(`${index + 1}. ${rec}`)
          })
          console.groupEnd()
        }
        
        if (metrics.length > 0) {
          console.group('📦 Bundle Details')
          console.table(metrics.map(m => ({
            Bundle: m.bundleName,
            'Size (KB)': (m.size / 1024).toFixed(2),
            'Load Time (ms)': m.loadTime.toFixed(2),
            Critical: m.isCritical ? 'Yes' : 'No',
            Compressed: m.isCompressed ? 'Yes' : 'No'
          })))
          console.groupEnd()
        }
        
        console.groupEnd()
      }
    }, 3000) // Wait 3 seconds for bundles to load

    return () => clearTimeout(timer)
  }, [enabled, mounted, showInDevelopment, report, metrics])

  // Track Web Vitals
  useEffect(() => {
    if (!enabled || !mounted || typeof window === 'undefined') return

    // First Contentful Paint
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          console.log('🎨 First Contentful Paint:', `${entry.startTime.toFixed(2)}ms`)
        }
      }
    })

    try {
      observer.observe({ entryTypes: ['paint'] })
    } catch (error) {
      // Ignore if not supported
    }

    // Navigation timing
    const logNavigationTiming = () => {
      if ('performance' in window && 'timing' in performance) {
        const timing = performance.timing
        const loadTime = timing.loadEventEnd - timing.navigationStart
        const domContentLoaded = timing.domContentLoadedEventEnd - timing.navigationStart
        const firstByte = timing.responseStart - timing.navigationStart

        console.group('⏱️ Navigation Timing')
        console.log('Time to First Byte (TTFB):', `${firstByte}ms`)
        console.log('DOM Content Loaded:', `${domContentLoaded}ms`)
        console.log('Page Load Complete:', `${loadTime}ms`)
        console.groupEnd()
      }
    }

    if (document.readyState === 'complete') {
      setTimeout(logNavigationTiming, 1000)
    } else {
      window.addEventListener('load', () => setTimeout(logNavigationTiming, 1000))
    }

    return () => {
      observer.disconnect()
    }
  }, [enabled, mounted])

  // Don't render anything in production or when disabled
  if (!enabled || process.env.NODE_ENV === 'production') {
    return null
  }

  if (!mounted) {
    return null
  }

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '4px',
        fontSize: '12px',
        zIndex: 9999,
        fontFamily: 'monospace',
        minWidth: '200px',
      }}
    >
      <div style={{ marginBottom: '4px', fontWeight: 'bold' }}>
        📊 Bundle Performance
      </div>
      <div>Size: {report.totalSizeKB.toFixed(1)} KB</div>
      <div>Bundles: {report.bundleCount}</div>
      <div>Performance: {score}/100</div>
      <div>Compressed: {report.compressionRatio.toFixed(0)}%</div>
      {(report.recommendations.length > 0 || score < 70) && (
        <div style={{ color: '#ffcc00', marginTop: '4px' }}>
          ⚠️ {report.recommendations.length + (score < 70 ? 1 : 0)} issues
        </div>
      )}
    </div>
  )
}

// Hook for accessing performance data
export function usePerformanceData() {
  const { metrics, report } = useBundleAnalysis()
  const performanceData = usePerformanceMonitoring()

  return {
    bundleMetrics: metrics,
    bundleReport: report,
    webVitals: performanceData.webVitals,
    performanceScore: performanceData.score,
  }
}

