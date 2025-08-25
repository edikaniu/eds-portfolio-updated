import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { withAdminAuth } from '@/lib/admin-middleware'
import { prisma } from '@/lib/prisma'
import { generateSlug, ensureUniqueSlug } from '@/lib/slug-utils'

const CaseStudySchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  subtitle: z.string().min(1, 'Subtitle is required').max(300, 'Subtitle too long'),
  description: z.string().min(1, 'Description is required').max(2000, 'Description too long'),
  fullDescription: z.string().min(1, 'Full description is required'),
  image: z.string().optional().or(z.literal('')),
  metrics: z.string().default('{}'),
  results: z.array(z.string()).default([]),
  tools: z.array(z.string()).default([]),
  category: z.string().min(1, 'Category is required'),
  color: z.string().default('#3B82F6'),
  challenge: z.string().min(1, 'Challenge is required'),
  solution: z.string().min(1, 'Solution is required'),
  timeline: z.array(z.string()).default([]),
  order: z.number().min(0).default(0)
})

// GET - Fetch all case studies
export const GET = withAdminAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('includeInactive') === 'true'

    const where: any = {}
    if (!includeInactive) {
      where.isActive = true
    }

    const caseStudies = await prisma.caseStudy.findMany({
      where,
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    // Parse JSON fields from strings
    const formattedCaseStudies = caseStudies.map(cs => ({
      ...cs,
      metrics: cs.metrics ? JSON.parse(cs.metrics as string) : {},
      results: cs.results ? JSON.parse(cs.results as string) : [],
      tools: cs.tools ? JSON.parse(cs.tools as string) : [],
      timeline: cs.timeline ? JSON.parse(cs.timeline as string) : []
    }))

    return NextResponse.json({
      success: true,
      data: formattedCaseStudies
    })
  } catch (error) {
    console.error('Error fetching case studies:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch case studies' },
      { status: 500 }
    )
  }
})

// POST - Create new case study
export const POST = withAdminAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const validationResult = CaseStudySchema.safeParse(body)

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

    const { title, subtitle, description, fullDescription, image, metrics, results, tools, category, color, challenge, solution, timeline, order } = validationResult.data

    // Generate unique slug
    const baseSlug = generateSlug(title)
    const existingSlugs = await prisma.caseStudy.findMany({
      select: { slug: true }
    }).then(results => results.map(r => r.slug))
    const uniqueSlug = ensureUniqueSlug(baseSlug, existingSlugs)

    const caseStudy = await prisma.caseStudy.create({
      data: {
        title,
        slug: uniqueSlug,
        subtitle,
        description,
        fullDescription,
        image: image || null,
        metrics: typeof metrics === 'string' ? metrics : JSON.stringify(metrics),
        results: JSON.stringify(results),
        tools: JSON.stringify(tools),
        category,
        color,
        challenge,
        solution,
        timeline: JSON.stringify(timeline),
        order,
        isActive: true
      }
    })

    // Format response with parsed JSON fields
    const formattedCaseStudy = {
      ...caseStudy,
      metrics: caseStudy.metrics ? JSON.parse(caseStudy.metrics as string) : {},
      results: caseStudy.results ? JSON.parse(caseStudy.results as string) : [],
      tools: caseStudy.tools ? JSON.parse(caseStudy.tools as string) : [],
      timeline: caseStudy.timeline ? JSON.parse(caseStudy.timeline as string) : []
    }

    return NextResponse.json({
      success: true,
      message: 'Case study created successfully',
      data: formattedCaseStudy
    })
  } catch (error) {
    console.error('Error creating case study:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create case study' },
      { status: 500 }
    )
  }
})

// PUT - Update case study
export const PUT = withAdminAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Case study ID is required' },
        { status: 400 }
      )
    }

    const validationResult = CaseStudySchema.partial().safeParse(updateData)
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

    const updatePayload: any = { ...validationResult.data }
    
    // Handle array serialization
    if (updatePayload.results) {
      updatePayload.results = JSON.stringify(updatePayload.results)
    }
    if (updatePayload.tools) {
      updatePayload.tools = JSON.stringify(updatePayload.tools)
    }
    if (updatePayload.timeline) {
      updatePayload.timeline = JSON.stringify(updatePayload.timeline)
    }
    if (updatePayload.metrics && typeof updatePayload.metrics !== 'string') {
      updatePayload.metrics = JSON.stringify(updatePayload.metrics)
    }

    // Handle empty string values
    if (updatePayload.image === '') updatePayload.image = null

    const caseStudy = await prisma.caseStudy.update({
      where: { id },
      data: {
        ...updatePayload,
        updatedAt: new Date()
      }
    })

    // Format response with parsed JSON fields
    const formattedCaseStudy = {
      ...caseStudy,
      metrics: caseStudy.metrics ? JSON.parse(caseStudy.metrics as string) : {},
      results: caseStudy.results ? JSON.parse(caseStudy.results as string) : [],
      tools: caseStudy.tools ? JSON.parse(caseStudy.tools as string) : [],
      timeline: caseStudy.timeline ? JSON.parse(caseStudy.timeline as string) : []
    }

    return NextResponse.json({
      success: true,
      message: 'Case study updated successfully',
      data: formattedCaseStudy
    })
  } catch (error) {
    console.error('Error updating case study:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update case study' },
      { status: 500 }
    )
  }
})

// DELETE - Delete case study
export const DELETE = withAdminAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Case study ID is required' },
        { status: 400 }
      )
    }

    await prisma.caseStudy.update({
      where: { id },
      data: { isActive: false }
    })

    return NextResponse.json({
      success: true,
      message: 'Case study deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting case study:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete case study' },
      { status: 500 }
    )
  }
})