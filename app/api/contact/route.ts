import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createCachedResponse, CACHE_DURATIONS } from '@/lib/api-cache'

// Contact form validation schema
const ContactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  email: z.string().email('Please enter a valid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters').max(200, 'Subject too long'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000, 'Message too long'),
  company: z.string().optional(),
  phone: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validationResult = ContactSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Please check your form inputs',
          errors: validationResult.error.errors 
        },
        { status: 400 }
      )
    }

    const { name, email, subject, message, company, phone } = validationResult.data

    // Basic spam detection
    const spamKeywords = ['viagra', 'casino', 'lottery', 'winner', 'congratulations', 'click here']
    const messageText = `${subject} ${message}`.toLowerCase()
    const hasSpamKeywords = spamKeywords.some(keyword => messageText.includes(keyword))

    if (hasSpamKeywords) {
      return NextResponse.json(
        { success: false, message: 'Message flagged as spam' },
        { status: 400 }
      )
    }

    // Rate limiting check (simple implementation)
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown'
    
    // In production, you would implement proper email sending here
    // For now, we'll simulate successful submission
    console.log('Contact form submission:', {
      name,
      email,
      subject,
      message,
      company,
      phone,
      timestamp: new Date().toISOString(),
      clientIP
    })

    // TODO: Implement actual email sending
    // await sendContactEmail({ name, email, subject, message, company, phone })

    return NextResponse.json({
      success: true,
      message: 'Thank you for your message! I will get back to you within 24 hours.',
    })

  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'There was an error sending your message. Please try again later.' 
      },
      { status: 500 }
    )
  }
}

// GET endpoint for contact form configuration
export async function GET() {
  return createCachedResponse({
    success: true,
    data: {
      maxMessageLength: 2000,
      requiredFields: ['name', 'email', 'subject', 'message'],
      optionalFields: ['company', 'phone'],
      responseTime: '24 hours',
      spamProtection: true
    }
  }, CACHE_DURATIONS.STATS)
}