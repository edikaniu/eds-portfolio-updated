import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/admin-middleware'
import { withErrorHandling } from '@/lib/error-handler'
import { dataExportImport } from '@/lib/data-export-import'
import { logger } from '@/lib/logger'

async function handleImportRequest(request: NextRequest): Promise<NextResponse> {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const options = {
      overwrite: formData.get('overwrite') === 'true',
      validateData: formData.get('validateData') !== 'false',
      createBackup: formData.get('createBackup') !== 'false',
      skipErrors: formData.get('skipErrors') === 'true'
    }

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_FILE',
            message: 'No file provided for import'
          }
        },
        { status: 400 }
      )
    }

    logger.info('Data import requested', {
      filename: file.name,
      size: file.size,
      type: file.type,
      options
    })

    // Read and parse the file
    const fileBuffer = Buffer.from(await file.arrayBuffer())
    let importData: any

    try {
      if (file.name.endsWith('.json')) {
        const jsonContent = fileBuffer.toString('utf8')
        importData = JSON.parse(jsonContent)
      } else if (file.name.endsWith('.zip')) {
        // Handle ZIP files
        const JSZip = (await import('jszip')).default
        const zip = new JSZip()
        const zipContent = await zip.loadAsync(fileBuffer)
        
        // Look for data.json in the zip
        const dataFile = zipContent.files['data.json']
        if (dataFile) {
          const jsonContent = await dataFile.async('string')
          importData = JSON.parse(jsonContent)
        } else {
          throw new Error('No data.json found in ZIP file')
        }
      } else {
        throw new Error('Unsupported file format. Please upload JSON or ZIP files.')
      }
    } catch (parseError) {
      logger.error('Failed to parse import file', parseError)
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'PARSE_ERROR',
            message: parseError instanceof Error ? parseError.message : 'Failed to parse import file'
          }
        },
        { status: 400 }
      )
    }

    // Validate file size (max 100MB)
    const maxSize = 100 * 1024 * 1024 // 100MB
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FILE_TOO_LARGE',
            message: `File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`
          }
        },
        { status: 400 }
      )
    }

    // Perform the import
    const result = await dataExportImport.importData(importData, options)

    logger.info('Data import completed', {
      filename: file.name,
      imported: result.imported,
      skipped: result.skipped,
      errors: result.errors.length,
      success: result.success
    })

    return NextResponse.json({
      success: true,
      data: result,
      message: result.message
    })

  } catch (error) {
    logger.error('Data import failed', error)
    throw error
  }
}

export const POST = withAdminAuth(withErrorHandling(handleImportRequest))