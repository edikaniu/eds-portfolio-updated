import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createCachedResponse, CACHE_DURATIONS } from '@/lib/api-cache'

interface SearchResult {
  id: string
  title: string
  content: string
  type: 'blog' | 'project' | 'case-study' | 'experience'
  slug?: string
  category?: string | null
  excerpt?: string | null
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
              { title: { contains: query } },
              { content: { contains: query } },
              { excerpt: { contains: query } },
              { category: { contains: query } }
            ]
          }
        ]
      },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        excerpt: true,
        category: true,
        publishedAt: true
      },
      take: limit,
      orderBy: { publishedAt: 'desc' }
    })

    // Only return posts that have both slug and are published - no fallback content
    return blogPosts
      .filter(post => post.slug && post.slug.trim() !== '')
      .map(post => ({
        id: post.id,
        title: post.title,
        content: post.content,
        type: 'blog' as const,
        slug: post.slug,
        category: post.category,
        excerpt: post.excerpt || post.content.substring(0, 150) + (post.content.length > 150 ? '...' : ''),
        url: `/blog/${post.slug}`,
        relevanceScore: Math.max(
          calculateRelevance(post.title, query),
          calculateRelevance(post.content, query) * 0.8,
          calculateRelevance(post.excerpt || '', query) * 0.6,
          calculateRelevance(post.category || '', query) * 0.5
        )
      }))
      .filter(result => result.relevanceScore > 0.1) // Filter low relevance results
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
              { title: { contains: query } },
              { description: { contains: query } },
              { category: { contains: query } },
              { technologies: { contains: query } }
            ]
          }
        ]
      },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        category: true,
        technologies: true,
        createdAt: true
      },
      take: limit,
      orderBy: { order: 'asc' }
    })

    // Only return projects with valid identifiers and descriptions
    return projects
      .filter(project => 
        project.id && 
        project.title && 
        project.description && 
        (project.slug || project.id) // Must have either slug or id for URL
      )
      .map(project => ({
        id: project.id,
        title: project.title,
        content: project.description,
        type: 'project' as const,
        slug: project.slug,
        category: project.category,
        excerpt: project.description.substring(0, 150) + (project.description.length > 150 ? '...' : ''),
        url: `/project/${project.slug || project.id}`, // Prefer slug for SEO, fallback to id
        relevanceScore: Math.max(
          calculateRelevance(project.title, query),
          calculateRelevance(project.description, query) * 0.8,
          calculateRelevance(project.category || '', query) * 0.6,
          calculateRelevance(project.technologies || '', query) * 0.4
        )
      }))
      .filter(result => result.relevanceScore > 0.1) // Filter low relevance results
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
              { title: { contains: query } },
              { subtitle: { contains: query } },
              { description: { contains: query } },
              { fullDescription: { contains: query } },
              { category: { contains: query } },
              { challenge: { contains: query } },
              { solution: { contains: query } }
            ]
          }
        ]
      },
      select: {
        id: true,
        title: true,
        slug: true,
        subtitle: true,
        description: true,
        category: true,
        createdAt: true
      },
      take: limit,
      orderBy: { order: 'asc' }
    })

    // Only return case studies with valid slug and content
    return caseStudies
      .filter(study => 
        study.slug && 
        study.slug.trim() !== '' && 
        study.title && 
        study.description
      )
      .map(study => ({
        id: study.id,
        title: study.title,
        content: study.description,
        type: 'case-study' as const,
        slug: study.slug,
        category: study.category,
        excerpt: study.subtitle || study.description.substring(0, 150) + (study.description.length > 150 ? '...' : ''),
        url: `/case-study/${study.slug}`,
        relevanceScore: Math.max(
          calculateRelevance(study.title, query),
          calculateRelevance(study.description, query) * 0.8,
          calculateRelevance(study.subtitle || '', query) * 0.7,
          calculateRelevance(study.category || '', query) * 0.5
        )
      }))
      .filter(result => result.relevanceScore > 0.1) // Filter low relevance results
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
              { title: { contains: query } },
              { company: { contains: query } },
              { achievements: { contains: query } },
              { type: { contains: query } },
              { category: { contains: query } }
            ]
          }
        ]
      },
      select: {
        id: true,
        title: true,
        company: true,
        achievements: true,
        period: true,
        type: true,
        category: true
      },
      take: limit,
      orderBy: { order: 'asc' }
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
        calculateRelevance(exp.achievements, query) * 0.8,
        calculateRelevance(exp.category || '', query) * 0.5
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
    
    const allWords = titleWords.concat(categoryWords)
    allWords.forEach(word => {
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
        results: [],
        totalResults: 0,
        query: query || ''
      } satisfies SearchResponse)
    }

    // Test database connection
    try {
      await prisma.$queryRaw`SELECT 1`
    } catch (dbError) {
      console.error('Database connection failed in search:', dbError)
      return NextResponse.json({
        success: false,
        results: [],
        totalResults: 0,
        query
      } satisfies SearchResponse, { status: 500 })
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

    // Filter out results with invalid URLs and sort by relevance score (highest first)
    const validResults = allResults
      .filter(result => {
        // Ensure all results have required fields for valid URLs
        if (result.type === 'blog' && !result.slug) return false
        if (result.type === 'case-study' && !result.slug) return false
        if (result.type === 'project' && !result.id && !result.slug) return false
        return result.title && result.url && result.relevanceScore > 0.1 // Minimum relevance threshold
      })
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit)

    // Log search results for debugging (always log to help troubleshoot 404s)
    console.log(`🔍 Search Query: "${query}"`);
    console.log(`📊 Raw Results: Blog(${blogResults.length}), Projects(${projectResults.length}), Case Studies(${caseStudyResults.length}), Experience(${experienceResults.length})`);
    console.log(`✅ Valid Results After Filtering: ${validResults.length}`);
    
    if (validResults.length > 0) {
      console.log('🔗 Valid URLs Generated:', 
        validResults.map(r => ({ type: r.type, title: r.title.substring(0, 50), url: r.url, score: r.relevanceScore.toFixed(2) }))
      )
    } else {
      console.log('❌ No valid search results found - all results filtered out')
    }

    // Generate suggestions
    const suggestions = generateSuggestions(query, validResults)

    return createCachedResponse({
      success: true,
      results: validResults,
      totalResults: validResults.length, // Use filtered count
      query,
      suggestions: suggestions.length > 0 ? suggestions : undefined
    } satisfies SearchResponse, CACHE_DURATIONS.SEARCH)

  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json({
      success: false,
      results: [],
      totalResults: 0,
      query: '',
      suggestions: []
    } satisfies SearchResponse, { status: 500 })
  }
}