/**
 * Bundle analysis utilities for performance monitoring
 * Tracks bundle sizes, chunks, and loading performance
 */

// Bundle analysis configuration
export const BUNDLE_ANALYSIS_CONFIG = {
  // Maximum recommended bundle sizes (in KB)
  maxSizes: {
    mainBundle: 250, // Main bundle should be under 250KB
    chunkBundle: 100, // Individual chunks should be under 100KB
    totalBundle: 500, // Total initial bundle should be under 500KB
  },
  
  // Performance thresholds
  thresholds: {
    firstContentfulPaint: 1500, // 1.5s
    largestContentfulPaint: 2500, // 2.5s
    cumulativeLayoutShift: 0.1,
    firstInputDelay: 100, // 100ms
  },
  
  // Critical resources
  criticalResources: [
    'main',
    'polyfills',
    'framework',
    'chunks/pages/_app',
  ],
} as const

// Bundle performance monitoring
export interface BundleMetrics {
  bundleName: string
  size: number
  loadTime: number
  isCompressed: boolean
  isCritical: boolean
  chunks: string[]
}

export class BundleAnalyzer {
  private metrics: BundleMetrics[] = []
  private observer: PerformanceObserver | null = null

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializePerformanceMonitoring()
    }
  }

  private initializePerformanceMonitoring() {
    // Monitor navigation timing
    if ('PerformanceObserver' in window) {
      this.observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.processPerformanceEntry(entry)
        }
      })

      this.observer.observe({ entryTypes: ['navigation', 'resource', 'measure'] })
    }

    // Track Core Web Vitals
    this.trackWebVitals()
  }

  private processPerformanceEntry(entry: PerformanceEntry) {
    if (entry.entryType === 'resource' && entry.name.includes('/_next/static/')) {
      this.recordBundleMetric({
        bundleName: this.extractBundleName(entry.name),
        size: (entry as PerformanceResourceTiming).transferSize || 0,
        loadTime: entry.duration,
        isCompressed: this.isCompressed(entry as PerformanceResourceTiming),
        isCritical: this.isCriticalResource(entry.name),
        chunks: this.extractChunks(entry.name),
      })
    }
  }

  private extractBundleName(url: string): string {
    const match = url.match(/\/_next\/static\/.*?\/(.+?)\.js/)
    return match ? match[1] : 'unknown'
  }

  private isCompressed(entry: PerformanceResourceTiming): boolean {
    return (entry.transferSize < entry.decodedBodySize * 0.8)
  }

  private isCriticalResource(url: string): boolean {
    return BUNDLE_ANALYSIS_CONFIG.criticalResources.some(critical => 
      url.includes(critical)
    )
  }

  private extractChunks(url: string): string[] {
    // Extract chunk information from URL
    const chunkMatch = url.match(/chunks\/(.+?)\.js/)
    return chunkMatch ? [chunkMatch[1]] : []
  }

  private recordBundleMetric(metric: BundleMetrics) {
    this.metrics.push(metric)
    this.analyzeBundle(metric)
  }

  private analyzeBundle(metric: BundleMetrics) {
    const sizeKB = metric.size / 1024

    // Check against thresholds
    if (sizeKB > BUNDLE_ANALYSIS_CONFIG.maxSizes.chunkBundle) {
      console.warn(`Bundle ${metric.bundleName} is ${sizeKB.toFixed(2)}KB, exceeds recommended size of ${BUNDLE_ANALYSIS_CONFIG.maxSizes.chunkBundle}KB`)
    }

    if (metric.loadTime > 1000 && metric.isCritical) {
      console.warn(`Critical bundle ${metric.bundleName} took ${metric.loadTime.toFixed(2)}ms to load`)
    }

    if (!metric.isCompressed) {
      console.warn(`Bundle ${metric.bundleName} is not properly compressed`)
    }
  }

  private trackWebVitals() {
    // First Contentful Paint
    this.trackMetric('first-contentful-paint', (value) => {
      if (value > BUNDLE_ANALYSIS_CONFIG.thresholds.firstContentfulPaint) {
        console.warn(`FCP: ${value}ms exceeds threshold of ${BUNDLE_ANALYSIS_CONFIG.thresholds.firstContentfulPaint}ms`)
      }
    })

    // Largest Contentful Paint
    this.trackMetric('largest-contentful-paint', (value) => {
      if (value > BUNDLE_ANALYSIS_CONFIG.thresholds.largestContentfulPaint) {
        console.warn(`LCP: ${value}ms exceeds threshold of ${BUNDLE_ANALYSIS_CONFIG.thresholds.largestContentfulPaint}ms`)
      }
    })

    // Cumulative Layout Shift
    this.trackMetric('cumulative-layout-shift', (value) => {
      if (value > BUNDLE_ANALYSIS_CONFIG.thresholds.cumulativeLayoutShift) {
        console.warn(`CLS: ${value} exceeds threshold of ${BUNDLE_ANALYSIS_CONFIG.thresholds.cumulativeLayoutShift}`)
      }
    })

    // First Input Delay
    this.trackMetric('first-input-delay', (value) => {
      if (value > BUNDLE_ANALYSIS_CONFIG.thresholds.firstInputDelay) {
        console.warn(`FID: ${value}ms exceeds threshold of ${BUNDLE_ANALYSIS_CONFIG.thresholds.firstInputDelay}ms`)
      }
    })
  }

  private trackMetric(metricName: string, callback: (value: number) => void) {
    if (typeof window === 'undefined') return

    try {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === metricName) {
            callback(entry.value || entry.startTime)
          }
        }
      }).observe({ entryTypes: ['measure'] })
    } catch (error) {
      console.error(`Failed to track ${metricName}:`, error)
    }
  }

  // Public API methods
  public getBundleMetrics(): BundleMetrics[] {
    return [...this.metrics]
  }

  public getTotalBundleSize(): number {
    return this.metrics.reduce((total, metric) => total + metric.size, 0)
  }

  public getCriticalBundleSize(): number {
    return this.metrics
      .filter(metric => metric.isCritical)
      .reduce((total, metric) => total + metric.size, 0)
  }

  public getPerformanceReport(): {
    totalSize: number
    totalSizeKB: number
    criticalSize: number
    criticalSizeKB: number
    bundleCount: number
    averageLoadTime: number
    compressionRatio: number
    recommendations: string[]
  } {
    const totalSize = this.getTotalBundleSize()
    const criticalSize = this.getCriticalBundleSize()
    const bundleCount = this.metrics.length
    const averageLoadTime = this.metrics.reduce((sum, m) => sum + m.loadTime, 0) / bundleCount
    const compressedBundles = this.metrics.filter(m => m.isCompressed).length
    const compressionRatio = bundleCount > 0 ? (compressedBundles / bundleCount) * 100 : 0

    const recommendations = this.generateRecommendations()

    return {
      totalSize,
      totalSizeKB: totalSize / 1024,
      criticalSize,
      criticalSizeKB: criticalSize / 1024,
      bundleCount,
      averageLoadTime,
      compressionRatio,
      recommendations,
    }
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = []
    const report = {
      totalSizeKB: this.getTotalBundleSize() / 1024,
      criticalSizeKB: this.getCriticalBundleSize() / 1024,
      compressionRatio: (this.metrics.filter(m => m.isCompressed).length / this.metrics.length) * 100,
    }

    if (report.totalSizeKB > BUNDLE_ANALYSIS_CONFIG.maxSizes.totalBundle) {
      recommendations.push(`Total bundle size (${report.totalSizeKB.toFixed(2)}KB) exceeds recommended ${BUNDLE_ANALYSIS_CONFIG.maxSizes.totalBundle}KB. Consider code splitting.`)
    }

    if (report.criticalSizeKB > BUNDLE_ANALYSIS_CONFIG.maxSizes.mainBundle) {
      recommendations.push(`Critical bundle size (${report.criticalSizeKB.toFixed(2)}KB) exceeds recommended ${BUNDLE_ANALYSIS_CONFIG.maxSizes.mainBundle}KB. Consider deferring non-critical code.`)
    }

    if (report.compressionRatio < 80) {
      recommendations.push(`Only ${report.compressionRatio.toFixed(1)}% of bundles are compressed. Enable gzip/brotli compression.`)
    }

    const largeBundles = this.metrics.filter(m => m.size / 1024 > BUNDLE_ANALYSIS_CONFIG.maxSizes.chunkBundle)
    if (largeBundles.length > 0) {
      recommendations.push(`${largeBundles.length} bundle(s) exceed ${BUNDLE_ANALYSIS_CONFIG.maxSizes.chunkBundle}KB: ${largeBundles.map(b => b.bundleName).join(', ')}`)
    }

    const slowBundles = this.metrics.filter(m => m.loadTime > 1000)
    if (slowBundles.length > 0) {
      recommendations.push(`${slowBundles.length} bundle(s) load slowly (>1s): ${slowBundles.map(b => b.bundleName).join(', ')}`)
    }

    return recommendations
  }

  public destroy() {
    if (this.observer) {
      this.observer.disconnect()
      this.observer = null
    }
  }
}

