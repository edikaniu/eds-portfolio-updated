import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Find admin user
    const adminUser = await prisma.adminUser.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (!adminUser) {
      return NextResponse.json({
        success: false,
        message: 'Admin user not found',
        debug: { email: email.toLowerCase() }
      })
    }

    // Test password verification
    const isPasswordValid = await bcrypt.compare(password, adminUser.password)

    return NextResponse.json({
      success: true,
      message: 'Debug info',
      debug: {
        userFound: true,
        userId: adminUser.id,
        userEmail: adminUser.email,
        userName: adminUser.name,
        userRole: adminUser.role,
        isActive: adminUser.isActive,
        passwordValid: isPasswordValid,
        jwtSecret: process.env.NEXTAUTH_SECRET ? 'Present' : 'Missing'
      }
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Error in test endpoint',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}