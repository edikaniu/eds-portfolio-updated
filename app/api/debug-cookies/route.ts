import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const allCookies = request.cookies.getAll()
  
  return NextResponse.json({
    cookies: allCookies.map(cookie => ({
      name: cookie.name,
      value: cookie.value,
      length: cookie.value.length
    })),
    count: allCookies.length,
    adminSession: request.cookies.get('admin-session')?.value || 'NOT_FOUND',
    userAgent: request.headers.get('user-agent'),
    timestamp: new Date().toISOString()
  })
}