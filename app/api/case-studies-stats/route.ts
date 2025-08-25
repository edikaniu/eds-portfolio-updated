import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Fetch case studies statistics for public use
export async function GET(request: NextRequest) {
  try {
    // Get stats from SiteSetting table
    const stats = await prisma.siteSetting.findMany({
      where: {
        settingKey: {
          in: ['case_studies_users_scaled', 'case_studies_subscribers_growth', 'case_studies_budget_scaled', 'case_studies_roas']
        }
      }
    })

    // Convert to object format with default values
    const statsData = {
      usersScaled: stats.find(s => s.settingKey === 'case_studies_users_scaled')?.settingValue || '200k+',
      subscribersGrowth: stats.find(s => s.settingKey === 'case_studies_subscribers_growth')?.settingValue || '733%',
      budgetScaled: stats.find(s => s.settingKey === 'case_studies_budget_scaled')?.settingValue || '$500k+',
      roas: stats.find(s => s.settingKey === 'case_studies_roas')?.settingValue || '5x'
    }

    return NextResponse.json({
      success: true,
      data: statsData
    })
  } catch (error) {
    console.error('Error fetching case studies stats:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch case studies statistics' },
      { status: 500 }
    )
  }
}