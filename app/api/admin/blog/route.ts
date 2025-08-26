import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAdminAuth } from '@/lib/admin-middleware'
import { z } from 'zod'

const BlogPostSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  category: z.string().optional(),
  tags: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  published: z.boolean().default(false),
  publishedAt: z.string().datetime().optional()
})

// GET - Fetch all blog posts
export const GET = withAdminAuth(async (request: NextRequest, user: any) => {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search')

    const where: any = {}
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } }
      ]
    }

    const blogPosts = await prisma.blogPost.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    })

    const totalCount = await prisma.blogPost.count({ where })

    return NextResponse.json({
      success: true,
      data: blogPosts,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching blog posts:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch blog posts' },
      { status: 500 }
    )
  }
})

// POST - Create new blog post
export const POST = withAdminAuth(async (request: NextRequest, user: any) => {
  try {
    const body = await request.json()
    
    const validationResult = BlogPostSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid input data',
          errors: validationResult.error.errors
        },
        { status: 400 }
      )
    }

    const data = validationResult.data
    
    // Check if slug already exists
    const existingPost = await prisma.blogPost.findUnique({
      where: { slug: data.slug }
    })
    
    if (existingPost) {
      return NextResponse.json(
        { success: false, message: 'A blog post with this slug already exists' },
        { status: 400 }
      )
    }

    const blogPost = await prisma.blogPost.create({
      data: {
        title: data.title,
        slug: data.slug,
        content: data.content,
        excerpt: data.excerpt || null,
        imageUrl: data.imageUrl || null,
        category: data.category || null,
        tags: data.tags || null,
        metaTitle: data.metaTitle || null,
        metaDescription: data.metaDescription || null,
        published: data.published,
        publishedAt: data.published ? new Date() : null
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Blog post created successfully',
      data: blogPost
    })
  } catch (error) {
    console.error('Error creating blog post:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create blog post' },
      { status: 500 }
    )
  }
})

// PUT - Update blog post
export const PUT = withAdminAuth(async (request: NextRequest, user: any) => {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Blog post ID is required' },
        { status: 400 }
      )
    }

    const validationResult = BlogPostSchema.partial().safeParse(updateData)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid input data',
          errors: validationResult.error.errors
        },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Check if slug already exists (excluding current post)
    if (data.slug) {
      const existingPost = await prisma.blogPost.findFirst({
        where: { 
          slug: data.slug,
          NOT: { id }
        }
      })
      
      if (existingPost) {
        return NextResponse.json(
          { success: false, message: 'A blog post with this slug already exists' },
          { status: 400 }
        )
      }
    }

    // Get current post to check if it was previously a draft
    const currentPost = await prisma.blogPost.findUnique({
      where: { id },
      select: { published: true, publishedAt: true }
    })

    const blogPost = await prisma.blogPost.update({
      where: { id },
      data: {
        ...data,
        // Only set publishedAt if we're publishing for the first time
        publishedAt: data.published === true 
          ? (currentPost?.published ? currentPost?.publishedAt : new Date()) 
          : null,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Blog post updated successfully',
      data: blogPost
    })
  } catch (error) {
    console.error('Error updating blog post:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update blog post' },
      { status: 500 }
    )
  }
})

// DELETE - Delete blog post
export const DELETE = withAdminAuth(async (request: NextRequest, user: any) => {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Blog post ID is required' },
        { status: 400 }
      )
    }

    await prisma.blogPost.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Blog post deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting blog post:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete blog post' },
      { status: 500 }
    )
  }
})