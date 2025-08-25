import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Fetch public statistics
export async function GET(request: NextRequest) {
  try {
    // Fetch all statistics
    const stats = await prisma.siteSetting.findMany({
      where: {
        settingKey: {
          in: [
            'core_skills_stat',
            'professional_tools_stat', 
            'years_experience_stat',
            'users_scaled_stat',
            'subscribers_growth_stat',
            'budget_scaled_stat',
            'roas_stat'
          ]
        }
      }
    })

    // Convert to key-value object
    const statsObject = stats.reduce((acc, stat) => {
      acc[stat.settingKey] = stat.settingValue
      return acc
    }, {} as Record<string, string>)

    return NextResponse.json({
      success: true,
      data: {
        coreSkills: statsObject.core_skills_stat || '24+',
        professionalTools: statsObject.professional_tools_stat || '16+',
        yearsExperience: statsObject.years_experience_stat || '7+',
        usersScaled: statsObject.users_scaled_stat || '200k+',
        subscribersGrowth: statsObject.subscribers_growth_stat || '733%',
        budgetScaled: statsObject.budget_scaled_stat || '$500k+',
        roas: statsObject.roas_stat || '5x'
      }
    })
  } catch (error) {
    console.error('Error fetching public stats:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}