import nodemailer from 'nodemailer'
import { logger } from '../logger'
import { auditLogger } from '../audit-logger'
// Removed fs and path imports - not compatible with Vercel serverless
import Handlebars from 'handlebars'

export interface EmailOptions {
  to: string | string[]
  subject: string
  template?: string
  templateData?: Record<string, any>
  html?: string
  text?: string
  attachments?: Array<{
    filename: string
    path?: string
    content?: Buffer
    contentType?: string
  }>
  priority?: 'high' | 'normal' | 'low'
  replyTo?: string
  cc?: string | string[]
  bcc?: string | string[]
}

export interface EmailTemplate {
  name: string
  subject: string
  html: string
  text?: string
}

export interface EmailQueue {
  id: string
  email: EmailOptions
  attempts: number
  maxAttempts: number
  nextAttempt: Date
  status: 'pending' | 'sent' | 'failed'
  error?: string
  createdAt: Date
}

class EmailService {
  private static instance: EmailService
  private transporter: nodemailer.Transporter
  private templates = new Map<string, EmailTemplate>()
  private queue: EmailQueue[] = []
  private processing = false

  private constructor() {
    this.initializeTransporter()
    this.loadTemplates()
    // Removed startQueueProcessor() - not compatible with Vercel serverless
  }

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService()
    }
    return EmailService.instance
  }

  private async initializeTransporter() {
    const config = this.getEmailConfig()

    this.transporter = nodemailer.createTransporter(config)

    // Verify connection
    try {
      await this.transporter.verify()
      logger.info('Email service initialized successfully')
    } catch (error) {
      logger.error('Email service initialization failed', error)
    }
  }

  private getEmailConfig() {
    const provider = process.env.EMAIL_PROVIDER || 'smtp'

    switch (provider) {
      case 'gmail':
        return {
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_APP_PASSWORD,
          },
        }

      case 'sendgrid':
        return {
          host: 'smtp.sendgrid.net',
          port: 587,
          auth: {
            user: 'apikey',
            pass: process.env.SENDGRID_API_KEY,
          },
        }

      case 'mailgun':
        return {
          host: 'smtp.mailgun.org',
          port: 587,
          auth: {
            user: process.env.MAILGUN_USERNAME,
            pass: process.env.MAILGUN_PASSWORD,
          },
        }

      case 'ses':
        return {
          host: 'email-smtp.us-west-2.amazonaws.com',
          port: 587,
          auth: {
            user: process.env.AWS_SES_ACCESS_KEY,
            pass: process.env.AWS_SES_SECRET_KEY,
          },
        }

      default: // SMTP
        return {
          host: process.env.EMAIL_HOST || 'localhost',
          port: parseInt(process.env.EMAIL_PORT || '587'),
          secure: process.env.EMAIL_SECURE === 'true',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
          },
          tls: {
            rejectUnauthorized: false,
          },
        }
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const emailData = await this.prepareEmail(options)
      
      // Send email immediately (Vercel serverless compatible)
      const result = await this.transporter.sendMail(emailData)
      
      logger.info('Email sent successfully', {
        to: options.to,
        subject: options.subject,
        messageId: result.messageId,
      })

      // Log for audit purposes
      await auditLogger.logSystemEvent(
        'email_sent',
        'low',
        {
          to: options.to,
          subject: options.subject,
          messageId: result.messageId,
        }
      )

      return true
    } catch (error) {
      logger.error('Failed to send email', { error, options })
      
      // Log failure for audit purposes
      await auditLogger.logSystemEvent(
        'email_failed',
        'high',
        {
          to: options.to,
          subject: options.subject,
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      )
      
      return false
    }
  }

  private async prepareEmail(options: EmailOptions) {
    let html = options.html
    let text = options.text
    let subject = options.subject

    // Use template if specified
    if (options.template) {
      const template = await this.getTemplate(options.template)
      if (template) {
        const compiledHtml = Handlebars.compile(template.html)
        const compiledText = template.text ? Handlebars.compile(template.text) : null
        const compiledSubject = Handlebars.compile(template.subject)

        html = compiledHtml(options.templateData || {})
        text = compiledText ? compiledText(options.templateData || {}) : undefined
        subject = compiledSubject(options.templateData || {})
      }
    }

    return {
      from: process.env.EMAIL_FROM || 'noreply@yoursite.com',
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject,
      html,
      text,
      cc: Array.isArray(options.cc) ? options.cc.join(', ') : options.cc,
      bcc: Array.isArray(options.bcc) ? options.bcc.join(', ') : options.bcc,
      replyTo: options.replyTo,
      attachments: options.attachments,
      priority: options.priority || 'normal',
    }
  }

  private async processQueue() {
    if (this.processing) return
    this.processing = true

    try {
      while (this.queue.length > 0) {
        const pendingEmails = this.queue.filter(
          item => item.status === 'pending' && item.nextAttempt <= new Date()
        )

        if (pendingEmails.length === 0) break

        for (const queueItem of pendingEmails) {
          await this.processQueueItem(queueItem)
        }

        // Remove sent and failed emails
        this.queue = this.queue.filter(
          item => item.status === 'pending' && item.attempts < item.maxAttempts
        )

        // Wait before next batch
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    } finally {
      this.processing = false
    }
  }

  private async processQueueItem(queueItem: EmailQueue) {
    try {
      queueItem.attempts++

      const emailData = await this.prepareEmail(queueItem.email)
      const result = await this.transporter.sendMail(emailData)

      queueItem.status = 'sent'

      // Log successful delivery
      await auditLogger.logSystemEvent(
        'email_sent',
        'low',
        {
          to: queueItem.email.to,
          subject: queueItem.email.subject,
          messageId: result.messageId,
          queueId: queueItem.id,
        }
      )

      logger.info('Email sent successfully', {
        to: queueItem.email.to,
        subject: queueItem.email.subject,
        messageId: result.messageId,
      })

    } catch (error) {
      queueItem.error = error instanceof Error ? error.message : 'Unknown error'

      if (queueItem.attempts >= queueItem.maxAttempts) {
        queueItem.status = 'failed'
        
        logger.error('Email delivery failed permanently', {
          to: queueItem.email.to,
          subject: queueItem.email.subject,
          attempts: queueItem.attempts,
          error: queueItem.error,
        })

        // Log failed delivery
        await auditLogger.logSystemEvent(
          'email_failed',
          'high',
          {
            to: queueItem.email.to,
            subject: queueItem.email.subject,
            error: queueItem.error,
            attempts: queueItem.attempts,
          }
        )
      } else {
        // Schedule retry with exponential backoff
        const delay = Math.pow(2, queueItem.attempts) * 60 * 1000 // 1, 2, 4 minutes
        queueItem.nextAttempt = new Date(Date.now() + delay)

        logger.warn('Email delivery failed, will retry', {
          to: queueItem.email.to,
          subject: queueItem.email.subject,
          attempts: queueItem.attempts,
          nextAttempt: queueItem.nextAttempt,
          error: queueItem.error,
        })
      }
    }
  }

  async loadTemplates() {
    try {
      // Load templates from in-memory definitions (Vercel serverless compatible)
      const defaultTemplates = this.getDefaultTemplates()
      
      for (const [templateName, template] of Object.entries(defaultTemplates)) {
        this.templates.set(templateName, {
          name: templateName,
          subject: template.subject,
          html: template.html,
          text: template.text,
        })
      }

      logger.info(`Loaded ${this.templates.size} email templates from memory`)
    } catch (error) {
      logger.error('Failed to load email templates', error)
    }
  }

  private getDefaultTemplates() {
    return {
      'welcome': {
        subject: 'Welcome to {{siteName}}!',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Welcome</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #2563eb;">Welcome, {{name}}!</h1>
              <p>Thank you for your interest in my portfolio. I'm excited to connect with you!</p>
              <p>Feel free to explore my projects and reach out if you have any questions.</p>
              <p>Best regards,<br>{{senderName}}</p>
            </div>
          </body>
          </html>
        `,
        text: 'Welcome, {{name}}! Thank you for your interest in my portfolio. Best regards, {{senderName}}'
      },
      'contact': {
        subject: 'New Contact Form Submission',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Contact Form</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #2563eb;">New Contact Form Submission</h1>
              <p><strong>Name:</strong> {{name}}</p>
              <p><strong>Email:</strong> {{email}}</p>
              <p><strong>Subject:</strong> {{subject}}</p>
              <p><strong>Message:</strong></p>
              <div style="background: #f5f5f5; padding: 15px; border-left: 4px solid #2563eb;">
                {{message}}
              </div>
              <p><small>Received at: {{timestamp}}</small></p>
            </div>
          </body>
          </html>
        `,
        text: 'New Contact Form Submission\nName: {{name}}\nEmail: {{email}}\nSubject: {{subject}}\nMessage: {{message}}\nReceived at: {{timestamp}}'
      },
      'notification': {
        subject: '{{title}}',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Notification</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #2563eb;">{{title}}</h1>
              <p>{{message}}</p>
              {{#if actionUrl}}
              <p style="margin: 30px 0;">
                <a href="{{actionUrl}}" 
                   style="background: #2563eb; color: white; padding: 12px 24px; 
                          text-decoration: none; border-radius: 5px; display: inline-block;">
                  {{actionText}}
                </a>
              </p>
              {{/if}}
              <p><small>{{timestamp}}</small></p>
            </div>
          </body>
          </html>
        `,
        text: '{{title}}\n{{message}}\n{{#if actionUrl}}{{actionText}}: {{actionUrl}}{{/if}}\n{{timestamp}}'
      },
      'security-alert': {
        subject: 'Security Alert: {{alertType}}',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Security Alert</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #dc2626;">🚨 Security Alert</h1>
              <p>We detected unusual activity on your account:</p>
              <p><strong>Alert Type:</strong> {{alertType}}</p>
              <p><strong>Details:</strong> {{details}}</p>
              <p><strong>Time:</strong> {{timestamp}}</p>
              {{#if ipAddress}}<p><strong>IP Address:</strong> {{ipAddress}}</p>{{/if}}
              {{#if userAgent}}<p><strong>User Agent:</strong> {{userAgent}}</p>{{/if}}
              <p style="color: #dc2626;"><strong>If this wasn't you, please change your password immediately and contact support.</strong></p>
            </div>
          </body>
          </html>
        `,
        text: 'Security Alert: {{alertType}}\nDetails: {{details}}\nTime: {{timestamp}}\n{{#if ipAddress}}IP: {{ipAddress}}{{/if}}\n{{#if userAgent}}User Agent: {{userAgent}}{{/if}}\nIf this wasn\'t you, please change your password immediately.'
      }
    }
  }

  private parseTemplateMetadata(content: string): { subject?: string; text?: string } {
    const subjectMatch = content.match(/{{!--\s*subject:\s*(.+?)\s*--}}/i)
    const textMatch = content.match(/{{!--\s*text:\s*(.+?)\s*--}}/i)

    return {
      subject: subjectMatch?.[1],
      text: textMatch?.[1],
    }
  }

  private async getTemplate(name: string): Promise<EmailTemplate | null> {
    return this.templates.get(name) || null
  }

  // Convenience methods
  async sendWelcomeEmail(to: string, data: { name: string; senderName: string; siteName: string }) {
    return this.sendEmail({
      to,
      template: 'welcome',
      templateData: data,
    })
  }

  async sendContactNotification(data: {
    name: string
    email: string
    subject: string
    message: string
  }) {
    return this.sendEmail({
      to: process.env.CONTACT_EMAIL || process.env.EMAIL_FROM || 'admin@yoursite.com',
      template: 'contact',
      templateData: {
        ...data,
        timestamp: new Date().toLocaleString(),
      },
    })
  }

  async sendNotification(to: string | string[], data: {
    title: string
    message: string
    actionUrl?: string
    actionText?: string
  }) {
    return this.sendEmail({
      to,
      template: 'notification',
      templateData: {
        ...data,
        timestamp: new Date().toLocaleString(),
      },
    })
  }

  async sendPasswordReset(to: string, data: { name: string; resetUrl: string; expiresIn: string }) {
    return this.sendEmail({
      to,
      subject: 'Password Reset Request',
      html: `
        <h1>Password Reset Request</h1>
        <p>Hello ${data.name},</p>
        <p>You requested a password reset for your account. Click the link below to reset your password:</p>
        <p><a href="${data.resetUrl}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a></p>
        <p>This link will expire in ${data.expiresIn}.</p>
        <p>If you didn't request this reset, please ignore this email.</p>
      `,
    })
  }

  async sendSecurityAlert(to: string, data: { 
    alertType: string
    details: string
    timestamp: string
    ipAddress?: string
    userAgent?: string
  }) {
    return this.sendEmail({
      to,
      subject: `Security Alert: ${data.alertType}`,
      html: `
        <h1 style="color: #dc2626;">Security Alert</h1>
        <p>We detected unusual activity on your account:</p>
        <p><strong>Alert Type:</strong> ${data.alertType}</p>
        <p><strong>Details:</strong> ${data.details}</p>
        <p><strong>Time:</strong> ${data.timestamp}</p>
        ${data.ipAddress ? `<p><strong>IP Address:</strong> ${data.ipAddress}</p>` : ''}
        ${data.userAgent ? `<p><strong>User Agent:</strong> ${data.userAgent}</p>` : ''}
        <p>If this wasn't you, please change your password immediately and contact support.</p>
      `,
      priority: 'high',
    })
  }

  // Simplified queue management for serverless compatibility
  getQueueStats() {
    // Return empty stats since we're not using background queue processing
    const stats = {
      pending: 0,
      processing: false,
      totalQueued: 0,
    }

    return stats
  }

  clearFailedEmails() {
    // No-op in serverless mode - emails are sent immediately
    logger.info('Clear failed emails requested - no queue in serverless mode')
    return 0
  }

  retryFailedEmails() {
    // No-op in serverless mode - emails are sent immediately
    logger.info('Retry failed emails requested - no queue in serverless mode')
    return 0
  }

  private generateId(): string {
    return `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

export const emailService = EmailService.getInstance()