/**
 * Minimal two-factor auth stub
 */

export class TwoFactorAuth {
  static async generateSecret(userId: string) {
    return {
      secret: 'stub-secret',
      qrCode: 'stub-qr-code',
      backupCodes: []
    }
  }

  static async verifyToken(userId: string, token: string) {
    return false
  }

  static async enableTwoFactor(userId: string, secret: string) {
    return true
  }

  static async disableTwoFactor(userId: string) {
    return true
  }
}

export const twoFactorAuth = new TwoFactorAuth()