import { PrismaClient } from '@prisma/client'
import { logger } from '../logger'
import { auditLogger } from '../audit-logger'
import crypto from 'crypto'
import qrcode from 'qrcode'

const prisma = new PrismaClient()

export interface TwoFactorSetup {
  secret: string
  qrCodeUrl: string
  backupCodes: string[]
}

export interface TwoFactorVerification {
  isValid: boolean
  remainingAttempts?: number
  lockoutUntil?: Date
}

export class TwoFactorAuth {
  private static instance: TwoFactorAuth
  private readonly issuer = 'Portfolio Admin'
  private readonly maxAttempts = 5
  private readonly lockoutDuration = 15 * 60 * 1000 // 15 minutes

  static getInstance(): TwoFactorAuth {
    if (!TwoFactorAuth.instance) {
      TwoFactorAuth.instance = new TwoFactorAuth()
    }
    return TwoFactorAuth.instance
  }

  async enableTwoFactor(userId: string, userEmail: string): Promise<TwoFactorSetup> {
    try {
      // Generate secret key
      const secret = this.generateSecret()
      
      // Generate backup codes
      const backupCodes = this.generateBackupCodes()
      
      // Create QR code URL
      const qrCodeUrl = await this.generateQRCode(userEmail, secret)

      // Store in database (not enabled until verified)
      await prisma.$executeRaw`
        INSERT OR REPLACE INTO user_two_factor (
          user_id, secret, backup_codes, enabled, created_at, updated_at
        ) VALUES (
          ${userId}, ${secret}, ${JSON.stringify(backupCodes)}, 
          false, datetime('now'), datetime('now')
        )
      `

      await auditLogger.logSecurityEvent(
        'two_factor_setup_initiated',
        'medium',
        { userId, userEmail },
        userId,
        userEmail
      )

      logger.info('Two-factor authentication setup initiated', { userId })

      return {
        secret,
        qrCodeUrl,
        backupCodes
      }
    } catch (error) {
      logger.error('Failed to enable two-factor authentication', error)
      throw error
    }
  }

  async verifyAndEnableTwoFactor(
    userId: string,
    userEmail: string,
    token: string
  ): Promise<boolean> {
    try {
      const twoFactorData = await this.getTwoFactorData(userId)
      
      if (!twoFactorData || twoFactorData.enabled) {
        throw new Error('Two-factor authentication not in setup state')
      }

      const isValid = this.verifyToken(twoFactorData.secret, token)
      
      if (!isValid) {
        await auditLogger.logSecurityEvent(
          'two_factor_verification_failed',
          'high',
          { userId, reason: 'invalid_token' },
          userId,
          userEmail,
          false
        )
        return false
      }

      // Enable two-factor authentication
      await prisma.$executeRaw`
        UPDATE user_two_factor 
        SET enabled = true, updated_at = datetime('now')
        WHERE user_id = ${userId}
      `

      await auditLogger.logSecurityEvent(
        'two_factor_enabled',
        'medium',
        { userId },
        userId,
        userEmail
      )

      logger.info('Two-factor authentication enabled', { userId })
      return true
    } catch (error) {
      logger.error('Failed to verify and enable two-factor authentication', error)
      throw error
    }
  }

