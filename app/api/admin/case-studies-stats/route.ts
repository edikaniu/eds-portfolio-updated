import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { withAdminAuth } from '@/lib/admin-middleware'
import { prisma } from '@/lib/prisma'

const CaseStudiesStatsSchema = z.object({
  usersScaled: z.string().min(1, 'Users scaled value is required'),
  subscribersGrowth: z.string().min(1, 'Subscribers growth value is required'),
  budgetScaled: z.string().min(1, 'Budget scaled value is required'),
  roas: z.string().min(1, 'ROAS value is required')
})

// GET - Fetch case studies statistics
export const GET = withAdminAuth(async (request: NextRequest) => {
  try {
    // Try to get existing stats from SiteSetting table
    const stats = await prisma.siteSetting.findMany({
      where: {
        settingKey: {
          in: ['case_studies_users_scaled', 'case_studies_subscribers_growth', 'case_studies_budget_scaled', 'case_studies_roas']
        }
      }
    })

    // Convert to object format
    const statsObj = {
      usersScaled: stats.find(s => s.settingKey === 'case_studies_users_scaled')?.settingValue || '200k+',
      subscribersGrowth: stats.find(s => s.settingKey === 'case_studies_subscribers_growth')?.settingValue || '733%',
      budgetScaled: stats.find(s => s.settingKey === 'case_studies_budget_scaled')?.settingValue || '$500k+',
      roas: stats.find(s => s.settingKey === 'case_studies_roas')?.settingValue || '5x'
    }

    return NextResponse.json({
      success: true,
      data: statsObj
    })
  } catch (error) {
    console.error('Error fetching case studies stats:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch case studies statistics' },
      { status: 500 }
    )
  }
})

// PUT - Update case studies statistics
export const PUT = withAdminAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const validationResult = CaseStudiesStatsSchema.safeParse(body)

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

    const { usersScaled, subscribersGrowth, budgetScaled, roas } = validationResult.data

    // Update or create settings
    const settingsToUpdate = [
      { key: 'case_studies_users_scaled', value: usersScaled, description: 'Case Studies - Users Scaled Statistic' },
      { key: 'case_studies_subscribers_growth', value: subscribersGrowth, description: 'Case Studies - Subscribers Growth Statistic' },
      { key: 'case_studies_budget_scaled', value: budgetScaled, description: 'Case Studies - Budget Scaled Statistic' },
      { key: 'case_studies_roas', value: roas, description: 'Case Studies - ROAS Statistic' }
    ]

    for (const setting of settingsToUpdate) {
      await prisma.siteSetting.upsert({
        where: { settingKey: setting.key },
        update: { settingValue: setting.value },
        create: {
          settingKey: setting.key,
          settingValue: setting.value,
          description: setting.description
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Case studies statistics updated successfully',
      data: {
        usersScaled,
        subscribersGrowth,
        budgetScaled,
        roas
      }
    })
  } catch (error) {
    console.error('Error updating case studies stats:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update case studies statistics' },
      { status: 500 }
    )
  }
})