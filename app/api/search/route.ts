import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

interface SearchResult {
  id: string
  title: string
  content: string
  type: 'blog' | 'project' | 'case-study' | 'experience'
  slug?: string
  category?: string
  excerpt?: string
  url: string
  relevanceScore: number
}

// Simple text similarity scoring
function calculateRelevance(searchTerm: string, title: string, content: string, category?: string): number {
  const query = searchTerm.toLowerCase()
  const titleLower = title.toLowerCase()
  const contentLower = content.toLowerCase()
  const categoryLower = category?.toLowerCase() || ''

  let score = 0

  // Title exact match gets highest score
  if (titleLower.includes(query)) {
    score += 100
  }

  // Title partial word matches
  const titleWords = titleLower.split(/\s+/)
  const queryWords = query.split(/\s+/)
  queryWords.forEach(queryWord => {
    titleWords.forEach(titleWord => {
      if (titleWord.includes(queryWord) || queryWord.includes(titleWord)) {
        score += 50
      }
    })
  })

  // Category matches
  if (categoryLower.includes(query)) {
    score += 30
  }

  // Content matches (less weight)
  const contentMatches = (contentLower.match(new RegExp(query, 'g')) || []).length
  score += contentMatches * 5

  // Word boundary matches in content
  queryWords.forEach(queryWord => {
    const wordBoundaryRegex = new RegExp(`\\b${queryWord}\\b`, 'g')
    const matches = (contentLower.match(wordBoundaryRegex) || []).length
    score += matches * 10
  })

  // Normalize score to 0-1 range
  return Math.min(score / 200, 1)
}

