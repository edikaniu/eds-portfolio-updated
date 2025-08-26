import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    // Check if admin user already exists
    const existingAdmin = await prisma.adminUser.findFirst()

    if (existingAdmin) {
      return NextResponse.json({
        success: false,
        message: 'Admin user already exists'
      }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('admin123!', 12)

    // Create admin user
    const admin = await prisma.adminUser.create({
      data: {
        email: 'admin@edikanudoibuot.com',
        password: hashedPassword,
        name: 'Edikan Udoibuot',
        role: 'admin',
        isActive: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role
      }
    })

  } catch (error) {
    console.error('Error creating admin user:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to create admin user',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}