import { PrismaClient } from '@prisma/client'
import { cacheManager } from './cache-manager'
import { logger } from '../logger'

const prisma = new PrismaClient()

export interface QueryStats {
  queryCount: number
  totalExecutionTime: number
  averageExecutionTime: number
  cacheHitRate: number
  slowQueries: Array<{
    query: string
    executionTime: number
    timestamp: Date
  }>
}

export class QueryOptimizer {
  private static instance: QueryOptimizer
  private queryStats = new Map<string, {
    count: number
    totalTime: number
    slowQueries: Array<{ executionTime: number; timestamp: Date }>
  }>()
  private slowQueryThreshold = 100 // milliseconds

  static getInstance(): QueryOptimizer {
    if (!QueryOptimizer.instance) {
      QueryOptimizer.instance = new QueryOptimizer()
    }
    return QueryOptimizer.instance
  }

  async optimizedQuery<T>(
    queryName: string,
    queryFn: () => Promise<T>,
    cacheConfig?: {
      ttl: number
      tags: string[]
      useCache?: boolean
    }
  ): Promise<T> {
    const startTime = Date.now()
    const cacheKey = `query:${queryName}`

    try {
      // Try cache first if enabled
      if (cacheConfig?.useCache !== false) {
        const cached = await cacheManager.get<T>(cacheKey)
        if (cached !== null) {
          this.recordQueryStats(queryName, Date.now() - startTime, true)
          return cached
        }
      }

      // Execute query
      const result = await queryFn()
      const executionTime = Date.now() - startTime

      // Cache result if config provided
      if (cacheConfig && result !== null && result !== undefined) {
        await cacheManager.set(cacheKey, result, cacheConfig.ttl)
      }

      this.recordQueryStats(queryName, executionTime, false)
      
      // Log slow queries
      if (executionTime > this.slowQueryThreshold) {
        logger.warn('Slow query detected', {
          queryName,
          executionTime,
          threshold: this.slowQueryThreshold
        })
      }

      return result
    } catch (error) {
      const executionTime = Date.now() - startTime
      this.recordQueryStats(queryName, executionTime, false)
      logger.error('Query execution failed', { queryName, error, executionTime })
      throw error
    }
  }

  // Optimized blog queries
  async getBlogPosts(options: {
    page?: number
    limit?: number
    featured?: boolean
    category?: string
    search?: string
  } = {}): Promise<any> {
    const { page = 1, limit = 10, featured, category, search } = options
    const offset = (page - 1) * limit
    
    const cacheKey = `blogs:${JSON.stringify(options)}`
    
    return this.optimizedQuery(
      'getBlogPosts',
      async () => {
        const whereConditions: any[] = []
        
        if (featured !== undefined) {
          whereConditions.push(`featured = ${featured}`)
        }
        
        if (category) {
          whereConditions.push(`category = '${category}'`)
        }
        
        if (search) {
          whereConditions.push(`(title LIKE '%${search}%' OR excerpt LIKE '%${search}%')`)
        }

        const whereClause = whereConditions.length > 0 
          ? `WHERE ${whereConditions.join(' AND ')}`
          : ''

        const [posts, total] = await Promise.all([
          prisma.$queryRaw`
            SELECT id, title, excerpt, slug, featured, category, tags, 
                   image_url, author_name, published_at, created_at, updated_at
            FROM blog_posts 
            ${whereClause}
            ORDER BY published_at DESC, created_at DESC
            LIMIT ${limit} OFFSET ${offset}
          `,
          prisma.$queryRaw`
            SELECT COUNT(*) as count FROM blog_posts ${whereClause}
          `
        ])

        return {
          posts,
          pagination: {
            page,
            limit,
            total: (total as any)[0].count,
            pages: Math.ceil((total as any)[0].count / limit)
          }
        }
      },
      {
        ttl: 300, // 5 minutes
        tags: ['blogs', category ? `category:${category}` : ''].filter(Boolean),
        useCache: !search // Don't cache search results
      }
    )
  }

  // Optimized project queries
  async getProjects(options: {
    page?: number
    limit?: number
    featured?: boolean
    category?: string
    status?: string
  } = {}): Promise<any> {
    const { page = 1, limit = 10, featured, category, status } = options
    const offset = (page - 1) * limit
    
    return this.optimizedQuery(
      'getProjects',
      async () => {
        const whereConditions: any[] = []
        
        if (featured !== undefined) {
          whereConditions.push(`featured = ${featured}`)
        }
        
        if (category) {
          whereConditions.push(`category = '${category}'`)
        }
        
        if (status) {
          whereConditions.push(`status = '${status}'`)
        }

        const whereClause = whereConditions.length > 0 
          ? `WHERE ${whereConditions.join(' AND ')}`
          : ''

        const [projects, total] = await Promise.all([
          prisma.$queryRaw`
            SELECT id, title, description, slug, featured, category, 
                   technologies, image_url, demo_url, github_url, status,
                   created_at, updated_at
            FROM projects 
            ${whereClause}
            ORDER BY featured DESC, created_at DESC
            LIMIT ${limit} OFFSET ${offset}
          `,
          prisma.$queryRaw`
            SELECT COUNT(*) as count FROM projects ${whereClause}
          `
        ])

        return {
          projects,
          pagination: {
            page,
            limit,
            total: (total as any)[0].count,
            pages: Math.ceil((total as any)[0].count / limit)
          }
        }
      },
      {
        ttl: 600, // 10 minutes
        tags: ['projects', category ? `category:${category}` : '', status ? `status:${status}` : ''].filter(Boolean)
      }
    )
  }

