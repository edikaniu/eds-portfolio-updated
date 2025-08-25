import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/admin-middleware'
import { contentVersioning } from '@/lib/content-versioning'
import { logger } from '@/lib/logger'

// Compare two versions
export const GET = withAdminAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const contentType = searchParams.get('contentType') as any
    const contentId = searchParams.get('contentId')
    const version1 = parseInt(searchParams.get('version1') || '0')
    const version2 = parseInt(searchParams.get('version2') || '0')

    if (!contentType || !contentId || !version1 || !version2) {
      return NextResponse.json(
        { success: false, message: 'contentType, contentId, version1, and version2 are required' },
        { status: 400 }
      )
    }

    const comparison = await contentVersioning.compareVersions(contentType, contentId, version1, version2)

    return NextResponse.json({
      success: true,
      data: comparison
    })

  } catch (error) {
    logger.error('Failed to compare versions', error)
    return NextResponse.json(
      { success: false, message: 'Failed to compare versions' },
      { status: 500 }
    )
  }
})