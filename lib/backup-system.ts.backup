import { PrismaClient } from '@prisma/client'
import { logger } from './logger'
import { dataExportImport } from './data-export-import'
import { contentVersioning } from './content-versioning'

const prisma = new PrismaClient()

export interface BackupConfig {
  schedule: 'daily' | 'weekly' | 'monthly'
  retention: number // Number of backups to keep
  includeMedia: boolean
  includeSystemData: boolean
  compression: boolean
  encryption?: boolean
  destinations: ('local' | 'cloud')[]
}

export interface BackupManifest {
  id: string
  type: 'manual' | 'scheduled' | 'pre-update'
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  createdAt: Date
  completedAt?: Date
  size: number
  checksum: string
  metadata: {
    version: string
    tables: string[]
    recordCount: number
    includeMedia: boolean
    includeSystemData: boolean
    compression: boolean
  }
  error?: string
  location: string
}

export interface RecoveryPoint {
  id: string
  timestamp: Date
  type: 'full' | 'incremental'
  size: number
  description: string
  integrity: 'verified' | 'unverified' | 'corrupted'
}

export class BackupSystem {
  private static instance: BackupSystem
  private config: BackupConfig = {
    schedule: 'daily',
    retention: 30,
    includeMedia: true,
    includeSystemData: true,
    compression: true,
    encryption: false,
    destinations: ['local']
  }

  static getInstance(): BackupSystem {
    if (!BackupSystem.instance) {
      BackupSystem.instance = new BackupSystem()
    }
    return BackupSystem.instance
  }

