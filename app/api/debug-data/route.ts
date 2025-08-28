import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Debug endpoint to check database data including case studies
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 DEBUG: Checking all database content...')
    
    // Get all content types
    const [skillCategories, tools, experience, blogPosts, caseStudies, projects] = await Promise.all([
      prisma.skillCategory.findMany({
        where: { isActive: true }
      }),
      prisma.tool.findMany({
        where: { isActive: true }
      }),
      prisma.experienceEntry.findMany({
        where: { isActive: true }
      }),
      prisma.blogPost.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.caseStudy.findMany({
        orderBy: { createdAt: 'desc' }
      }),
      prisma.project.findMany({
        where: { isActive: true },
        take: 5,
        orderBy: { createdAt: 'desc' }
      })
    ])

    console.log('📊 Content counts:', {
      skillCategories: skillCategories.length,
      tools: tools.length,
      experience: experience.length,
      blogPosts: blogPosts.length,
      caseStudies: caseStudies.length,
      projects: projects.length
    })

    // Log case studies details
    caseStudies.forEach(cs => {
      console.log(`📝 Case Study: ${cs.title} (${cs.category}) - Active: ${cs.isActive}`)
    })

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
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
        },
        blogPosts: {
          count: blogPosts.length,
          samples: blogPosts.slice(0, 3).map(p => ({ id: p.id, title: p.title, slug: p.slug }))
        },
        caseStudies: {
          count: caseStudies.length,
          totalActive: caseStudies.filter(cs => cs.isActive).length,
          samples: caseStudies.slice(0, 5).map(cs => ({ 
            id: cs.id, 
            title: cs.title, 
            slug: cs.slug, 
            category: cs.category,
            isActive: cs.isActive,
            createdAt: cs.createdAt
          }))
        },
        projects: {
          count: projects.length,
          samples: projects.slice(0, 3).map(p => ({ id: p.id, title: p.title, slug: p.slug }))
        }
      },
      notes: [
        'This shows all database content for debugging',
        'Focus on case studies count and samples',
        'Check if migration data exists in database'
      ]
    })
  } catch (error) {
    console.error('❌ DEBUG: Database error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      data: {
        skillCategories: { count: 0, samples: [] },
        tools: { count: 0, samples: [] },
        experience: { count: 0, samples: [] },
        blogPosts: { count: 0, samples: [] },
        caseStudies: { count: 0, samples: [] },
        projects: { count: 0, samples: [] }
      }
    })
  }
}