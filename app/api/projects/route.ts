import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Fetch active projects for frontend
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const category = searchParams.get('category') || undefined

    const where: any = {
      isActive: true
    }
    
    if (category) {
      where.category = {
        contains: category,
        mode: 'insensitive'
      }
    }

    const projects = await prisma.project.findMany({
      where,
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ],
      skip: (page - 1) * limit,
      take: limit
    })

    const totalCount = await prisma.project.count({ where })

    // Transform data to match frontend expectations
    const transformedProjects = projects.map((project) => ({
      id: project.id,
      slug: project.slug,
      title: project.title,
      description: project.description,
      type: (project.category?.toLowerCase().includes('automation') || 
             project.category?.toLowerCase().includes('workflow') ||
             project.title.toLowerCase().includes('workflow') ||
             project.title.toLowerCase().includes('automation')) ? 'workflow' : 'tool',
      technologies: project.technologies ? JSON.parse(project.technologies) : [],
      image: project.image || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop&crop=center",
      status: "Live",
      githubUrl: project.githubUrl,
      liveUrl: project.liveUrl,
    }))

    return NextResponse.json({
      success: true,
      data: transformedProjects,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}