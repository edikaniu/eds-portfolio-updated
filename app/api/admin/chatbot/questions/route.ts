import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { withAdminAuth } from '@/lib/admin-middleware'
import { prisma } from '@/lib/prisma'

const QuestionSchema = z.object({
  questionText: z.string().min(1, 'Question is required').max(500, 'Question too long'),
  icon: z.string().min(1, 'Icon is required'),
  category: z.string().min(1, 'Category is required').max(100, 'Category too long'),
  responseMapping: z.string().optional(),
  order: z.number().min(0).default(0)
})

// GET - Fetch all predefined questions
export const GET = withAdminAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const isActive = searchParams.get('active')

    const where: any = {}

    if (category && category !== 'all') {
      where.category = category
    }

    if (isActive !== null) {
      where.isActive = isActive === 'true'
    }

    const questions = await prisma.chatbotQuestion.findMany({
      where,
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json({
      success: true,
      data: questions
    })
  } catch (error) {
    console.error('Error fetching questions:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch questions' },
      { status: 500 }
    )
  }
})

// POST - Create new predefined question
export const POST = withAdminAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const validationResult = QuestionSchema.safeParse(body)

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

    const { questionText, icon, category, responseMapping, order } = validationResult.data

    const question = await prisma.chatbotQuestion.create({
      data: {
        questionText,
        icon,
        category,
        responseMapping,
        order,
        isActive: true,
        usageCount: 0
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Question created successfully',
      data: question
    })
  } catch (error) {
    console.error('Error creating question:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create question' },
      { status: 500 }
    )
  }
})

// PUT - Update predefined question
export const PUT = withAdminAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Question ID is required' },
        { status: 400 }
      )
    }

    const validationResult = QuestionSchema.partial().safeParse(updateData)
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

    const question = await prisma.chatbotQuestion.update({
      where: { id },
      data: {
        ...validationResult.data,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Question updated successfully',
      data: question
    })
  } catch (error) {
    console.error('Error updating question:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update question' },
      { status: 500 }
    )
  }
})

// DELETE - Delete predefined question
export const DELETE = withAdminAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Question ID is required' },
        { status: 400 }
      )
    }

    await prisma.chatbotQuestion.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Question deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting question:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete question' },
      { status: 500 }
    )
  }
})