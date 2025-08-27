import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Fetch frontend content sections
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const section = searchParams.get('section')

    const where: any = {
      isActive: true
    }
    
    if (section) {
      where.sectionName = section
    }

    const contentSections = await prisma.contentSection.findMany({
      where
    })

    // Format for frontend
    const formattedContent: any = {}
    
    contentSections.forEach(section => {
      try {
        formattedContent[section.sectionName] = {
          content: section.content ? JSON.parse(section.content) : {},
          metadata: section.metadata ? JSON.parse(section.metadata) : {}
        }
      } catch (error) {
        console.error(`Error parsing content for section ${section.sectionName}:`, error)
        formattedContent[section.sectionName] = {
          content: {},
          metadata: {}
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: formattedContent
    })
  } catch (error) {
    console.error('Error fetching frontend content:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch content' },
      { status: 500 }
    )
  }
}