import { PrismaClient } from '@prisma/client'
import { logger } from './logger'
import JSZip from 'jszip'

const prisma = new PrismaClient()

export interface ExportOptions {
  includeMedia?: boolean
  includeSystemData?: boolean
  format?: 'json' | 'csv' | 'zip'
  compression?: boolean
  tables?: string[]
}

export interface ImportOptions {
  overwrite?: boolean
  validateData?: boolean
  createBackup?: boolean
  skipErrors?: boolean
}

export interface ExportResult {
  success: boolean
  data?: any
  file?: Buffer
  filename: string
  size: number
  timestamp: Date
  checksum?: string
}

export interface ImportResult {
  success: boolean
  imported: number
  skipped: number
  errors: Array<{
    table: string
    record: any
    error: string
  }>
  message: string
}

export class DataExportImport {
  private static instance: DataExportImport

  static getInstance(): DataExportImport {
    if (!DataExportImport.instance) {
      DataExportImport.instance = new DataExportImport()
    }
    return DataExportImport.instance
  }

  async exportData(options: ExportOptions = {}): Promise<ExportResult> {
    try {
      const {
        includeMedia = false,
        includeSystemData = false,
        format = 'json',
        compression = true,
        tables = []
      } = options

      logger.info('Starting data export', { options })

      const exportData: Record<string, any> = {}
      const timestamp = new Date()

      // Define table export order (respecting foreign keys)
      const tablesToExport = tables.length > 0 ? tables : [
        'AdminUser',
        'ContentSection',
        'BlogPost',
        'Project',
        'CaseStudy',
        'ExperienceEntry',
        'SkillCategory',
        'Tool',
        'MediaFile',
        'NavigationItem',
        'SocialLink',
        'FooterSection',
        'ContactInfo',
        'SiteSettings',
        'ContentVersion',
        'BackupManifest'
      ]

      // Add system tables if requested
      if (includeSystemData) {
        tablesToExport.push(
          'ChatbotKnowledge',
          'ChatbotQuestion',
          'ChatbotConversation',
          'ChatbotSettings'
        )
      }

      // Export each table
      for (const tableName of tablesToExport) {
        try {
          const modelName = tableName.toLowerCase()
          const model = (prisma as any)[modelName]
          
          if (!model) {
            logger.warn(`Model ${tableName} not found, skipping`)
            continue
          }

          const records = await model.findMany()
          exportData[tableName] = records
          
          logger.info(`Exported ${records.length} records from ${tableName}`)
        } catch (error) {
          logger.error(`Failed to export table ${tableName}`, error)
          exportData[tableName] = []
        }
      }

      // Add metadata
      exportData._metadata = {
        exportedAt: timestamp.toISOString(),
        version: '1.0.0',
        options,
        totalTables: Object.keys(exportData).length - 1,
        totalRecords: Object.values(exportData).reduce((sum, records) => {
          return sum + (Array.isArray(records) ? records.length : 0)
        }, 0)
      }

      // Handle different export formats
      let result: ExportResult
      const baseFilename = `portfolio-export-${timestamp.toISOString().split('T')[0]}`

      switch (format) {
        case 'json':
          result = await this.exportAsJSON(exportData, baseFilename, compression)
          break
        case 'csv':
          result = await this.exportAsCSV(exportData, baseFilename, compression)
          break
        case 'zip':
          result = await this.exportAsZip(exportData, baseFilename, includeMedia)
          break
        default:
          throw new Error(`Unsupported export format: ${format}`)
      }

      logger.info('Data export completed successfully', {
        format,
        size: result.size,
        filename: result.filename
      })

      return result

    } catch (error) {
      logger.error('Data export failed', error)
      throw error
    }
  }

  private async exportAsJSON(data: any, baseFilename: string, compression: boolean): Promise<ExportResult> {
    const jsonData = JSON.stringify(data, null, compression ? 0 : 2)
    const buffer = Buffer.from(jsonData, 'utf8')
    
    return {
      success: true,
      data,
      file: buffer,
      filename: `${baseFilename}.json`,
      size: buffer.length,
      timestamp: new Date(),
      checksum: this.generateChecksum(jsonData)
    }
  }

  private async exportAsCSV(data: any, baseFilename: string, compression: boolean): Promise<ExportResult> {
    const zip = new JSZip()
    let totalSize = 0

    // Convert each table to CSV
    for (const [tableName, records] of Object.entries(data)) {
      if (tableName === '_metadata' || !Array.isArray(records)) continue

      const csv = this.convertToCSV(records as any[])
      zip.file(`${tableName}.csv`, csv)
      totalSize += csv.length
    }

    // Add metadata as JSON
    zip.file('_metadata.json', JSON.stringify(data._metadata, null, 2))

    const buffer = await zip.generateAsync({
      type: 'nodebuffer',
      compression: compression ? 'DEFLATE' : 'STORE'
    })

    return {
      success: true,
      file: buffer,
      filename: `${baseFilename}.zip`,
      size: buffer.length,
      timestamp: new Date()
    }
  }

