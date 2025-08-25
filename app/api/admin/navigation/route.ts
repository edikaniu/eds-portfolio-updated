import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { withAdminAuth } from '@/lib/admin-middleware'
import { prisma } from '@/lib/prisma'

const NavigationSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  href: z.string().min(1, 'Link is required').max(200, 'Link too long'),
  isSection: z.boolean().default(false),
  order: z.number().min(0).default(0)
})

// GET - Fetch all navigation items
export const GET = withAdminAuth(async (request: NextRequest) => {
  try {
    const navigationItems = await prisma.navigationItem.findMany({
      where: { isVisible: true },
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json({
      success: true,
      data: navigationItems
    })
  } catch (error) {
    console.error('Error fetching navigation items:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch navigation items' },
      { status: 500 }
    )
  }
})

// POST - Create new navigation item
export const POST = withAdminAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const validationResult = NavigationSchema.safeParse(body)

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

    const { title, href, isSection, order } = validationResult.data

    const navigationItem = await prisma.navigationItem.create({
      data: {
        title,
        href,
        isSection,
        order,
        isVisible: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Navigation item created successfully',
      data: navigationItem
    })
  } catch (error) {
    console.error('Error creating navigation item:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create navigation item' },
      { status: 500 }
    )
  }
})

// PUT - Update navigation item
export const PUT = withAdminAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Navigation item ID is required' },
        { status: 400 }
      )
    }

    const validationResult = NavigationSchema.partial().safeParse(updateData)
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

    const navigationItem = await prisma.navigationItem.update({
      where: { id },
      data: {
        ...validationResult.data,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Navigation item updated successfully',
      data: navigationItem
    })
  } catch (error) {
    console.error('Error updating navigation item:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update navigation item' },
      { status: 500 }
    )
  }
})

// DELETE - Delete navigation item
export const DELETE = withAdminAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Navigation item ID is required' },
        { status: 400 }
      )
    }

    await prisma.navigationItem.update({
      where: { id },
      data: { isVisible: false }
    })

    return NextResponse.json({
      success: true,
      message: 'Navigation item deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting navigation item:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete navigation item' },
      { status: 500 }
    )
  }
})