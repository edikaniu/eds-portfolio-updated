import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Fetch all active tools for public use
export async function GET(request: NextRequest) {
  try {
    const tools = await prisma.tool.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        order: 'asc'
      }
    })

    return NextResponse.json({
      success: true,
      data: tools
    })
  } catch (error) {
    console.error('Error fetching tools:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch tools' },
      { status: 500 }
    )
  }
}