import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/admin-middleware'
import { prisma } from '@/lib/prisma'

// POST - Setup database schema by creating tables manually
export const POST = withAdminAuth(async (request: NextRequest) => {
  try {
    console.log('Setting up database schema...')
    
    // Test connection first
    await prisma.$queryRaw`SELECT 1 as connection_test`
    
    // Create tables manually if they don't exist
    const createTablesSQL = `
      -- Create AdminUser table
      CREATE TABLE IF NOT EXISTS "admin_users" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "email" TEXT NOT NULL UNIQUE,
        "password" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "role" TEXT NOT NULL DEFAULT 'admin',
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      -- Create BlogPost table
      CREATE TABLE IF NOT EXISTS "blog_posts" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "slug" TEXT NOT NULL UNIQUE,
        "content" TEXT NOT NULL,
        "excerpt" TEXT,
        "imageUrl" TEXT,
        "category" TEXT,
        "tags" TEXT,
        "author" TEXT,
        "metaTitle" TEXT,
        "metaDescription" TEXT,
        "published" BOOLEAN NOT NULL DEFAULT false,
        "publishedAt" TIMESTAMP(3),
        "metadata" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      -- Create CaseStudy table
      CREATE TABLE IF NOT EXISTS "case_studies" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "slug" TEXT NOT NULL UNIQUE,
        "subtitle" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "fullDescription" TEXT NOT NULL,
        "image" TEXT,
        "metrics" TEXT NOT NULL,
        "results" TEXT NOT NULL,
        "tools" TEXT NOT NULL,
        "category" TEXT NOT NULL,
        "color" TEXT NOT NULL,
        "challenge" TEXT NOT NULL,
        "solution" TEXT NOT NULL,
        "timeline" TEXT NOT NULL,
        "icon" TEXT,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "order" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      -- Create Project table
      CREATE TABLE IF NOT EXISTS "projects" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "slug" TEXT NOT NULL UNIQUE,
        "description" TEXT NOT NULL,
        "image" TEXT,
        "technologies" TEXT NOT NULL,
        "githubUrl" TEXT,
        "liveUrl" TEXT,
        "category" TEXT,
        "order" INTEGER NOT NULL DEFAULT 0,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      -- Create SkillCategory table
      CREATE TABLE IF NOT EXISTS "skill_categories" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "color" TEXT NOT NULL,
        "skills" TEXT NOT NULL,
        "order" INTEGER NOT NULL DEFAULT 0,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      -- Create Tool table
      CREATE TABLE IF NOT EXISTS "tools" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "logoUrl" TEXT,
        "category" TEXT,
        "color" TEXT,
        "order" INTEGER NOT NULL DEFAULT 0,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      -- Additional essential tables
      CREATE TABLE IF NOT EXISTS "chatbot_knowledge" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "content" TEXT NOT NULL,
        "sourceType" TEXT NOT NULL,
        "sourceFile" TEXT,
        "category" TEXT NOT NULL,
        "tags" TEXT,
        "priority" INTEGER NOT NULL DEFAULT 0,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS "chatbot_conversations" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "sessionId" TEXT,
        "question" TEXT NOT NULL,
        "response" TEXT NOT NULL,
        "responseSource" TEXT NOT NULL,
        "aiUsed" BOOLEAN NOT NULL DEFAULT false,
        "satisfactionRating" INTEGER,
        "responseTime" INTEGER,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `

    // Execute the table creation
    await prisma.$executeRawUnsafe(createTablesSQL)

    // Verify tables were created
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `

    // Create default admin user if needed
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@edikanudoibuot.com'
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456'

    try {
      const existingAdmin = await prisma.adminUser.findUnique({
        where: { email: adminEmail }
      })

      if (!existingAdmin) {
        await prisma.adminUser.create({
          data: {
            email: adminEmail,
            password: adminPassword,
            name: 'Administrator',
            role: 'admin'
          }
        })
      }
    } catch (adminError) {
      console.log('Admin user creation skipped:', adminError instanceof Error ? adminError.message : 'Unknown error')
    }

    return NextResponse.json({
      success: true,
      message: 'Database schema setup completed successfully',
      data: {
        tablesCreated: Array.isArray(tables) ? tables.length : 0,
        tables: tables,
        adminUserSetup: 'completed'
      }
    })

  } catch (error) {
    console.error('Schema setup error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to setup database schema', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
})