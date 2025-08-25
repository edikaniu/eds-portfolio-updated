import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { withAdminAuth } from '@/lib/admin-middleware'
import { prisma } from '@/lib/prisma'

const ExperienceSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  company: z.string().min(1, 'Company is required').max(200, 'Company too long'),
  period: z.string().min(1, 'Period is required').max(100, 'Period too long'),
  type: z.string().min(1, 'Type is required').max(50, 'Type too long'),
  category: z.string().min(1, 'Category is required').max(50, 'Category too long'),
  achievements: z.array(z.string()).default([]),
  metrics: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  order: z.number().min(0).default(0)
})

// GET - Fetch all experience entries
export const GET = withAdminAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('includeInactive') === 'true'

    const where: any = {}
    if (!includeInactive) {
      where.isActive = true
    }

    const experiences = await prisma.experienceEntry.findMany({
      where,
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    // Parse JSON fields
    const formattedExperiences = experiences.map(exp => ({
      ...exp,
      achievements: exp.achievements ? JSON.parse(exp.achievements) : []
    }))

    return NextResponse.json({
      success: true,
      data: formattedExperiences
    })
  } catch (error) {
    console.error('Error fetching experiences:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch experiences' },
      { status: 500 }
    )
  }
})

// POST - Create new experience entry
export const POST = withAdminAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const validationResult = ExperienceSchema.safeParse(body)

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

    const { achievements, ...data } = validationResult.data

    const experience = await prisma.experienceEntry.create({
      data: {
        ...data,
        achievements: JSON.stringify(achievements),
        isActive: true
      }
    })

    // Format response with parsed achievements
    const formattedExperience = {
      ...experience,
      achievements: JSON.parse(experience.achievements)
    }

    return NextResponse.json({
      success: true,
      message: 'Experience entry created successfully',
      data: formattedExperience
    })
  } catch (error) {
    console.error('Error creating experience:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create experience entry' },
      { status: 500 }
    )
  }
})

// PUT - Update experience entry
export const PUT = withAdminAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Experience ID is required' },
        { status: 400 }
      )
    }

    const validationResult = ExperienceSchema.partial().safeParse(updateData)
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
    
    // Handle achievements serialization
    if (updatePayload.achievements) {
      updatePayload.achievements = JSON.stringify(updatePayload.achievements)
    }

    const experience = await prisma.experienceEntry.update({
      where: { id },
      data: {
        ...updatePayload,
        updatedAt: new Date()
      }
    })

    // Format response with parsed achievements
    const formattedExperience = {
      ...experience,
      achievements: JSON.parse(experience.achievements)
    }

    return NextResponse.json({
      success: true,
      message: 'Experience entry updated successfully',
      data: formattedExperience
    })
  } catch (error) {
    console.error('Error updating experience:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update experience entry' },
      { status: 500 }
    )
  }
})

// DELETE - Delete experience entry
export const DELETE = withAdminAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Experience ID is required' },
        { status: 400 }
      )
    }

    await prisma.experienceEntry.update({
      where: { id },
      data: { isActive: false }
    })

    return NextResponse.json({
      success: true,
      message: 'Experience entry deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting experience:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete experience entry' },
      { status: 500 }
    )
  }
})