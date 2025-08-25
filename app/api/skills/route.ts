import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Fetch active skill categories for public display
export async function GET(request: NextRequest) {
  try {
    const skillCategories = await prisma.skillCategory.findMany({
      where: {
        isActive: true
      },
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    // Parse JSON fields and format for frontend
    const formattedCategories = skillCategories.map(category => ({
      id: category.id,
      title: category.title,
      description: category.description,
      color: category.color,
      skills: category.skills ? JSON.parse(category.skills) : [],
      order: category.order
    }))

    return NextResponse.json({
      success: true,
      data: formattedCategories
    })
  } catch (error) {
    console.error('Error fetching public skills data:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch skills data' },
      { status: 500 }
    )
  }
}