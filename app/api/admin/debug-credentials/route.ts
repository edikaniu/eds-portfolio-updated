import { NextResponse } from 'next/server'

export async function GET() {
  try {
    return NextResponse.json({
      expectedEmail: process.env.ADMIN_EMAIL || 'admin@edikanudoibuot.com',
      hasAdminEmail: !!process.env.ADMIN_EMAIL,
      hasAdminPassword: !!process.env.ADMIN_PASSWORD,
      passwordLength: (process.env.ADMIN_PASSWORD || 'admin123456').length,
      nodeEnv: process.env.NODE_ENV
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get debug info' }, { status: 500 })
  }
}