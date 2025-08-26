import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Fetch all active case studies for public use
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')

    const caseStudies = await prisma.caseStudy.findMany({
      where: {
        isActive: true
      },
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ],
      take: limit
    })

    // Parse JSON fields and format for frontend with error handling
    const formattedCaseStudies = caseStudies.map((cs) => {
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
        fullDescription: cs.fullDescription,
        image: cs.image || "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop",
        metrics: safeJsonParse(cs.metrics, { primary: '0', primaryLabel: 'Metric', secondary: '0', secondaryLabel: 'Metric' }),
        results: safeJsonParse(cs.results, []),
        tools: safeJsonParse(cs.tools, []),
        category: cs.category,
        color: cs.color,
        icon: cs.icon,
        challenge: cs.challenge,
        solution: cs.solution,
        timeline: safeJsonParse(cs.timeline, []),
        order: cs.order
      }
    })

    return NextResponse.json({
      success: true,
      data: formattedCaseStudies
    })
  } catch (error) {
    console.error('Error fetching case studies:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch case studies' },
      { status: 500 }
    )
  }
}