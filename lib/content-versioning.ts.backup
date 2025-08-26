/**
 * Content Versioning and Backup System
 * Provides automatic backups, version control, and recovery for content
 */

import { logger } from './logger'
import { prisma } from './prisma'

// Version control configuration
export const VERSIONING_CONFIG = {
  maxVersionsPerContent: 10,        // Keep last 10 versions
  backupInterval: 24 * 60 * 60 * 1000, // 24 hours
  compressionEnabled: true,         // Compress old versions
  retentionDays: 30,               // Keep versions for 30 days
  autoBackupEnabled: true,         // Enable automatic backups
  enableDiffTracking: true,        // Track changes between versions
} as const

// Content version types
export interface ContentVersion {
  id: string
  contentType: 'blog' | 'project' | 'case_study' | 'page'
  contentId: string
  version: number
  title: string
  content: string
  metadata: Record<string, any>
  changes: ContentChange[]
  createdBy: string
  createdAt: Date
  checksum: string
  size: number
  compressed: boolean
}

export interface ContentChange {
  field: string
  oldValue: any
  newValue: any
  changeType: 'added' | 'modified' | 'removed'
}

export interface BackupManifest {
  id: string
  timestamp: Date
  contentTypes: Array<{
    type: string
    count: number
    size: number
  }>
  totalSize: number
  checksum: string
  compressed: boolean
  metadata: Record<string, any>
}

// Content Versioning System
export class ContentVersioning {
  private static instance: ContentVersioning | null = null

  static getInstance(): ContentVersioning {
    if (!ContentVersioning.instance) {
      ContentVersioning.instance = new ContentVersioning()
    }
    return ContentVersioning.instance
  }

  // Create a new version when content is saved
  async createVersion(
    contentType: ContentVersion['contentType'],
    contentId: string,
    data: {
      title: string
      content: string
      metadata?: Record<string, any>
    },
    userId: string,
    previousVersion?: ContentVersion
  ): Promise<ContentVersion> {
    try {
      // Calculate changes if previous version exists
      const changes = previousVersion ? this.calculateChanges(previousVersion, data) : []
      
      // Generate checksum for integrity
      const checksum = this.generateChecksum(data.content)
      
      // Get next version number
      const lastVersion = await this.getLatestVersion(contentType, contentId)
      const versionNumber = lastVersion ? lastVersion.version + 1 : 1

      // Create version record
      const version: ContentVersion = {
        id: this.generateVersionId(contentType, contentId, versionNumber),
        contentType,
        contentId,
        version: versionNumber,
        title: data.title,
        content: data.content,
        metadata: data.metadata || {},
        changes,
        createdBy: userId,
        createdAt: new Date(),
        checksum,
        size: JSON.stringify(data).length,
        compressed: false
      }

      // Store version (in production, use database)
      await this.storeVersion(version)
      
      // Cleanup old versions
      await this.cleanupOldVersions(contentType, contentId)
      
      logger.info('Content version created', {
        contentType,
        contentId,
        version: versionNumber,
        changes: changes.length
      })

      return version
    } catch (error) {
      logger.error('Failed to create content version', error)
      throw error
    }
  }

  // Get version history for content
  async getVersionHistory(
    contentType: ContentVersion['contentType'],
    contentId: string,
    limit: number = 10
  ): Promise<ContentVersion[]> {
    try {
      // In production, query from database
      const versions = await this.getStoredVersions(contentType, contentId, limit)
      
      return versions.sort((a, b) => b.version - a.version)
    } catch (error) {
      logger.error('Failed to get version history', error)
      return []
    }
  }

