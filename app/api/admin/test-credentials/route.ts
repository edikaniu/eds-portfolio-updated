import { NextRequest, NextResponse } from 'next/server'
import { validateCredentials, ADMIN_CREDENTIALS } from '@/lib/simple-auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body
    
    console.log('🔍 CREDENTIAL TEST - Testing:', {
      providedEmail: email,
      providedPassword: password,
      providedPasswordLength: password?.length || 0,
      expectedEmail: ADMIN_CREDENTIALS.email,
      expectedPasswordLength: ADMIN_CREDENTIALS.password.length,
      emailMatch: email?.toLowerCase() === ADMIN_CREDENTIALS.email.toLowerCase(),
      passwordMatch: password === ADMIN_CREDENTIALS.password
    })
    
    const isValid = validateCredentials(email, password)
    
    return NextResponse.json({
      success: isValid,
      debug: {
        providedEmail: email,
        providedPasswordLength: password?.length || 0,
        expectedEmail: ADMIN_CREDENTIALS.email,
        expectedPasswordLength: ADMIN_CREDENTIALS.password.length,
        emailMatch: email?.toLowerCase() === ADMIN_CREDENTIALS.email.toLowerCase(),
        passwordMatch: password === ADMIN_CREDENTIALS.password,
        firstCharsMatch: password?.substring(0, 5) === ADMIN_CREDENTIALS.password.substring(0, 5),
        // Only show first/last 3 chars for security
        expectedPasswordHint: ADMIN_CREDENTIALS.password.substring(0, 3) + '***' + ADMIN_CREDENTIALS.password.substring(ADMIN_CREDENTIALS.password.length - 3)
      }
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400 }
    )
  }
}