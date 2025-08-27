import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Fetch stats for skills section display
export async function GET(request: NextRequest) {
  try {
    // Try to get stats from database first
    const [skillCategories, tools] = await Promise.all([
      prisma.skillCategory.count({
        where: { isActive: true }
      }),
      prisma.tool.count({
        where: { isActive: true }
      })
    ])

    // Calculate stats based on database content
    const stats = {
      coreSkills: skillCategories > 0 ? `${skillCategories * 4}+` : '24+',
      professionalTools: tools > 0 ? `${tools}+` : '16+',
      yearsExperience: '7+'  // Static value based on experience
    }

    return NextResponse.json({
      success: true,
      data: stats
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    // Return fallback stats if database fails
    return NextResponse.json({
      success: true,
      data: {
        coreSkills: '24+',
        professionalTools: '16+',
        yearsExperience: '7+'
      }
    })
  }
}