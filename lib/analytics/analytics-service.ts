import { PrismaClient } from '@prisma/client'
import { logger } from '../logger'
import { cacheManager } from '../cache/cache-manager'

const prisma = new PrismaClient()

export interface AnalyticsEvent {
  type: string
  category: string
  action: string
  label?: string
  value?: number
  userId?: string
  sessionId?: string
  ipAddress?: string
  userAgent?: string
  referrer?: string
  pathname: string
  timestamp: Date
  metadata?: Record<string, any>
}

export interface PageView {
  pathname: string
  title?: string
  referrer?: string
  userId?: string
  sessionId: string
  ipAddress?: string
  userAgent?: string
  timestamp: Date
  duration?: number
  bounced?: boolean
}

export interface AnalyticsReport {
  overview: {
    totalPageViews: number
    uniqueVisitors: number
    averageSessionDuration: number
    bounceRate: number
    topPages: Array<{ pathname: string; views: number; percentage: number }>
    topReferrers: Array<{ referrer: string; visits: number; percentage: number }>
  }
  traffic: {
    dailyViews: Array<{ date: string; views: number; visitors: number }>
    deviceTypes: Array<{ device: string; count: number; percentage: number }>
    browsers: Array<{ browser: string; count: number; percentage: number }>
    operatingSystems: Array<{ os: string; count: number; percentage: number }>
  }
  engagement: {
    averageTimeOnPage: number
    pagesPerSession: number
    topEvents: Array<{ event: string; count: number }>
    conversions: Array<{ goal: string; count: number; rate: number }>
  }
  content: {
    popularContent: Array<{ 
      id: string
      title: string 
      type: 'blog' | 'project' | 'case-study'
      views: number
      engagement: number
    }>
    searchQueries: Array<{ query: string; count: number; results: number }>
  }
}

export interface RealTimeMetrics {
  activeVisitors: number
  pageViewsLastHour: number
  topActivePages: Array<{ pathname: string; activeUsers: number }>
  recentEvents: Array<AnalyticsEvent>
  conversionRate: number
}

