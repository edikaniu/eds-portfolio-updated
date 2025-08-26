import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, newPassword } = body

    // Find admin user
    const adminUser = await prisma.adminUser.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (!adminUser) {
      return NextResponse.json({
        success: false,
        message: 'Admin user not found'
      })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    // Update password
    await prisma.adminUser.update({
      where: { id: adminUser.id },
      data: { password: hashedPassword }
    })

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully'
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Error resetting password',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}