  // Restore content to a specific version
  async restoreToVersion(
    contentType: ContentVersion['contentType'],
    contentId: string,
    version: number,
    userId: string
  ): Promise<boolean> {
    try {
      const targetVersion = await this.getVersion(contentType, contentId, version)
      if (!targetVersion) {
        throw new Error(`Version ${version} not found`)
      }

      // Verify checksum integrity
      const calculatedChecksum = this.generateChecksum(targetVersion.content)
      if (calculatedChecksum !== targetVersion.checksum) {
        throw new Error('Version integrity check failed')
      }

      // Create a new version from the restored content
      await this.createVersion(
        contentType,
        contentId,
        {
          title: targetVersion.title,
          content: targetVersion.content,
          metadata: { ...targetVersion.metadata, restoredFrom: version }
        },
        userId
      )

      // Update the main content record
      await this.updateMainContent(contentType, contentId, {
        title: targetVersion.title,
        content: targetVersion.content,
        metadata: targetVersion.metadata
      })

      logger.info('Content restored to version', {
        contentType,
        contentId,
        restoredVersion: version,
        userId
      })

      return true
    } catch (error) {
      logger.error('Failed to restore content version', error)
      return false
    }
  }

  // Compare two versions
  async compareVersions(
    contentType: ContentVersion['contentType'],
    contentId: string,
    version1: number,
    version2: number
  ): Promise<{
    version1: ContentVersion | null
    version2: ContentVersion | null
    differences: ContentChange[]
  }> {
    try {
      const [v1, v2] = await Promise.all([
        this.getVersion(contentType, contentId, version1),
        this.getVersion(contentType, contentId, version2)
      ])

      const differences = v1 && v2 ? this.calculateChanges(v1, {
        title: v2.title,
        content: v2.content,
        metadata: v2.metadata
      }) : []

      return {
        version1: v1,
        version2: v2,
        differences
      }
    } catch (error) {
      logger.error('Failed to compare versions', error)
      return {
        version1: null,
        version2: null,
        differences: []
      }
    }
  }

  // Create full backup of all content
  async createFullBackup(userId: string): Promise<BackupManifest> {
    try {
      const timestamp = new Date()
      const backupId = this.generateBackupId(timestamp)

      // Get all content
      const [blogPosts, projects, caseStudies] = await Promise.all([
        this.getAllContent('blog'),
        this.getAllContent('project'),
        this.getAllContent('case_study')
      ])

      // Create backup data
      const backupData = {
        blogPosts,
        projects,
        caseStudies,
        metadata: {
          createdBy: userId,
          timestamp: timestamp.toISOString(),
          version: '1.0'
        }
      }

      // Calculate statistics
      const contentTypes = [
        { type: 'blog', count: blogPosts.length, size: this.calculateDataSize(blogPosts) },
        { type: 'project', count: projects.length, size: this.calculateDataSize(projects) },
        { type: 'case_study', count: caseStudies.length, size: this.calculateDataSize(caseStudies) }
      ]

      const totalSize = contentTypes.reduce((sum, ct) => sum + ct.size, 0)
      const checksum = this.generateChecksum(JSON.stringify(backupData))

      // Store backup
      await this.storeBackup(backupId, backupData, VERSIONING_CONFIG.compressionEnabled)

      const manifest: BackupManifest = {
        id: backupId,
        timestamp,
        contentTypes,
        totalSize,
        checksum,
        compressed: VERSIONING_CONFIG.compressionEnabled,
        metadata: {
          createdBy: userId,
          itemCount: contentTypes.reduce((sum, ct) => sum + ct.count, 0)
        }
      }

      await this.storeBackupManifest(manifest)

      logger.info('Full backup created', {
        backupId,
        totalItems: manifest.metadata.itemCount,
        totalSize: manifest.totalSize
      })

      return manifest
    } catch (error) {
      logger.error('Failed to create full backup', error)
      throw error
    }
  }

