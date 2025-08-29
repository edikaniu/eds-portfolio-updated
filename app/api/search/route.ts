import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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

interface SearchResponse {
  success: boolean
  results: SearchResult[]
  totalResults: number
  query: string
  suggestions?: string[]
}

// Helper function to calculate relevance score
function calculateRelevance(text: string, query: string): number {
  const queryLower = query.toLowerCase()
  const textLower = text.toLowerCase()
  
  // Exact match gets highest score
  if (textLower === queryLower) return 1.0
  
  // Title/content starts with query gets high score
  if (textLower.startsWith(queryLower)) return 0.9
  
  // Contains exact phrase gets good score
  if (textLower.includes(queryLower)) return 0.7
  
  // Word matching
  const queryWords = queryLower.split(' ')
  const textWords = textLower.split(' ')
  const matches = queryWords.filter(qw => textWords.some(tw => tw.includes(qw)))
  
  return Math.min(matches.length / queryWords.length * 0.6, 0.6)
}

// Search blog posts
async function searchBlogPosts(query: string, limit: number) {
  try {
    const blogPosts = await prisma.blogPost.findMany({
      where: {
        AND: [
          { published: true },
          {
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { content: { contains: query, mode: 'insensitive' } },
              { excerpt: { contains: query, mode: 'insensitive' } },
              { category: { contains: query, mode: 'insensitive' } }
            ]
          }
        ]
      },
      take: limit,
      orderBy: { createdAt: 'desc' }
    })

    return blogPosts.map(post => ({
      id: post.id,
      title: post.title,
      content: post.content,
      type: 'blog' as const,
      slug: post.slug,
      category: post.category,
      excerpt: post.excerpt,
      url: `/blog/${post.slug}`,
      relevanceScore: Math.max(
        calculateRelevance(post.title, query),
        calculateRelevance(post.content, query) * 0.8,
        calculateRelevance(post.excerpt || '', query) * 0.6
      )
    }))
  } catch (error) {
    console.error('Blog search error:', error)
    return []
  }
}

// Search projects
async function searchProjects(query: string, limit: number) {
  try {
    const projects = await prisma.project.findMany({
      where: {
        AND: [
          { isActive: true },
          {
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
              { type: { contains: query, mode: 'insensitive' } },
              { challenge: { contains: query, mode: 'insensitive' } },
              { solution: { contains: query, mode: 'insensitive' } }
            ]
          }
        ]
      },
      take: limit,
      orderBy: { createdAt: 'desc' }
    })

    return projects.map(project => ({
      id: project.id,
      title: project.title,
      content: project.description,
      type: 'project' as const,
      slug: project.slug,
      category: project.type,
      excerpt: project.description.substring(0, 150) + '...',
      url: `/project/${project.id}`,
      relevanceScore: Math.max(
        calculateRelevance(project.title, query),
        calculateRelevance(project.description, query) * 0.8,
        calculateRelevance(project.challenge || '', query) * 0.6
      )
    }))
  } catch (error) {
    console.error('Project search error:', error)
    return []
  }
}

// Search case studies
async function searchCaseStudies(query: string, limit: number) {
  try {
    const caseStudies = await prisma.caseStudy.findMany({
      where: {
        AND: [
          { isActive: true },
          {
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { subtitle: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
              { fullDescription: { contains: query, mode: 'insensitive' } },
              { category: { contains: query, mode: 'insensitive' } },
              { challenge: { contains: query, mode: 'insensitive' } },
              { solution: { contains: query, mode: 'insensitive' } }
            ]
          }
        ]
      },
      take: limit,
      orderBy: { createdAt: 'desc' }
    })

    return caseStudies.map(study => ({
      id: study.id,
      title: study.title,
      content: study.description,
      type: 'case-study' as const,
      slug: study.slug,
      category: study.category,
      excerpt: study.subtitle,
      url: `/case-study/${study.slug}`,
      relevanceScore: Math.max(
        calculateRelevance(study.title, query),
        calculateRelevance(study.description, query) * 0.8,
        calculateRelevance(study.subtitle, query) * 0.7
      )
    }))
  } catch (error) {
    console.error('Case study search error:', error)
    return []
  }
}

