import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET(request: NextRequest) {
  try {
    console.log('=== SIMPLE AUTH TEST ===')
    
    // Test 1: Basic database connection
    console.log('Testing database connection...')
    const adminUsers = await prisma.adminUser.findMany()
    console.log('Admin users found:', adminUsers.length)
    
    if (adminUsers.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No admin users found'
      })
    }
    
    const adminUser = adminUsers[0]
    console.log('First admin user:', { 
      id: adminUser.id, 
      email: adminUser.email, 
      hasPassword: !!adminUser.password,
      passwordLength: adminUser.password.length
    })
    
    // Test 2: Simple bcrypt comparison
    console.log('Testing bcrypt comparison...')
    const testPassword = 'admin123!'
    const isMatch = await bcrypt.compare(testPassword, adminUser.password)
    console.log('Password match test:', isMatch)
    
    // Test 3: JWT secret check
    console.log('Testing JWT secret...')
    const jwtSecret = process.env.NEXTAUTH_SECRET
    console.log('JWT secret exists:', !!jwtSecret, 'length:', jwtSecret?.length || 0)
    
    return NextResponse.json({
      success: true,
      tests: {
        database: adminUsers.length > 0,
        passwordMatch: isMatch,
        jwtSecret: !!jwtSecret
      },
      adminUser: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role
      }
    })

  } catch (error) {
    console.error('Simple test error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Test failed',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}