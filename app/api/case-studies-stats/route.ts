import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Fetch case studies statistics
export async function GET(request: NextRequest) {
  try {
    // For now, return static stats that match the seeded case studies
    // In the future, these could be calculated from actual case study data
    const stats = {
      usersScaled: '200k+',
      subscribersGrowth: '733%', 
      budgetScaled: '$500k+',
      roas: '5x'
    }

    return NextResponse.json({
      success: true,
      data: stats
    })
  } catch (error) {
    console.error('Error fetching case studies stats:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}