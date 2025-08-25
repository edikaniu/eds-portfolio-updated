#!/usr/bin/env node

import { contentScheduler } from '../lib/content-scheduler'
import { logger } from '../lib/logger'

async function publishScheduledPosts() {
  try {
    console.log('Starting scheduled post publication job...')
    
    const results = await contentScheduler.publishScheduledPosts()
    
    console.log(`Publication job completed:`)
    console.log(`- Published: ${results.published} posts`)
    console.log(`- Failed: ${results.failed.length} posts`)
    
    if (results.failed.length > 0) {
      console.error('Failed post IDs:', results.failed)
    }

    // Clean up old drafts (older than 30 days)
    const cleanedUp = await contentScheduler.cleanupExpiredDrafts(30)
    if (cleanedUp > 0) {
      console.log(`Cleaned up ${cleanedUp} expired draft posts`)
    }

    logger.info('Scheduled post publication job completed', results)
    
    process.exit(0)
  } catch (error) {
    console.error('Failed to run scheduled post publication job:', error)
    logger.error('Scheduled post publication job failed', error)
    process.exit(1)
  }
}

// Run the job
publishScheduledPosts()