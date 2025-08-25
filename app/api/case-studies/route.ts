import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withCache, caseStudiesCacheConfig } from '@/lib/cache/cache-middleware'
import { queryOptimizer } from '@/lib/cache/query-optimizer'
import { performanceMonitor } from '@/lib/performance/performance-monitor'

// GET - Fetch all active case studies for public use
export const GET = withCache(caseStudiesCacheConfig)(async function getCaseStudies(request: NextRequest) {
  const timer = performanceMonitor.startTimer('case_studies_api_request')
  
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const featured = searchParams.get('featured') === 'true'

    // Use optimized query
    const result = await queryOptimizer.getCaseStudies({
      page: 1,
      limit,
      featured: featured ? true : undefined
    })

    const caseStudies = result.caseStudies

    // Parse JSON fields and format for frontend with error handling
    const formattedCaseStudies = caseStudies.map((cs: any) => {
      // Safe JSON parsing function
      const safeJsonParse = (jsonString: string | null, defaultValue: any = {}) => {
        if (!jsonString) return defaultValue
        try {
          const parsed = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString
          return parsed
        } catch (e) {
          console.error('Error parsing JSON for case study:', cs.id, 'field value:', jsonString)
          return defaultValue
        }
      }

      return {
        id: cs.id,
        slug: cs.slug,
        title: cs.title,
        subtitle: cs.subtitle,
        description: cs.description,
        fullDescription: cs.full_description || cs.fullDescription,
        image: cs.image_url || cs.image,
        metrics: safeJsonParse(cs.results, { primary: '0', primaryLabel: 'Metric', secondary: '0', secondaryLabel: 'Metric' }),
        results: safeJsonParse(cs.results, []),
        tools: safeJsonParse(cs.technologies, []),
        category: cs.category,
        color: cs.color,
        icon: cs.icon,
        challenge: cs.challenge,
        solution: cs.solution,
        timeline: safeJsonParse(cs.timeline, []),
        order: cs.order
      }
    })

    // Track API performance
    const duration = timer()
    performanceMonitor.trackApiEndpoint(
      'GET',
      '/api/case-studies',
      200,
      duration,
      JSON.stringify(formattedCaseStudies).length
    )

    return NextResponse.json({
      success: true,
      data: formattedCaseStudies
    })
  } catch (error) {
    const duration = timer()
    performanceMonitor.trackApiEndpoint('GET', '/api/case-studies', 500, duration)
    
    console.error('Error fetching case studies:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch case studies' },
      { status: 500 }
    )
  }
})