import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // Use URLSearchParams instead of FormData for better compatibility
    const params = new URLSearchParams()
    params.append('email', email)
    
    const beehiivResponse = await fetch(
      'https://subscribe-forms.beehiiv.com/d6ed7510-b199-42ed-816a-ef341a71139c',
      {
        method: 'POST',
        body: params.toString(),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'Origin': process.env.NEXT_PUBLIC_BASE_URL || 'https://portfolio-main-ten-xi.vercel.app',
          'Referer': process.env.NEXT_PUBLIC_BASE_URL || 'https://portfolio-main-ten-xi.vercel.app',
        }
      }
    )

    console.log('Beehiiv response status:', beehiivResponse.status)
    console.log('Beehiiv response headers:', Object.fromEntries(beehiivResponse.headers.entries()))

    // Beehiiv typically redirects on successful submission
    if (beehiivResponse.ok || beehiivResponse.status === 302 || beehiivResponse.status === 301) {
      return NextResponse.json({
        success: true,
        message: 'Successfully subscribed! Please check your email to confirm your subscription.'
      })
    } else {
      const responseText = await beehiivResponse.text()
      console.error('Beehiiv submission failed:', beehiivResponse.status, beehiivResponse.statusText, responseText)
      
      return NextResponse.json(
        { success: false, error: 'Subscription failed. Please try again.' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Newsletter subscription error:', error)
    return NextResponse.json(
      { success: false, error: 'Server error. Please try again later.' },
      { status: 500 }
    )
  }
}