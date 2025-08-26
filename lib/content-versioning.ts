/**
 * Minimal content versioning stub
 */

export class ContentVersioning {
  async createVersion(contentType: string, contentId: string, data: any) {
    return null
  }

  async getVersionHistory(contentType: string, contentId: string) {
    return []
  }

  async restoreVersion(contentType: string, contentId: string, versionId: string) {
    return false
  }

  async getBackupHistory(limit: number) {
    return []
  }

  async createFullBackup(userId: string) {
    return {
      id: 'stub-backup-id',
      success: false,
      message: 'Backup system disabled for deployment'
    }
  }

  async restoreFromBackup(backupId: string, userId: string) {
    return false
  }
}

export const contentVersioning = new ContentVersioning()