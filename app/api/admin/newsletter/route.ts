import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface NewsletterSettings {
  embedCode: string
  attributionCode: string
  isEnabled: boolean
  updatedAt: string
}

const NEWSLETTER_SECTION_NAME = 'newsletter_settings'

// Get newsletter settings
export async function GET(request: NextRequest) {
  try {
    console.log('GET newsletter settings request received')
    
    // Try to get existing settings from database
    const existingSettings = await prisma.contentSection.findUnique({
      where: {
        sectionName: NEWSLETTER_SECTION_NAME
      }
    })

    if (!existingSettings) {
      console.log('Newsletter settings not found in database, returning defaults')
      // Return default settings if not found
      return NextResponse.json({
        success: true,
        data: {
          embedCode: '',
          attributionCode: '',
          isEnabled: false,
          updatedAt: new Date().toISOString()
        }
      })
    }

    // Parse the stored JSON content
    const settings: NewsletterSettings = JSON.parse(existingSettings.content)
    console.log('Newsletter settings loaded successfully from database')

    return NextResponse.json({
      success: true,
      data: settings
    })
  } catch (error) {
    console.error('Error reading newsletter settings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to load newsletter settings' },
      { status: 500 }
    )
  }
}

// Save newsletter settings
export async function POST(request: NextRequest) {
  try {
    console.log('POST newsletter settings request received')
    
    const body = await request.json()
    console.log('Request body received:', { 
      hasEmbedCode: !!body.embedCode, 
      hasAttributionCode: !!body.attributionCode,
      isEnabled: body.isEnabled
    })
    
    const { embedCode, attributionCode, isEnabled } = body

    // Only validate embed code if newsletter is being enabled
    if (isEnabled && (!embedCode || typeof embedCode !== 'string' || embedCode.trim().length === 0)) {
      console.log('Validation failed: embed code missing or invalid when enabling newsletter')
      return NextResponse.json(
        { success: false, error: 'Beehiiv embed code is required when newsletter is enabled' },
        { status: 400 }
      )
    }

    const settings: NewsletterSettings = {
      embedCode: embedCode?.trim() || '',
      attributionCode: attributionCode?.trim() || '',
      isEnabled: Boolean(isEnabled),
      updatedAt: new Date().toISOString()
    }

    console.log('Saving settings to database...')
    
    // Use upsert to either create or update the settings
    await prisma.contentSection.upsert({
      where: {
        sectionName: NEWSLETTER_SECTION_NAME
      },
      update: {
        content: JSON.stringify(settings),
        metadata: 'Beehiiv newsletter integration settings',
        updatedAt: new Date()
      },
      create: {
        sectionName: NEWSLETTER_SECTION_NAME,
        content: JSON.stringify(settings),
        metadata: 'Beehiiv newsletter integration settings',
        isActive: true
      }
    })
    
    console.log('Settings saved successfully to database')

    return NextResponse.json({
      success: true,
      message: 'Newsletter settings saved successfully',
      data: settings
    })
  } catch (error) {
    console.error('Error saving newsletter settings:', error)
    return NextResponse.json(
      { success: false, error: `Failed to save newsletter settings: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}