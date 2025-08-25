#!/usr/bin/env node

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function migrateBlogPosts() {
  try {
    console.log('Starting blog posts migration...')

    // Update any existing posts that use the old isDraft field
    const result = await prisma.$executeRaw`
      UPDATE blog_posts 
      SET published = CASE WHEN isDraft = 1 THEN 0 ELSE 1 END
      WHERE published IS NULL
    `

    console.log(`Updated ${result} blog posts`)

    // Ensure all posts have proper slug values
    const postsWithoutSlug = await prisma.blogPost.findMany({
      where: {
        slug: {
          equals: null
        }
      }
    })

    for (const post of postsWithoutSlug) {
      const slug = post.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

      await prisma.blogPost.update({
        where: { id: post.id },
        data: { slug }
      })
    }

    console.log(`Generated slugs for ${postsWithoutSlug.length} posts`)

    // Set default values for new fields
    await prisma.$executeRaw`
      UPDATE blog_posts 
      SET 
        published = COALESCE(published, 0),
        metadata = COALESCE(metadata, '{}')
      WHERE published IS NULL OR metadata IS NULL
    `

    console.log('Migration completed successfully')
    process.exit(0)
    
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

migrateBlogPosts()