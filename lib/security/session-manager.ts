/**
 * Minimal session manager stub
 */

export class SessionManager {
  static async createSession(userId: string, sessionData: any) {
    return {
      sessionId: 'stub-session-id',
      token: 'stub-token',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    }
  }

  static async validateSession(sessionId: string) {
    return null
  }

  static async invalidateSession(sessionId: string) {
    return true
  }

  static async getSessionStats() {
    return {
      activeSessions: 0,
      uniqueUsers: 0,
      recentActivity: []
    }
  }
}

export const sessionManager = new SessionManager()