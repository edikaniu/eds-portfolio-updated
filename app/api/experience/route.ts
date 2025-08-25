import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Fetch active experience entries for public display
export async function GET(request: NextRequest) {
  try {
    const experiences = await prisma.experienceEntry.findMany({
      where: {
        isActive: true
      },
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    // Parse JSON fields and format for frontend
    const formattedExperiences = experiences.map(exp => ({
      id: exp.id,
      title: exp.title,
      company: exp.company,
      period: exp.period,
      type: exp.type,
      category: exp.category,
      achievements: exp.achievements ? JSON.parse(exp.achievements) : [],
      metrics: exp.metrics,
      icon: exp.icon,
      color: exp.color,
      order: exp.order
    }))

    return NextResponse.json({
      success: true,
      data: formattedExperiences
    })
  } catch (error) {
    console.error('Error fetching public experience data:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch experience data' },
      { status: 500 }
    )
  }
}