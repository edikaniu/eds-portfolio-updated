import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/admin-middleware'
import { withErrorHandling } from '@/lib/error-handler'
import { performanceMonitor } from '@/lib/performance/performance-monitor'
import { cacheManager } from '@/lib/cache/cache-manager'
import { apiCache } from '@/lib/cache/api-cache'
import { queryOptimizer } from '@/lib/cache/query-optimizer'
import { staticOptimizer } from '@/lib/cache/static-optimizer'

async function handlePerformanceRequest(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')

  switch (request.method) {
    case 'GET':
      return await handleGetRequest(request, action, searchParams)
    case 'POST':
      return await handlePostRequest(request, action)
    default:
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'METHOD_NOT_ALLOWED',
            message: 'Method not allowed'
          }
        },
        { status: 405 }
      )
  }
}

async function handleGetRequest(
  request: NextRequest,
  action: string | null,
  searchParams: URLSearchParams
): Promise<NextResponse> {
  switch (action) {
    case 'metrics':
      try {
        const timeRange = searchParams.get('timeRange')
        let timeFilter: { start: Date; end: Date } | undefined

        if (timeRange) {
          const now = new Date()
          const hours = parseInt(timeRange)
          if (!isNaN(hours)) {
            timeFilter = {
              start: new Date(now.getTime() - hours * 60 * 60 * 1000),
              end: now
            }
          }
        }

        const performanceStats = performanceMonitor.getPerformanceStats(timeFilter)
        const realTimeMetrics = performanceMonitor.getRealTimeMetrics()
        const recommendations = performanceMonitor.getRecommendations()

        return NextResponse.json({
          success: true,
          data: {
            performance: performanceStats,
            realTime: realTimeMetrics,
            recommendations
          }
        })
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'Failed to get performance metrics')
      }

    case 'cache':
      try {
        const cacheStats = cacheManager.getStats()
        const apiCacheStats = apiCache.getStats()
        const queryStats = queryOptimizer.getQueryStats()

        return NextResponse.json({
          success: true,
          data: {
            memory: cacheStats,
            api: apiCacheStats,
            queries: queryStats
          }
        })
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'Failed to get cache metrics')
      }

    case 'optimization':
      try {
        const optimizationStats = staticOptimizer.getOptimizationStats()

        return NextResponse.json({
          success: true,
          data: optimizationStats
        })
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'Failed to get optimization metrics')
      }

    case 'export':
      try {
        const format = searchParams.get('format') || 'json'
        const metrics = performanceMonitor.exportMetrics(format as 'json' | 'prometheus')
        
        const contentType = format === 'prometheus' 
          ? 'text/plain; version=0.0.4; charset=utf-8'
          : 'application/json'

        return new NextResponse(metrics, {
          headers: {
            'Content-Type': contentType,
            'Content-Disposition': `attachment; filename="metrics.${format}"`
          }
        })
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'Failed to export metrics')
      }

    default:
      // Default: return dashboard summary
      try {
        const performanceStats = performanceMonitor.getPerformanceStats()
        const realTimeMetrics = performanceMonitor.getRealTimeMetrics()
        const cacheStats = cacheManager.getStats()
        const queryStats = queryOptimizer.getQueryStats()
        const recommendations = performanceMonitor.getRecommendations()

        return NextResponse.json({
          success: true,
          data: {
            summary: {
              performance: {
                totalMetrics: performanceStats.summary.totalMetrics,
                averageResponseTime: performanceStats.summary.averageResponseTime,
                slowOperations: performanceStats.summary.slowOperations,
                memoryUsage: performanceStats.summary.memoryUsage
              },
              cache: {
                memoryItems: cacheStats.memoryItems,
                hitRate: cacheStats.hitRate,
                memoryUsage: cacheStats.memoryUsage
              },
              queries: {
                queryCount: queryStats.queryCount,
                averageExecutionTime: queryStats.averageExecutionTime,
                cacheHitRate: queryStats.cacheHitRate,
                slowQueriesCount: queryStats.slowQueries.length
              },
              realTime: realTimeMetrics
            },
            recommendations: recommendations.slice(0, 5), // Top 5 recommendations
            charts: {
              webVitals: performanceStats.webVitals,
              topSlowQueries: performanceStats.topSlowQueries.slice(0, 5),
              resourcePerformance: performanceStats.resourcePerformance
            }
          }
        })
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'Failed to get performance dashboard')
      }
  }
}

