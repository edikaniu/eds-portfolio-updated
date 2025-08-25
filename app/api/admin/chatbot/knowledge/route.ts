import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { withAdminAuth } from '@/lib/admin-middleware'
import { prisma } from '@/lib/prisma'

const KnowledgeSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  content: z.string().min(1, 'Content is required').max(10000, 'Content too long'),
  category: z.string().min(1, 'Category is required').max(100, 'Category too long'),
  sourceType: z.string().default('manual'),
  sourceFile: z.string().optional(),
  tags: z.array(z.string()).optional(),
  priority: z.number().min(0).max(10).default(0)
})

// GET - Fetch all knowledge base items
export const GET = withAdminAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: any = {
      isActive: true
    }

    if (category && category !== 'all') {
      where.category = category
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [items, total] = await Promise.all([
      prisma.chatbotKnowledge.findMany({
        where,
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' }
        ],
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.chatbotKnowledge.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: {
        items,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error('Error fetching knowledge base:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch knowledge base' },
      { status: 500 }
    )
  }
})

// POST - Create new knowledge base item
export const POST = withAdminAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const validationResult = KnowledgeSchema.safeParse(body)

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

    const { title, content, category, sourceType, sourceFile, tags, priority } = validationResult.data

    const knowledge = await prisma.chatbotKnowledge.create({
      data: {
        title,
        content,
        category,
        sourceType,
        sourceFile,
        tags: tags ? JSON.stringify(tags) : null,
        priority,
        isActive: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Knowledge item created successfully',
      data: knowledge
    })
  } catch (error) {
    console.error('Error creating knowledge item:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create knowledge item' },
      { status: 500 }
    )
  }
})

// PUT - Update knowledge base item
export const PUT = withAdminAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Knowledge item ID is required' },
        { status: 400 }
      )
    }

    const validationResult = KnowledgeSchema.partial().safeParse(updateData)
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

    const knowledge = await prisma.chatbotKnowledge.update({
      where: { id },
      data: {
        ...validationResult.data,
        tags: validationResult.data.tags ? JSON.stringify(validationResult.data.tags) : undefined,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Knowledge item updated successfully',
      data: knowledge
    })
  } catch (error) {
    console.error('Error updating knowledge item:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update knowledge item' },
      { status: 500 }
    )
  }
})

// DELETE - Delete knowledge base item
export const DELETE = withAdminAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Knowledge item ID is required' },
        { status: 400 }
      )
    }

    await prisma.chatbotKnowledge.update({
      where: { id },
      data: { isActive: false }
    })

    return NextResponse.json({
      success: true,
      message: 'Knowledge item deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting knowledge item:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete knowledge item' },
      { status: 500 }
    )
  }
})