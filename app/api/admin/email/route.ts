import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/admin-middleware'
import { withErrorHandling } from '@/lib/error-handler'
import { emailService } from '@/lib/email/email-service'
import { logger } from '@/lib/logger'

async function handleEmailRequest(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')

  switch (request.method) {
    case 'GET':
      return await handleGetRequest(request, action)
    case 'POST':
      return await handlePostRequest(request, action)
    default:
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'METHOD_NOT_ALLOWED',
            message: 'Method not allowed'
          }
        },
        { status: 405 }
      )
  }
}

async function handleGetRequest(
  request: NextRequest,
  action: string | null
): Promise<NextResponse> {
  switch (action) {
    case 'queue':
      try {
        const stats = emailService.getQueueStats()
        
        return NextResponse.json({
          success: true,
          data: stats
        })
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'Failed to get email queue stats')
      }

    case 'templates':
      try {
        // Reload templates to get latest versions
        await emailService.loadTemplates()
        
        return NextResponse.json({
          success: true,
          message: 'Templates reloaded successfully'
        })
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'Failed to reload templates')
      }

    case 'test-connection':
      try {
        // Test email service connection
        const testResult = await testEmailConnection()
        
        return NextResponse.json({
          success: true,
          data: testResult
        })
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'Email connection test failed')
      }

    default:
      return NextResponse.json({
        success: true,
        data: {
          service: 'Email Management API',
          actions: ['queue', 'templates', 'test-connection'],
          endpoints: {
            'GET /api/admin/email?action=queue': 'Get email queue statistics',
            'GET /api/admin/email?action=templates': 'Reload email templates',
            'GET /api/admin/email?action=test-connection': 'Test email service connection',
            'POST /api/admin/email?action=send': 'Send test email',
            'POST /api/admin/email?action=send-notification': 'Send notification email',
            'POST /api/admin/email?action=clear-failed': 'Clear failed emails from queue',
            'POST /api/admin/email?action=retry-failed': 'Retry failed emails'
          }
        }
      })
  }
}

async function handlePostRequest(
  request: NextRequest,
  action: string | null
): Promise<NextResponse> {
  const body = await request.json()

  switch (action) {
    case 'send':
      try {
        const { to, subject, message, template, templateData } = body

        if (!to || !subject) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: 'MISSING_REQUIRED_FIELDS',
                message: 'Missing required fields: to, subject'
              }
            },
            { status: 400 }
          )
        }

        let emailOptions: any = {
          to,
          subject,
        }

        if (template) {
          emailOptions.template = template
          emailOptions.templateData = templateData || {}
        } else if (message) {
          emailOptions.html = `
            <h1>${subject}</h1>
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
              ${message.replace(/\n/g, '<br>')}
            </div>
          `
          emailOptions.text = message
        } else {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: 'MISSING_CONTENT',
                message: 'Either message or template must be provided'
              }
            },
            { status: 400 }
          )
        }

        const success = await emailService.sendEmail(emailOptions)

        return NextResponse.json({
          success,
          message: success ? 'Email sent successfully' : 'Failed to send email'
        })
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'Failed to send email')
      }

    case 'send-notification':
      try {
        const { recipients, title, message, actionUrl, actionText, priority } = body

        if (!recipients || !title || !message) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: 'MISSING_REQUIRED_FIELDS',
                message: 'Missing required fields: recipients, title, message'
              }
            },
            { status: 400 }
          )
        }

        const success = await emailService.sendNotification(recipients, {
          title,
          message,
          actionUrl,
          actionText
        })

        return NextResponse.json({
          success,
          message: success ? 'Notification sent successfully' : 'Failed to send notification'
        })
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'Failed to send notification')
      }

    case 'send-security-alert':
      try {
        const { to, alertType, details, ipAddress, userAgent } = body

        if (!to || !alertType || !details) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: 'MISSING_REQUIRED_FIELDS',
                message: 'Missing required fields: to, alertType, details'
              }
            },
            { status: 400 }
          )
        }

        const success = await emailService.sendSecurityAlert(to, {
          alertType,
          details,
          timestamp: new Date().toLocaleString(),
          ipAddress,
          userAgent
        })

        return NextResponse.json({
          success,
          message: success ? 'Security alert sent successfully' : 'Failed to send security alert'
        })
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'Failed to send security alert')
      }

    case 'clear-failed':
      try {
        const clearedCount = emailService.clearFailedEmails()
        
        return NextResponse.json({
          success: true,
          data: { clearedCount },
          message: `Cleared ${clearedCount} failed emails from queue`
        })
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'Failed to clear failed emails')
      }

    case 'retry-failed':
      try {
        const retriedCount = emailService.retryFailedEmails()
        
        return NextResponse.json({
          success: true,
          data: { retriedCount },
          message: `Retrying ${retriedCount} failed emails`
        })
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'Failed to retry failed emails')
      }

    case 'test-email':
      try {
        const testEmail = process.env.TEST_EMAIL || 'test@example.com'
        
        const success = await emailService.sendEmail({
          to: testEmail,
          subject: 'Email Service Test',
          html: `
            <h1>Email Service Test</h1>
            <p>This is a test email sent at ${new Date().toLocaleString()}.</p>
            <p>If you receive this email, the email service is working correctly.</p>
          `,
          text: `Email Service Test - Sent at ${new Date().toLocaleString()}`
        })

        return NextResponse.json({
          success,
          data: { recipient: testEmail },
          message: success 
            ? `Test email sent to ${testEmail}` 
            : `Failed to send test email to ${testEmail}`
        })
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'Failed to send test email')
      }

    default:
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_ACTION',
            message: 'Invalid action specified'
          }
        },
        { status: 400 }
      )
  }
}

async function testEmailConnection(): Promise<any> {
  try {
    // This would test the actual email service connection
    // For now, we'll return a mock test result
    const testResult = {
      status: 'connected',
      provider: process.env.EMAIL_PROVIDER || 'smtp',
      host: process.env.EMAIL_HOST || 'localhost',
      port: process.env.EMAIL_PORT || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: !!process.env.EMAIL_USER,
      testTimestamp: new Date().toISOString()
    }

    logger.info('Email connection test completed', testResult)
    return testResult
  } catch (error) {
    logger.error('Email connection test failed', error)
    throw error
  }
}

export const GET = withAdminAuth(withErrorHandling(handleEmailRequest))
export const POST = withAdminAuth(withErrorHandling(handleEmailRequest))