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

    // Submit to Beehive's form endpoint using server-side fetch
    const formData = new FormData()
    formData.append('email', email)
    
    const beehiveResponse = await fetch(
      'https://subscribe-forms.beehiiv.com/d6ed7510-b199-42ed-816a-ef341a71139c',
      {
        method: 'POST',
        body: formData,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
        }
      }
    )

    if (beehiveResponse.ok || beehiveResponse.status === 302) {
      // Success or redirect (which Beehive typically does after successful submission)
      return NextResponse.json({
        success: true,
        message: 'Successfully subscribed! Please check your email to confirm your subscription.'
      })
    } else {
      console.error('Beehive submission failed:', beehiveResponse.status, beehiveResponse.statusText)
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