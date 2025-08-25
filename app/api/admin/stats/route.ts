import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { withAdminAuth } from '@/lib/admin-middleware'
import { prisma } from '@/lib/prisma'

const StatSchema = z.object({
  key: z.string().min(1, 'Key is required'),
  label: z.string().min(1, 'Label is required'),
  value: z.string().min(1, 'Value is required'),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  order: z.number().min(0).default(0)
})

// GET - Fetch all site statistics
export const GET = withAdminAuth(async (request: NextRequest) => {
  try {
    const stats = await prisma.siteSetting.findMany({
      where: {
        settingKey: {
          in: ['core_skills_stat', 'professional_tools_stat', 'years_experience_stat', 'users_scaled_stat', 'subscribers_growth_stat', 'budget_scaled_stat', 'roas_stat']
        }
      },
      orderBy: { settingKey: 'asc' }
    })

    // Transform to expected format
    const formattedStats = stats.map(stat => ({
      id: stat.id,
      key: stat.settingKey,
      label: stat.settingKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: stat.settingValue,
      description: stat.description || '',
      icon: 'BarChart3', // Default icon
      color: '#3B82F6', // Default color
      order: 0, // Default order
      createdAt: stat.createdAt,
      updatedAt: stat.updatedAt
    }))

    return NextResponse.json({
      success: true,
      data: formattedStats
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
})

// POST - Create new stat
export const POST = withAdminAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const validationResult = StatSchema.safeParse(body)

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

    const { key, label, value, description, icon, color, order } = validationResult.data

    const stat = await prisma.siteSetting.create({
      data: {
        settingKey: key,
        settingValue: value,
        description: description || ''
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Statistic created successfully',
      data: stat
    })
  } catch (error) {
    console.error('Error creating stat:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create statistic' },
      { status: 500 }
    )
  }
})

// PUT - Update stat
export const PUT = withAdminAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Statistic ID is required' },
        { status: 400 }
      )
    }

    const validationResult = StatSchema.partial().safeParse(updateData)
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

    const { key, label, value, description, icon, color, order } = validationResult.data

    const updatePayload: any = {}
    if (key) updatePayload.settingKey = key
    if (value) updatePayload.settingValue = value
    if (description !== undefined) updatePayload.description = description

    const stat = await prisma.siteSetting.update({
      where: { id },
      data: updatePayload
    })

    return NextResponse.json({
      success: true,
      message: 'Statistic updated successfully',
      data: stat
    })
  } catch (error) {
    console.error('Error updating stat:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update statistic' },
      { status: 500 }
    )
  }
})

// DELETE - Delete stat
export const DELETE = withAdminAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Statistic ID is required' },
        { status: 400 }
      )
    }

    await prisma.siteSetting.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Statistic deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting stat:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete statistic' },
      { status: 500 }
    )
  }
})