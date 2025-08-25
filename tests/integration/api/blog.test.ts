import { NextRequest } from 'next/server'
import { GET } from '@/app/api/blog/route'
import { createMockRequest, createMockBlogPost } from '../../utils/test-utils'

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    blogPost: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
}))

jest.mock('@/lib/cache/cache-middleware', () => ({
  withCache: (config: any) => (handler: any) => handler,
  blogCacheConfig: {},
}))

jest.mock('@/lib/cache/query-optimizer', () => ({
  queryOptimizer: {
    getBlogPosts: jest.fn(),
  },
}))

jest.mock('@/lib/performance/performance-monitor', () => ({
  performanceMonitor: {
    startTimer: jest.fn(() => jest.fn().mockReturnValue(100)),
    trackApiEndpoint: jest.fn(),
  },
}))

import { queryOptimizer } from '@/lib/cache/query-optimizer'
import { performanceMonitor } from '@/lib/performance/performance-monitor'

describe('/api/blog', () => {
  const mockBlogPosts = [
    createMockBlogPost({
      id: '1',
      title: 'First Blog Post',
      slug: 'first-blog-post',
      published_at: '2024-01-01T00:00:00Z',
      author_name: 'Test Author',
    }),
    createMockBlogPost({
      id: '2',
      title: 'Second Blog Post',
      slug: 'second-blog-post',
      published_at: '2024-01-02T00:00:00Z',
      author_name: 'Test Author',
    }),
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock the optimized query
    (queryOptimizer.getBlogPosts as jest.Mock).mockResolvedValue({
      posts: mockBlogPosts,
      pagination: {
        page: 1,
        limit: 10,
        total: mockBlogPosts.length,
        pages: 1,
      },
    })
  })

  describe('GET', () => {
    it('should return blog posts successfully', async () => {
      const request = createMockRequest('GET', 'http://localhost:3000/api/blog')

      const response = await GET(request as NextRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toHaveLength(2)
      expect(data.data[0]).toMatchObject({
        id: '1',
        title: 'First Blog Post',
        slug: 'first-blog-post',
        author: 'Test Author',
      })
      expect(data.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 2,
        pages: 1,
      })
    })

    it('should handle pagination parameters', async () => {
      const request = createMockRequest(
        'GET',
        'http://localhost:3000/api/blog?page=2&limit=5'
      )

      await GET(request as NextRequest)

      expect(queryOptimizer.getBlogPosts).toHaveBeenCalledWith({
        page: 2,
        limit: 5,
        featured: undefined,
        category: undefined,
        search: undefined,
      })
    })

    it('should handle featured filter', async () => {
      const request = createMockRequest(
        'GET',
        'http://localhost:3000/api/blog?featured=true'
      )

      await GET(request as NextRequest)

      expect(queryOptimizer.getBlogPosts).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        featured: true,
        category: undefined,
        search: undefined,
      })
    })

    it('should handle category filter', async () => {
      const request = createMockRequest(
        'GET',
        'http://localhost:3000/api/blog?category=Technology'
      )

      await GET(request as NextRequest)

      expect(queryOptimizer.getBlogPosts).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        featured: undefined,
        category: 'Technology',
        search: undefined,
      })
    })

    it('should handle search parameter', async () => {
      const request = createMockRequest(
        'GET',
        'http://localhost:3000/api/blog?search=react'
      )

      await GET(request as NextRequest)

      expect(queryOptimizer.getBlogPosts).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        featured: undefined,
        category: undefined,
        search: 'react',
      })
    })

    it('should track performance metrics', async () => {
      const request = createMockRequest('GET', 'http://localhost:3000/api/blog')

      await GET(request as NextRequest)

      expect(performanceMonitor.startTimer).toHaveBeenCalledWith('blog_api_request')
      expect(performanceMonitor.trackApiEndpoint).toHaveBeenCalledWith(
        'GET',
        '/api/blog',
        200,
        100,
        expect.any(Number)
      )
    })

    it('should handle errors gracefully', async () => {
      // Mock query optimizer to throw error
      (queryOptimizer.getBlogPosts as jest.Mock).mockRejectedValue(
        new Error('Database connection failed')
      )

      const request = createMockRequest('GET', 'http://localhost:3000/api/blog')

      const response = await GET(request as NextRequest)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.message).toBe('Failed to fetch blog posts')

      // Should still track error metrics
      expect(performanceMonitor.trackApiEndpoint).toHaveBeenCalledWith(
        'GET',
        '/api/blog',
        500,
        expect.any(Number)
      )
    })

    it('should transform blog post data correctly', async () => {
      const request = createMockRequest('GET', 'http://localhost:3000/api/blog')

      const response = await GET(request as NextRequest)
      const data = await response.json()

      const transformedPost = data.data[0]

      expect(transformedPost).toHaveProperty('id')
      expect(transformedPost).toHaveProperty('slug')
      expect(transformedPost).toHaveProperty('title')
      expect(transformedPost).toHaveProperty('excerpt')
      expect(transformedPost).toHaveProperty('date')
      expect(transformedPost).toHaveProperty('readTime')
      expect(transformedPost).toHaveProperty('category')
      expect(transformedPost).toHaveProperty('image')
      expect(transformedPost).toHaveProperty('author')

      // Check date format
      expect(transformedPost.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      
      // Check default values
      expect(transformedPost.readTime).toBe('8 min read')
      expect(transformedPost.author).toBe('Test Author')
    })

    it('should handle missing optional fields', async () => {
      const incompletePost = {
        id: '1',
        title: 'Incomplete Post',
        slug: 'incomplete-post',
        // Missing optional fields
      }

      ;(queryOptimizer.getBlogPosts as jest.Mock).mockResolvedValue({
        posts: [incompletePost],
        pagination: { page: 1, limit: 10, total: 1, pages: 1 },
      })

      const request = createMockRequest('GET', 'http://localhost:3000/api/blog')

      const response = await GET(request as NextRequest)
      const data = await response.json()

      const transformedPost = data.data[0]

      expect(transformedPost.excerpt).toBe('')
      expect(transformedPost.category).toBe('Uncategorized')
      expect(transformedPost.image).toContain('unsplash.com')
    })

    it('should return empty array when no posts found', async () => {
      ;(queryOptimizer.getBlogPosts as jest.Mock).mockResolvedValue({
        posts: [],
        pagination: { page: 1, limit: 10, total: 0, pages: 0 },
      })

      const request = createMockRequest('GET', 'http://localhost:3000/api/blog')

      const response = await GET(request as NextRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toEqual([])
      expect(data.pagination.total).toBe(0)
    })
  })
})