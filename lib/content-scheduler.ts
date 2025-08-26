/**
 * Minimal content scheduler stub
 */

export class ContentScheduler {
  async publishScheduledPosts() {
    return {
      published: 0,
      failed: [],
      errors: []
    }
  }

  async schedulePost(postId: string, publishAt: Date, options: any = {}) {
    return false
  }

  async cleanupExpiredDrafts(days: number) {
    return {
      deleted: 0
    }
  }
}

export const contentScheduler = new ContentScheduler()