import { NextRequest, NextResponse } from 'next/server'
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

const NEWSLETTER_DATA_DIR = join(process.cwd(), 'data', 'newsletter')
const NEWSLETTER_FILE = join(NEWSLETTER_DATA_DIR, 'settings.json')

interface NewsletterSettings {
  embedCode: string
  attributionCode: string
  updatedAt: string
}

// Ensure data directory exists
function ensureDataDir() {
  if (!existsSync(NEWSLETTER_DATA_DIR)) {
    mkdirSync(NEWSLETTER_DATA_DIR, { recursive: true })
  }
}

// Get newsletter settings
export async function GET(request: NextRequest) {
  try {
    ensureDataDir()
    
    if (!existsSync(NEWSLETTER_FILE)) {
      // Return default settings if file doesn't exist
      return NextResponse.json({
        success: true,
        data: {
          embedCode: '',
          attributionCode: '',
          updatedAt: new Date().toISOString()
        }
      })
    }

    const fileContent = readFileSync(NEWSLETTER_FILE, 'utf-8')
    const settings: NewsletterSettings = JSON.parse(fileContent)

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
    const { embedCode, attributionCode } = await request.json()

    if (!embedCode || typeof embedCode !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Embed code is required' },
        { status: 400 }
      )
    }

    ensureDataDir()

    const settings: NewsletterSettings = {
      embedCode: embedCode.trim(),
      attributionCode: attributionCode?.trim() || '',
      updatedAt: new Date().toISOString()
    }

    writeFileSync(NEWSLETTER_FILE, JSON.stringify(settings, null, 2))

    return NextResponse.json({
      success: true,
      message: 'Newsletter settings saved successfully',
      data: settings
    })
  } catch (error) {
    console.error('Error saving newsletter settings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save newsletter settings' },
      { status: 500 }
    )
  }
}