// Search experiences
async function searchExperiences(query: string, limit: number) {
  try {
    const experiences = await prisma.experienceEntry.findMany({
      where: {
        AND: [
          { isActive: true },
          {
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { company: { contains: query, mode: 'insensitive' } },
              { achievements: { contains: query, mode: 'insensitive' } },
              { type: { contains: query, mode: 'insensitive' } },
              { category: { contains: query, mode: 'insensitive' } }
            ]
          }
        ]
      },
      take: limit,
      orderBy: { createdAt: 'desc' }
    })

    return experiences.map(exp => ({
      id: exp.id,
      title: `${exp.title} at ${exp.company}`,
      content: exp.achievements,
      type: 'experience' as const,
      category: exp.category,
      excerpt: `${exp.period} • ${exp.type}`,
      url: `/#experience`, // Link to experience section on homepage
      relevanceScore: Math.max(
        calculateRelevance(exp.title, query),
        calculateRelevance(exp.company, query),
        calculateRelevance(exp.achievements, query) * 0.8
      )
    }))
  } catch (error) {
    console.error('Experience search error:', error)
    return []
  }
}

// Generate search suggestions
function generateSuggestions(query: string, results: SearchResult[]): string[] {
  const suggestions: string[] = []
  const queryLower = query.toLowerCase()
  
  // Extract common words from successful results
  const words = new Set<string>()
  results.forEach(result => {
    const titleWords = result.title.toLowerCase().split(/\s+/)
    const categoryWords = result.category?.toLowerCase().split(/\s+/) || []
    
    [...titleWords, ...categoryWords].forEach(word => {
      if (word.length > 3 && !word.includes(queryLower) && word !== queryLower) {
        words.add(word)
      }
    })
  })
  
  // Common search terms
  const commonTerms = [
    'marketing', 'growth', 'analytics', 'automation', 'strategy',
    'campaign', 'conversion', 'optimization', 'social', 'email',
    'content', 'SEO', 'performance', 'engagement', 'metrics'
  ]
  
  // Add relevant common terms
  commonTerms.forEach(term => {
    if (term.includes(queryLower) || queryLower.includes(term)) {
      suggestions.push(term)
    }
  })
  
  return Array.from(words).slice(0, 3).concat(suggestions.slice(0, 2))
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')?.trim()
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50)

    if (!query || query.length < 2) {
      return NextResponse.json({
        success: false,
        message: 'Query must be at least 2 characters long',
        results: [],
        totalResults: 0,
        query: query || ''
      } satisfies SearchResponse)
    }

    // Search across all content types in parallel
    const [blogResults, projectResults, caseStudyResults, experienceResults] = await Promise.all([
      searchBlogPosts(query, Math.ceil(limit * 0.4)), // 40% blogs
      searchProjects(query, Math.ceil(limit * 0.3)),   // 30% projects  
      searchCaseStudies(query, Math.ceil(limit * 0.2)), // 20% case studies
      searchExperiences(query, Math.ceil(limit * 0.1))  // 10% experiences
    ])

    // Combine all results
    const allResults = [
      ...blogResults,
      ...projectResults, 
      ...caseStudyResults,
      ...experienceResults
    ]

    // Sort by relevance score (highest first)
    const sortedResults = allResults
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit)

    // Generate suggestions
    const suggestions = generateSuggestions(query, sortedResults)

    return NextResponse.json({
      success: true,
      results: sortedResults,
      totalResults: allResults.length,
      query,
      suggestions: suggestions.length > 0 ? suggestions : undefined
    } satisfies SearchResponse)

  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json({
      success: false,
      message: 'Search failed',
      results: [],
      totalResults: 0,
      query: '',
      suggestions: []
    } satisfies SearchResponse, { status: 500 })
  }
}