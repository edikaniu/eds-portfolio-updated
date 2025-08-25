import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAdminAuth } from '@/lib/admin-middleware'
import { z } from 'zod'
import { generateSlug, ensureUniqueSlug } from '@/lib/slug-utils'

const ProjectSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  image: z.string().url().optional().or(z.literal('')),
  technologies: z.string(),
  githubUrl: z.string().url().optional().or(z.literal('')),
  liveUrl: z.string().url().optional().or(z.literal('')),
  category: z.string().optional(),
  order: z.number().int().default(0),
  isActive: z.boolean().default(true)
})

// GET - Fetch all projects
export const GET = withAdminAuth(async (request: NextRequest, user: any) => {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search')

    const where: any = {}
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } }
      ]
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

    return NextResponse.json({
      success: true,
      data: projects,
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
})

// POST - Create new project
export const POST = withAdminAuth(async (request: NextRequest, user: any) => {
  try {
    const body = await request.json()
    
    const validationResult = ProjectSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid input data',
          errors: validationResult.error.errors
        },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Generate unique slug
    const baseSlug = generateSlug(data.title)
    const existingSlugs = await prisma.project.findMany({
      select: { slug: true }
    }).then(results => results.map(r => r.slug))
    const uniqueSlug = ensureUniqueSlug(baseSlug, existingSlugs)

    const project = await prisma.project.create({
      data: {
        title: data.title,
        slug: uniqueSlug,
        description: data.description,
        image: data.image || null,
        technologies: data.technologies,
        githubUrl: data.githubUrl || null,
        liveUrl: data.liveUrl || null,
        category: data.category || null,
        order: data.order,
        isActive: data.isActive
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Project created successfully',
      data: project
    })
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create project' },
      { status: 500 }
    )
  }
})

// PUT - Update project
export const PUT = withAdminAuth(async (request: NextRequest, user: any) => {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Project ID is required' },
        { status: 400 }
      )
    }

    const validationResult = ProjectSchema.partial().safeParse(updateData)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid input data',
          errors: validationResult.error.errors
        },
        { status: 400 }
      )
    }

    const data = validationResult.data

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...data,
        image: data.image || null,
        githubUrl: data.githubUrl || null,
        liveUrl: data.liveUrl || null,
        category: data.category || null,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Project updated successfully',
      data: project
    })
  } catch (error) {
    console.error('Error updating project:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update project' },
      { status: 500 }
    )
  }
})

// DELETE - Delete project
export const DELETE = withAdminAuth(async (request: NextRequest, user: any) => {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Project ID is required' },
        { status: 400 }
      )
    }

    await prisma.project.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Project deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete project' },
      { status: 500 }
    )
  }
})