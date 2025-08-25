import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { logger } from '@/lib/logger'
import nodemailer from 'nodemailer'

// Contact form schema validation
const ContactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
  email: z.string().email('Invalid email address').max(254, 'Email is too long'),
  subject: z.string().min(3, 'Subject must be at least 3 characters').max(200, 'Subject is too long'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000, 'Message is too long')
})

// Rate limiting store for contact form submissions
const submissionStore = new Map<string, { count: number; resetTime: number }>()
const CONTACT_RATE_LIMIT = {
  requests: 3,
  windowMs: 60 * 60 * 1000 // 3 requests per hour
}

function isContactRateLimited(clientId: string): boolean {
  const now = Date.now()
  const clientData = submissionStore.get(clientId)

  if (!clientData || now > clientData.resetTime) {
    submissionStore.set(clientId, { count: 1, resetTime: now + CONTACT_RATE_LIMIT.windowMs })
    return false
  }

  if (clientData.count >= CONTACT_RATE_LIMIT.requests) {
    return true
  }

  clientData.count++
  submissionStore.set(clientId, clientData)
  return false
}

function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
}

async function createEmailTransporter() {
  const smtpHost = process.env.SMTP_HOST
  const smtpPort = parseInt(process.env.SMTP_PORT || '587')
  const smtpUser = process.env.SMTP_USER
  const smtpPass = process.env.SMTP_PASS

  if (!smtpHost || !smtpUser || !smtpPass) {
    throw new Error('Email configuration incomplete. Please configure SMTP settings.')
  }

  return nodemailer.createTransporter({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass
    }
  })
}

function generateEmailContent(data: {
  name: string
  email: string
  subject: string
  message: string
}) {
  const timestamp = new Date().toLocaleString('en-US', {
    timeZone: 'UTC',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Contact Form Submission</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .content { background: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; }
        .field { margin-bottom: 15px; }
        .label { font-weight: bold; color: #374151; margin-bottom: 5px; display: block; }
        .value { background: white; padding: 10px; border-radius: 4px; border: 1px solid #d1d5db; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Contact Form Submission</h1>
          <p>Received on ${timestamp} UTC</p>
        </div>
        
        <div class="content">
          <div class="field">
            <label class="label">From:</label>
            <div class="value">${data.name} (${data.email})</div>
          </div>
          
          <div class="field">
            <label class="label">Subject:</label>
            <div class="value">${data.subject}</div>
          </div>
          
          <div class="field">
            <label class="label">Message:</label>
            <div class="value" style="white-space: pre-wrap;">${data.message}</div>
          </div>
        </div>
        
        <div class="footer">
          <p>This message was sent from the contact form on edikanudoibuot.com</p>
        </div>
      </div>
    </body>
    </html>
  `

  const textContent = `
New Contact Form Submission
Received on ${timestamp} UTC

From: ${data.name} (${data.email})
Subject: ${data.subject}

Message:
${data.message}

---
This message was sent from the contact form on edikanudoibuot.com
  `

  return { htmlContent, textContent }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting check
    const clientId = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    
    if (isContactRateLimited(clientId)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Too many contact form submissions. Please try again in an hour.',
          error: 'RATE_LIMIT_EXCEEDED'
        },
        { status: 429 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = ContactSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid form data',
          errors: validationResult.error.errors
        },
        { status: 400 }
      )
    }

    // Sanitize input data
    const sanitizedData = {
      name: sanitizeInput(validationResult.data.name),
      email: sanitizeInput(validationResult.data.email),
      subject: sanitizeInput(validationResult.data.subject),
      message: sanitizeInput(validationResult.data.message)
    }

    // Additional validation after sanitization
    if (!sanitizedData.name || !sanitizedData.email || !sanitizedData.subject || !sanitizedData.message) {
      return NextResponse.json(
        {
          success: false,
          message: 'All fields are required and must contain valid content'
        },
        { status: 400 }
      )
    }

    try {
      // Create email transporter
      const transporter = await createEmailTransporter()

      // Generate email content
      const { htmlContent, textContent } = generateEmailContent(sanitizedData)

      // Email configuration
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@edikanudoibuot.com'
      const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER

      // Send email to admin
      const mailOptions = {
        from: `"Portfolio Contact Form" <${fromEmail}>`,
        to: adminEmail,
        replyTo: sanitizedData.email,
        subject: `Portfolio Contact: ${sanitizedData.subject}`,
        text: textContent,
        html: htmlContent
      }

      await transporter.sendMail(mailOptions)

      // Send confirmation email to user
      const confirmationHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 20px; border-radius: 8px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Thank you for reaching out!</h1>
            </div>
            <div style="padding: 20px;">
              <p>Hi ${sanitizedData.name},</p>
              <p>Thank you for contacting me through my portfolio website. I've received your message about "${sanitizedData.subject}" and will get back to you within 24 hours.</p>
              <p>If you have any urgent questions, feel free to reach out to me directly at edikanudoibuot@gmail.com.</p>
              <p>Best regards,<br>Edikan Udoibuot</p>
            </div>
          </div>
        </body>
        </html>
      `

      const confirmationOptions = {
        from: `"Edikan Udoibuot" <${fromEmail}>`,
        to: sanitizedData.email,
        subject: 'Thanks for reaching out!',
        html: confirmationHtml
      }

      // Send confirmation email (don't fail if this fails)
      try {
        await transporter.sendMail(confirmationOptions)
      } catch (confirmationError) {
        logger.warn('Failed to send confirmation email', confirmationError, {
          userEmail: sanitizedData.email
        })
      }

      // Log successful submission
      logger.info('Contact form submission successful', {
        name: sanitizedData.name,
        email: sanitizedData.email,
        subject: sanitizedData.subject,
        clientId
      })

      return NextResponse.json({
        success: true,
        message: 'Message sent successfully! I\'ll get back to you within 24 hours.'
      })

    } catch (emailError) {
      logger.error('Failed to send contact form email', emailError, {
        name: sanitizedData.name,
        email: sanitizedData.email,
        subject: sanitizedData.subject
      })

      return NextResponse.json(
        {
          success: false,
          message: 'Failed to send message. Please try again or contact me directly at edikanudoibuot@gmail.com',
          error: 'EMAIL_SEND_FAILED'
        },
        { status: 500 }
      )
    }

  } catch (error) {
    logger.error('Contact form API error', error)
    
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error. Please try again later.',
        error: 'INTERNAL_ERROR'
      },
      { status: 500 }
    )
  }
}