  async verifyTwoFactor(
    userId: string,
    userEmail: string,
    token: string,
    ipAddress?: string
  ): Promise<TwoFactorVerification> {
    try {
      // Check if user is locked out
      const lockoutStatus = await this.checkLockout(userId)
      if (lockoutStatus.isLockedOut) {
        await auditLogger.logSecurityEvent(
          'two_factor_verification_blocked',
          'high',
          { 
            userId, 
            reason: 'account_locked',
            lockoutUntil: lockoutStatus.lockoutUntil,
            ipAddress
          },
          userId,
          userEmail,
          false
        )

        return {
          isValid: false,
          lockoutUntil: lockoutStatus.lockoutUntil
        }
      }

      const twoFactorData = await this.getTwoFactorData(userId)
      
      if (!twoFactorData || !twoFactorData.enabled) {
        return { isValid: false }
      }

      // Try regular token verification first
      let isValid = this.verifyToken(twoFactorData.secret, token)
      let usedBackupCode = false

      // If regular token fails, try backup codes
      if (!isValid && twoFactorData.backupCodes.includes(token)) {
        isValid = true
        usedBackupCode = true
        
        // Remove used backup code
        const updatedBackupCodes = twoFactorData.backupCodes.filter(code => code !== token)
        await prisma.$executeRaw`
          UPDATE user_two_factor 
          SET backup_codes = ${JSON.stringify(updatedBackupCodes)},
              updated_at = datetime('now')
          WHERE user_id = ${userId}
        `
      }

      if (isValid) {
        // Reset failed attempts on successful verification
        await this.resetFailedAttempts(userId)

        await auditLogger.logSecurityEvent(
          'two_factor_verification_success',
          'low',
          { 
            userId,
            method: usedBackupCode ? 'backup_code' : 'totp',
            ipAddress
          },
          userId,
          userEmail
        )

        return { isValid: true }
      } else {
        // Record failed attempt
        const attemptsInfo = await this.recordFailedAttempt(userId)
        
        await auditLogger.logSecurityEvent(
          'two_factor_verification_failed',
          attemptsInfo.remainingAttempts === 0 ? 'critical' : 'high',
          { 
            userId,
            remainingAttempts: attemptsInfo.remainingAttempts,
            ipAddress
          },
          userId,
          userEmail,
          false
        )

        return {
          isValid: false,
          remainingAttempts: attemptsInfo.remainingAttempts,
          lockoutUntil: attemptsInfo.lockoutUntil
        }
      }
    } catch (error) {
      logger.error('Two-factor verification failed', error)
      throw error
    }
  }

  async disableTwoFactor(userId: string, userEmail: string): Promise<boolean> {
    try {
      await prisma.$executeRaw`
        UPDATE user_two_factor 
        SET enabled = false, updated_at = datetime('now')
        WHERE user_id = ${userId}
      `

      await auditLogger.logSecurityEvent(
        'two_factor_disabled',
        'high',
        { userId },
        userId,
        userEmail
      )

      logger.info('Two-factor authentication disabled', { userId })
      return true
    } catch (error) {
      logger.error('Failed to disable two-factor authentication', error)
      throw error
    }
  }

  async regenerateBackupCodes(userId: string, userEmail: string): Promise<string[]> {
    try {
      const backupCodes = this.generateBackupCodes()
      
      await prisma.$executeRaw`
        UPDATE user_two_factor 
        SET backup_codes = ${JSON.stringify(backupCodes)},
            updated_at = datetime('now')
        WHERE user_id = ${userId} AND enabled = true
      `

      await auditLogger.logSecurityEvent(
        'two_factor_backup_codes_regenerated',
        'medium',
        { userId },
        userId,
        userEmail
      )

      logger.info('Two-factor backup codes regenerated', { userId })
      return backupCodes
    } catch (error) {
      logger.error('Failed to regenerate backup codes', error)
      throw error
    }
  }

  async getTwoFactorStatus(userId: string): Promise<{
    enabled: boolean
    backupCodesCount: number
    lastUsed?: Date
  }> {
    try {
      const twoFactorData = await this.getTwoFactorData(userId)
      
      return {
        enabled: twoFactorData?.enabled || false,
        backupCodesCount: twoFactorData?.backupCodes.length || 0,
        lastUsed: twoFactorData?.lastUsed
      }
    } catch (error) {
      logger.error('Failed to get two-factor status', error)
      throw error
    }
  }

  private async getTwoFactorData(userId: string) {
    const result = await prisma.$queryRaw`
      SELECT secret, backup_codes, enabled, last_used
      FROM user_two_factor 
      WHERE user_id = ${userId}
    ` as any[]

    if (result.length === 0) return null

    const data = result[0]
    return {
      secret: data.secret,
      backupCodes: JSON.parse(data.backup_codes || '[]'),
      enabled: Boolean(data.enabled),
      lastUsed: data.last_used ? new Date(data.last_used) : undefined
    }
  }

