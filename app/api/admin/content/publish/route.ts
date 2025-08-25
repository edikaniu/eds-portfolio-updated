import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/admin-middleware'
import { contentScheduler } from '@/lib/content-scheduler'
import { logger } from '@/lib/logger'

export const POST = withAdminAuth(async (request: NextRequest) => {
  try {
    const results = await contentScheduler.publishScheduledPosts()

    return NextResponse.json({
      success: true,
      data: results,
      message: `Published ${results.published} posts${results.failed.length > 0 ? `, failed: ${results.failed.length}` : ''}`
    })

  } catch (error) {
    logger.error('Failed to publish scheduled posts', error)
    return NextResponse.json(
      { success: false, message: 'Failed to publish scheduled posts' },
      { status: 500 }
    )
  }
})

export const GET = withAdminAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const postId = searchParams.get('postId')

    if (!postId) {
      return NextResponse.json(
        { success: false, message: 'postId is required' },
        { status: 400 }
      )
    }

    const analytics = await contentScheduler.getPostAnalytics(postId)

    if (!analytics) {
      return NextResponse.json(
        { success: false, message: 'Post not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: analytics
    })

  } catch (error) {
    logger.error('Failed to get post analytics', error)
    return NextResponse.json(
      { success: false, message: 'Failed to get post analytics' },
      { status: 500 }
    )
  }
})