import { PrismaClient } from '@prisma/client'
import { logger } from './logger'

const prisma = new PrismaClient()

export interface AuditEvent {
  id?: string
  action: string
  resource: string
  resourceId?: string
  userId?: string
  userEmail?: string
  ipAddress?: string
  userAgent?: string
  metadata?: Record<string, any>
  previousState?: Record<string, any>
  newState?: Record<string, any>
  timestamp: Date
  success: boolean
  errorMessage?: string
  sessionId?: string
  severity: 'low' | 'medium' | 'high' | 'critical'
}

export interface AuditFilter {
  action?: string
  resource?: string
  userId?: string
  dateFrom?: Date
  dateTo?: Date
  success?: boolean
  severity?: string[]
  limit?: number
  offset?: number
}

export interface AuditSummary {
  totalEvents: number
  recentActivity: number
  topActions: Array<{ action: string; count: number }>
  topUsers: Array<{ userId: string; userEmail?: string; count: number }>
  failureRate: number
  criticalEvents: number
}

export class AuditLogger {
  private static instance: AuditLogger
  private eventBuffer: AuditEvent[] = []
  private bufferSize = 100
  private flushInterval: NodeJS.Timeout | null = null

  static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger()
      AuditLogger.instance.startBufferFlush()
    }
    return AuditLogger.instance
  }

  async log(event: Omit<AuditEvent, 'id' | 'timestamp'>): Promise<void> {
    const auditEvent: AuditEvent = {
      ...event,
      timestamp: new Date()
    }

    // Add to buffer for batch processing
    this.eventBuffer.push(auditEvent)

    // If buffer is full, flush immediately
    if (this.eventBuffer.length >= this.bufferSize) {
      await this.flushBuffer()
    }

    // Also log to application logger for immediate visibility
    logger.info(`Audit: ${event.action}`, {
      resource: event.resource,
      resourceId: event.resourceId,
      userId: event.userId,
      success: event.success,
      severity: event.severity,
      metadata: event.metadata
    })
  }

  // Convenience methods for common audit events
  async logUserAction(
    action: string,
    userId: string,
    userEmail: string,
    resource: string,
    resourceId?: string,
    metadata?: Record<string, any>,
    success: boolean = true,
    severity: AuditEvent['severity'] = 'medium'
  ): Promise<void> {
    await this.log({
      action,
      resource,
      resourceId,
      userId,
      userEmail,
      metadata,
      success,
      severity
    })
  }

  async logDataChange(
    action: 'create' | 'update' | 'delete',
    resource: string,
    resourceId: string,
    userId: string,
    userEmail: string,
    previousState?: Record<string, any>,
    newState?: Record<string, any>,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.log({
      action,
      resource,
      resourceId,
      userId,
      userEmail,
      previousState,
      newState,
      metadata,
      success: true,
      severity: action === 'delete' ? 'high' : 'medium'
    })
  }

  async logSecurityEvent(
    action: string,
    severity: 'high' | 'critical',
    metadata?: Record<string, any>,
    userId?: string,
    userEmail?: string,
    success: boolean = true
  ): Promise<void> {
    await this.log({
      action,
      resource: 'security',
      userId,
      userEmail,
      metadata,
      success,
      severity
    })
  }

  async logSystemEvent(
    action: string,
    metadata?: Record<string, any>,
    success: boolean = true,
    severity: AuditEvent['severity'] = 'low'
  ): Promise<void> {
    await this.log({
      action,
      resource: 'system',
      metadata,
      success,
      severity
    })
  }

  async getAuditEvents(filter: AuditFilter = {}): Promise<{
    events: AuditEvent[]
    total: number
    hasMore: boolean
  }> {
    try {
      // Ensure buffer is flushed before querying
      await this.flushBuffer()

      const {
        action,
        resource,
        userId,
        dateFrom,
        dateTo,
        success,
        severity,
        limit = 50,
        offset = 0
      } = filter

      const where: any = {}

      if (action) where.action = { contains: action }
      if (resource) where.resource = resource
      if (userId) where.userId = userId
      if (success !== undefined) where.success = success
      if (severity && severity.length > 0) where.severity = { in: severity }
      if (dateFrom || dateTo) {
        where.timestamp = {}
        if (dateFrom) where.timestamp.gte = dateFrom
        if (dateTo) where.timestamp.lte = dateTo
      }

      const [events, total] = await Promise.all([
        prisma.auditLog.findMany({
          where,
          orderBy: { timestamp: 'desc' },
          skip: offset,
          take: limit
        }),
        prisma.auditLog.count({ where })
      ])

      return {
        events: events.map(this.mapDatabaseEventToAuditEvent),
        total,
        hasMore: offset + events.length < total
      }
    } catch (error) {
      logger.error('Failed to fetch audit events', error)
      throw error
    }
  }

  async getAuditSummary(days: number = 30): Promise<AuditSummary> {
    try {
      await this.flushBuffer()

      const since = new Date()
      since.setDate(since.getDate() - days)

      const [
        totalEvents,
        recentEvents,
        actionStats,
        userStats,
        failedEvents,
        criticalEvents
      ] = await Promise.all([
        prisma.auditLog.count(),
        prisma.auditLog.count({
          where: { timestamp: { gte: since } }
        }),
        prisma.auditLog.groupBy({
          by: ['action'],
          _count: { action: true },
          where: { timestamp: { gte: since } },
          orderBy: { _count: { action: 'desc' } },
          take: 10
        }),
        prisma.auditLog.groupBy({
          by: ['userId', 'userEmail'],
          _count: { userId: true },
          where: { 
            timestamp: { gte: since },
            userId: { not: null }
          },
          orderBy: { _count: { userId: 'desc' } },
          take: 10
        }),
        prisma.auditLog.count({
          where: { 
            timestamp: { gte: since },
            success: false
          }
        }),
        prisma.auditLog.count({
          where: { 
            timestamp: { gte: since },
            severity: 'critical'
          }
        })
      ])

      const failureRate = recentEvents > 0 ? (failedEvents / recentEvents) * 100 : 0

      return {
        totalEvents,
        recentActivity: recentEvents,
        topActions: actionStats.map(stat => ({
          action: stat.action,
          count: stat._count.action
        })),
        topUsers: userStats.map(stat => ({
          userId: stat.userId || 'unknown',
          userEmail: stat.userEmail || undefined,
          count: stat._count.userId
        })),
        failureRate: Math.round(failureRate * 100) / 100,
        criticalEvents
      }
    } catch (error) {
      logger.error('Failed to generate audit summary', error)
      throw error
    }
  }

  async searchAuditEvents(
    query: string,
    limit: number = 50
  ): Promise<AuditEvent[]> {
    try {
      await this.flushBuffer()

      const events = await prisma.auditLog.findMany({
        where: {
          OR: [
            { action: { contains: query } },
            { resource: { contains: query } },
            { resourceId: { contains: query } },
            { userEmail: { contains: query } },
            { metadata: { contains: query } }
          ]
        },
        orderBy: { timestamp: 'desc' },
        take: limit
      })

      return events.map(this.mapDatabaseEventToAuditEvent)
    } catch (error) {
      logger.error('Failed to search audit events', error)
      throw error
    }
  }

  async exportAuditEvents(
    filter: AuditFilter = {},
    format: 'json' | 'csv' = 'json'
  ): Promise<{ data: any; filename: string }> {
    try {
      const result = await this.getAuditEvents({
        ...filter,
        limit: 10000 // Large limit for export
      })

      const timestamp = new Date().toISOString().split('T')[0]
      const filename = `audit-export-${timestamp}.${format}`

      if (format === 'csv') {
        const csv = this.convertToCSV(result.events)
        return { data: csv, filename }
      }

      return { 
        data: JSON.stringify(result.events, null, 2), 
        filename 
      }
    } catch (error) {
      logger.error('Failed to export audit events', error)
      throw error
    }
  }

  async getAuditTimeline(days: number = 7): Promise<Array<{
    date: string
    events: number
    failures: number
    critical: number
  }>> {
    try {
      await this.flushBuffer()

      const since = new Date()
      since.setDate(since.getDate() - days)

      const events = await prisma.auditLog.findMany({
        where: { timestamp: { gte: since } },
        select: {
          timestamp: true,
          success: true,
          severity: true
        }
      })

      // Group by date
      const timeline = new Map<string, { events: number; failures: number; critical: number }>()

      for (const event of events) {
        const date = event.timestamp.toISOString().split('T')[0]
        
        if (!timeline.has(date)) {
          timeline.set(date, { events: 0, failures: 0, critical: 0 })
        }

        const dayData = timeline.get(date)!
        dayData.events++
        
        if (!event.success) dayData.failures++
        if (event.severity === 'critical') dayData.critical++
      }

      return Array.from(timeline.entries()).map(([date, data]) => ({
        date,
        ...data
      })).sort((a, b) => a.date.localeCompare(b.date))
    } catch (error) {
      logger.error('Failed to generate audit timeline', error)
      throw error
    }
  }

  async cleanupOldEvents(retentionDays: number = 365): Promise<number> {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays)

      const result = await prisma.auditLog.deleteMany({
        where: {
          timestamp: { lt: cutoffDate },
          severity: { not: 'critical' } // Keep critical events longer
        }
      })

      logger.info('Audit log cleanup completed', {
        deleted: result.count,
        retentionDays,
        cutoffDate
      })

      return result.count
    } catch (error) {
      logger.error('Failed to cleanup audit events', error)
      throw error
    }
  }

  private startBufferFlush(): void {
    this.flushInterval = setInterval(async () => {
      if (this.eventBuffer.length > 0) {
        await this.flushBuffer()
      }
    }, 5000) // Flush every 5 seconds
  }

  private async flushBuffer(): Promise<void> {
    if (this.eventBuffer.length === 0) return

    const eventsToFlush = [...this.eventBuffer]
    this.eventBuffer = []

    try {
      // Add audit_log table creation to schema if it doesn't exist
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS audit_logs (
          id TEXT PRIMARY KEY,
          action TEXT NOT NULL,
          resource TEXT NOT NULL,
          resource_id TEXT,
          user_id TEXT,
          user_email TEXT,
          ip_address TEXT,
          user_agent TEXT,
          metadata TEXT,
          previous_state TEXT,
          new_state TEXT,
          timestamp DATETIME NOT NULL,
          success BOOLEAN NOT NULL,
          error_message TEXT,
          session_id TEXT,
          severity TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `

      for (const event of eventsToFlush) {
        await prisma.$executeRaw`
          INSERT INTO audit_logs (
            id, action, resource, resource_id, user_id, user_email,
            ip_address, user_agent, metadata, previous_state, new_state,
            timestamp, success, error_message, session_id, severity
          ) VALUES (
            ${event.id || `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`},
            ${event.action},
            ${event.resource},
            ${event.resourceId || null},
            ${event.userId || null},
            ${event.userEmail || null},
            ${event.ipAddress || null},
            ${event.userAgent || null},
            ${event.metadata ? JSON.stringify(event.metadata) : null},
            ${event.previousState ? JSON.stringify(event.previousState) : null},
            ${event.newState ? JSON.stringify(event.newState) : null},
            ${event.timestamp},
            ${event.success},
            ${event.errorMessage || null},
            ${event.sessionId || null},
            ${event.severity}
          )
        `
      }

      logger.debug('Audit buffer flushed', { count: eventsToFlush.length })
    } catch (error) {
      logger.error('Failed to flush audit buffer', error)
      // Re-add events to buffer to retry later
      this.eventBuffer.unshift(...eventsToFlush)
    }
  }

  private mapDatabaseEventToAuditEvent(dbEvent: any): AuditEvent {
    return {
      id: dbEvent.id,
      action: dbEvent.action,
      resource: dbEvent.resource,
      resourceId: dbEvent.resource_id,
      userId: dbEvent.user_id,
      userEmail: dbEvent.user_email,
      ipAddress: dbEvent.ip_address,
      userAgent: dbEvent.user_agent,
      metadata: dbEvent.metadata ? JSON.parse(dbEvent.metadata) : undefined,
      previousState: dbEvent.previous_state ? JSON.parse(dbEvent.previous_state) : undefined,
      newState: dbEvent.new_state ? JSON.parse(dbEvent.new_state) : undefined,
      timestamp: dbEvent.timestamp,
      success: dbEvent.success,
      errorMessage: dbEvent.error_message,
      sessionId: dbEvent.session_id,
      severity: dbEvent.severity
    }
  }

  private convertToCSV(events: AuditEvent[]): string {
    if (events.length === 0) return ''

    const headers = [
      'timestamp', 'action', 'resource', 'resourceId', 'userId', 'userEmail',
      'success', 'severity', 'errorMessage', 'ipAddress'
    ]

    const csvRows = [headers.join(',')]

    for (const event of events) {
      const values = headers.map(header => {
        const value = (event as any)[header]
        if (value === null || value === undefined) return ''
        if (typeof value === 'object') return JSON.stringify(value)
        return `"${String(value).replace(/"/g, '""')}"`
      })
      csvRows.push(values.join(','))
    }

    return csvRows.join('\n')
  }

  // Cleanup on application shutdown
  destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval)
    }
    // Flush any remaining events
    this.flushBuffer().catch(error => 
      logger.error('Failed to flush audit buffer on shutdown', error)
    )
  }
}

export const auditLogger = AuditLogger.getInstance()

// Graceful shutdown handling
if (typeof process !== 'undefined') {
  process.on('SIGTERM', () => auditLogger.destroy())
  process.on('SIGINT', () => auditLogger.destroy())
}