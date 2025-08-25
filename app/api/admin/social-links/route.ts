import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { withAdminAuth } from '@/lib/admin-middleware'
import { prisma } from '@/lib/prisma'

const SocialLinkSchema = z.object({
  platform: z.string().min(1, 'Platform is required').max(50, 'Platform name too long'),
  url: z.string().url('Valid URL is required').max(300, 'URL too long'),
  order: z.number().min(0).default(0)
})

// GET - Fetch all social links
export const GET = withAdminAuth(async (request: NextRequest) => {
  try {
    const socialLinks = await prisma.socialLink.findMany({
      where: { isVisible: true },
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json({
      success: true,
      data: socialLinks
    })
  } catch (error) {
    console.error('Error fetching social links:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch social links' },
      { status: 500 }
    )
  }
})

// POST - Create new social link
export const POST = withAdminAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const validationResult = SocialLinkSchema.safeParse(body)

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

    const { platform, url, order } = validationResult.data

    const socialLink = await prisma.socialLink.create({
      data: {
        platformName: platform,
        url,
        order,
        isVisible: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Social link created successfully',
      data: socialLink
    })
  } catch (error) {
    console.error('Error creating social link:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create social link' },
      { status: 500 }
    )
  }
})

// PUT - Update social link
export const PUT = withAdminAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Social link ID is required' },
        { status: 400 }
      )
    }

    const validationResult = SocialLinkSchema.partial().safeParse(updateData)
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

    const socialLink = await prisma.socialLink.update({
      where: { id },
      data: {
        ...validationResult.data,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Social link updated successfully',
      data: socialLink
    })
  } catch (error) {
    console.error('Error updating social link:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update social link' },
      { status: 500 }
    )
  }
})

// DELETE - Delete social link
export const DELETE = withAdminAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Social link ID is required' },
        { status: 400 }
      )
    }

    await prisma.socialLink.update({
      where: { id },
      data: { isVisible: false }
    })

    return NextResponse.json({
      success: true,
      message: 'Social link deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting social link:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete social link' },
      { status: 500 }
    )
  }
})