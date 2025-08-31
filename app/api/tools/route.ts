import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createCachedResponse, CACHE_DURATIONS } from '@/lib/api-cache'

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

    return createCachedResponse({
      success: true,
      data: tools
    }, CACHE_DURATIONS.TOOLS)
  } catch (error) {
    console.error('Error fetching tools:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch tools' },
      { status: 500 }
    )
  }
}