class AnalyticsService {
  private static instance: AnalyticsService
  private eventBuffer: AnalyticsEvent[] = []
  private pageViewBuffer: PageView[] = []
  private readonly bufferSize = 100
  private readonly flushInterval = 30000 // 30 seconds

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService()
    }
    return AnalyticsService.instance
  }

  constructor() {
    this.initializeTables()
    // Removed startBufferFlush() - not compatible with Vercel serverless
  }

  async trackEvent(event: Omit<AnalyticsEvent, 'timestamp'>): Promise<void> {
    const analyticsEvent: AnalyticsEvent = {
      ...event,
      timestamp: new Date(),
    }

    // Write directly to database (Vercel serverless compatible)
    try {
      await prisma.$executeRaw`
        INSERT INTO analytics_events (
          type, category, action, label, value, user_id, session_id, 
          ip_address, user_agent, referrer, pathname, timestamp, metadata
        ) VALUES (
          ${analyticsEvent.type}, ${analyticsEvent.category}, ${analyticsEvent.action}, ${analyticsEvent.label || null}, 
          ${analyticsEvent.value || null}, ${analyticsEvent.userId || null}, ${analyticsEvent.sessionId || null},
          ${analyticsEvent.ipAddress || null}, ${analyticsEvent.userAgent || null}, ${analyticsEvent.referrer || null},
          ${analyticsEvent.pathname}, ${analyticsEvent.timestamp.toISOString()}, ${analyticsEvent.metadata ? JSON.stringify(analyticsEvent.metadata) : null}
        )
      `
      
      logger.debug('Analytics event tracked successfully', { event: analyticsEvent.type })
    } catch (error) {
      logger.error('Failed to track analytics event', { error, event: analyticsEvent.type })
    }
  }

  async trackPageView(pageView: Omit<PageView, 'timestamp'>): Promise<void> {
    const analyticsPageView: PageView = {
      ...pageView,
      timestamp: new Date(),
    }

    // Write directly to database (Vercel serverless compatible)
    try {
      await prisma.$executeRaw`
        INSERT INTO page_views (
          pathname, title, referrer, user_id, session_id, ip_address, 
          user_agent, timestamp, duration, bounced
        ) VALUES (
          ${analyticsPageView.pathname}, ${analyticsPageView.title || null}, ${analyticsPageView.referrer || null},
          ${analyticsPageView.userId || null}, ${analyticsPageView.sessionId}, ${analyticsPageView.ipAddress || null},
          ${analyticsPageView.userAgent || null}, ${analyticsPageView.timestamp.toISOString()}, 
          ${analyticsPageView.duration || null}, ${analyticsPageView.bounced || false}
        )
      `
      
      logger.debug('Page view tracked successfully', { pathname: analyticsPageView.pathname })
    } catch (error) {
      logger.error('Failed to track page view', { error, pathname: analyticsPageView.pathname })
    }
  }

  async generateReport(
    startDate: Date,
    endDate: Date,
    filters?: {
      pathname?: string
      userId?: string
      deviceType?: string
    }
  ): Promise<AnalyticsReport> {
    const cacheKey = `analytics_report_${startDate.toISOString()}_${endDate.toISOString()}_${JSON.stringify(filters)}`
    
    // Check cache first
    const cachedReport = await cacheManager.get<AnalyticsReport>(cacheKey)
    if (cachedReport) {
      return cachedReport
    }

    try {
      const report = await this.buildReport(startDate, endDate, filters)
      
      // Cache for 1 hour
      await cacheManager.set(cacheKey, report, 3600)
      
      return report
    } catch (error) {
      logger.error('Failed to generate analytics report', { error, startDate, endDate, filters })
      throw error
    }
  }

  private async buildReport(
    startDate: Date,
    endDate: Date,
    filters?: any
  ): Promise<AnalyticsReport> {
    // Overview metrics
    const totalPageViews = await this.getTotalPageViews(startDate, endDate, filters)
    const uniqueVisitors = await this.getUniqueVisitors(startDate, endDate, filters)
    const averageSessionDuration = await this.getAverageSessionDuration(startDate, endDate, filters)
    const bounceRate = await this.getBounceRate(startDate, endDate, filters)
    const topPages = await this.getTopPages(startDate, endDate, filters)
    const topReferrers = await this.getTopReferrers(startDate, endDate, filters)

    // Traffic analytics
    const dailyViews = await this.getDailyViews(startDate, endDate, filters)
    const deviceTypes = await this.getDeviceTypes(startDate, endDate, filters)
    const browsers = await this.getBrowsers(startDate, endDate, filters)
    const operatingSystems = await this.getOperatingSystems(startDate, endDate, filters)

    // Engagement metrics
    const averageTimeOnPage = await this.getAverageTimeOnPage(startDate, endDate, filters)
    const pagesPerSession = await this.getPagesPerSession(startDate, endDate, filters)
    const topEvents = await this.getTopEvents(startDate, endDate, filters)
    const conversions = await this.getConversions(startDate, endDate, filters)

    // Content analytics
    const popularContent = await this.getPopularContent(startDate, endDate, filters)
    const searchQueries = await this.getSearchQueries(startDate, endDate, filters)

    return {
      overview: {
        totalPageViews,
        uniqueVisitors,
        averageSessionDuration,
        bounceRate,
        topPages,
        topReferrers,
      },
      traffic: {
        dailyViews,
        deviceTypes,
        browsers,
        operatingSystems,
      },
      engagement: {
        averageTimeOnPage,
        pagesPerSession,
        topEvents,
        conversions,
      },
      content: {
        popularContent,
        searchQueries,
      },
    }
  }

  async getRealTimeMetrics(): Promise<RealTimeMetrics> {
    const cacheKey = 'realtime_metrics'
    
    // Check cache (very short TTL for real-time data)
    const cached = await cacheManager.get<RealTimeMetrics>(cacheKey)
    if (cached) {
      return cached
    }

    try {
      const now = new Date()
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000)

      const [
        activeVisitors,
        pageViewsLastHour,
        topActivePages,
        recentEvents,
        conversionRate,
      ] = await Promise.all([
        this.getActiveVisitors(fiveMinutesAgo),
        this.getPageViewsInRange(oneHourAgo, now),
        this.getTopActivePages(fiveMinutesAgo),
        this.getRecentEvents(10),
        this.getConversionRate(oneHourAgo, now),
      ])

      const realTimeMetrics: RealTimeMetrics = {
        activeVisitors,
        pageViewsLastHour,
        topActivePages,
        recentEvents,
        conversionRate,
      }

      // Cache for 30 seconds
      await cacheManager.set(cacheKey, realTimeMetrics, 30)

      return realTimeMetrics
    } catch (error) {
      logger.error('Failed to get real-time metrics', error)
      throw error
    }
  }

  async getContentAnalytics(contentId: string, contentType: 'blog' | 'project' | 'case-study'): Promise<{
    views: number
    uniqueViews: number
    averageTimeOnPage: number
    bounceRate: number
    referrers: Array<{ referrer: string; count: number }>
    devices: Array<{ device: string; count: number }>
    dailyViews: Array<{ date: string; views: number }>
  }> {
    const cacheKey = `content_analytics_${contentType}_${contentId}`
    const cached = await cacheManager.get(cacheKey)
    if (cached) {
      return cached
    }

    const pathname = `/${contentType}/${contentId}`
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const now = new Date()

    try {
      const [
        views,
        uniqueViews,
        averageTimeOnPage,
        bounceRate,
        referrers,
        devices,
        dailyViews,
      ] = await Promise.all([
        this.getTotalPageViews(thirtyDaysAgo, now, { pathname }),
        this.getUniqueVisitors(thirtyDaysAgo, now, { pathname }),
        this.getAverageTimeOnPage(thirtyDaysAgo, now, { pathname }),
        this.getBounceRate(thirtyDaysAgo, now, { pathname }),
        this.getTopReferrers(thirtyDaysAgo, now, { pathname }),
        this.getDeviceTypes(thirtyDaysAgo, now, { pathname }),
        this.getDailyViews(thirtyDaysAgo, now, { pathname }),
      ])

      const analytics = {
        views,
        uniqueViews,
        averageTimeOnPage,
        bounceRate,
        referrers,
        devices,
        dailyViews,
      }

      // Cache for 1 hour
      await cacheManager.set(cacheKey, analytics, 3600)

      return analytics
    } catch (error) {
      logger.error('Failed to get content analytics', { error, contentId, contentType })
      throw error
    }
  }

  // Private helper methods
  private async getTotalPageViews(startDate: Date, endDate: Date, filters?: any): Promise<number> {
    const result = await prisma.$queryRaw`
      SELECT COUNT(*) as count
      FROM page_views 
      WHERE timestamp >= ${startDate.toISOString()} 
        AND timestamp <= ${endDate.toISOString()}
        ${filters?.pathname ? `AND pathname = ${filters.pathname}` : ''}
    ` as any[]

    return Number(result[0].count)
  }

  private async getUniqueVisitors(startDate: Date, endDate: Date, filters?: any): Promise<number> {
    const result = await prisma.$queryRaw`
      SELECT COUNT(DISTINCT session_id) as count
      FROM page_views 
      WHERE timestamp >= ${startDate.toISOString()} 
        AND timestamp <= ${endDate.toISOString()}
        ${filters?.pathname ? `AND pathname = ${filters.pathname}` : ''}
    ` as any[]

    return Number(result[0].count)
  }

  private async getAverageSessionDuration(startDate: Date, endDate: Date, filters?: any): Promise<number> {
    const result = await prisma.$queryRaw`
      SELECT AVG(duration) as avg_duration
      FROM page_views 
      WHERE timestamp >= ${startDate.toISOString()} 
        AND timestamp <= ${endDate.toISOString()}
        AND duration IS NOT NULL
        ${filters?.pathname ? `AND pathname = ${filters.pathname}` : ''}
    ` as any[]

    return Number(result[0].avg_duration) || 0
  }

  private async getBounceRate(startDate: Date, endDate: Date, filters?: any): Promise<number> {
    const result = await prisma.$queryRaw`
      SELECT 
        COUNT(CASE WHEN bounced = 1 THEN 1 END) * 100.0 / COUNT(*) as bounce_rate
      FROM page_views 
      WHERE timestamp >= ${startDate.toISOString()} 
        AND timestamp <= ${endDate.toISOString()}
        ${filters?.pathname ? `AND pathname = ${filters.pathname}` : ''}
    ` as any[]

    return Number(result[0].bounce_rate) || 0
  }

  private async getTopPages(startDate: Date, endDate: Date, filters?: any): Promise<Array<{ pathname: string; views: number; percentage: number }>> {
    const result = await prisma.$queryRaw`
      SELECT pathname, COUNT(*) as views
      FROM page_views 
      WHERE timestamp >= ${startDate.toISOString()} 
        AND timestamp <= ${endDate.toISOString()}
      GROUP BY pathname
      ORDER BY views DESC
      LIMIT 10
    ` as any[]

    const total = result.reduce((sum, row) => sum + Number(row.views), 0)

    return result.map(row => ({
      pathname: row.pathname,
      views: Number(row.views),
      percentage: total > 0 ? (Number(row.views) / total) * 100 : 0,
    }))
  }

  private async getTopReferrers(startDate: Date, endDate: Date, filters?: any): Promise<Array<{ referrer: string; visits: number; percentage: number }>> {
    const result = await prisma.$queryRaw`
      SELECT referrer, COUNT(*) as visits
      FROM page_views 
      WHERE timestamp >= ${startDate.toISOString()} 
        AND timestamp <= ${endDate.toISOString()}
        AND referrer IS NOT NULL
        ${filters?.pathname ? `AND pathname = ${filters.pathname}` : ''}
      GROUP BY referrer
      ORDER BY visits DESC
      LIMIT 10
    ` as any[]

    const total = result.reduce((sum, row) => sum + Number(row.visits), 0)

    return result.map(row => ({
      referrer: row.referrer || 'Direct',
      visits: Number(row.visits),
      percentage: total > 0 ? (Number(row.visits) / total) * 100 : 0,
    }))
  }

  private async getDailyViews(startDate: Date, endDate: Date, filters?: any): Promise<Array<{ date: string; views: number; visitors: number }>> {
    const result = await prisma.$queryRaw`
      SELECT 
        DATE(timestamp) as date,
        COUNT(*) as views,
        COUNT(DISTINCT session_id) as visitors
      FROM page_views 
      WHERE timestamp >= ${startDate.toISOString()} 
        AND timestamp <= ${endDate.toISOString()}
        ${filters?.pathname ? `AND pathname = ${filters.pathname}` : ''}
      GROUP BY DATE(timestamp)
      ORDER BY date
    ` as any[]

    return result.map(row => ({
      date: row.date,
      views: Number(row.views),
      visitors: Number(row.visitors),
    }))
  }

  private async getDeviceTypes(startDate: Date, endDate: Date, filters?: any): Promise<Array<{ device: string; count: number; percentage: number }>> {
    const result = await prisma.$queryRaw`
      SELECT 
        CASE 
          WHEN user_agent LIKE '%Mobile%' THEN 'Mobile'
          WHEN user_agent LIKE '%Tablet%' THEN 'Tablet'
          ELSE 'Desktop'
        END as device,
        COUNT(*) as count
      FROM page_views 
      WHERE timestamp >= ${startDate.toISOString()} 
        AND timestamp <= ${endDate.toISOString()}
        ${filters?.pathname ? `AND pathname = ${filters.pathname}` : ''}
      GROUP BY device
      ORDER BY count DESC
    ` as any[]

    const total = result.reduce((sum, row) => sum + Number(row.count), 0)

    return result.map(row => ({
      device: row.device,
      count: Number(row.count),
      percentage: total > 0 ? (Number(row.count) / total) * 100 : 0,
    }))
  }

  private async getBrowsers(startDate: Date, endDate: Date, filters?: any): Promise<Array<{ browser: string; count: number; percentage: number }>> {
    const result = await prisma.$queryRaw`
      SELECT 
        CASE 
          WHEN user_agent LIKE '%Chrome%' THEN 'Chrome'
          WHEN user_agent LIKE '%Firefox%' THEN 'Firefox'
          WHEN user_agent LIKE '%Safari%' THEN 'Safari'
          WHEN user_agent LIKE '%Edge%' THEN 'Edge'
          ELSE 'Other'
        END as browser,
        COUNT(*) as count
      FROM page_views 
      WHERE timestamp >= ${startDate.toISOString()} 
        AND timestamp <= ${endDate.toISOString()}
        ${filters?.pathname ? `AND pathname = ${filters.pathname}` : ''}
      GROUP BY browser
      ORDER BY count DESC
    ` as any[]

    const total = result.reduce((sum, row) => sum + Number(row.count), 0)

    return result.map(row => ({
      browser: row.browser,
      count: Number(row.count),
      percentage: total > 0 ? (Number(row.count) / total) * 100 : 0,
    }))
  }

  private async getOperatingSystems(startDate: Date, endDate: Date, filters?: any): Promise<Array<{ os: string; count: number; percentage: number }>> {
    const result = await prisma.$queryRaw`
      SELECT 
        CASE 
          WHEN user_agent LIKE '%Windows%' THEN 'Windows'
          WHEN user_agent LIKE '%Mac OS%' THEN 'macOS'
          WHEN user_agent LIKE '%Linux%' THEN 'Linux'
          WHEN user_agent LIKE '%Android%' THEN 'Android'
          WHEN user_agent LIKE '%iOS%' THEN 'iOS'
          ELSE 'Other'
        END as os,
        COUNT(*) as count
      FROM page_views 
      WHERE timestamp >= ${startDate.toISOString()} 
        AND timestamp <= ${endDate.toISOString()}
        ${filters?.pathname ? `AND pathname = ${filters.pathname}` : ''}
      GROUP BY os
      ORDER BY count DESC
    ` as any[]

    const total = result.reduce((sum, row) => sum + Number(row.count), 0)

    return result.map(row => ({
      os: row.os,
      count: Number(row.count),
      percentage: total > 0 ? (Number(row.count) / total) * 100 : 0,
    }))
  }

  private async getAverageTimeOnPage(startDate: Date, endDate: Date, filters?: any): Promise<number> {
    const result = await prisma.$queryRaw`
      SELECT AVG(duration) as avg_time
      FROM page_views 
      WHERE timestamp >= ${startDate.toISOString()} 
        AND timestamp <= ${endDate.toISOString()}
        AND duration IS NOT NULL
        ${filters?.pathname ? `AND pathname = ${filters.pathname}` : ''}
    ` as any[]

    return Number(result[0].avg_time) || 0
  }

  private async getPagesPerSession(startDate: Date, endDate: Date, filters?: any): Promise<number> {
    const result = await prisma.$queryRaw`
      SELECT AVG(page_count) as avg_pages
      FROM (
        SELECT session_id, COUNT(*) as page_count
        FROM page_views 
        WHERE timestamp >= ${startDate.toISOString()} 
          AND timestamp <= ${endDate.toISOString()}
          ${filters?.pathname ? `AND pathname = ${filters.pathname}` : ''}
        GROUP BY session_id
      )
    ` as any[]

    return Number(result[0].avg_pages) || 0
  }

  private async getTopEvents(startDate: Date, endDate: Date, filters?: any): Promise<Array<{ event: string; count: number }>> {
    const result = await prisma.$queryRaw`
      SELECT action as event, COUNT(*) as count
      FROM analytics_events 
      WHERE timestamp >= ${startDate.toISOString()} 
        AND timestamp <= ${endDate.toISOString()}
      GROUP BY action
      ORDER BY count DESC
      LIMIT 10
    ` as any[]

    return result.map(row => ({
      event: row.event,
      count: Number(row.count),
    }))
  }

  private async getConversions(startDate: Date, endDate: Date, filters?: any): Promise<Array<{ goal: string; count: number; rate: number }>> {
    // This would be implemented based on specific conversion goals
    // For now, return empty array
    return []
  }

  private async getPopularContent(startDate: Date, endDate: Date, filters?: any): Promise<Array<{
    id: string
    title: string
    type: 'blog' | 'project' | 'case-study'
    views: number
    engagement: number
  }>> {
    // This would join with content tables to get popular content
    // For now, return empty array
    return []
  }

  private async getSearchQueries(startDate: Date, endDate: Date, filters?: any): Promise<Array<{ query: string; count: number; results: number }>> {
    const result = await prisma.$queryRaw`
      SELECT 
        metadata->>'$.query' as query,
        COUNT(*) as count
      FROM analytics_events 
      WHERE timestamp >= ${startDate.toISOString()} 
        AND timestamp <= ${endDate.toISOString()}
        AND action = 'search'
      GROUP BY query
      ORDER BY count DESC
      LIMIT 20
    ` as any[]

    return result.map(row => ({
      query: row.query || '',
      count: Number(row.count),
      results: 0, // Would be calculated based on search results
    }))
  }

  private async getActiveVisitors(since: Date): Promise<number> {
    const result = await prisma.$queryRaw`
      SELECT COUNT(DISTINCT session_id) as count
      FROM page_views 
      WHERE timestamp >= ${since.toISOString()}
    ` as any[]

    return Number(result[0].count)
  }

  private async getPageViewsInRange(startDate: Date, endDate: Date): Promise<number> {
    const result = await prisma.$queryRaw`
      SELECT COUNT(*) as count
      FROM page_views 
      WHERE timestamp >= ${startDate.toISOString()} 
        AND timestamp <= ${endDate.toISOString()}
    ` as any[]

    return Number(result[0].count)
  }

  private async getTopActivePages(since: Date): Promise<Array<{ pathname: string; activeUsers: number }>> {
    const result = await prisma.$queryRaw`
      SELECT pathname, COUNT(DISTINCT session_id) as activeUsers
      FROM page_views 
      WHERE timestamp >= ${since.toISOString()}
      GROUP BY pathname
      ORDER BY activeUsers DESC
      LIMIT 5
    ` as any[]

    return result.map(row => ({
      pathname: row.pathname,
      activeUsers: Number(row.activeUsers),
    }))
  }

  private async getRecentEvents(limit: number): Promise<AnalyticsEvent[]> {
    const result = await prisma.$queryRaw`
      SELECT *
      FROM analytics_events 
      ORDER BY timestamp DESC
      LIMIT ${limit}
    ` as any[]

    return result.map(row => ({
      type: row.type,
      category: row.category,
      action: row.action,
      label: row.label,
      value: row.value,
      userId: row.user_id,
      sessionId: row.session_id,
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
      referrer: row.referrer,
      pathname: row.pathname,
      timestamp: new Date(row.timestamp),
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
    }))
  }

  private async getConversionRate(startDate: Date, endDate: Date): Promise<number> {
    // This would calculate conversion rate based on specific goals
    // For now, return a placeholder
    return 2.5
  }

  // Removed buffer flushing methods - not needed for serverless deployment
  // Data is now written directly to database in trackEvent and trackPageView methods

  private async initializeTables(): Promise<void> {
    try {
      // PostgreSQL-compatible table creation
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS analytics_events (
          id SERIAL PRIMARY KEY,
          type VARCHAR(255) NOT NULL,
          category VARCHAR(255) NOT NULL,
          action VARCHAR(255) NOT NULL,
          label VARCHAR(255),
          value INTEGER,
          user_id VARCHAR(255),
          session_id VARCHAR(255),
          ip_address VARCHAR(45),
          user_agent TEXT,
          referrer TEXT,
          pathname VARCHAR(2048) NOT NULL,
          timestamp TIMESTAMP NOT NULL,
          metadata JSONB,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `

      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS page_views (
          id SERIAL PRIMARY KEY,
          pathname VARCHAR(2048) NOT NULL,
          title VARCHAR(255),
          referrer TEXT,
          user_id VARCHAR(255),
          session_id VARCHAR(255) NOT NULL,
          ip_address VARCHAR(45),
          user_agent TEXT,
          timestamp TIMESTAMP NOT NULL,
          duration INTEGER,
          bounced BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `

      // Create indexes for better performance (PostgreSQL syntax)
      await prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events(timestamp)
      `

      await prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS idx_analytics_events_pathname ON analytics_events(pathname)
      `

      await prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS idx_page_views_timestamp ON page_views(timestamp)
      `

      await prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS idx_page_views_session_id ON page_views(session_id)
      `

      logger.info('Analytics tables initialized (PostgreSQL)')
    } catch (error) {
      logger.error('Failed to initialize analytics tables', error)
    }
  }
}

export const analyticsService = AnalyticsService.getInstance()