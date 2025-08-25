import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const NotificationSchema = z.object({
  question: z.string().min(1, "Question is required").max(1000, "Question too long"),
  userMessage: z.string().min(1, "User message is required").max(2000, "Message too long"),
})

const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW = 15 * 60 * 1000 // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 5 // Max 5 requests per window

function getRateLimitKey(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")
  const realIp = request.headers.get("x-real-ip")
  const ip = forwarded ? forwarded.split(",")[0].trim() : realIp || "unknown"
  return `rate_limit:${ip}`
}

function checkRateLimit(key: string): { allowed: boolean; resetTime?: number } {
  const now = Date.now()
  const record = rateLimitMap.get(key)

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return { allowed: true }
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, resetTime: record.resetTime }
  }

  record.count++
  return { allowed: true }
}

function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+=/gi, "") // Remove event handlers
    .trim()
}

export async function POST(request: NextRequest) {
  try {
    const rateLimitKey = getRateLimitKey(request)
    const rateLimitResult = checkRateLimit(rateLimitKey)

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: "Too many requests. Please try again later.",
          resetTime: rateLimitResult.resetTime,
        },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil((rateLimitResult.resetTime! - Date.now()) / 1000).toString(),
          },
        },
      )
    }

    const contentLength = request.headers.get("content-length")
    if (contentLength && Number.parseInt(contentLength) > 10000) {
      // 10KB limit
      return NextResponse.json({ success: false, message: "Request too large" }, { status: 413 })
    }

    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Request timeout")), 5000))

    const requestData = (await Promise.race([request.json(), timeoutPromise])) as unknown

    const validationResult = NotificationSchema.safeParse(requestData)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid input data",
          errors: validationResult.error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        },
        { status: 400 },
      )
    }

    const { question, userMessage } = validationResult.data

    const sanitizedQuestion = sanitizeInput(question)
    const sanitizedUserMessage = sanitizeInput(userMessage)

    if (sanitizedQuestion.length === 0 || sanitizedUserMessage.length === 0) {
      return NextResponse.json({ success: false, message: "Invalid content detected" }, { status: 400 })
    }

    console.log("[v0] Email notification triggered:", {
      to: "edikanudoibuot@gmail.com",
      subject: "New Unanswered Question from Portfolio Chat",
      question: sanitizedQuestion,
      userMessage: sanitizedUserMessage,
      timestamp: new Date().toISOString(),
      ip: getRateLimitKey(request).replace("rate_limit:", ""),
      userAgent: request.headers.get("user-agent")?.substring(0, 100) || "unknown",
    })

    // In a real implementation, you would use a service like:
    // - Resend
    // - SendGrid
    // - Nodemailer with SMTP
    // - AWS SES

    // For now, we'll simulate the email sending
    await new Promise((resolve) => setTimeout(resolve, 500))

    const response = NextResponse.json({
      success: true,
      message: "Notification sent successfully",
    })

    response.headers.set("X-Content-Type-Options", "nosniff")
    response.headers.set("X-Frame-Options", "DENY")
    response.headers.set("X-XSS-Protection", "1; mode=block")

    return response
  } catch (error) {
    console.error("[v0] Error sending notification:", {
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
      ip: getRateLimitKey(request).replace("rate_limit:", ""),
    })

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      {
        status: 500,
        headers: {
          "X-Content-Type-Options": "nosniff",
          "X-Frame-Options": "DENY",
          "X-XSS-Protection": "1; mode=block",
        },
      },
    )
  }
}

export async function GET() {
  return NextResponse.json({ success: false, message: "Method not allowed" }, { status: 405 })
}

export async function PUT() {
  return NextResponse.json({ success: false, message: "Method not allowed" }, { status: 405 })
}

export async function DELETE() {
  return NextResponse.json({ success: false, message: "Method not allowed" }, { status: 405 })
}
