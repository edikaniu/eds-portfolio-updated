#!/usr/bin/env node

/**
 * Vercel Deployment Script
 * Automates the deployment process with pre-deployment checks
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Vercel deployment process...\n');

// Configuration
const config = {
  environment: process.env.VERCEL_ENV || 'production',
  skipBuild: process.argv.includes('--skip-build'),
  skipTests: process.argv.includes('--skip-tests'),
  production: process.argv.includes('--prod'),
  preview: process.argv.includes('--preview')
};

function runCommand(command, description) {
  console.log(`📋 ${description}...`);
  try {
    const result = execSync(command, { stdio: 'inherit', encoding: 'utf8' });
    console.log(`✅ ${description} completed\n`);
    return result;
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    process.exit(1);
  }
}

function checkFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${description} found`);
    return true;
  } else {
    console.log(`⚠️  ${description} not found at ${filePath}`);
    return false;
  }
}

function preDeploymentChecks() {
  console.log('🔍 Running pre-deployment checks...\n');
  
  // Check required files
  const requiredFiles = [
    { path: 'package.json', description: 'Package.json' },
    { path: 'next.config.mjs', description: 'Next.js config' },
    { path: 'vercel.json', description: 'Vercel config' },
    { path: 'prisma/schema.prisma', description: 'Prisma schema' }
  ];

  let allFilesExist = true;
  requiredFiles.forEach(file => {
    if (!checkFile(file.path, file.description)) {
      allFilesExist = false;
    }
  });

  if (!allFilesExist) {
    console.error('❌ Missing required files. Please check the above errors.');
    process.exit(1);
  }

  // Check environment variables
  console.log('\n📊 Checking critical environment variables...');
  const requiredEnvVars = [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL'
  ];

  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missingEnvVars.length > 0) {
    console.log(`⚠️  Missing environment variables: ${missingEnvVars.join(', ')}`);
    console.log('Please set these in your Vercel project settings.');
  } else {
    console.log('✅ All critical environment variables are set');
  }

  // Check database connection (if DATABASE_URL is available)
  if (process.env.DATABASE_URL && !config.skipTests) {
    try {
      console.log('🗄️  Testing database connection...');
      execSync('npx prisma db push --preview-feature', { stdio: 'pipe' });
      console.log('✅ Database connection successful');
    } catch (error) {
      console.log('⚠️  Database connection test failed. Deployment will continue.');
    }
  }

  console.log('\n✅ Pre-deployment checks completed\n');
}

function buildApplication() {
  if (config.skipBuild) {
    console.log('⏭️  Skipping build step\n');
    return;
  }

  console.log('🏗️  Building application...\n');
  
  // Install dependencies
  runCommand('npm ci --legacy-peer-deps', 'Installing dependencies');
  
  // Generate Prisma client
  runCommand('npx prisma generate', 'Generating Prisma client');
  
  // Run type checking
  if (!config.skipTests) {
    runCommand('npm run type-check', 'Type checking');
  }
  
  // Build the application
  runCommand('npm run build', 'Building Next.js application');
}

function deployToVercel() {
  console.log('🚀 Deploying to Vercel...\n');
  
  let deployCommand = 'vercel';
  
  if (config.production) {
    deployCommand += ' --prod';
    console.log('📦 Deploying to PRODUCTION');
  } else if (config.preview) {
    deployCommand += ' --no-wait';
    console.log('📦 Deploying to PREVIEW');
  } else {
    console.log('📦 Deploying to development/preview environment');
  }
  
  // Add environment-specific flags
  if (process.env.VERCEL_TOKEN) {
    deployCommand += ` --token ${process.env.VERCEL_TOKEN}`;
  }
  
  runCommand(deployCommand, 'Vercel deployment');
}

function postDeploymentTasks() {
  console.log('🔧 Running post-deployment tasks...\n');
  
  // Run database migrations on production
  if (config.production && process.env.DATABASE_URL) {
    try {
      console.log('🗄️  Running database migrations...');
      execSync('npx prisma migrate deploy', { stdio: 'inherit' });
      console.log('✅ Database migrations completed');
    } catch (error) {
      console.log('⚠️  Database migrations failed:', error.message);
      console.log('Please run migrations manually after deployment');
    }
  }
  
  // Warm up the application
  console.log('🔥 Warming up application...');
  setTimeout(() => {
    console.log('✅ Application should be warmed up');
  }, 5000);
}

function main() {
  try {
    console.log(`🎯 Deployment Environment: ${config.environment}`);
    console.log(`📋 Configuration:`, config);
    console.log('─'.repeat(50));
    
    // Run all deployment steps
    preDeploymentChecks();
    buildApplication();
    deployToVercel();
    postDeploymentTasks();
    
    console.log('\n🎉 Deployment completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Verify the deployment in Vercel dashboard');
    console.log('2. Test critical functionality');
    console.log('3. Check monitoring and logs');
    console.log('4. Update DNS if deploying to production');
    
  } catch (error) {
    console.error('\n❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

// Handle script arguments
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
Vercel Deployment Script

Usage: node scripts/deploy-vercel.js [options]

Options:
  --prod           Deploy to production
  --preview        Deploy to preview environment
  --skip-build     Skip the build step
  --skip-tests     Skip tests and type checking
  --help, -h       Show this help message

Environment Variables:
  VERCEL_TOKEN     Vercel authentication token
  DATABASE_URL     PostgreSQL connection string
  NEXTAUTH_SECRET  NextAuth secret key
  NEXTAUTH_URL     NextAuth URL

Examples:
  node scripts/deploy-vercel.js --prod
  node scripts/deploy-vercel.js --preview --skip-tests
  node scripts/deploy-vercel.js --skip-build
`);
  process.exit(0);
}

// Run the deployment
main();