import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const adminEmail = process.env.ADMIN_EMAIL
    const adminPassword = process.env.ADMIN_PASSWORD
    
    return NextResponse.json({
      success: true,
      environment: process.env.NODE_ENV,
      envCheck: {
        adminEmailSet: !!adminEmail,
        adminEmailValue: adminEmail ? `${adminEmail.substring(0, 5)}***@${adminEmail.split('@')[1] || 'unknown'}` : 'NOT SET',
        adminPasswordSet: !!adminPassword,
        adminPasswordLength: adminPassword ? adminPassword.length : 0,
        adminPasswordHint: adminPassword ? `${adminPassword.substring(0, 2)}***${adminPassword.substring(adminPassword.length - 2)}` : 'NOT SET'
      }
    })
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Environment check failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}