import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from './prisma'
import { logger } from './logger'

const JWT_SECRET = process.env.NEXTAUTH_SECRET as string

if (!JWT_SECRET) {
  throw new Error('NEXTAUTH_SECRET environment variable is required')
}

export interface AdminUser {
  id: string
  email: string
  name: string
  role: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(user: AdminUser): string {
  return jwt.sign(
    { 
      userId: user.id, 
      email: user.email, 
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

export function verifyToken(token: string): AdminUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    return {
      id: decoded.userId,
      email: decoded.email,
      name: decoded.name || '',
      role: decoded.role
    }
  } catch (error) {
    return null
  }
}

export async function authenticateAdmin(email: string, password: string): Promise<AdminUser | null> {
  try {
    const adminUser = await prisma.adminUser.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (!adminUser || !adminUser.isActive) {
      return null
    }

    const isPasswordValid = await verifyPassword(password, adminUser.password)
    if (!isPasswordValid) {
      return null
    }

    return {
      id: adminUser.id,
      email: adminUser.email,
      name: adminUser.name,
      role: adminUser.role
    }
  } catch (error) {
    logger.error('Authentication failed', error, { email: email.toLowerCase() })
    return null
  }
}

export async function createDefaultAdmin(): Promise<void> {
  try {
    const adminEmail = process.env.ADMIN_EMAIL
    const adminPassword = process.env.ADMIN_PASSWORD

    // Validate required environment variables
    if (!adminEmail || !adminPassword) {
      logger.error('Admin credentials not configured', {
        hasEmail: !!adminEmail,
        hasPassword: !!adminPassword
      })
      throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required')
    }

    // Validate email format
    if (!adminEmail.includes('@')) {
      throw new Error('ADMIN_EMAIL must be a valid email address')
    }

    // Validate password strength
    if (adminPassword.length < 8) {
      throw new Error('ADMIN_PASSWORD must be at least 8 characters long')
    }

    // Check if admin already exists
    const existingAdmin = await prisma.adminUser.findUnique({
      where: { email: adminEmail }
    })

    if (!existingAdmin) {
      const hashedPassword = await hashPassword(adminPassword)
      
      await prisma.adminUser.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          name: 'Admin User',
          role: 'admin',
          isActive: true
        }
      })

      logger.info('Default admin user created successfully', { email: adminEmail })
    } else {
      logger.info('Admin user already exists', { email: adminEmail })
    }
  } catch (error) {
    logger.error('Failed to create default admin', error)
    throw error // Re-throw to ensure calling code knows about the failure
  }
}