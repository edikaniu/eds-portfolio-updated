import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Debug endpoint to check database data
export async function GET(request: NextRequest) {
  try {
    const [skillCategories, tools, experience] = await Promise.all([
      prisma.skillCategory.findMany({
        where: { isActive: true }
      }),
      prisma.tool.findMany({
        where: { isActive: true }
      }),
      prisma.experienceEntry.findMany({
        where: { isActive: true }
      })
    ])

    return NextResponse.json({
      success: true,
      data: {
        skillCategories: {
          count: skillCategories.length,
          samples: skillCategories.slice(0, 2).map(c => ({ id: c.id, title: c.title }))
        },
        tools: {
          count: tools.length,
          samples: tools.slice(0, 3).map(t => ({ id: t.id, name: t.name }))
        },
        experience: {
          count: experience.length,
          samples: experience.slice(0, 2).map(e => ({ id: e.id, title: e.title, company: e.company }))
        }
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: {
        skillCategories: { count: 0, samples: [] },
        tools: { count: 0, samples: [] },
        experience: { count: 0, samples: [] }
      }
    })
  }
}