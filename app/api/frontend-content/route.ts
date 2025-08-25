import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Public endpoint for frontend to fetch content
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sectionType = searchParams.get('section')

    const where: any = { isActive: true }
    if (sectionType) {
      where.sectionName = sectionType
    }

    const contentSections = await prisma.contentSection.findMany({
      where,
      orderBy: { updatedAt: 'desc' }
    })

    // Parse content and metadata for frontend use
    const formattedSections = contentSections.reduce((acc: any, section) => {
      acc[section.sectionName] = {
        content: section.content ? JSON.parse(section.content) : {},
        metadata: section.metadata ? JSON.parse(section.metadata) : {},
        updatedAt: section.updatedAt
      }
      return acc
    }, {})

    return NextResponse.json({
      success: true,
      data: formattedSections
    })
  } catch (error) {
    console.error('Error fetching frontend content:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch content' },
      { status: 500 }
    )
  }
}