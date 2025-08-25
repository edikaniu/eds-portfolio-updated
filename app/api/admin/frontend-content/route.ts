import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { withAdminAuth } from '@/lib/admin-middleware'
import { prisma } from '@/lib/prisma'

const FrontendContentSchema = z.object({
  sectionType: z.enum(['hero', 'about', 'skills', 'experience', 'contact']),
  data: z.record(z.any())
})

// GET - Fetch frontend content sections
export const GET = withAdminAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const sectionType = searchParams.get('section')

    const where: any = {}
    if (sectionType) {
      where.sectionName = sectionType
    }

    const contentSections = await prisma.contentSection.findMany({
      where: {
        ...where,
        isActive: true
      },
      orderBy: { updatedAt: 'desc' }
    })

    // Parse metadata and content for frontend use
    const formattedSections = contentSections.map(section => {
      let content = {}
      let metadata = {}
      
      try {
        content = section.content ? JSON.parse(section.content) : {}
      } catch (error) {
        console.warn(`Invalid JSON in content for section ${section.sectionName}:`, section.content)
        content = { value: section.content } // Wrap plain text in an object
      }
      
      try {
        metadata = section.metadata ? JSON.parse(section.metadata) : {}
      } catch (error) {
        console.warn(`Invalid JSON in metadata for section ${section.sectionName}:`, section.metadata)
        metadata = {}
      }
      
      return {
        ...section,
        content,
        metadata
      }
    })

    return NextResponse.json({
      success: true,
      data: formattedSections
    })
  } catch (error) {
    console.error('Error fetching frontend content:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch frontend content' },
      { status: 500 }
    )
  }
})

// POST - Create frontend content section
export const POST = withAdminAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const validationResult = FrontendContentSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid input data',
          errors: validationResult.error.errors
        },
        { status: 400 }
      )
    }

    const { sectionType, data } = validationResult.data

    // Check if section already exists
    const existingSection = await prisma.contentSection.findUnique({
      where: { sectionName: sectionType }
    })

    if (existingSection) {
      // Update existing section
      const updatedSection = await prisma.contentSection.update({
        where: { sectionName: sectionType },
        data: {
          content: JSON.stringify(data),
          updatedAt: new Date()
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Frontend content updated successfully',
        data: {
          ...updatedSection,
          content: JSON.parse(updatedSection.content),
          metadata: updatedSection.metadata ? JSON.parse(updatedSection.metadata) : {}
        }
      })
    } else {
      // Create new section
      const contentSection = await prisma.contentSection.create({
        data: {
          sectionName: sectionType,
          content: JSON.stringify(data),
          metadata: null,
          isActive: true
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Frontend content created successfully',
        data: {
          ...contentSection,
          content: JSON.parse(contentSection.content),
          metadata: contentSection.metadata ? JSON.parse(contentSection.metadata) : {}
        }
      })
    }
  } catch (error) {
    console.error('Error creating/updating frontend content:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to save frontend content' },
      { status: 500 }
    )
  }
})

// PUT - Update frontend content section
export const PUT = withAdminAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { sectionType, data } = body

    if (!sectionType || !data) {
      return NextResponse.json(
        { success: false, message: 'Section type and data are required' },
        { status: 400 }
      )
    }

    const contentSection = await prisma.contentSection.update({
      where: { sectionName: sectionType },
      data: {
        content: JSON.stringify(data),
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Frontend content updated successfully',
      data: {
        ...contentSection,
        content: JSON.parse(contentSection.content),
        metadata: contentSection.metadata ? JSON.parse(contentSection.metadata) : {}
      }
    })
  } catch (error) {
    console.error('Error updating frontend content:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update frontend content' },
      { status: 500 }
    )
  }
})