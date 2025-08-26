import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createAdminUser() {
  try {
    // Check if admin user already exists
    const existingAdmin = await prisma.adminUser.findUnique({
      where: { email: 'admin@edikanudoibuot.com' }
    })

    if (existingAdmin) {
      console.log('Admin user already exists')
      return
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

    console.log('Admin user created successfully:', {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role
    })

  } catch (error) {
    console.error('Error creating admin user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdminUser()