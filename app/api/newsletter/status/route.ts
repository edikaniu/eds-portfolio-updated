import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const NEWSLETTER_SECTION_NAME = 'newsletter_settings'

// Get newsletter enabled status (public endpoint)
export async function GET(request: NextRequest) {
  try {
    // Try to get existing settings from database
    const existingSettings = await prisma.contentSection.findUnique({
      where: {
        sectionName: NEWSLETTER_SECTION_NAME
      }
    })

    if (!existingSettings) {
      // Return disabled by default if no settings found
      return NextResponse.json({
        success: true,
        data: {
          isEnabled: false
        }
      })
    }

    // Parse the stored JSON content
    const settings = JSON.parse(existingSettings.content)

    return NextResponse.json({
      success: true,
      data: {
        isEnabled: Boolean(settings.isEnabled)
      }
    })
  } catch (error) {
    console.error('Error reading newsletter status:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to load newsletter status' },
      { status: 500 }
    )
  }
}