import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { withAdminAuth } from '@/lib/admin-middleware'
import { prisma } from '@/lib/prisma'

const ContentSectionSchema = z.object({
  sectionName: z.string().min(1, 'Section name is required').max(100, 'Section name too long'),
  content: z.string().min(1, 'Content is required'),
  metadata: z.string().optional().nullable()
})

// GET - Fetch all content sections
export const GET = withAdminAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('includeInactive') === 'true'
    const sectionName = searchParams.get('section')

    const where: any = {}
    if (!includeInactive) {
      where.isActive = true
    }
    if (sectionName) {
      where.sectionName = sectionName
    }

    const contentSections = await prisma.contentSection.findMany({
      where,
      orderBy: [
        { sectionName: 'asc' },
        { updatedAt: 'desc' }
      ]
    })

    // Parse metadata JSON fields
    const formattedSections = contentSections.map(section => ({
      ...section,
      metadata: section.metadata ? JSON.parse(section.metadata) : null
    }))

    return NextResponse.json({
      success: true,
      data: formattedSections
    })
  } catch (error) {
    console.error('Error fetching content sections:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch content sections' },
      { status: 500 }
    )
  }
})

// POST - Create new content section
export const POST = withAdminAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const validationResult = ContentSectionSchema.safeParse(body)

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

    const { sectionName, content, metadata } = validationResult.data

    // Check if section already exists
    const existingSection = await prisma.contentSection.findUnique({
      where: { sectionName }
    })

    if (existingSection) {
      return NextResponse.json(
        { success: false, message: 'Section already exists' },
        { status: 400 }
      )
    }

    const contentSection = await prisma.contentSection.create({
      data: {
        sectionName,
        content,
        metadata: metadata ? JSON.stringify(metadata) : null,
        isActive: true
      }
    })

    // Format response with parsed metadata
    const formattedSection = {
      ...contentSection,
      metadata: contentSection.metadata ? JSON.parse(contentSection.metadata) : null
    }

    return NextResponse.json({
      success: true,
      message: 'Content section created successfully',
      data: formattedSection
    })
  } catch (error) {
    console.error('Error creating content section:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create content section' },
      { status: 500 }
    )
  }
})

// PUT - Update content section
export const PUT = withAdminAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { id, sectionName, ...updateData } = body

    if (!id && !sectionName) {
      return NextResponse.json(
        { success: false, message: 'Content section ID or section name is required' },
        { status: 400 }
      )
    }

    const validationResult = ContentSectionSchema.partial().safeParse(updateData)
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

    const updatePayload: any = { ...validationResult.data }
    
    // Handle metadata serialization
    if (updatePayload.metadata !== undefined) {
      updatePayload.metadata = updatePayload.metadata ? JSON.stringify(updatePayload.metadata) : null
    }

    const whereClause = id ? { id } : { sectionName: sectionName! }

    const contentSection = await prisma.contentSection.update({
      where: whereClause,
      data: {
        ...updatePayload,
        updatedAt: new Date()
      }
    })

    // Format response with parsed metadata
    const formattedSection = {
      ...contentSection,
      metadata: contentSection.metadata ? JSON.parse(contentSection.metadata) : null
    }

    return NextResponse.json({
      success: true,
      message: 'Content section updated successfully',
      data: formattedSection
    })
  } catch (error) {
    console.error('Error updating content section:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update content section' },
      { status: 500 }
    )
  }
})

// DELETE - Delete content section
export const DELETE = withAdminAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const sectionName = searchParams.get('sectionName')

    if (!id && !sectionName) {
      return NextResponse.json(
        { success: false, message: 'Content section ID or section name is required' },
        { status: 400 }
      )
    }

    const whereClause = id ? { id } : { sectionName: sectionName! }

    await prisma.contentSection.update({
      where: whereClause,
      data: { isActive: false }
    })

    return NextResponse.json({
      success: true,
      message: 'Content section deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting content section:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete content section' },
      { status: 500 }
    )
  }
})