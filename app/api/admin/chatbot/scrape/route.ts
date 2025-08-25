import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/admin-middleware'
import { prisma } from '@/lib/prisma'

// URL scraping handler for chatbot knowledge
export const POST = withAdminAuth(async (request: NextRequest) => {
  try {
    const { url } = await request.json()
    
    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Valid URL is required' },
        { status: 400 }
      )
    }

    // Validate URL format
    let validUrl: URL
    try {
      validUrl = new URL(url)
      if (!validUrl.protocol.startsWith('http')) {
        throw new Error('Invalid protocol')
      }
    } catch (urlError) {
      return NextResponse.json(
        { success: false, message: 'Invalid URL format' },
        { status: 400 }
      )
    }

    // Fetch URL content
    let content = ''
    let title = ''
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; ChatbotScraper/1.0)',
        },
        // 30 second timeout
        signal: AbortSignal.timeout(30000)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const html = await response.text()
      
      // Extract title
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
      title = titleMatch ? titleMatch[1].trim() : new URL(url).hostname

      // Basic HTML content extraction (remove HTML tags)
      // In a production app, you might want to use a more sophisticated HTML parser
      content = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // Remove scripts
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') // Remove styles
        .replace(/<[^>]+>/g, ' ') // Remove HTML tags
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim()

      // Limit content length
      if (content.length > 8000) {
        content = content.substring(0, 8000) + '...'
      }

      if (!content || content.length < 50) {
        throw new Error('No meaningful content found on the page')
      }
    } catch (fetchError) {
      console.error('Error fetching URL:', fetchError)
      return NextResponse.json(
        { success: false, message: `Failed to fetch URL: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}` },
        { status: 500 }
      )
    }

    // Create knowledge base entry
    const knowledge = await prisma.chatbotKnowledge.create({
      data: {
        title: title.substring(0, 200),
        content: content,
        category: 'web',
        sourceType: 'url',
        sourceFile: url,
        priority: 0,
        isActive: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'URL scraped and processed successfully',
      data: knowledge
    })
  } catch (error) {
    console.error('Error scraping URL:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to scrape URL' },
      { status: 500 }
    )
  }
})