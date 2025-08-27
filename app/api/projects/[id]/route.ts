import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Fetch single project by ID for frontend
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const project = await prisma.project.findFirst({
      where: {
        OR: [
          { id: id },
          { slug: id } // Allow access by slug as well
        ],
        isActive: true
      }
    })

    if (!project) {
      return NextResponse.json(
        { success: false, message: 'Project not found' },
        { status: 404 }
      )
    }

    // Transform data to match frontend expectations
    const transformedProject = {
      id: project.id,
      slug: project.slug,
      title: project.title,
      description: project.description,
      type: (project.category?.toLowerCase().includes('automation') || 
             project.category?.toLowerCase().includes('workflow') ||
             project.title.toLowerCase().includes('workflow') ||
             project.title.toLowerCase().includes('automation')) ? 'workflow' : 'tool',
      technologies: project.technologies ? JSON.parse(project.technologies) : [],
      image: project.image || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop&crop=center",
      githubUrl: project.githubUrl,
      liveUrl: project.liveUrl,
      category: project.category,
      order: project.order,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString()
    }

    return NextResponse.json({
      success: true,
      data: transformedProject
    })
  } catch (error) {
    console.error('Error fetching project:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch project' },
      { status: 500 }
    )
  }
}