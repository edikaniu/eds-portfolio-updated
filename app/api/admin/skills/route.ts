import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { withAdminAuth } from '@/lib/admin-middleware'
import { prisma } from '@/lib/prisma'

const SkillCategorySchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  description: z.string().min(1, 'Description is required').max(500, 'Description too long'),
  color: z.string().min(1, 'Color is required'),
  skills: z.array(z.object({
    name: z.string(),
    proficiency: z.number().min(0).max(100)
  })).default([]),
  order: z.number().min(0).default(0)
})

// GET - Fetch all skill categories
export const GET = withAdminAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('includeInactive') === 'true'

    const where: any = {}
    if (!includeInactive) {
      where.isActive = true
    }

    const skillCategories = await prisma.skillCategory.findMany({
      where,
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    // Parse skills JSON field
    const formattedCategories = skillCategories.map(category => ({
      ...category,
      skills: category.skills ? JSON.parse(category.skills) : []
    }))

    return NextResponse.json({
      success: true,
      data: formattedCategories
    })
  } catch (error) {
    console.error('Error fetching skill categories:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch skill categories' },
      { status: 500 }
    )
  }
})

// POST - Create new skill category
export const POST = withAdminAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const validationResult = SkillCategorySchema.safeParse(body)

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

    const { skills, ...data } = validationResult.data

    const skillCategory = await prisma.skillCategory.create({
      data: {
        ...data,
        skills: JSON.stringify(skills),
        isActive: true
      }
    })

    // Format response with parsed skills
    const formattedCategory = {
      ...skillCategory,
      skills: JSON.parse(skillCategory.skills)
    }

    return NextResponse.json({
      success: true,
      message: 'Skill category created successfully',
      data: formattedCategory
    })
  } catch (error) {
    console.error('Error creating skill category:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create skill category' },
      { status: 500 }
    )
  }
})

// PUT - Update skill category
export const PUT = withAdminAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Skill category ID is required' },
        { status: 400 }
      )
    }

    const validationResult = SkillCategorySchema.partial().safeParse(updateData)
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
    
    // Handle skills serialization
    if (updatePayload.skills) {
      updatePayload.skills = JSON.stringify(updatePayload.skills)
    }

    const skillCategory = await prisma.skillCategory.update({
      where: { id },
      data: {
        ...updatePayload,
        updatedAt: new Date()
      }
    })

    // Format response with parsed skills
    const formattedCategory = {
      ...skillCategory,
      skills: JSON.parse(skillCategory.skills)
    }

    return NextResponse.json({
      success: true,
      message: 'Skill category updated successfully',
      data: formattedCategory
    })
  } catch (error) {
    console.error('Error updating skill category:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update skill category' },
      { status: 500 }
    )
  }
})

// DELETE - Delete skill category
export const DELETE = withAdminAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Skill category ID is required' },
        { status: 400 }
      )
    }

    await prisma.skillCategory.update({
      where: { id },
      data: { isActive: false }
    })

    return NextResponse.json({
      success: true,
      message: 'Skill category deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting skill category:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete skill category' },
      { status: 500 }
    )
  }
})