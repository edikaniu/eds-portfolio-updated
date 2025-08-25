import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/admin-middleware'
import { prisma } from '@/lib/prisma'

// GET - Fetch dashboard statistics
export const GET = withAdminAuth(async (request: NextRequest) => {
  try {
    // Get knowledge base count
    const knowledgeItems = await prisma.chatbotKnowledge.count({
      where: { isActive: true }
    })

    // Get conversations count
    const conversations = await prisma.chatbotConversation.count()

    // Get case studies count
    const caseStudies = await prisma.caseStudy.count({
      where: { isActive: true }
    })

    // Count content sections (hero, about, experience, etc.)
    const contentSections = 6 // Static for now: hero, about, experience, skills, projects, contact

    return NextResponse.json({
      success: true,
      data: {
        knowledgeItems,
        conversations,
        caseStudies,
        contentSections
      }
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    )
  }
})