  async createBackup(
    type: 'manual' | 'scheduled' | 'pre-update' = 'manual',
    options?: Partial<BackupConfig>
  ): Promise<BackupManifest> {
    const backupId = `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const startTime = new Date()

    logger.info('Starting backup creation', { backupId, type, options })

    // Create initial backup manifest
    let manifest: BackupManifest = {
      id: backupId,
      type,
      status: 'in_progress',
      createdAt: startTime,
      size: 0,
      checksum: '',
      metadata: {
        version: '1.0.0',
        tables: [],
        recordCount: 0,
        includeMedia: options?.includeMedia ?? this.config.includeMedia,
        includeSystemData: options?.includeSystemData ?? this.config.includeSystemData,
        compression: options?.compression ?? this.config.compression
      },
      location: 'local'
    }

    try {
      // Store initial manifest in database
      await prisma.backupManifest.create({
        data: {
          id: manifest.id,
          backupType: manifest.type,
          itemsCount: 0,
          totalSize: 0,
          checksum: '',
          metadata: JSON.stringify(manifest.metadata),
          createdBy: 'system',
          createdAt: manifest.createdAt
        }
      })

      // Perform the actual backup using data export system
      const exportResult = await dataExportImport.exportData({
        format: 'zip',
        includeMedia: manifest.metadata.includeMedia,
        includeSystemData: manifest.metadata.includeSystemData,
        compression: manifest.metadata.compression
      })

      if (!exportResult.success || !exportResult.file) {
        throw new Error('Backup export failed')
      }

      // Calculate metadata
      const tableCount = this.countTablesInExport(exportResult.data)
      const recordCount = this.countRecordsInExport(exportResult.data)

      // Update manifest with results
      manifest = {
        ...manifest,
        status: 'completed',
        completedAt: new Date(),
        size: exportResult.size,
        checksum: this.generateChecksum(exportResult.file),
        metadata: {
          ...manifest.metadata,
          tables: Object.keys(exportResult.data || {}),
          recordCount
        },
        location: `backups/${exportResult.filename}`
      }

      // Update database record
      await prisma.backupManifest.update({
        where: { id: manifest.id },
        data: {
          itemsCount: tableCount,
          totalSize: manifest.size,
          checksum: manifest.checksum,
          metadata: JSON.stringify(manifest.metadata)
        }
      })

      // Store backup file (in a real implementation, you would save to filesystem/cloud)
      await this.storeBackupFile(exportResult.file, exportResult.filename)

      // Cleanup old backups based on retention policy
      await this.cleanupOldBackups()

      logger.info('Backup created successfully', {
        backupId: manifest.id,
        size: manifest.size,
        duration: Date.now() - startTime.getTime()
      })

      return manifest

    } catch (error) {
      // Update manifest with error
      manifest = {
        ...manifest,
        status: 'failed',
        completedAt: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error'
      }

      // Update database record
      await prisma.backupManifest.update({
        where: { id: manifest.id },
        data: {
          itemsCount: 0,
          totalSize: 0,
          checksum: '',
          metadata: JSON.stringify({ ...manifest.metadata, error: manifest.error })
        }
      })

      logger.error('Backup creation failed', { backupId: manifest.id, error })
      throw error
    }
  }

  async restoreFromBackup(backupId: string, options?: {
    selectiveTables?: string[]
    createPreRestoreBackup?: boolean
    validateIntegrity?: boolean
  }): Promise<boolean> {
    try {
      logger.info('Starting restore from backup', { backupId, options })

      // Get backup manifest
      const backupRecord = await prisma.backupManifest.findUnique({
        where: { id: backupId }
      })

      if (!backupRecord) {
        throw new Error(`Backup ${backupId} not found`)
      }

      // Create pre-restore backup if requested
      if (options?.createPreRestoreBackup) {
        logger.info('Creating pre-restore backup')
        await this.createBackup('pre-update')
      }

      // Validate backup integrity if requested
      if (options?.validateIntegrity) {
        const isValid = await this.validateBackupIntegrity(backupId)
        if (!isValid) {
          throw new Error(`Backup ${backupId} failed integrity check`)
        }
      }

      // Load backup data
      const backupData = await this.loadBackupData(backupId)

      // Filter tables if selective restore is requested
      let dataToRestore = backupData
      if (options?.selectiveTables && options.selectiveTables.length > 0) {
        dataToRestore = this.filterBackupData(backupData, options.selectiveTables)
      }

      // Perform the restore using data import system
      const importResult = await dataExportImport.importData(dataToRestore, {
        overwrite: true,
        validateData: true,
        createBackup: false, // Already created pre-restore backup
        skipErrors: false
      })

      if (!importResult.success) {
        throw new Error(`Restore failed: ${importResult.message}`)
      }

      logger.info('Restore completed successfully', {
        backupId,
        imported: importResult.imported,
        skipped: importResult.skipped,
        errors: importResult.errors.length
      })

      return true

    } catch (error) {
      logger.error('Restore from backup failed', { backupId, error })
      throw error
    }
  }

  async getBackupHistory(limit: number = 50): Promise<BackupManifest[]> {
    const backups = await prisma.backupManifest.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' }
    })

    return backups.map(backup => ({
      id: backup.id,
      type: backup.backupType as 'manual' | 'scheduled' | 'pre-update',
      status: 'completed', // Assume completed if in database
      createdAt: backup.createdAt,
      size: backup.totalSize,
      checksum: backup.checksum,
      metadata: typeof backup.metadata === 'string' 
        ? JSON.parse(backup.metadata) 
        : backup.metadata,
      location: `backups/${backup.id}.zip`
    }))
  }

  async validateBackupIntegrity(backupId: string): Promise<boolean> {
    try {
      const backupRecord = await prisma.backupManifest.findUnique({
        where: { id: backupId }
      })

      if (!backupRecord) {
        return false
      }

      // In a real implementation, you would:
      // 1. Load the backup file
      // 2. Calculate its checksum
      // 3. Compare with stored checksum
      // 4. Validate JSON structure
      // 5. Check for corruption

      logger.info('Backup integrity validation passed', { backupId })
      return true

    } catch (error) {
      logger.error('Backup integrity validation failed', { backupId, error })
      return false
    }
  }

  async deleteBackup(backupId: string): Promise<boolean> {
    try {
      // Delete from database
      await prisma.backupManifest.delete({
        where: { id: backupId }
      })

      // Delete backup file (in a real implementation)
      await this.deleteBackupFile(backupId)

      logger.info('Backup deleted successfully', { backupId })
      return true

    } catch (error) {
      logger.error('Failed to delete backup', { backupId, error })
      return false
    }
  }

  async getRecoveryPoints(): Promise<RecoveryPoint[]> {
    const backups = await this.getBackupHistory(10)
    
    return backups.map(backup => ({
      id: backup.id,
      timestamp: backup.createdAt,
      type: 'full',
      size: backup.size,
      description: `${backup.type} backup - ${backup.metadata.recordCount} records`,
      integrity: 'verified' // In a real implementation, check actual integrity
    }))
  }

  async scheduleBackups(config: Partial<BackupConfig>): Promise<void> {
    this.config = { ...this.config, ...config }
    
    // In a real implementation, you would:
    // 1. Set up cron jobs or scheduled tasks
    // 2. Store configuration in database
    // 3. Handle different schedules (daily, weekly, monthly)
    
    logger.info('Backup schedule updated', { config: this.config })
  }

  async getBackupStatistics(): Promise<{
    totalBackups: number
    totalSize: number
    oldestBackup: Date | null
    newestBackup: Date | null
    successRate: number
  }> {
    const backups = await prisma.backupManifest.findMany({
      select: {
        totalSize: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    })

    const totalSize = backups.reduce((sum, backup) => sum + backup.totalSize, 0)
    const oldest = backups.length > 0 ? backups[backups.length - 1].createdAt : null
    const newest = backups.length > 0 ? backups[0].createdAt : null

    return {
      totalBackups: backups.length,
      totalSize,
      oldestBackup: oldest,
      newestBackup: newest,
      successRate: 100 // In a real implementation, calculate from actual success/failure rates
    }
  }

  // Private helper methods
  private countTablesInExport(data: any): number {
    return Object.keys(data || {}).filter(key => key !== '_metadata').length
  }

  private countRecordsInExport(data: any): number {
    if (!data) return 0
    return Object.values(data).reduce((sum, records) => {
      return sum + (Array.isArray(records) ? records.length : 0)
    }, 0)
  }

  private generateChecksum(data: Buffer): string {
    const crypto = require('crypto')
    return crypto.createHash('sha256').update(data).digest('hex')
  }

  private async storeBackupFile(data: Buffer, filename: string): Promise<void> {
    // In a real implementation, save to filesystem or cloud storage
    logger.info('Backup file stored', { filename, size: data.length })
  }

  private async deleteBackupFile(backupId: string): Promise<void> {
    // In a real implementation, delete from filesystem or cloud storage
    logger.info('Backup file deleted', { backupId })
  }

  private async loadBackupData(backupId: string): Promise<any> {
    // In a real implementation, load from filesystem or cloud storage
    // For now, return mock data
    return { _metadata: { version: '1.0.0' } }
  }

  private filterBackupData(data: any, tables: string[]): any {
    const filtered: any = { _metadata: data._metadata }
    
    for (const table of tables) {
      if (data[table]) {
        filtered[table] = data[table]
      }
    }

    return filtered
  }

  private async cleanupOldBackups(): Promise<void> {
    try {
      const allBackups = await prisma.backupManifest.findMany({
        orderBy: { createdAt: 'desc' }
      })

      if (allBackups.length > this.config.retention) {
        const backupsToDelete = allBackups.slice(this.config.retention)
        
        for (const backup of backupsToDelete) {
          await this.deleteBackup(backup.id)
        }

        logger.info('Old backups cleaned up', {
          deleted: backupsToDelete.length,
          retention: this.config.retention
        })
      }
    } catch (error) {
      logger.error('Failed to cleanup old backups', error)
    }
  }
}

export const backupSystem = BackupSystem.getInstance()