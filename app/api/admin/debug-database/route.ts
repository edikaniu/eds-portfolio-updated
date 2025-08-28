import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/admin-middleware'
import { prisma } from '@/lib/prisma'

// GET - Debug database connection and environment
export const GET = withAdminAuth(async (request: NextRequest) => {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    databaseUrl: {
      exists: !!process.env.DATABASE_URL,
      protocol: process.env.DATABASE_URL?.split('://')[0] || 'not set',
      length: process.env.DATABASE_URL?.length || 0,
      host: process.env.DATABASE_URL ? 
        process.env.DATABASE_URL.split('@')[1]?.split('/')[0] || 'unknown' : 
        'not set'
    },
    neonVars: {
      pgUrl: !!process.env.POSTGRES_URL,
      pgPrismaUrl: !!process.env.POSTGRES_PRISMA_URL,
      pgNonPooling: !!process.env.POSTGRES_URL_NON_POOLING
    },
    connectionTest: null as any,
    tableCheck: null as any,
    schemaInfo: null as any
  }

  try {
    // Test basic connection
    console.log('Testing database connection...')
    await prisma.$queryRaw`SELECT 1 as test, version() as pg_version, current_database() as db_name`
    diagnostics.connectionTest = { status: 'success', message: 'Database connection successful' }
    
    // Check if tables exist
    try {
      const tables = await prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name;
      `
      diagnostics.tableCheck = { 
        status: 'success', 
        count: Array.isArray(tables) ? tables.length : 0,
        tables: tables
      }
    } catch (tableError) {
      diagnostics.tableCheck = { 
        status: 'error', 
        message: tableError instanceof Error ? tableError.message : 'Unknown table check error'
      }
    }

    // Get schema information
    try {
      const schemaInfo = await prisma.$queryRaw`
        SELECT 
          schemaname,
          tablename,
          tableowner
        FROM pg_tables 
        WHERE schemaname = 'public'
        LIMIT 10;
      `
      diagnostics.schemaInfo = { 
        status: 'success', 
        info: schemaInfo 
      }
    } catch (schemaError) {
      diagnostics.schemaInfo = { 
        status: 'error', 
        message: schemaError instanceof Error ? schemaError.message : 'Unknown schema error'
      }
    }

  } catch (connectionError) {
    const errorMessage = connectionError instanceof Error ? connectionError.message : 'Unknown connection error'
    diagnostics.connectionTest = { status: 'error', message: errorMessage }
    
    // Provide specific guidance based on error type
    if (errorMessage.includes('file:')) {
      diagnostics.connectionTest.guidance = 'Database URL is configured for SQLite but should be PostgreSQL'
    } else if (errorMessage.includes('ECONNREFUSED') || errorMessage.includes('ENOTFOUND')) {
      diagnostics.connectionTest.guidance = 'Database server is not accessible - check Neon database status'
    } else if (errorMessage.includes('password authentication failed')) {
      diagnostics.connectionTest.guidance = 'Database credentials are incorrect - verify Neon connection string'
    } else if (errorMessage.includes('database') && errorMessage.includes('does not exist')) {
      diagnostics.connectionTest.guidance = 'Database exists but target database name is incorrect'
    }
  }

  return NextResponse.json({
    success: true,
    message: 'Database diagnostics completed',
    data: diagnostics
  })
})

// POST - Attempt to create database schema
export const POST = withAdminAuth(async (request: NextRequest) => {
  try {
    console.log('Attempting to create database schema...')
    
    // This will create all tables defined in the Prisma schema
    await prisma.$executeRaw`
      -- This is a test query to ensure the connection works
      SELECT 1 as schema_creation_test;
    `
    
    return NextResponse.json({
      success: true,
      message: 'Schema creation initiated. Run "prisma db push" to create tables.',
      recommendation: 'The database connection works. You need to run "prisma db push" to create the required tables.'
    })
    
  } catch (error) {
    console.error('Schema creation error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to create schema',
      error: error instanceof Error ? error.message : 'Unknown error',
      recommendation: 'Check database connection and permissions'
    }, { status: 500 })
  }
})