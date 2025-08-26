import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { authenticateAdmin, generateToken } from '@/lib/auth'

const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

export async function POST(request: NextRequest) {
  try {
    console.log('Login attempt starting...')
    const body = await request.json()
    console.log('Body parsed:', { email: body.email, hasPassword: !!body.password })
    
    const validationResult = LoginSchema.safeParse(body)

    if (!validationResult.success) {
      console.log('Validation failed:', validationResult.error.errors)
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
    console.log('Validation passed, attempting authentication...')

    // Authenticate admin user
    const adminUser = await authenticateAdmin(email, password)
    console.log('Authentication result:', !!adminUser)
    
    if (!adminUser) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid email or password' 
        },
        { status: 401 }
      )
    }

    console.log('Generating JWT token...')
    // Generate JWT token
    const token = generateToken(adminUser)
    console.log('Token generated, length:', token.length)

    // Create response with token in cookie
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role
      }
    })

    // Set HTTP-only cookie with token - optimized for Vercel
    const isProduction = process.env.NODE_ENV === 'production'
    console.log('Setting cookie, production mode:', isProduction)
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction, // Only secure in production HTTPS
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    }
    
    response.cookies.set('admin-token', token, cookieOptions)
    console.log('Cookie set successfully')

    return response

  } catch (error) {
    console.error('Login error details:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error',
        debug: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : String(error) : undefined
      },
      { status: 500 }
    )
  }
}