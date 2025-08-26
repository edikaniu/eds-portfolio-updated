import { NextResponse } from 'next/server'

export async function GET() {
  try {
    return NextResponse.json({
      // Credentials info
      expectedEmail: process.env.ADMIN_EMAIL || 'admin@edikanudoibuot.com',
      hasAdminEmail: !!process.env.ADMIN_EMAIL,
      hasAdminPassword: !!process.env.ADMIN_PASSWORD,
      passwordLength: (process.env.ADMIN_PASSWORD || 'admin123456').length,
      
      // Environment info
      nodeEnv: process.env.NODE_ENV,
      isVercel: !!process.env.VERCEL,
      vercelUrl: process.env.VERCEL_URL,
      
      // Cookie debug info
      cookieConfig: {
        secure: true, // Always true for Vercel
        sameSite: 'lax',
        httpOnly: true,
        path: '/',
        domain: 'auto'
      }
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get debug info' }, { status: 500 })
  }
}