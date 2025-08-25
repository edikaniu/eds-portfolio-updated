import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/admin-middleware'
import { contentVersioning } from '@/lib/content-versioning'
import { logger } from '@/lib/logger'

// Get version history for content
export const GET = withAdminAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const contentType = searchParams.get('contentType') as any
    const contentId = searchParams.get('contentId')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!contentType || !contentId) {
      return NextResponse.json(
        { success: false, message: 'contentType and contentId are required' },
        { status: 400 }
      )
    }

    const versions = await contentVersioning.getVersionHistory(contentType, contentId, limit)

    return NextResponse.json({
      success: true,
      data: versions
    })

  } catch (error) {
    logger.error('Failed to get version history', error)
    return NextResponse.json(
      { success: false, message: 'Failed to get version history' },
      { status: 500 }
    )
  }
})

// Create a new version
export const POST = withAdminAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { contentType, contentId, title, content, metadata, userId } = body

    if (!contentType || !contentId || !title || !content || !userId) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get previous version for change tracking
    const previousVersion = await contentVersioning.getVersionHistory(contentType, contentId, 1)
    const prevVersion = previousVersion[0] || undefined

    const version = await contentVersioning.createVersion(
      contentType,
      contentId,
      { title, content, metadata },
      userId,
      prevVersion
    )

    return NextResponse.json({
      success: true,
      data: version,
      message: 'Version created successfully'
    })

  } catch (error) {
    logger.error('Failed to create version', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create version' },
      { status: 500 }
    )
  }
})

// Restore to a specific version
export const PUT = withAdminAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { contentType, contentId, version, userId } = body

    if (!contentType || !contentId || !version || !userId) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    const success = await contentVersioning.restoreToVersion(contentType, contentId, version, userId)

    if (success) {
      return NextResponse.json({
        success: true,
        message: `Content restored to version ${version}`
      })
    } else {
      return NextResponse.json(
        { success: false, message: 'Failed to restore content' },
        { status: 500 }
      )
    }

  } catch (error) {
    logger.error('Failed to restore version', error)
    return NextResponse.json(
      { success: false, message: 'Failed to restore version' },
      { status: 500 }
    )
  }
})