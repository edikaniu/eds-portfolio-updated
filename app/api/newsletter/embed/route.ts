import { NextRequest, NextResponse } from 'next/server'
import { existsSync, readFileSync } from 'fs'
import { join } from 'path'

const NEWSLETTER_DATA_DIR = join(process.cwd(), 'data', 'newsletter')
const NEWSLETTER_FILE = join(NEWSLETTER_DATA_DIR, 'settings.json')

interface NewsletterSettings {
  embedCode: string
  attributionCode: string
  updatedAt: string
}

// Get newsletter embed code for public use
export async function GET(request: NextRequest) {
  try {
    if (!existsSync(NEWSLETTER_FILE)) {
      return NextResponse.json(
        { success: false, error: 'Newsletter settings not configured' },
        { status: 404 }
      )
    }

    const fileContent = readFileSync(NEWSLETTER_FILE, 'utf-8')
    const settings: NewsletterSettings = JSON.parse(fileContent)

    if (!settings.embedCode) {
      return NextResponse.json(
        { success: false, error: 'Newsletter embed code not configured' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        embedCode: settings.embedCode,
        attributionCode: settings.attributionCode || ''
      }
    })
  } catch (error) {
    console.error('Error reading newsletter embed code:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to load newsletter configuration' },
      { status: 500 }
    )
  }
}