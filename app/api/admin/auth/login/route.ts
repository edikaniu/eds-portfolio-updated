import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { validateCredentials, createUserSession, generateSessionToken } from '@/lib/simple-auth'

const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

export async function POST(request: NextRequest) {
  try {
    console.log('🔥 LOGIN ENDPOINT HIT - Starting authentication process')
    
    const body = await request.json()
    console.log('📝 Request body received:', { email: body.email, hasPassword: !!body.password })
    
    const validationResult = LoginSchema.safeParse(body)

    if (!validationResult.success) {
      console.log('❌ Validation failed:', validationResult.error.errors)
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid input data',
          errors: validationResult.error.errors 
        },
        { status: 400 }
      )
    }

    const { email, password } = validationResult.data
    console.log('✅ Validation passed, checking credentials...')

    // Validate credentials using environment variables
    const isValid = validateCredentials(email, password)
    console.log('🔐 Credential check result:', isValid)
    
    if (!isValid) {
      console.log('❌ Invalid credentials provided')
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid email or password' 
        },
        { status: 401 }
      )
    }

    console.log('🎯 Credentials valid! Creating session...')
    
    // Create user session
    const user = createUserSession()
    const sessionToken = generateSessionToken(user)
    
    console.log('🔑 Session created:', {
      userId: user.id,
      userEmail: user.email,
      tokenLength: sessionToken.length
    })

    // Create response with session token in cookie
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    })

    // Environment detection
    const isProduction = process.env.NODE_ENV === 'production'
    const isVercel = !!process.env.VERCEL
    
    console.log('🍪 Setting cookie - Environment:', {
      isProduction,
      isVercel,
      nodeEnv: process.env.NODE_ENV,
      vercelUrl: process.env.VERCEL_URL || 'local'
    })
    
    // FIXED: Proper cookie configuration for Vercel deployment
    const cookieConfig = {
      httpOnly: true,
      secure: isProduction, // Only secure in production (not always true)
      sameSite: 'strict' as const, // Changed from lax to strict for better auth security
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    }
    
    // Use only Next.js cookie setting (remove duplicate Set-Cookie header)
    response.cookies.set('admin-session', sessionToken, cookieConfig)
    
    console.log('🍪 Cookie configuration:', cookieConfig)
    console.log('🍪 Session token length:', sessionToken.length)

    console.log('✅ LOGIN COMPLETE - Session cookie set successfully')
    return response

  } catch (error) {
    console.error('💥 LOGIN ERROR:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error'
      },
      { status: 500 }
    )
  }
}