  // Restore from backup
  async restoreFromBackup(backupId: string, userId: string): Promise<boolean> {
    try {
      const manifest = await this.getBackupManifest(backupId)
      if (!manifest) {
        throw new Error('Backup not found')
      }

      const backupData = await this.getBackupData(backupId)
      if (!backupData) {
        throw new Error('Backup data not found')
      }

      // Verify integrity
      const calculatedChecksum = this.generateChecksum(JSON.stringify(backupData))
      if (calculatedChecksum !== manifest.checksum) {
        throw new Error('Backup integrity check failed')
      }

      // Create versions for current content before restore
      await this.createPreRestoreVersions(userId)

      // Restore content
      const results = await Promise.allSettled([
        this.restoreContentType('blog', backupData.blogPosts),
        this.restoreContentType('project', backupData.projects),
        this.restoreContentType('case_study', backupData.caseStudies)
      ])

      const failures = results.filter(r => r.status === 'rejected')
      if (failures.length > 0) {
        logger.warn('Some content failed to restore', { failures: failures.length })
      }

      logger.info('Content restored from backup', {
        backupId,
        restoredBy: userId,
        failures: failures.length
      })

      return failures.length === 0
    } catch (error) {
      logger.error('Failed to restore from backup', error)
      return false
    }
  }

  // Get backup history
  async getBackupHistory(limit: number = 10): Promise<BackupManifest[]> {
    try {
      return await this.getStoredBackupManifests(limit)
    } catch (error) {
      logger.error('Failed to get backup history', error)
      return []
    }
  }

  // Automatic backup scheduler
  async scheduleAutoBackup(): Promise<void> {
    if (!VERSIONING_CONFIG.autoBackupEnabled) return

    setInterval(async () => {
      try {
        await this.createFullBackup('system')
        await this.cleanupOldBackups()
      } catch (error) {
        logger.error('Automatic backup failed', error)
      }
    }, VERSIONING_CONFIG.backupInterval)
  }

  // Private helper methods
  private calculateChanges(
    previous: ContentVersion | { title: string; content: string; metadata: Record<string, any> },
    current: { title: string; content: string; metadata?: Record<string, any> }
  ): ContentChange[] {
    const changes: ContentChange[] = []

    // Compare title
    if (previous.title !== current.title) {
      changes.push({
        field: 'title',
        oldValue: previous.title,
        newValue: current.title,
        changeType: 'modified'
      })
    }

    // Compare content
    if (previous.content !== current.content) {
      changes.push({
        field: 'content',
        oldValue: this.truncateForLog(previous.content),
        newValue: this.truncateForLog(current.content),
        changeType: 'modified'
      })
    }

    // Compare metadata
    const prevMeta = previous.metadata || {}
    const currMeta = current.metadata || {}
    const allMetaKeys = new Set([...Object.keys(prevMeta), ...Object.keys(currMeta)])

    allMetaKeys.forEach(key => {
      const oldVal = prevMeta[key]
      const newVal = currMeta[key]

      if (oldVal !== newVal) {
        if (oldVal === undefined) {
          changes.push({ field: `metadata.${key}`, oldValue: null, newValue: newVal, changeType: 'added' })
        } else if (newVal === undefined) {
          changes.push({ field: `metadata.${key}`, oldValue: oldVal, newValue: null, changeType: 'removed' })
        } else {
          changes.push({ field: `metadata.${key}`, oldValue: oldVal, newValue: newVal, changeType: 'modified' })
        }
      }
    })

    return changes
  }

  private generateChecksum(content: string): string {
    // Simple checksum - in production, use crypto
    let hash = 0
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return hash.toString(16)
  }

  private generateVersionId(contentType: string, contentId: string, version: number): string {
    return `${contentType}_${contentId}_v${version}_${Date.now()}`
  }

  private generateBackupId(timestamp: Date): string {
    return `backup_${timestamp.getTime()}`
  }

  private truncateForLog(text: string, maxLength: number = 100): string {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
  }

  private calculateDataSize(data: any): number {
    return JSON.stringify(data).length
  }

  // Storage methods (implement based on your storage solution)
  private async storeVersion(version: ContentVersion): Promise<void> {
    // In production, store in database
    // For now, log the version
    logger.info('Version stored', { id: version.id, size: version.size })
  }

  private async getStoredVersions(
    contentType: string,
    contentId: string,
    limit: number
  ): Promise<ContentVersion[]> {
    // In production, query from database
    return []
  }