  // Optimized case study queries
  async getCaseStudies(options: {
    page?: number
    limit?: number
    featured?: boolean
  } = {}): Promise<any> {
    const { page = 1, limit = 10, featured } = options
    const offset = (page - 1) * limit
    
    return this.optimizedQuery(
      'getCaseStudies',
      async () => {
        const whereClause = featured !== undefined 
          ? `WHERE featured = ${featured}`
          : ''

        const [caseStudies, total] = await Promise.all([
          prisma.$queryRaw`
            SELECT id, title, client, industry, description, slug, featured,
                   image_url, technologies, duration, team_size, results,
                   created_at, updated_at
            FROM case_studies 
            ${whereClause}
            ORDER BY featured DESC, created_at DESC
            LIMIT ${limit} OFFSET ${offset}
          `,
          prisma.$queryRaw`
            SELECT COUNT(*) as count FROM case_studies ${whereClause}
          `
        ])

        return {
          caseStudies,
          pagination: {
            page,
            limit,
            total: (total as any)[0].count,
            pages: Math.ceil((total as any)[0].count / limit)
          }
        }
      },
      {
        ttl: 900, // 15 minutes
        tags: ['case-studies']
      }
    )
  }

  // Analytics and aggregated data
  async getAnalytics(days: number = 30): Promise<any> {
    return this.optimizedQuery(
      `getAnalytics_${days}`,
      async () => {
        const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

        const [blogStats, projectStats, caseStudyStats, recentActivity] = await Promise.all([
          prisma.$queryRaw`
            SELECT 
              COUNT(*) as total,
              SUM(CASE WHEN featured = 1 THEN 1 ELSE 0 END) as featured,
              COUNT(CASE WHEN published_at > ${since.toISOString()} THEN 1 END) as recent
            FROM blog_posts
          `,
          
          prisma.$queryRaw`
            SELECT 
              COUNT(*) as total,
              SUM(CASE WHEN featured = 1 THEN 1 ELSE 0 END) as featured,
              COUNT(CASE WHEN created_at > ${since.toISOString()} THEN 1 END) as recent
            FROM projects
          `,
          
          prisma.$queryRaw`
            SELECT 
              COUNT(*) as total,
              SUM(CASE WHEN featured = 1 THEN 1 ELSE 0 END) as featured,
              COUNT(CASE WHEN created_at > ${since.toISOString()} THEN 1 END) as recent
            FROM case_studies
          `,

          prisma.$queryRaw`
            SELECT 'blog' as type, title, created_at FROM blog_posts 
            WHERE created_at > ${since.toISOString()}
            UNION ALL
            SELECT 'project' as type, title, created_at FROM projects 
            WHERE created_at > ${since.toISOString()}
            UNION ALL  
            SELECT 'case_study' as type, title, created_at FROM case_studies 
            WHERE created_at > ${since.toISOString()}
            ORDER BY created_at DESC
            LIMIT 10
          `
        ])

        return {
          blogs: (blogStats as any)[0],
          projects: (projectStats as any)[0],
          caseStudies: (caseStudyStats as any)[0],
          recentActivity
        }
      },
      {
        ttl: 1800, // 30 minutes
        tags: ['analytics', `analytics:${days}days`]
      }
    )
  }

  // Get query performance statistics
  getQueryStats(): QueryStats {
    let totalQueries = 0
    let totalTime = 0
    let cacheHits = 0
    const slowQueries: Array<{ query: string; executionTime: number; timestamp: Date }> = []

    for (const [queryName, stats] of this.queryStats) {
      totalQueries += stats.count
      totalTime += stats.totalTime
      
      for (const slowQuery of stats.slowQueries) {
        slowQueries.push({
          query: queryName,
          executionTime: slowQuery.executionTime,
          timestamp: slowQuery.timestamp
        })
      }
    }

    // Get cache stats
    const cacheStats = cacheManager.getStats()
    const cacheHitRate = cacheStats.hitRate

    return {
      queryCount: totalQueries,
      totalExecutionTime: totalTime,
      averageExecutionTime: totalQueries > 0 ? totalTime / totalQueries : 0,
      cacheHitRate,
      slowQueries: slowQueries
        .sort((a, b) => b.executionTime - a.executionTime)
        .slice(0, 10) // Top 10 slowest
    }
  }

  // Database connection optimization
  async optimizeConnections(): Promise<void> {
    try {
      // Analyze query patterns and suggest optimizations
      await prisma.$executeRaw`ANALYZE`
      
      logger.info('Database connections optimized')
    } catch (error) {
      logger.error('Failed to optimize database connections', error)
    }
  }

  // Clear query cache for specific tags
  async invalidateCache(tags: string[]): Promise<void> {
    for (const tag of tags) {
      const pattern = `*:${tag}:*`
      await cacheManager.delete(pattern)
    }
    
    logger.info('Cache invalidated for tags', { tags })
  }

  private recordQueryStats(
    queryName: string, 
    executionTime: number, 
    fromCache: boolean
  ): void {
    if (!this.queryStats.has(queryName)) {
      this.queryStats.set(queryName, {
        count: 0,
        totalTime: 0,
        slowQueries: []
      })
    }

    const stats = this.queryStats.get(queryName)!
    stats.count++
    
    if (!fromCache) {
      stats.totalTime += executionTime
      
      // Track slow queries
      if (executionTime > this.slowQueryThreshold) {
        stats.slowQueries.push({
          executionTime,
          timestamp: new Date()
        })
        
        // Keep only recent slow queries (last 100)
        if (stats.slowQueries.length > 100) {
          stats.slowQueries = stats.slowQueries.slice(-100)
        }
      }
    }
  }
}

export const queryOptimizer = QueryOptimizer.getInstance()