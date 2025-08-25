import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withCache, blogCacheConfig } from '@/lib/cache/cache-middleware'
import { queryOptimizer } from '@/lib/cache/query-optimizer'
import { performanceMonitor } from '@/lib/performance/performance-monitor'

// GET - Fetch published blog posts for frontend
export const GET = withCache(blogCacheConfig)(async function getBlogPosts(request: NextRequest) {
  const timer = performanceMonitor.startTimer('blog_api_request')
  
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const featured = searchParams.get('featured') === 'true'
    const category = searchParams.get('category') || undefined
    const search = searchParams.get('search') || undefined

    // Use optimized query
    const result = await queryOptimizer.getBlogPosts({
      page,
      limit,
      featured: featured ? true : undefined,
      category,
      search
    })

    const blogPosts = result.posts

    // Transform data to match frontend expectations
    const transformedPosts = blogPosts.map((post: any) => ({
      id: post.id,
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt || '',
      date: post.published_at?.split('T')[0] || post.created_at?.split('T')[0],
      readTime: "8 min read", // Could calculate this based on content length
      category: post.category || 'Uncategorized',
      image: post.image_url || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=200&fit=crop&crop=center",
      author: post.author_name || "Edikan Udoibuot",
    }))

    // Track API performance
    const duration = timer()
    performanceMonitor.trackApiEndpoint(
      'GET',
      '/api/blog',
      200,
      duration,
      JSON.stringify(transformedPosts).length
    )

    return NextResponse.json({
      success: true,
      data: transformedPosts,
      pagination: result.pagination
    })
  } catch (error) {
    const duration = timer()
    performanceMonitor.trackApiEndpoint('GET', '/api/blog', 500, duration)
    
    console.error('Error fetching blog posts:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch blog posts' },
      { status: 500 }
    )
  }
})