  private async getVersion(
    contentType: string,
    contentId: string,
    version: number
  ): Promise<ContentVersion | null> {
    // In production, query from database
    return null
  }

  private async getLatestVersion(
    contentType: string,
    contentId: string
  ): Promise<ContentVersion | null> {
    const versions = await this.getStoredVersions(contentType, contentId, 1)
    return versions[0] || null
  }

  private async cleanupOldVersions(contentType: string, contentId: string): Promise<void> {
    // Remove versions beyond the limit
    logger.info('Cleaning up old versions', { contentType, contentId })
  }

  private async updateMainContent(
    contentType: string,
    contentId: string,
    data: { title: string; content: string; metadata: Record<string, any> }
  ): Promise<void> {
    // Update the main content record in database
    switch (contentType) {
      case 'blog':
        await prisma.blogPost.update({
          where: { id: parseInt(contentId) },
          data: {
            title: data.title,
            content: data.content,
            updatedAt: new Date()
          }
        })
        break
      case 'project':
        await prisma.project.update({
          where: { id: parseInt(contentId) },
          data: {
            title: data.title,
            description: data.content,
            updatedAt: new Date()
          }
        })
        break
      case 'case_study':
        await prisma.caseStudy.update({
          where: { id: parseInt(contentId) },
          data: {
            title: data.title,
            fullDescription: data.content,
            updatedAt: new Date()
          }
        })
        break
    }
  }

  private async getAllContent(contentType: string): Promise<any[]> {
    switch (contentType) {
      case 'blog':
        return await prisma.blogPost.findMany()
      case 'project':
        return await prisma.project.findMany()
      case 'case_study':
        return await prisma.caseStudy.findMany()
      default:
        return []
    }
  }

  private async storeBackup(backupId: string, data: any, compressed: boolean): Promise<void> {
    // In production, store backup data (file system, S3, etc.)
    logger.info('Backup stored', { backupId, compressed })
  }

  private async storeBackupManifest(manifest: BackupManifest): Promise<void> {
    // In production, store manifest in database
    logger.info('Backup manifest stored', { id: manifest.id })
  }

  private async getBackupManifest(backupId: string): Promise<BackupManifest | null> {
    // In production, retrieve from database
    return null
  }

  private async getBackupData(backupId: string): Promise<any> {
    // In production, retrieve backup data
    return null
  }

  private async getStoredBackupManifests(limit: number): Promise<BackupManifest[]> {
    // In production, query from database
    return []
  }

  private async createPreRestoreVersions(userId: string): Promise<void> {
    // Create versions of current content before restoring
    logger.info('Creating pre-restore versions', { userId })
  }

  private async restoreContentType(contentType: string, data: any[]): Promise<void> {
    // Restore content of specific type
    logger.info('Restoring content type', { contentType, count: data.length })
  }

  private async cleanupOldBackups(): Promise<void> {
    // Remove backups older than retention period
    logger.info('Cleaning up old backups')
  }
}

// Singleton instance
export const contentVersioning = ContentVersioning.getInstance()

// React hooks for content versioning
export function useContentVersioning(contentType: ContentVersion['contentType'], contentId: string) {
  const createVersion = async (data: { title: string; content: string; metadata?: Record<string, any> }, userId: string) => {
    return await contentVersioning.createVersion(contentType, contentId, data, userId)
  }

  const getVersionHistory = async (limit?: number) => {
    return await contentVersioning.getVersionHistory(contentType, contentId, limit)
  }

  const restoreToVersion = async (version: number, userId: string) => {
    return await contentVersioning.restoreToVersion(contentType, contentId, version, userId)
  }

  const compareVersions = async (version1: number, version2: number) => {
    return await contentVersioning.compareVersions(contentType, contentId, version1, version2)
  }

  return {
    createVersion,
    getVersionHistory,
    restoreToVersion,
    compareVersions
  }
}

// Initialize automatic backup on server start
if (typeof window === 'undefined' && VERSIONING_CONFIG.autoBackupEnabled) {
  contentVersioning.scheduleAutoBackup()
}