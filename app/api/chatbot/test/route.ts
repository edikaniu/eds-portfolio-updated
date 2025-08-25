import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Test knowledge base
    const knowledgeCount = await prisma.chatbotKnowledge.count({
      where: { isActive: true }
    })

    // Test questions
    const questionsCount = await prisma.chatbotQuestion.count({
      where: { isActive: true }
    })

    // Test settings
    const settings = await prisma.chatbotSettings.findFirst()

    return NextResponse.json({
      success: true,
      data: {
        knowledgeItems: knowledgeCount,
        questions: questionsCount,
        hasSettings: !!settings,
        aiEnabled: settings?.isActive || false
      }
    })
  } catch (error) {
    console.error('Chatbot test error:', error)
    return NextResponse.json(
      { success: false, message: 'Chatbot test failed', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}