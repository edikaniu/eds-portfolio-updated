import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { withAdminAuth } from '@/lib/admin-middleware'
import { prisma } from '@/lib/prisma'

const ToolSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z.string().optional(),
  logoUrl: z.string().url().optional().or(z.literal('')),
  category: z.string().optional(),
  color: z.string().optional(),
  order: z.number().min(0).default(0)
})

// GET - Fetch all tools
export const GET = withAdminAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('includeInactive') === 'true'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''

    const where: any = {}
    if (!includeInactive) {
      where.isActive = true
    }

    // Add search functionality
    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          description: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          category: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ]
    }

    // Calculate pagination
    const skip = (page - 1) * limit
    const take = limit

    // Get total count for pagination metadata
    const totalCount = await prisma.tool.count({ where })

    const tools = await prisma.tool.findMany({
      where,
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ],
      skip,
      take
    })

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      success: true,
      data: tools,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: totalPages
      }
    })
  } catch (error) {
    console.error('Error fetching tools:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch tools' },
      { status: 500 }
    )
  }
})

// POST - Create new tool
export const POST = withAdminAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const validationResult = ToolSchema.safeParse(body)

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

    const tool = await prisma.tool.create({
      data: {
        ...validationResult.data,
        isActive: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Tool created successfully',
      data: tool
    })
  } catch (error) {
    console.error('Error creating tool:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create tool' },
      { status: 500 }
    )
  }
})

// PUT - Update tool
export const PUT = withAdminAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Tool ID is required' },
        { status: 400 }
      )
    }

    const validationResult = ToolSchema.partial().safeParse(updateData)
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

    const tool = await prisma.tool.update({
      where: { id },
      data: {
        ...validationResult.data,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Tool updated successfully',
      data: tool
    })
  } catch (error) {
    console.error('Error updating tool:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update tool' },
      { status: 500 }
    )
  }
})

// DELETE - Delete tool
export const DELETE = withAdminAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Tool ID is required' },
        { status: 400 }
      )
    }

    await prisma.tool.update({
      where: { id },
      data: { isActive: false }
    })

    return NextResponse.json({
      success: true,
      message: 'Tool deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting tool:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete tool' },
      { status: 500 }
    )
  }
})