  private generateSecret(): string {
    // Generate a 32-character base32 secret
    const buffer = crypto.randomBytes(20)
    return buffer.toString('base64')
      .replace(/\+/g, '')
      .replace(/\//g, '')
      .replace(/=/g, '')
      .toUpperCase()
      .substring(0, 32)
  }

  private generateBackupCodes(): string[] {
    const codes = []
    for (let i = 0; i < 10; i++) {
      const code = crypto.randomBytes(4).toString('hex').toUpperCase()
      codes.push(code)
    }
    return codes
  }

  private async generateQRCode(email: string, secret: string): Promise<string> {
    const otpauthUrl = `otpauth://totp/${encodeURIComponent(this.issuer)}:${encodeURIComponent(email)}?secret=${secret}&issuer=${encodeURIComponent(this.issuer)}`
    return await qrcode.toDataURL(otpauthUrl)
  }

  private verifyToken(secret: string, token: string): boolean {
    // Simple TOTP verification (in production, use a proper library like 'otplib')
    const timeStep = Math.floor(Date.now() / 30000)
    
    // Check current time step and previous/next for clock drift tolerance
    for (let i = -1; i <= 1; i++) {
      const testToken = this.generateToken(secret, timeStep + i)
      if (testToken === token.replace(/\s/g, '')) {
        return true
      }
    }
    
    return false
  }

  private generateToken(secret: string, timeStep: number): string {
    // Simplified TOTP token generation
    const key = Buffer.from(secret, 'base64')
    const time = Buffer.alloc(8)
    time.writeUInt32BE(timeStep, 4)
    
    const hmac = crypto.createHmac('sha1', key)
    hmac.update(time)
    const hash = hmac.digest()
    
    const offset = hash[hash.length - 1] & 0xf
    const code = (hash.readUInt32BE(offset) & 0x7fffffff) % 1000000
    
    return code.toString().padStart(6, '0')
  }

  private async checkLockout(userId: string): Promise<{
    isLockedOut: boolean
    lockoutUntil?: Date
  }> {
    const result = await prisma.$queryRaw`
      SELECT failed_attempts, locked_until
      FROM user_two_factor_attempts 
      WHERE user_id = ${userId}
    ` as any[]

    if (result.length === 0) {
      return { isLockedOut: false }
    }

    const data = result[0]
    const lockedUntil = data.locked_until ? new Date(data.locked_until) : null

    if (lockedUntil && lockedUntil > new Date()) {
      return {
        isLockedOut: true,
        lockoutUntil: lockedUntil
      }
    }

    return { isLockedOut: false }
  }

  private async recordFailedAttempt(userId: string): Promise<{
    remainingAttempts: number
    lockoutUntil?: Date
  }> {
    // Get current attempts
    const result = await prisma.$queryRaw`
      SELECT failed_attempts
      FROM user_two_factor_attempts 
      WHERE user_id = ${userId}
    ` as any[]

    const currentAttempts = result.length > 0 ? result[0].failed_attempts : 0
    const newAttempts = currentAttempts + 1
    const remainingAttempts = Math.max(0, this.maxAttempts - newAttempts)

    let lockoutUntil: Date | undefined

    if (newAttempts >= this.maxAttempts) {
      lockoutUntil = new Date(Date.now() + this.lockoutDuration)
    }

    // Update or insert attempts record
    await prisma.$executeRaw`
      INSERT OR REPLACE INTO user_two_factor_attempts (
        user_id, failed_attempts, locked_until, updated_at
      ) VALUES (
        ${userId}, ${newAttempts}, 
        ${lockoutUntil ? lockoutUntil.toISOString() : null},
        datetime('now')
      )
    `

    return { remainingAttempts, lockoutUntil }
  }

  private async resetFailedAttempts(userId: string): Promise<void> {
    await prisma.$executeRaw`
      DELETE FROM user_two_factor_attempts WHERE user_id = ${userId}
    `
  }

  // Initialize database tables if they don't exist
  async initializeTables(): Promise<void> {
    try {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS user_two_factor (
          user_id TEXT PRIMARY KEY,
          secret TEXT NOT NULL,
          backup_codes TEXT NOT NULL,
          enabled BOOLEAN NOT NULL DEFAULT false,
          last_used DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `

      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS user_two_factor_attempts (
          user_id TEXT PRIMARY KEY,
          failed_attempts INTEGER NOT NULL DEFAULT 0,
          locked_until DATETIME,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `

      logger.info('Two-factor authentication tables initialized')
    } catch (error) {
      logger.error('Failed to initialize two-factor tables', error)
      throw error
    }
  }
}

export const twoFactorAuth = TwoFactorAuth.getInstance()

// Initialize tables on startup
twoFactorAuth.initializeTables().catch(error =>
  logger.error('Failed to initialize 2FA tables', error)
)