async function handlePostRequest(request: NextRequest, action: string | null): Promise<NextResponse> {
  const body = await request.json()

  switch (action) {
    case 'clear-cache':
      try {
        const cacheType = body.type || 'all'
        let clearedItems = 0

        switch (cacheType) {
          case 'memory':
            await cacheManager.clear()
            clearedItems = 1
            break
          case 'api':
            // Clear API cache by patterns or tags
            if (body.tags) {
              for (const tag of body.tags) {
                clearedItems += await apiCache.invalidateByTag(tag)
              }
            } else {
              await cacheManager.clear() // Clear underlying cache
              clearedItems = 1
            }
            break
          case 'queries':
            if (body.tags) {
              await queryOptimizer.invalidateCache(body.tags)
              clearedItems = body.tags.length
            }
            break
          case 'all':
          default:
            await cacheManager.clear()
            clearedItems = 1
            break
        }

        return NextResponse.json({
          success: true,
          message: `Cache cleared successfully`,
          data: { clearedItems }
        })
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'Failed to clear cache')
      }

    case 'optimize':
      try {
        const optimizationType = body.type || 'all'
        const results: any = {}

        if (optimizationType === 'images' || optimizationType === 'all') {
          // In a real implementation, you would scan for images
          const imagePaths = body.imagePaths || []
          if (imagePaths.length > 0) {
            results.images = await staticOptimizer.optimizeImages(imagePaths, body.imageOptions)
          }
        }

        if (optimizationType === 'css' || optimizationType === 'all') {
          const cssFiles = body.cssFiles || []
          if (cssFiles.length > 0) {
            results.css = await staticOptimizer.optimizeCSS(cssFiles, body.cssOptions)
          }
        }

        if (optimizationType === 'js' || optimizationType === 'all') {
          const jsFiles = body.jsFiles || []
          if (jsFiles.length > 0) {
            results.js = await staticOptimizer.optimizeJS(jsFiles, body.jsOptions)
          }
        }

        if (optimizationType === 'sitemap' || optimizationType === 'all') {
          results.sitemap = await staticOptimizer.generateStaticSitemap()
        }

        if (optimizationType === 'robots' || optimizationType === 'all') {
          results.robots = await staticOptimizer.generateRobotsTxt()
        }

        return NextResponse.json({
          success: true,
          message: 'Optimization completed',
          data: results
        })
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'Failed to optimize assets')
      }

    case 'warmup-cache':
      try {
        const warmupType = body.type || 'api'

        if (warmupType === 'api') {
          // Warmup common API routes
          const routes = body.routes || [
            {
              key: 'blogs_default',
              generator: () => queryOptimizer.getBlogPosts({}),
              config: { ttl: 300, tags: ['blogs'] }
            },
            {
              key: 'projects_default',
              generator: () => queryOptimizer.getProjects({}),
              config: { ttl: 600, tags: ['projects'] }
            },
            {
              key: 'case_studies_default',
              generator: () => queryOptimizer.getCaseStudies({}),
              config: { ttl: 900, tags: ['case-studies'] }
            }
          ]

          await apiCache.warmupCache(routes)
        } else if (warmupType === 'queries') {
          // Warmup common database queries
          await queryOptimizer.getBlogPosts({})
          await queryOptimizer.getProjects({})
          await queryOptimizer.getCaseStudies({})
          await queryOptimizer.getAnalytics(7)
        }

        return NextResponse.json({
          success: true,
          message: 'Cache warmup completed',
          data: { type: warmupType }
        })
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'Failed to warmup cache')
      }

    default:
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_ACTION',
            message: 'Invalid action specified'
          }
        },
        { status: 400 }
      )
  }
}

export const GET = withAdminAuth(withErrorHandling(handlePerformanceRequest))
export const POST = withAdminAuth(withErrorHandling(handlePerformanceRequest))