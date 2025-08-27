import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Fetch single published blog post by slug for frontend
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const blogPost = await prisma.blogPost.findFirst({
      where: {
        slug: slug,
        published: true
      }
    })

    if (!blogPost) {
      return NextResponse.json(
        { success: false, message: 'Blog post not found' },
        { status: 404 }
      )
    }

    // Transform data to match frontend expectations
    const transformedPost = {
      id: blogPost.id,
      slug: blogPost.slug,
      title: blogPost.title,
      content: blogPost.content || '',
      excerpt: blogPost.excerpt || '',
      date: blogPost.publishedAt?.toISOString().split('T')[0] || blogPost.createdAt.toISOString().split('T')[0],
      readTime: Math.max(1, Math.ceil((blogPost.content || '').split(' ').length / 200)) + " min read",
      category: blogPost.category || 'Uncategorized',
      tags: blogPost.tags ? JSON.parse(blogPost.tags) : [],
      image: blogPost.imageUrl || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop&crop=center",
      author: blogPost.author || "Edikan Udoibuot",
      metaTitle: blogPost.metaTitle,
      metaDescription: blogPost.metaDescription,
    }

    return NextResponse.json({
      success: true,
      data: transformedPost
    })
  } catch (error) {
    console.error('Error fetching blog post:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch blog post' },
      { status: 500 }
    )
  }
}