#!/usr/bin/env node

/**
 * Database Setup Script
 * This script helps set up the database for both development and production
 */

const { PrismaClient } = require('@prisma/client')
const { execSync } = require('child_process')

async function setupDatabase() {
  console.log('🔄 Setting up database...')
  
  try {
    // First, try to push the schema
    console.log('📋 Pushing database schema...')
    execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' })
    
    // Generate the Prisma client
    console.log('🔧 Generating Prisma client...')
    execSync('npx prisma generate', { stdio: 'inherit' })
    
    // Test database connection
    console.log('🔌 Testing database connection...')
    const prisma = new PrismaClient()
    
    try {
      // Try a simple query to test connection
      await prisma.$queryRaw`SELECT 1 as test`
      console.log('✅ Database connection successful!')
      
      // Create default admin user if needed
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@edikanudoibuot.com'
      const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456'
      
      console.log('👤 Creating default admin user...')
      
      // Check if admin already exists
      const existingAdmin = await prisma.adminUser.findUnique({
        where: { email: adminEmail }
      })
      
      if (!existingAdmin) {
        await prisma.adminUser.create({
          data: {
            email: adminEmail,
            password: adminPassword, // In production, this should be hashed
            name: 'Admin User',
            role: 'admin'
          }
        })
        console.log(`✅ Admin user created: ${adminEmail}`)
      } else {
        console.log(`ℹ️  Admin user already exists: ${adminEmail}`)
      }
      
    } catch (error) {
      console.error('❌ Database connection failed:', error.message)
      throw error
    } finally {
      await prisma.$disconnect()
    }
    
    console.log('🎉 Database setup completed successfully!')
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message)
    
    if (error.message.includes('file:')) {
      console.log('')
      console.log('💡 It looks like you\'re using SQLite locally but need PostgreSQL for production.')
      console.log('   For Vercel deployment, you need to:')
      console.log('   1. Set up Vercel Postgres in your project dashboard')
      console.log('   2. Copy the DATABASE_URL to your Vercel environment variables')
      console.log('   3. The schema is now configured for PostgreSQL')
    }
    
    if (error.message.includes('postgresql://')) {
      console.log('')
      console.log('💡 Database connection issues. Please check:')
      console.log('   1. DATABASE_URL environment variable is set correctly')
      console.log('   2. Database server is running and accessible')
      console.log('   3. Database credentials are correct')
    }
    
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  setupDatabase().catch(console.error)
}

module.exports = { setupDatabase }