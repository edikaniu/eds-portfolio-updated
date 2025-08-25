import { PrismaClient, BlogPost } from '@prisma/client'
import { logger } from './logger'

const prisma = new PrismaClient()

export interface ScheduledPost {
  id: string
  title: string
  content: string
  excerpt: string
  publishedAt: Date
  isScheduled: boolean
  tags: string[]
  imageUrl?: string
  author?: string
  createdAt: Date
  updatedAt: Date
}

export interface ScheduleOptions {
  publishAt: Date
  autoPublish?: boolean
  notifyOnPublish?: boolean
  socialMediaShare?: boolean
}

export class ContentScheduler {
  async schedulePost(
    postData: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt' | 'published'>,
    scheduleOptions: ScheduleOptions
  ): Promise<ScheduledPost> {
    try {
      const scheduledPost = await prisma.blogPost.create({
        data: {
          ...postData,
          published: false,
          publishedAt: scheduleOptions.publishAt,
          metadata: {
            scheduled: true,
            autoPublish: scheduleOptions.autoPublish ?? true,
            notifyOnPublish: scheduleOptions.notifyOnPublish ?? false,
            socialMediaShare: scheduleOptions.socialMediaShare ?? false,
            scheduledAt: new Date().toISOString()
          }
        }
      })

      logger.info('Post scheduled successfully', {
        postId: scheduledPost.id,
        publishAt: scheduleOptions.publishAt
      })

      return {
        id: scheduledPost.id,
        title: scheduledPost.title,
        content: scheduledPost.content,
        excerpt: scheduledPost.excerpt || '',
        publishedAt: scheduledPost.publishedAt || new Date(),
        isScheduled: true,
        tags: Array.isArray(scheduledPost.tags) ? scheduledPost.tags : [],
        imageUrl: scheduledPost.imageUrl || undefined,
        author: scheduledPost.author || undefined,
        createdAt: scheduledPost.createdAt,
        updatedAt: scheduledPost.updatedAt
      }
    } catch (error) {
      logger.error('Failed to schedule post', error)
      throw error
    }
  }

  async getScheduledPosts(limit: number = 20): Promise<ScheduledPost[]> {
    try {
      const posts = await prisma.blogPost.findMany({
        where: {
          published: false,
          publishedAt: {
            not: null
          }
        },
        orderBy: {
          publishedAt: 'asc'
        },
        take: limit
      })

      return posts.map(post => ({
        id: post.id,
        title: post.title,
        content: post.content,
        excerpt: post.excerpt || '',
        publishedAt: post.publishedAt || new Date(),
        isScheduled: true,
        tags: Array.isArray(post.tags) ? post.tags : [],
        imageUrl: post.imageUrl || undefined,
        author: post.author || undefined,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt
      }))
    } catch (error) {
      logger.error('Failed to get scheduled posts', error)
      throw error
    }
  }

  async publishScheduledPosts(): Promise<{ published: number; failed: string[] }> {
    try {
      const now = new Date()
      const postsToPublish = await prisma.blogPost.findMany({
        where: {
          published: false,
          publishedAt: {
            lte: now
          }
        }
      })

      const results = { published: 0, failed: [] as string[] }

      for (const post of postsToPublish) {
        try {
          await prisma.blogPost.update({
            where: { id: post.id },
            data: {
              published: true,
              publishedAt: now,
              metadata: {
                ...post.metadata,
                actualPublishedAt: now.toISOString(),
                autoPublished: true
              }
            }
          })

          results.published++

          logger.info('Auto-published scheduled post', {
            postId: post.id,
            title: post.title
          })

          if (post.metadata?.notifyOnPublish) {
            await this.notifyPostPublished(post)
          }

        } catch (error) {
          results.failed.push(post.id)
          logger.error('Failed to publish scheduled post', {
            postId: post.id,
            error
          })
        }
      }

      return results
    } catch (error) {
      logger.error('Failed to publish scheduled posts', error)
      throw error
    }
  }

  async updateScheduledPost(
    postId: string,
    updates: Partial<Pick<BlogPost, 'title' | 'content' | 'excerpt' | 'tags' | 'imageUrl'>> & {
      publishAt?: Date
    }
  ): Promise<ScheduledPost> {
    try {
      const { publishAt, ...postUpdates } = updates
      
      const updatedPost = await prisma.blogPost.update({
        where: {
          id: postId,
          published: false
        },
        data: {
          ...postUpdates,
          ...(publishAt && { publishedAt: publishAt }),
          updatedAt: new Date()
        }
      })

      return {
        id: updatedPost.id,
        title: updatedPost.title,
        content: updatedPost.content,
        excerpt: updatedPost.excerpt || '',
        publishedAt: updatedPost.publishedAt || new Date(),
        isScheduled: true,
        tags: Array.isArray(updatedPost.tags) ? updatedPost.tags : [],
        imageUrl: updatedPost.imageUrl || undefined,
        author: updatedPost.author || undefined,
        createdAt: updatedPost.createdAt,
        updatedAt: updatedPost.updatedAt
      }
    } catch (error) {
      logger.error('Failed to update scheduled post', error)
      throw error
    }
  }

  async cancelScheduledPost(postId: string): Promise<boolean> {
    try {
      await prisma.blogPost.delete({
        where: {
          id: postId,
          published: false
        }
      })

      logger.info('Cancelled scheduled post', { postId })
      return true
    } catch (error) {
      logger.error('Failed to cancel scheduled post', error)
      return false
    }
  }

  async publishNow(postId: string): Promise<boolean> {
    try {
      const now = new Date()
      
      await prisma.blogPost.update({
        where: {
          id: postId,
          published: false
        },
        data: {
          published: true,
          publishedAt: now,
          metadata: {
            actualPublishedAt: now.toISOString(),
            manuallyPublished: true
          }
        }
      })

      logger.info('Manually published scheduled post', { postId })
      return true
    } catch (error) {
      logger.error('Failed to manually publish post', error)
      return false
    }
  }

  async getPostAnalytics(postId: string) {
    try {
      const post = await prisma.blogPost.findUnique({
        where: { id: postId }
      })

      if (!post) return null

      return {
        id: post.id,
        title: post.title,
        published: post.published,
        publishedAt: post.publishedAt,
        createdAt: post.createdAt,
        scheduledFor: post.metadata?.scheduled ? post.publishedAt : null,
        autoPublish: post.metadata?.autoPublish ?? true,
        timeUntilPublish: post.publishedAt ? 
          Math.max(0, new Date(post.publishedAt).getTime() - Date.now()) : 0
      }
    } catch (error) {
      logger.error('Failed to get post analytics', error)
      return null
    }
  }

  private async notifyPostPublished(post: BlogPost) {
    try {
      logger.info('Post published notification', {
        postId: post.id,
        title: post.title,
        publishedAt: new Date()
      })
    } catch (error) {
      logger.error('Failed to send publish notification', error)
    }
  }

  async cleanupExpiredDrafts(daysOld: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysOld)

      const result = await prisma.blogPost.deleteMany({
        where: {
          published: false,
          publishedAt: null,
          createdAt: {
            lt: cutoffDate
          }
        }
      })

      logger.info('Cleaned up expired drafts', {
        deleted: result.count,
        cutoffDate
      })

      return result.count
    } catch (error) {
      logger.error('Failed to cleanup expired drafts', error)
      return 0
    }
  }
}

export const contentScheduler = new ContentScheduler()