import { PrismaClient } from '@prisma/client'
import { logger } from '../logger'
import { auditLogger } from '../audit-logger'
import crypto from 'crypto'

const prisma = new PrismaClient()

export interface Session {
  id: string
  userId: string
  userEmail: string
  ipAddress: string
  userAgent: string
  isActive: boolean
  isTwoFactorVerified: boolean
  lastActivity: Date
  expiresAt: Date
  createdAt: Date
  location?: string
  deviceInfo?: {
    browser: string
    os: string
    device: string
  }
}

export interface SessionSecurity {
  maxSessions: number
  sessionTimeout: number // in milliseconds
  absoluteTimeout: number // in milliseconds
  requireTwoFactorForSensitive: boolean
  trackLocation: boolean
}

export class SessionManager {
  private static instance: SessionManager
  private config: SessionSecurity = {
    maxSessions: 5,
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
    absoluteTimeout: 24 * 60 * 60 * 1000, // 24 hours
    requireTwoFactorForSensitive: true,
    trackLocation: false
  }

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager()
    }
    return SessionManager.instance
  }

  async createSession(
    userId: string,
    userEmail: string,
    ipAddress: string,
    userAgent: string,
    twoFactorVerified: boolean = false
  ): Promise<Session> {
    try {
      // Clean up expired sessions first
      await this.cleanupExpiredSessions()

      // Check session limits
      await this.enforceSessionLimits(userId)

      // Generate session ID
      const sessionId = this.generateSessionId()
      
      // Parse user agent for device info
      const deviceInfo = this.parseUserAgent(userAgent)
      
      // Get location (if enabled)
      let location: string | undefined
      if (this.config.trackLocation) {
        location = await this.getLocationFromIP(ipAddress)
      }

      const now = new Date()
      const expiresAt = new Date(now.getTime() + this.config.absoluteTimeout)

      // Create session in database
      await prisma.$executeRaw`
        INSERT INTO user_sessions (
          id, user_id, user_email, ip_address, user_agent,
          is_active, is_two_factor_verified, last_activity, expires_at,
          location, device_info, created_at
        ) VALUES (
          ${sessionId}, ${userId}, ${userEmail}, ${ipAddress}, ${userAgent},
          true, ${twoFactorVerified}, ${now.toISOString()}, ${expiresAt.toISOString()},
          ${location || null}, ${JSON.stringify(deviceInfo)}, ${now.toISOString()}
        )
      `

      const session: Session = {
        id: sessionId,
        userId,
        userEmail,
        ipAddress,
        userAgent,
        isActive: true,
        isTwoFactorVerified: twoFactorVerified,
        lastActivity: now,
        expiresAt,
        createdAt: now,
        location,
        deviceInfo
      }

      await auditLogger.logSecurityEvent(
        'session_created',
        'low',
        {
          sessionId,
          ipAddress,
          userAgent: this.sanitizeUserAgent(userAgent),
          location,
          twoFactorVerified
        },
        userId,
        userEmail
      )

      logger.info('Session created', { 
        sessionId, 
        userId, 
        ipAddress: this.maskIP(ipAddress) 
      })

      return session
    } catch (error) {
      logger.error('Failed to create session', error)
      throw error
    }
  }

  async getSession(sessionId: string): Promise<Session | null> {
    try {
      const result = await prisma.$queryRaw`
        SELECT * FROM user_sessions 
        WHERE id = ${sessionId} AND is_active = true AND expires_at > datetime('now')
      ` as any[]

      if (result.length === 0) return null

      const data = result[0]
      return this.mapDatabaseSessionToSession(data)
    } catch (error) {
      logger.error('Failed to get session', error)
      return null
    }
  }

  async validateSession(sessionId: string, ipAddress?: string): Promise<{
    valid: boolean
    session?: Session
    reason?: string
  }> {
    try {
      const session = await this.getSession(sessionId)
      
      if (!session) {
        return { valid: false, reason: 'session_not_found' }
      }

      // Check if session is expired
      if (session.expiresAt < new Date()) {
        await this.invalidateSession(sessionId, 'expired')
        return { valid: false, reason: 'session_expired' }
      }

      // Check session timeout
      const lastActivityTimeout = new Date(session.lastActivity.getTime() + this.config.sessionTimeout)
      if (lastActivityTimeout < new Date()) {
        await this.invalidateSession(sessionId, 'timeout')
        return { valid: false, reason: 'session_timeout' }
      }

      // Check IP address consistency (optional security feature)
      if (ipAddress && session.ipAddress !== ipAddress) {
        await auditLogger.logSecurityEvent(
          'session_ip_mismatch',
          'high',
          {
            sessionId,
            originalIP: this.maskIP(session.ipAddress),
            newIP: this.maskIP(ipAddress)
          },
          session.userId,
          session.userEmail,
          false
        )
        
        // In high-security mode, invalidate session on IP mismatch
        // await this.invalidateSession(sessionId, 'ip_mismatch')
        // return { valid: false, reason: 'ip_mismatch' }
      }

      // Update last activity
      await this.updateLastActivity(sessionId)

      return { valid: true, session }
    } catch (error) {
      logger.error('Session validation failed', error)
      return { valid: false, reason: 'validation_error' }
    }
  }

  async updateLastActivity(sessionId: string): Promise<void> {
    try {
      await prisma.$executeRaw`
        UPDATE user_sessions 
        SET last_activity = datetime('now')
        WHERE id = ${sessionId}
      `
    } catch (error) {
      logger.error('Failed to update session activity', error)
    }
  }

  async updateTwoFactorStatus(sessionId: string, verified: boolean): Promise<void> {
    try {
      await prisma.$executeRaw`
        UPDATE user_sessions 
        SET is_two_factor_verified = ${verified}
        WHERE id = ${sessionId}
      `

      const session = await this.getSession(sessionId)
      if (session) {
        await auditLogger.logSecurityEvent(
          verified ? 'session_two_factor_verified' : 'session_two_factor_unverified',
          'medium',
          { sessionId },
          session.userId,
          session.userEmail
        )
      }
    } catch (error) {
      logger.error('Failed to update two-factor status', error)
      throw error
    }
  }

  async invalidateSession(sessionId: string, reason: string): Promise<void> {
    try {
      const session = await this.getSession(sessionId)
      
      await prisma.$executeRaw`
        UPDATE user_sessions 
        SET is_active = false
        WHERE id = ${sessionId}
      `

      if (session) {
        await auditLogger.logSecurityEvent(
          'session_invalidated',
          'medium',
          { sessionId, reason },
          session.userId,
          session.userEmail
        )

        logger.info('Session invalidated', { 
          sessionId, 
          reason, 
          userId: session.userId 
        })
      }
    } catch (error) {
      logger.error('Failed to invalidate session', error)
    }
  }

  async invalidateAllUserSessions(userId: string, exceptSessionId?: string): Promise<number> {
    try {
      const whereClause = exceptSessionId 
        ? `user_id = '${userId}' AND id != '${exceptSessionId}'`
        : `user_id = '${userId}'`

      const result = await prisma.$executeRaw`
        UPDATE user_sessions 
        SET is_active = false
        WHERE ${whereClause} AND is_active = true
      `

      const user = await prisma.adminUser.findUnique({ 
        where: { id: userId },
        select: { email: true }
      })

      await auditLogger.logSecurityEvent(
        'all_sessions_invalidated',
        'high',
        { 
          userId, 
          exceptSessionId,
          invalidatedCount: result
        },
        userId,
        user?.email || 'unknown'
      )

      logger.info('All user sessions invalidated', { 
        userId, 
        exceptSessionId,
        count: result
      })

      return result as number
    } catch (error) {
      logger.error('Failed to invalidate user sessions', error)
      throw error
    }
  }

  async getUserSessions(userId: string): Promise<Session[]> {
    try {
      const result = await prisma.$queryRaw`
        SELECT * FROM user_sessions 
        WHERE user_id = ${userId} AND is_active = true AND expires_at > datetime('now')
        ORDER BY last_activity DESC
      ` as any[]

      return result.map(this.mapDatabaseSessionToSession)
    } catch (error) {
      logger.error('Failed to get user sessions', error)
      return []
    }
  }

  async getSessionAnalytics(days: number = 30): Promise<{
    totalActiveSessions: number
    totalUniqueUsers: number
    averageSessionDuration: number
    topLocations: Array<{ location: string; count: number }>
    topDevices: Array<{ device: string; count: number }>
    sessionsByDay: Array<{ date: string; count: number }>
  }> {
    try {
      const since = new Date(Date.now() - (days * 24 * 60 * 60 * 1000))

      const [activeSessionsResult, uniqueUsersResult, sessionsDataResult] = await Promise.all([
        prisma.$queryRaw`
          SELECT COUNT(*) as count 
          FROM user_sessions 
          WHERE is_active = true AND expires_at > datetime('now')
        ` as any[],
        
        prisma.$queryRaw`
          SELECT COUNT(DISTINCT user_id) as count 
          FROM user_sessions 
          WHERE created_at >= ${since.toISOString()}
        ` as any[],
        
        prisma.$queryRaw`
          SELECT location, device_info, created_at, last_activity
          FROM user_sessions 
          WHERE created_at >= ${since.toISOString()}
        ` as any[]
      ])

      const totalActiveSessions = activeSessionsResult[0].count
      const totalUniqueUsers = uniqueUsersResult[0].count

      // Calculate average session duration
      let totalDuration = 0
      const locationCounts = new Map<string, number>()
      const deviceCounts = new Map<string, number>()
      const dailyCounts = new Map<string, number>()

      for (const session of sessionsDataResult) {
        // Duration calculation
        const created = new Date(session.created_at)
        const lastActivity = new Date(session.last_activity)
        totalDuration += lastActivity.getTime() - created.getTime()

        // Location aggregation
        if (session.location) {
          locationCounts.set(session.location, (locationCounts.get(session.location) || 0) + 1)
        }

        // Device aggregation
        if (session.device_info) {
          try {
            const deviceInfo = JSON.parse(session.device_info)
            const device = `${deviceInfo.browser} on ${deviceInfo.os}`
            deviceCounts.set(device, (deviceCounts.get(device) || 0) + 1)
          } catch {
            // Ignore malformed device info
          }
        }

        // Daily counts
        const date = created.toISOString().split('T')[0]
        dailyCounts.set(date, (dailyCounts.get(date) || 0) + 1)
      }

      const averageSessionDuration = sessionsDataResult.length > 0 
        ? totalDuration / sessionsDataResult.length 
        : 0

      return {
        totalActiveSessions,
        totalUniqueUsers,
        averageSessionDuration,
        topLocations: Array.from(locationCounts.entries())
          .map(([location, count]) => ({ location, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10),
        topDevices: Array.from(deviceCounts.entries())
          .map(([device, count]) => ({ device, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10),
        sessionsByDay: Array.from(dailyCounts.entries())
          .map(([date, count]) => ({ date, count }))
          .sort((a, b) => a.date.localeCompare(b.date))
      }
    } catch (error) {
      logger.error('Failed to get session analytics', error)
      throw error
    }
  }

  async cleanupExpiredSessions(): Promise<number> {
    try {
      const result = await prisma.$executeRaw`
        DELETE FROM user_sessions 
        WHERE expires_at < datetime('now') OR 
              (last_activity < datetime('now', '-${this.config.sessionTimeout / 1000} seconds') AND is_active = true)
      `

      if (result > 0) {
        logger.info('Expired sessions cleaned up', { count: result })
      }

      return result as number
    } catch (error) {
      logger.error('Failed to cleanup expired sessions', error)
      return 0
    }
  }

  private async enforceSessionLimits(userId: string): Promise<void> {
    const activeSessions = await this.getUserSessions(userId)
    
    if (activeSessions.length >= this.config.maxSessions) {
      // Remove oldest sessions
      const sessionsToRemove = activeSessions
        .sort((a, b) => a.lastActivity.getTime() - b.lastActivity.getTime())
        .slice(0, activeSessions.length - this.config.maxSessions + 1)

      for (const session of sessionsToRemove) {
        await this.invalidateSession(session.id, 'session_limit_exceeded')
      }
    }
  }

  private generateSessionId(): string {
    return crypto.randomBytes(32).toString('hex')
  }

  private parseUserAgent(userAgent: string): {
    browser: string
    os: string
    device: string
  } {
    // Simple user agent parsing (in production, use a proper library)
    const ua = userAgent.toLowerCase()
    
    let browser = 'Unknown'
    if (ua.includes('chrome')) browser = 'Chrome'
    else if (ua.includes('firefox')) browser = 'Firefox'
    else if (ua.includes('safari')) browser = 'Safari'
    else if (ua.includes('edge')) browser = 'Edge'
    
    let os = 'Unknown'
    if (ua.includes('windows')) os = 'Windows'
    else if (ua.includes('mac')) os = 'macOS'
    else if (ua.includes('linux')) os = 'Linux'
    else if (ua.includes('android')) os = 'Android'
    else if (ua.includes('ios')) os = 'iOS'
    
    let device = 'Desktop'
    if (ua.includes('mobile')) device = 'Mobile'
    else if (ua.includes('tablet')) device = 'Tablet'
    
    return { browser, os, device }
  }

  private async getLocationFromIP(ipAddress: string): Promise<string | undefined> {
    // In production, use a geolocation service
    // For now, return undefined
    return undefined
  }

  private sanitizeUserAgent(userAgent: string): string {
    // Remove potentially sensitive information
    return userAgent.substring(0, 200)
  }

  private maskIP(ipAddress: string): string {
    // Mask the last octet for privacy
    const parts = ipAddress.split('.')
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.${parts[2]}.xxx`
    }
    return 'xxx.xxx.xxx.xxx'
  }

  private mapDatabaseSessionToSession(data: any): Session {
    return {
      id: data.id,
      userId: data.user_id,
      userEmail: data.user_email,
      ipAddress: data.ip_address,
      userAgent: data.user_agent,
      isActive: Boolean(data.is_active),
      isTwoFactorVerified: Boolean(data.is_two_factor_verified),
      lastActivity: new Date(data.last_activity),
      expiresAt: new Date(data.expires_at),
      createdAt: new Date(data.created_at),
      location: data.location,
      deviceInfo: data.device_info ? JSON.parse(data.device_info) : undefined
    }
  }

  // Initialize database tables
  async initializeTables(): Promise<void> {
    try {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS user_sessions (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          user_email TEXT NOT NULL,
          ip_address TEXT NOT NULL,
          user_agent TEXT NOT NULL,
          is_active BOOLEAN NOT NULL DEFAULT true,
          is_two_factor_verified BOOLEAN NOT NULL DEFAULT false,
          last_activity DATETIME NOT NULL,
          expires_at DATETIME NOT NULL,
          location TEXT,
          device_info TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `

      await prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id)
      `

      await prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(is_active, expires_at)
      `

      logger.info('Session management tables initialized')
    } catch (error) {
      logger.error('Failed to initialize session tables', error)
      throw error
    }
  }

  updateConfig(config: Partial<SessionSecurity>): void {
    this.config = { ...this.config, ...config }
    logger.info('Session configuration updated', this.config)
  }
}

export const sessionManager = SessionManager.getInstance()

// Initialize tables and start cleanup
sessionManager.initializeTables().catch(error =>
  logger.error('Failed to initialize session tables', error)
)

// Cleanup expired sessions every hour
setInterval(() => {
  sessionManager.cleanupExpiredSessions().catch(error =>
    logger.error('Failed to cleanup expired sessions', error)
  )
}, 60 * 60 * 1000)