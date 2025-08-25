import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/admin-middleware'
import { contentScheduler } from '@/lib/content-scheduler'
import { logger } from '@/lib/logger'

export const GET = withAdminAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')

    const scheduledPosts = await contentScheduler.getScheduledPosts(limit)

    return NextResponse.json({
      success: true,
      data: scheduledPosts
    })

  } catch (error) {
    logger.error('Failed to get scheduled posts', error)
    return NextResponse.json(
      { success: false, message: 'Failed to get scheduled posts' },
      { status: 500 }
    )
  }
})

export const POST = withAdminAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { 
      title, 
      content, 
      excerpt, 
      tags, 
      imageUrl, 
      author, 
      publishAt, 
      autoPublish, 
      notifyOnPublish, 
      socialMediaShare 
    } = body

    if (!title || !content || !publishAt) {
      return NextResponse.json(
        { success: false, message: 'title, content, and publishAt are required' },
        { status: 400 }
      )
    }

    const publishDate = new Date(publishAt)
    if (publishDate <= new Date()) {
      return NextResponse.json(
        { success: false, message: 'publishAt must be in the future' },
        { status: 400 }
      )
    }

    const postData = {
      title,
      content,
      excerpt: excerpt || content.substring(0, 200) + '...',
      tags: tags || [],
      imageUrl,
      author,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    }

    const scheduleOptions = {
      publishAt: publishDate,
      autoPublish: autoPublish !== false,
      notifyOnPublish: notifyOnPublish === true,
      socialMediaShare: socialMediaShare === true
    }

    const scheduledPost = await contentScheduler.schedulePost(postData, scheduleOptions)

    return NextResponse.json({
      success: true,
      data: scheduledPost,
      message: 'Post scheduled successfully'
    })

  } catch (error) {
    logger.error('Failed to schedule post', error)
    return NextResponse.json(
      { success: false, message: 'Failed to schedule post' },
      { status: 500 }
    )
  }
})

export const PUT = withAdminAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { postId, action, ...updates } = body

    if (!postId) {
      return NextResponse.json(
        { success: false, message: 'postId is required' },
        { status: 400 }
      )
    }

    let result
    let message

    switch (action) {
      case 'update':
        result = await contentScheduler.updateScheduledPost(postId, updates)
        message = 'Scheduled post updated successfully'
        break
      
      case 'cancel':
        result = await contentScheduler.cancelScheduledPost(postId)
        message = result ? 'Scheduled post cancelled successfully' : 'Failed to cancel scheduled post'
        break
      
      case 'publish_now':
        result = await contentScheduler.publishNow(postId)
        message = result ? 'Post published immediately' : 'Failed to publish post'
        break
      
      default:
        return NextResponse.json(
          { success: false, message: 'Invalid action. Use update, cancel, or publish_now' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: !!result,
      data: result,
      message
    })

  } catch (error) {
    logger.error('Failed to update scheduled post', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update scheduled post' },
      { status: 500 }
    )
  }
})