// Singleton instance
let bundleAnalyzer: BundleAnalyzer | null = null

export function getBundleAnalyzer(): BundleAnalyzer {
  if (!bundleAnalyzer && typeof window !== 'undefined') {
    bundleAnalyzer = new BundleAnalyzer()
  }
  return bundleAnalyzer!
}

// React hook for bundle analysis
export function useBundleAnalysis() {
  if (typeof window === 'undefined') {
    return {
      metrics: [],
      report: {
        totalSize: 0,
        totalSizeKB: 0,
        criticalSize: 0,
        criticalSizeKB: 0,
        bundleCount: 0,
        averageLoadTime: 0,
        compressionRatio: 0,
        recommendations: [],
      },
    }
  }

  const analyzer = getBundleAnalyzer()
  return {
    metrics: analyzer.getBundleMetrics(),
    report: analyzer.getPerformanceReport(),
  }
}

// Bundle analysis script for build-time analysis
export function generateBuildAnalysisScript() {
  return `
    // Bundle Analysis Script
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      import('${__filename}').then(({ getBundleAnalyzer }) => {
        const analyzer = getBundleAnalyzer()
        
        // Log performance report after page load
        window.addEventListener('load', () => {
          setTimeout(() => {
            console.group('📊 Bundle Analysis Report')
            console.table(analyzer.getPerformanceReport())
            
            const recommendations = analyzer.getPerformanceReport().recommendations
            if (recommendations.length > 0) {
              console.group('💡 Recommendations')
              recommendations.forEach(rec => console.warn(rec))
              console.groupEnd()
            }
            
            console.groupEnd()
          }, 2000)
        })
      })
    }
  `
}