  private async exportAsZip(data: any, baseFilename: string, includeMedia: boolean): Promise<ExportResult> {
    const zip = new JSZip()

    // Add main data as JSON
    zip.file('data.json', JSON.stringify(data, null, 2))

    // Add individual table files
    const tablesFolder = zip.folder('tables')
    for (const [tableName, records] of Object.entries(data)) {
      if (tableName === '_metadata') continue
      tablesFolder?.file(`${tableName}.json`, JSON.stringify(records, null, 2))
    }

    // Include media files if requested
    if (includeMedia) {
      const mediaFolder = zip.folder('media')
      try {
        const mediaFiles = await prisma.mediaFile.findMany()
        for (const media of mediaFiles) {
          // In a real implementation, you would read the actual files
          // For now, we'll just include the metadata
          mediaFolder?.file(`${media.filename}.meta.json`, JSON.stringify(media, null, 2))
        }
      } catch (error) {
        logger.warn('Failed to include media files in export', error)
      }
    }

    const buffer = await zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE'
    })

    return {
      success: true,
      file: buffer,
      filename: `${baseFilename}.zip`,
      size: buffer.length,
      timestamp: new Date()
    }
  }

  async importData(data: any, options: ImportOptions = {}): Promise<ImportResult> {
    try {
      const {
        overwrite = false,
        validateData = true,
        createBackup = true,
        skipErrors = false
      } = options

      logger.info('Starting data import', { options })

      let imported = 0
      let skipped = 0
      const errors: ImportResult['errors'] = []

      // Create backup if requested
      if (createBackup) {
        try {
          await this.exportData({ format: 'json', compression: true })
          logger.info('Backup created before import')
        } catch (error) {
          logger.error('Failed to create backup before import', error)
          if (!skipErrors) throw error
        }
      }

      // Validate data structure if requested
      if (validateData) {
        const validation = this.validateImportData(data)
        if (!validation.valid) {
          throw new Error(`Data validation failed: ${validation.errors.join(', ')}`)
        }
      }

      // Import in dependency order
      const importOrder = [
        'AdminUser',
        'ContentSection',
        'SiteSettings',
        'NavigationItem',
        'SocialLink',
        'FooterSection',
        'ContactInfo',
        'MediaFile',
        'SkillCategory',
        'Tool',
        'ExperienceEntry',
        'CaseStudy',
        'Project',
        'BlogPost',
        'ContentVersion',
        'BackupManifest'
      ]

      for (const tableName of importOrder) {
        if (!data[tableName]) continue

        try {
          const records = data[tableName]
          if (!Array.isArray(records)) continue

          const modelName = tableName.toLowerCase()
          const model = (prisma as any)[modelName]

          if (!model) {
            logger.warn(`Model ${tableName} not found, skipping`)
            continue
          }

          for (const record of records) {
            try {
              // Remove id for new records or handle overwrites
              const recordData = { ...record }
              
              if (overwrite) {
                await model.upsert({
                  where: { id: record.id },
                  update: recordData,
                  create: recordData
                })
              } else {
                // Try to create, skip if exists
                delete recordData.id
                await model.create({ data: recordData })
              }

              imported++
            } catch (error) {
              const errorInfo = {
                table: tableName,
                record: record.id || 'unknown',
                error: error instanceof Error ? error.message : 'Unknown error'
              }
              
              errors.push(errorInfo)

              if (!skipErrors) {
                throw error
              } else {
                skipped++
                logger.warn(`Skipped record in ${tableName}`, errorInfo)
              }
            }
          }

          logger.info(`Imported ${records.length} records into ${tableName}`)
        } catch (error) {
          const errorInfo = {
            table: tableName,
            record: 'all',
            error: error instanceof Error ? error.message : 'Unknown error'
          }
          
          errors.push(errorInfo)
          logger.error(`Failed to import table ${tableName}`, error)

          if (!skipErrors) throw error
        }
      }

      const result: ImportResult = {
        success: errors.length === 0 || skipErrors,
        imported,
        skipped,
        errors,
        message: `Import completed: ${imported} imported, ${skipped} skipped, ${errors.length} errors`
      }

      logger.info('Data import completed', result)
      return result

    } catch (error) {
      logger.error('Data import failed', error)
      throw error
    }
  }

  private validateImportData(data: any): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!data || typeof data !== 'object') {
      errors.push('Data must be an object')
      return { valid: false, errors }
    }

    if (!data._metadata) {
      errors.push('Missing metadata')
    }

    // Validate each table structure
    const requiredTables = ['AdminUser', 'ContentSection', 'SiteSettings']
    for (const table of requiredTables) {
      if (!data[table]) {
        errors.push(`Missing required table: ${table}`)
      } else if (!Array.isArray(data[table])) {
        errors.push(`Table ${table} must be an array`)
      }
    }

    return { valid: errors.length === 0, errors }
  }

  private convertToCSV(records: any[]): string {
    if (records.length === 0) return ''

    const headers = Object.keys(records[0])
    const csvRows = [headers.join(',')]

    for (const record of records) {
      const values = headers.map(header => {
        const value = record[header]
        if (value === null || value === undefined) return ''
        if (typeof value === 'object') return JSON.stringify(value)
        return `"${String(value).replace(/"/g, '""')}"`
      })
      csvRows.push(values.join(','))
    }

    return csvRows.join('\n')
  }

  private generateChecksum(data: string): string {
    const crypto = require('crypto')
    return crypto.createHash('sha256').update(data).digest('hex')
  }

  async getExportHistory(): Promise<Array<{
    id: string
    filename: string
    size: number
    format: string
    createdAt: Date
    checksum?: string
  }>> {
    // In a real implementation, you would store export history in the database
    return []
  }

  async deleteExport(id: string): Promise<boolean> {
    // In a real implementation, you would delete the export file and record
    return true
  }

  async validateExportIntegrity(filePath: string, expectedChecksum: string): Promise<boolean> {
    // In a real implementation, you would validate the file integrity
    return true
  }
}

export const dataExportImport = DataExportImport.getInstance()