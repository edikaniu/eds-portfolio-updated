import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Debug endpoint specifically for case studies without auth
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 DEBUG: Testing case studies specifically...')
    
    // Test basic database connection
    const dbTest = await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ Database connection test:', dbTest)
    
    // Check if case_studies table exists
    const tableCheck = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'case_studies'
    `
    console.log('📋 Table check result:', tableCheck)
    
    // Get total count
    const totalCount = await prisma.caseStudy.count()
    console.log('📊 Total case studies count:', totalCount)
    
    // Get all case studies data
    const allCaseStudies = await prisma.caseStudy.findMany({
      orderBy: { createdAt: 'desc' }
    })
    console.log('📝 All case studies found:', allCaseStudies.length)
    
    // Log each case study
    allCaseStudies.forEach((cs, index) => {
      console.log(`${index + 1}. ${cs.title} (${cs.category}) - Active: ${cs.isActive}`)
    })
    
    // Check for any records without filtering
    const rawQuery = await prisma.$queryRaw`SELECT COUNT(*) as total FROM case_studies`
    console.log('🔢 Raw query count:', rawQuery)
    
    return NextResponse.json({
      success: true,
      debug: true,
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        tableExists: Array.isArray(tableCheck) && tableCheck.length > 0,
        rawCount: rawQuery,
        prismaCount: totalCount
      },
      caseStudies: {
        total: allCaseStudies.length,
        active: allCaseStudies.filter(cs => cs.isActive).length,
        inactive: allCaseStudies.filter(cs => !cs.isActive).length,
        data: allCaseStudies.map(cs => ({
          id: cs.id,
          title: cs.title,
          slug: cs.slug,
          category: cs.category,
          isActive: cs.isActive,
          createdAt: cs.createdAt,
          hasMetrics: !!cs.metrics,
          hasResults: !!cs.results,
          hasTools: !!cs.tools,
          hasTimeline: !!cs.timeline
        }))
      },
      troubleshooting: {
        migration_run: 'Check if migration was successful',
        table_populated: allCaseStudies.length > 0,
        admin_api_issue: 'Compare with authenticated admin API response'
      }
    })
  } catch (error) {
    console.error('❌ DEBUG: Case studies error:', error)
    return NextResponse.json({
      success: false,
      debug: true,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}