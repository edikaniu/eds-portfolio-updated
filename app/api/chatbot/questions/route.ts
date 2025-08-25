import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Public endpoint to fetch predefined chatbot questions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '10')

    const where: any = {
      isActive: true
    }

    if (category && category !== 'all') {
      where.category = category
    }

    const questions = await prisma.chatbotQuestion.findMany({
      where,
      orderBy: [
        { order: 'asc' },
        { usageCount: 'desc' }
      ],
      take: limit,
      select: {
        id: true,
        questionText: true,
        icon: true,
        category: true
      }
    })

    return NextResponse.json({
      success: true,
      data: questions
    })
  } catch (error) {
    console.error('Error fetching questions:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch questions' },
      { status: 500 }
    )
  }
}