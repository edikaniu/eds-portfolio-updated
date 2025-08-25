import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withCache, projectsCacheConfig } from '@/lib/cache/cache-middleware'
import { queryOptimizer } from '@/lib/cache/query-optimizer'
import { performanceMonitor } from '@/lib/performance/performance-monitor'

// GET - Fetch active projects for frontend
export const GET = withCache(projectsCacheConfig)(async function getProjects(request: NextRequest) {
  const timer = performanceMonitor.startTimer('projects_api_request')
  
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const featured = searchParams.get('featured') === 'true'
    const category = searchParams.get('category') || undefined
    const status = searchParams.get('status') || 'active'

    // Use optimized query
    const result = await queryOptimizer.getProjects({
      page,
      limit,
      featured: featured ? true : undefined,
      category,
      status
    })

    const projects = result.projects

    // Transform data to match frontend expectations
    const transformedProjects = projects.map((project: any) => ({
      id: project.id,
      slug: project.slug,
      title: project.title,
      description: project.description,
      type: (project.category?.toLowerCase().includes('automation') || 
             project.category?.toLowerCase().includes('workflow') ||
             project.title.toLowerCase().includes('workflow') ||
             project.title.toLowerCase().includes('automation')) ? 'workflow' : 'tool',
      technologies: project.technologies ? (typeof project.technologies === 'string' ? JSON.parse(project.technologies) : project.technologies) : [],
      image: project.image_url || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop&crop=center",
      status: project.status || "Live",
      demoUrl: project.demo_url,
      githubUrl: project.github_url,
    }))

    // Track API performance
    const duration = timer()
    performanceMonitor.trackApiEndpoint(
      'GET',
      '/api/projects',
      200,
      duration,
      JSON.stringify(transformedProjects).length
    )

    return NextResponse.json({
      success: true,
      data: transformedProjects,
      pagination: result.pagination
    })
  } catch (error) {
    const duration = timer()
    performanceMonitor.trackApiEndpoint('GET', '/api/projects', 500, duration)
    
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
})