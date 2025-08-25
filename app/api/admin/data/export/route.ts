import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/admin-middleware'
import { withErrorHandling } from '@/lib/error-handler'
import { dataExportImport } from '@/lib/data-export-import'
import { logger } from '@/lib/logger'

async function handleExportRequest(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url)
  
  const format = (searchParams.get('format') as 'json' | 'csv' | 'zip') || 'json'
  const includeMedia = searchParams.get('includeMedia') === 'true'
  const includeSystemData = searchParams.get('includeSystemData') === 'true'
  const compression = searchParams.get('compression') !== 'false'
  const tables = searchParams.get('tables')?.split(',').filter(Boolean) || []

  try {
    logger.info('Data export requested', {
      format,
      includeMedia,
      includeSystemData,
      compression,
      tables: tables.length > 0 ? tables : 'all'
    })

    const result = await dataExportImport.exportData({
      format,
      includeMedia,
      includeSystemData,
      compression,
      tables: tables.length > 0 ? tables : undefined
    })

    if (!result.success || !result.file) {
      throw new Error('Export failed')
    }

    // Set appropriate headers for file download
    const headers = new Headers({
      'Content-Type': getContentType(format),
      'Content-Disposition': `attachment; filename="${result.filename}"`,
      'Content-Length': result.size.toString(),
      'X-Export-Timestamp': result.timestamp.toISOString(),
      'X-Export-Size': result.size.toString()
    })

    if (result.checksum) {
      headers.set('X-Export-Checksum', result.checksum)
    }

    logger.info('Data export completed successfully', {
      filename: result.filename,
      size: result.size,
      format
    })

    return new NextResponse(result.file, { headers })

  } catch (error) {
    logger.error('Data export failed', error)
    throw error
  }
}

function getContentType(format: string): string {
  switch (format) {
    case 'json':
      return 'application/json'
    case 'csv':
      return 'application/zip'
    case 'zip':
      return 'application/zip'
    default:
      return 'application/octet-stream'
  }
}

export const GET = withAdminAuth(withErrorHandling(handleExportRequest))