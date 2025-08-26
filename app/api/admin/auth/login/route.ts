import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { authenticateAdmin, generateToken } from '@/lib/auth'

const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validationResult = LoginSchema.safeParse(body)

    if (!validationResult.success) {
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

    // Authenticate admin user
    const adminUser = await authenticateAdmin(email, password)
    if (!adminUser) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid email or password' 
        },
        { status: 401 }
      )
    }

    // Generate JWT token
    const token = generateToken(adminUser)

    // Create response with token in cookie
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role
      },
      debug: {
        tokenGenerated: true,
        cookieWillBeSet: true,
        environment: process.env.NODE_ENV
      }
    })

    // Set HTTP-only cookie with token using both methods
    response.cookies.set('admin-token', token, {
      httpOnly: true,
      secure: true, // Always use secure in production (Vercel uses HTTPS)
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      domain: undefined // Let browser determine the domain
    })
    
    // Backup: Also set via Set-Cookie header
    const cookieValue = `admin-token=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${7 * 24 * 60 * 60}`
    response.headers.set('Set-Cookie', cookieValue)
    
    // Debug: Log cookie setting attempt
    console.log('🍪 Setting admin-token cookie:', {
      tokenLength: token.length,
      tokenPreview: `${token.substring(0, 20)}...`,
      cookieSettings: {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60
      },
      setCookieHeader: cookieValue
    })

    return response

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}