// Generate search suggestions based on existing content
function generateSuggestions(query: string, allContent: any[]): string[] {
  const suggestions: Set<string> = new Set()
  const queryLower = query.toLowerCase()

  // Extract common words from titles and categories
  allContent.forEach(item => {
    // Title words
    const titleWords = item.title.toLowerCase().split(/\s+/).filter(word => word.length > 3)
    titleWords.forEach(word => {
      if (word.includes(queryLower) || queryLower.includes(word)) {
        suggestions.add(word)
      }
    })

    // Category suggestions
    if (item.category) {
      const category = item.category.toLowerCase()
      if (category.includes(queryLower) || queryLower.includes(category)) {
        suggestions.add(item.category)
      }
    }
  })

  return Array.from(suggestions).slice(0, 5)
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        success: false,
        message: 'Query must be at least 2 characters long',
        results: [],
        totalResults: 0
      })
    }

    const searchTerm = query.trim()

    // Search across different content types
    const [blogPosts, projects, caseStudies, experiences] = await Promise.all([
      // Blog posts
      prisma.blogPost.findMany({
        where: {
          isDraft: false,
          OR: [
            { title: { contains: searchTerm, mode: 'insensitive' } },
            { content: { contains: searchTerm, mode: 'insensitive' } },
            { excerpt: { contains: searchTerm, mode: 'insensitive' } },
            { category: { contains: searchTerm, mode: 'insensitive' } },
            { tags: { contains: searchTerm, mode: 'insensitive' } }
          ]
        },
        select: {
          id: true,
          title: true,
          content: true,
          excerpt: true,
          slug: true,
          category: true,
          tags: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' }
      }),

      // Projects
      prisma.project.findMany({
        where: {
          isDraft: false,
          OR: [
            { title: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } },
            { technologies: { contains: searchTerm, mode: 'insensitive' } },
            { category: { contains: searchTerm, mode: 'insensitive' } }
          ]
        },
        select: {
          id: true,
          title: true,
          description: true,
          slug: true,
          category: true,
          technologies: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' }
      }),

      // Case Studies
      prisma.caseStudy.findMany({
        where: {
          isDraft: false,
          OR: [
            { title: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } },
            { challenge: { contains: searchTerm, mode: 'insensitive' } },
            { solution: { contains: searchTerm, mode: 'insensitive' } },
            { category: { contains: searchTerm, mode: 'insensitive' } }
          ]
        },
        select: {
          id: true,
          title: true,
          description: true,
          challenge: true,
          solution: true,
          slug: true,
          category: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' }
      }),

      // Experience
      prisma.experience.findMany({
        where: {
          OR: [
            { company: { contains: searchTerm, mode: 'insensitive' } },
            { position: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } },
            { technologies: { contains: searchTerm, mode: 'insensitive' } }
          ]
        },
        select: {
          id: true,
          company: true,
          position: true,
          description: true,
          technologies: true,
          startDate: true,
          endDate: true
        },
        orderBy: { startDate: 'desc' }
      })
    ])

    // Transform results into unified format
    const results: SearchResult[] = []

    // Process blog posts
    blogPosts.forEach(post => {
      const relevance = calculateRelevance(
        searchTerm, 
        post.title, 
        post.content + ' ' + (post.excerpt || ''), 
        post.category || undefined
      )
      
      if (relevance > 0) {
        results.push({
          id: post.id,
          title: post.title,
          content: post.content,
          type: 'blog',
          slug: post.slug || undefined,
          category: post.category || undefined,
          excerpt: post.excerpt || undefined,
          url: `/blog/${post.slug || post.id}`,
          relevanceScore: relevance
        })
      }
    })

    // Process projects
    projects.forEach(project => {
      const relevance = calculateRelevance(
        searchTerm, 
        project.title, 
        project.description || '', 
        project.category || undefined
      )
      
      if (relevance > 0) {
        results.push({
          id: project.id,
          title: project.title,
          content: project.description || '',
          type: 'project',
          slug: project.slug || undefined,
          category: project.category || undefined,
          excerpt: project.description?.slice(0, 150),
          url: `/project/${project.slug || project.id}`,
          relevanceScore: relevance
        })
      }
    })

    // Process case studies
    caseStudies.forEach(caseStudy => {
      const content = [caseStudy.description, caseStudy.challenge, caseStudy.solution]
        .filter(Boolean)
        .join(' ')
      
      const relevance = calculateRelevance(
        searchTerm, 
        caseStudy.title, 
        content, 
        caseStudy.category || undefined
      )
      
      if (relevance > 0) {
        results.push({
          id: caseStudy.id,
          title: caseStudy.title,
          content,
          type: 'case-study',
          slug: caseStudy.slug || undefined,
          category: caseStudy.category || undefined,
          excerpt: caseStudy.description?.slice(0, 150),
          url: `/case-study/${caseStudy.slug || caseStudy.id}`,
          relevanceScore: relevance
        })
      }
    })

    // Process experiences
    experiences.forEach(exp => {
      const title = `${exp.position} at ${exp.company}`
      const content = exp.description || ''
      
      const relevance = calculateRelevance(searchTerm, title, content)
      
      if (relevance > 0) {
        results.push({
          id: exp.id,
          title,
          content,
          type: 'experience',
          category: 'Experience',
          excerpt: content.slice(0, 150),
          url: '/#experience',
          relevanceScore: relevance
        })
      }
    })

    // Sort by relevance score and limit results
    const sortedResults = results
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit)

    // Generate suggestions if no or few results
    const allContent = [
      ...blogPosts.map(p => ({ title: p.title, category: p.category })),
      ...projects.map(p => ({ title: p.title, category: p.category })),
      ...caseStudies.map(p => ({ title: p.title, category: p.category })),
      ...experiences.map(p => ({ title: `${p.position} at ${p.company}`, category: 'Experience' }))
    ]

    const suggestions = sortedResults.length < 3 
      ? generateSuggestions(searchTerm, allContent)
      : []

    // Log search query for analytics
    logger.info('Search performed', {
      query: searchTerm,
      resultsCount: sortedResults.length,
      totalContent: allContent.length
    })

    return NextResponse.json({
      success: true,
      results: sortedResults,
      totalResults: sortedResults.length,
      query: searchTerm,
      suggestions
    })

  } catch (error) {
    logger.error('Search API error', error)
    
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      results: [],
      totalResults: 0
    }, { status: 500 })
  }
}