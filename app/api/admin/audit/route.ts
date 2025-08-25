import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/admin-middleware'
import { withErrorHandling } from '@/lib/error-handler'
import { auditLogger } from '@/lib/audit-logger'
import { logger } from '@/lib/logger'

async function handleAuditRequest(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')

  switch (request.method) {
    case 'GET':
      return await handleGetRequest(action, searchParams)
    default:
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'METHOD_NOT_ALLOWED',
            message: 'Method not allowed'
          }
        },
        { status: 405 }
      )
  }
}

async function handleGetRequest(action: string | null, searchParams: URLSearchParams): Promise<NextResponse> {
  switch (action) {
    case 'events':
      const filter = {
        action: searchParams.get('filterAction') || undefined,
        resource: searchParams.get('resource') || undefined,
        userId: searchParams.get('userId') || undefined,
        success: searchParams.get('success') ? searchParams.get('success') === 'true' : undefined,
        severity: searchParams.get('severity')?.split(',').filter(Boolean) || undefined,
        limit: parseInt(searchParams.get('limit') || '50'),
        offset: parseInt(searchParams.get('offset') || '0')
      }

      // Date range filtering
      const dateFrom = searchParams.get('dateFrom')
      const dateTo = searchParams.get('dateTo')
      if (dateFrom) filter.dateFrom = new Date(dateFrom)
      if (dateTo) filter.dateTo = new Date(dateTo)

      const events = await auditLogger.getAuditEvents(filter)
      
      logger.info('Audit events requested', {
        filter: Object.fromEntries(Object.entries(filter).filter(([_, v]) => v !== undefined)),
        resultCount: events.events.length
      })

      return NextResponse.json({
        success: true,
        data: events
      })

    case 'summary':
      const days = parseInt(searchParams.get('days') || '30')
      const summary = await auditLogger.getAuditSummary(days)
      
      return NextResponse.json({
        success: true,
        data: summary
      })

    case 'timeline':
      const timelineDays = parseInt(searchParams.get('days') || '7')
      const timeline = await auditLogger.getAuditTimeline(timelineDays)
      
      return NextResponse.json({
        success: true,
        data: timeline
      })

    case 'search':
      const query = searchParams.get('query')
      if (!query) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'MISSING_QUERY',
              message: 'Search query is required'
            }
          },
          { status: 400 }
        )
      }

      const searchLimit = parseInt(searchParams.get('limit') || '50')
      const searchResults = await auditLogger.searchAuditEvents(query, searchLimit)
      
      logger.info('Audit search performed', { query, resultCount: searchResults.length })
      
      return NextResponse.json({
        success: true,
        data: searchResults
      })

    case 'export':
      const exportFormat = (searchParams.get('format') as 'json' | 'csv') || 'json'
      
      const exportFilter = {
        action: searchParams.get('filterAction') || undefined,
        resource: searchParams.get('resource') || undefined,
        userId: searchParams.get('userId') || undefined,
        success: searchParams.get('success') ? searchParams.get('success') === 'true' : undefined,
        severity: searchParams.get('severity')?.split(',').filter(Boolean) || undefined
      }

      // Date range for export
      const exportDateFrom = searchParams.get('dateFrom')
      const exportDateTo = searchParams.get('dateTo')
      if (exportDateFrom) exportFilter.dateFrom = new Date(exportDateFrom)
      if (exportDateTo) exportFilter.dateTo = new Date(exportDateTo)

      const exportResult = await auditLogger.exportAuditEvents(exportFilter, exportFormat)
      
      logger.info('Audit export requested', {
        format: exportFormat,
        filter: Object.fromEntries(Object.entries(exportFilter).filter(([_, v]) => v !== undefined))
      })

      const contentType = exportFormat === 'csv' ? 'text/csv' : 'application/json'
      
      return new NextResponse(exportResult.data, {
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${exportResult.filename}"`
        }
      })

    case 'cleanup':
      const retentionDays = parseInt(searchParams.get('retentionDays') || '365')
      const deletedCount = await auditLogger.cleanupOldEvents(retentionDays)
      
      logger.info('Audit cleanup performed', { deletedCount, retentionDays })
      
      return NextResponse.json({
        success: true,
        data: {
          deletedCount,
          retentionDays,
          message: `Cleaned up ${deletedCount} old audit events`
        }
      })

    default:
      // Default: return recent activity summary
      const defaultSummary = await auditLogger.getAuditSummary(7)
      const recentEvents = await auditLogger.getAuditEvents({ limit: 10 })
      
      return NextResponse.json({
        success: true,
        data: {
          summary: defaultSummary,
          recentEvents: recentEvents.events,
          status: 'operational'
        }
      })
  }
}

export const GET = withAdminAuth(withErrorHandling(handleAuditRequest))