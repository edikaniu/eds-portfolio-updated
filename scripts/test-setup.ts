#!/usr/bin/env node

/**
 * Test setup script
 * Prepares the test environment and database
 */

import { execSync } from 'child_process'
import { existsSync, mkdirSync, writeFileSync } from 'fs'
import path from 'path'

const testDbPath = path.join(process.cwd(), 'prisma', 'test.db')
const testResultsPath = path.join(process.cwd(), 'test-results')

async function setupTestEnvironment() {
  console.log('🔧 Setting up test environment...')

  // Create test results directory
  if (!existsSync(testResultsPath)) {
    mkdirSync(testResultsPath, { recursive: true })
    console.log('✅ Created test-results directory')
  }

  // Create test database
  try {
    console.log('📁 Setting up test database...')
    
    // Set test environment
    process.env.NODE_ENV = 'test'
    process.env.DATABASE_URL = `file:${testDbPath}`

    // Generate Prisma client for tests
    execSync('npx prisma generate', { stdio: 'inherit' })
    
    // Push database schema
    execSync('npx prisma db push --force-reset', { 
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: `file:${testDbPath}` }
    })
    
    console.log('✅ Test database setup complete')
  } catch (error) {
    console.error('❌ Failed to setup test database:', error)
    process.exit(1)
  }

  // Seed test data
  try {
    console.log('🌱 Seeding test data...')
    await seedTestData()
    console.log('✅ Test data seeded successfully')
  } catch (error) {
    console.error('❌ Failed to seed test data:', error)
    process.exit(1)
  }

  // Install Playwright browsers if needed
  try {
    console.log('🎭 Installing Playwright browsers...')
    execSync('npx playwright install --with-deps', { stdio: 'inherit' })
    console.log('✅ Playwright browsers installed')
  } catch (error) {
    console.warn('⚠️ Failed to install Playwright browsers:', error)
    console.log('ℹ️ You may need to run "npx playwright install" manually')
  }

  console.log('🎉 Test environment setup complete!')
}

async function seedTestData() {
  // Import Prisma client
  const { PrismaClient } = await import('@prisma/client')
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: `file:${testDbPath}`
      }
    }
  })

  try {
    // Create test admin user
    await prisma.adminUser.upsert({
      where: { email: 'test-admin@example.com' },
      update: {},
      create: {
        email: 'test-admin@example.com',
        password: '$2b$12$test-hashed-password', // This would be properly hashed in real implementation
        name: 'Test Admin',
        role: 'admin',
        isActive: true,
      },
    })

    // Create test blog posts
    const blogPosts = [
      {
        title: 'Test Blog Post 1',
        slug: 'test-blog-post-1',
        excerpt: 'This is a test blog post excerpt 1',
        content: 'This is the full content of test blog post 1',
        category: 'Technology',
        tags: JSON.stringify(['test', 'blog', 'technology']),
        featuredImage: 'https://example.com/image1.jpg',
        publishedAt: new Date('2024-01-01'),
        isDraft: false,
        authorName: 'Test Author',
      },
      {
        title: 'Test Blog Post 2',
        slug: 'test-blog-post-2',
        excerpt: 'This is a test blog post excerpt 2',
        content: 'This is the full content of test blog post 2',
        category: 'Design',
        tags: JSON.stringify(['test', 'blog', 'design']),
        featuredImage: 'https://example.com/image2.jpg',
        publishedAt: new Date('2024-01-02'),
        isDraft: false,
        authorName: 'Test Author',
      },
    ]

    for (const post of blogPosts) {
      await prisma.blogPost.upsert({
        where: { slug: post.slug },
        update: post,
        create: post,
      })
    }

    // Create test projects
    const projects = [
      {
        title: 'Test Project 1',
        slug: 'test-project-1',
        description: 'This is a test project description 1',
        technologies: JSON.stringify(['React', 'TypeScript', 'Next.js']),
        category: 'Web Development',
        image: 'https://example.com/project1.jpg',
        demoUrl: 'https://example.com/demo1',
        githubUrl: 'https://github.com/test/project1',
        isActive: true,
        featured: true,
        status: 'Live',
      },
      {
        title: 'Test Project 2',
        slug: 'test-project-2',
        description: 'This is a test project description 2',
        technologies: JSON.stringify(['Vue', 'JavaScript', 'Node.js']),
        category: 'Web Development',
        image: 'https://example.com/project2.jpg',
        demoUrl: 'https://example.com/demo2',
        githubUrl: 'https://github.com/test/project2',
        isActive: true,
        featured: false,
        status: 'Live',
      },
    ]

    for (const project of projects) {
      await prisma.project.upsert({
        where: { slug: project.slug },
        update: project,
        create: project,
      })
    }

    // Create test case studies
    const caseStudies = [
      {
        title: 'Test Case Study 1',
        slug: 'test-case-study-1',
        client: 'Test Client 1',
        industry: 'Technology',
        description: 'This is a test case study description 1',
        challenge: 'The challenge description 1',
        solution: 'The solution description 1',
        results: JSON.stringify(['Improved performance by 50%', 'Reduced costs by 30%']),
        technologies: JSON.stringify(['React', 'Node.js', 'PostgreSQL']),
        image: 'https://example.com/casestudy1.jpg',
        duration: '3 months',
        teamSize: 4,
        isActive: true,
        featured: true,
      },
      {
        title: 'Test Case Study 2',
        slug: 'test-case-study-2',
        client: 'Test Client 2',
        industry: 'Healthcare',
        description: 'This is a test case study description 2',
        challenge: 'The challenge description 2',
        solution: 'The solution description 2',
        results: JSON.stringify(['Increased efficiency by 40%', 'Better user satisfaction']),
        technologies: JSON.stringify(['Vue', 'Python', 'MongoDB']),
        image: 'https://example.com/casestudy2.jpg',
        duration: '6 months',
        teamSize: 6,
        isActive: true,
        featured: false,
      },
    ]

    for (const caseStudy of caseStudies) {
      await prisma.caseStudy.upsert({
        where: { slug: caseStudy.slug },
        update: caseStudy,
        create: caseStudy,
      })
    }

    console.log('✅ Test data seeded successfully')
  } catch (error) {
    console.error('❌ Failed to seed test data:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

async function cleanupTestEnvironment() {
  console.log('🧹 Cleaning up test environment...')

  try {
    // Remove test database
    if (existsSync(testDbPath)) {
      execSync(`rm -f ${testDbPath}`, { stdio: 'inherit' })
      console.log('✅ Test database removed')
    }

    console.log('🎉 Test environment cleanup complete!')
  } catch (error) {
    console.error('❌ Failed to cleanup test environment:', error)
  }
}

// Main execution
async function main() {
  const command = process.argv[2]

  switch (command) {
    case 'setup':
      await setupTestEnvironment()
      break
    case 'cleanup':
      await cleanupTestEnvironment()
      break
    case 'seed':
      await seedTestData()
      break
    default:
      console.log('Usage: npm run test:setup [setup|cleanup|seed]')
      console.log('  setup   - Setup test environment and database')
      console.log('  cleanup - Remove test database and files')
      console.log('  seed    - Seed test database with sample data')
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Test setup failed:', error)
    process.exit(1)
  })
}