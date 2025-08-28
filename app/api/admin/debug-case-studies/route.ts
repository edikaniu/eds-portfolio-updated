import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Debug endpoint to check case studies without auth
export async function GET(request: NextRequest) {
  try {
    console.log('Debug: Fetching case studies from database...')
    
    // Test database connection
    const dbTest = await prisma.$queryRaw`SELECT 1 as test`
    console.log('Debug: Database connection test:', dbTest)
    
    // Get raw case studies count
    const caseStudyCount = await prisma.caseStudy.count()
    console.log('Debug: Case studies count:', caseStudyCount)
    
    // Get all case studies
    const caseStudies = await prisma.caseStudy.findMany({
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ]
    })
    
    console.log('Debug: Raw case studies from DB:', caseStudies.length, 'items')
    console.log('Debug: First case study:', caseStudies[0] ? {
      id: caseStudies[0].id,
      title: caseStudies[0].title,
      slug: caseStudies[0].slug,
      category: caseStudies[0].category,
      isActive: caseStudies[0].isActive,
      createdAt: caseStudies[0].createdAt
    } : 'None')
    
    // Parse JSON fields from strings
    const formattedCaseStudies = caseStudies.map(cs => {
      try {
        return {
          ...cs,
          metrics: cs.metrics ? JSON.parse(cs.metrics as string) : {},
          results: cs.results ? JSON.parse(cs.results as string) : [],
          tools: cs.tools ? JSON.parse(cs.tools as string) : [],
          timeline: cs.timeline ? JSON.parse(cs.timeline as string) : []
        }
      } catch (parseError) {
        console.error('Debug: JSON parse error for case study', cs.id, ':', parseError)
        return {
          ...cs,
          metrics: {},
          results: [],
          tools: [],
          timeline: []
        }
      }
    })
    
    console.log('Debug: Formatted case studies:', formattedCaseStudies.length, 'items')
    
    return NextResponse.json({
      success: true,
      debug: true,
      dbConnectionTest: dbTest,
      rawCount: caseStudyCount,
      rawCaseStudies: caseStudies.slice(0, 3), // First 3 raw items
      formattedCount: formattedCaseStudies.length,
      data: formattedCaseStudies
    })
  } catch (error) {
    console.error('Debug: Error fetching case studies:', error)
    return NextResponse.json({
      success: false,
      debug: true,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}