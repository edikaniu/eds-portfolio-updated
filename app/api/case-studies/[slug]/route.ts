import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Fetch single case study by slug for frontend
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const caseStudy = await prisma.caseStudy.findFirst({
      where: {
        slug: slug,
        isActive: true
      }
    })

    if (!caseStudy) {
      return NextResponse.json(
        { success: false, message: 'Case study not found' },
        { status: 404 }
      )
    }

    // Parse JSON fields and format for frontend with error handling
    const safeJsonParse = (jsonString: string | null, defaultValue: any = {}) => {
      if (!jsonString) return defaultValue
      try {
        const parsed = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString
        return parsed
      } catch (e) {
        console.error('Error parsing JSON for case study:', caseStudy.id, 'field value:', jsonString)
        return defaultValue
      }
    }

    const transformedCaseStudy = {
      id: caseStudy.id,
      slug: caseStudy.slug,
      title: caseStudy.title,
      subtitle: caseStudy.subtitle,
      description: caseStudy.description,
      fullDescription: caseStudy.fullDescription,
      image: caseStudy.image || "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop",
      metrics: safeJsonParse(caseStudy.metrics, { primary: '0', primaryLabel: 'Metric', secondary: '0', secondaryLabel: 'Metric' }),
      results: safeJsonParse(caseStudy.results, []),
      tools: safeJsonParse(caseStudy.tools, []),
      category: caseStudy.category,
      color: caseStudy.color,
      icon: caseStudy.icon,
      challenge: caseStudy.challenge,
      solution: caseStudy.solution,
      timeline: safeJsonParse(caseStudy.timeline, []),
      order: caseStudy.order,
      createdAt: caseStudy.createdAt.toISOString(),
      updatedAt: caseStudy.updatedAt.toISOString()
    }

    return NextResponse.json({
      success: true,
      data: transformedCaseStudy
    })
  } catch (error) {
    console.error('Error fetching case study:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch case study' },
      { status: 500 }
    )
  }
}