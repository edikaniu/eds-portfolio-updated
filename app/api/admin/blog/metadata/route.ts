import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAdminAuth } from '@/lib/admin-middleware'

// GET - Fetch existing categories and tags for dropdowns
export const GET = withAdminAuth(async (request: NextRequest, user: any) => {
  try {
    // Get all unique categories (exclude null/empty)
    const categories = await prisma.blogPost.findMany({
      where: {
        AND: [
          { category: { not: null } },
          { category: { not: '' } }
        ]
      },
      select: {
        category: true
      },
      distinct: ['category']
    })

    // Get all unique tags
    const tagsData = await prisma.blogPost.findMany({
      where: {
        AND: [
          { tags: { not: null } },
          { tags: { not: '' } }
        ]
      },
      select: {
        tags: true
      }
    })

    // Process tags - parse JSON and flatten all tags
    const allTags = new Set<string>()
    tagsData.forEach(post => {
      if (post.tags) {
        try {
          const parsedTags = JSON.parse(post.tags)
          if (Array.isArray(parsedTags)) {
            parsedTags.forEach(tag => {
              if (tag && tag.trim()) {
                allTags.add(tag.trim())
              }
            })
          }
        } catch (error) {
          // Handle cases where tags might be stored as comma-separated strings
          const stringTags = post.tags.split(',')
          stringTags.forEach(tag => {
            if (tag && tag.trim()) {
              allTags.add(tag.trim())
            }
          })
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        categories: categories.map(c => c.category).filter(Boolean),
        tags: Array.from(allTags).sort()
      }
    })
  } catch (error) {
    console.error('Error fetching blog metadata:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch blog metadata' },
      { status: 500 }
    )
  }
})