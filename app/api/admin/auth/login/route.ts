import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { validateCredentials, createUserSession } from '@/lib/simple-auth'
import { generateJWT } from '@/lib/jwt-auth'

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

    // Validate credentials using environment variables
    const isValid = validateCredentials(email, password)
    
    if (!isValid) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid email or password' 
        },
        { status: 401 }
      )
    }
    
    // Create user session with JWT
    const user = createUserSession()
    const sessionToken = generateJWT(user)

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

    // Secure cookie configuration
    const isProduction = process.env.NODE_ENV === 'production'
    const cookieConfig = {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict' as const,
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    }
    
    response.cookies.set('admin-session', sessionToken, cookieConfig)
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