/**
 * Minimal audit logger stub
 */

// Stub implementation for quick deployment
export class AuditLogger {
  static async logEvent(event: string, details: any) {
    console.log('Audit event:', event, details)
  }

  async logSecurityEvent(event: string, severity: string, details: any, userId?: string, userEmail?: string, additional?: any) {
    console.log('Security event:', event, severity, details, userId, userEmail, additional)
  }
}

export const auditLogger = new AuditLogger()