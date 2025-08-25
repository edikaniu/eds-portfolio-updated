#!/usr/bin/env node

/**
 * Deployment Validation Script
 * Comprehensive testing and validation for Vercel production readiness
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧪 Starting deployment validation...\n');

// Colors for output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
};

class ValidationRunner {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      warnings: 0,
      tests: []
    };
  }

  log(level, message, details = '') {
    const timestamp = new Date().toISOString();
    const color = {
      error: colors.red,
      success: colors.green,
      warning: colors.yellow,
      info: colors.blue,
    }[level] || colors.reset;
    
    console.log(`${color}[${timestamp}] ${message}${colors.reset}`);
    if (details) {
      console.log(`  ${details}`);
    }
  }

  test(name, testFn) {
    try {
      console.log(`\n🔍 Testing: ${name}`);
      const result = testFn();
      
      if (result.success) {
        this.log('success', `✅ ${name} - PASSED`);
        this.results.passed++;
      } else {
        this.log('warning', `⚠️  ${name} - WARNING`, result.message);
        this.results.warnings++;
      }
      
      this.results.tests.push({
        name,
        status: result.success ? 'passed' : 'warning',
        message: result.message,
        details: result.details
      });
      
    } catch (error) {
      this.log('error', `❌ ${name} - FAILED`, error.message);
      this.results.failed++;
      this.results.tests.push({
        name,
        status: 'failed',
        message: error.message,
        details: error.stack
      });
    }
  }

  // File structure validation
  validateFileStructure() {
    const requiredFiles = [
      { path: 'package.json', critical: true },
      { path: 'next.config.mjs', critical: true },
      { path: 'vercel.json', critical: true },
      { path: 'instrumentation.ts', critical: true },
      { path: 'middleware.ts', critical: true },
      { path: 'prisma/schema.prisma', critical: true },
      { path: '.env.example', critical: false },
      { path: '.env.vercel.example', critical: false },
      { path: 'VERCEL_DEPLOYMENT.md', critical: false },
    ];

    const requiredDirs = [
      'app/api/health',
      'app/api/monitoring',
      'app/api/backup',
      'app/api/cleanup',
      'app/api/maintenance',
      'app/api/cron',
      'lib/cache',
      'lib/performance',
      'scripts'
    ];

    let missingCritical = [];
    let missingOptional = [];

    // Check files
    for (const file of requiredFiles) {
      if (!fs.existsSync(file.path)) {
        if (file.critical) {
          missingCritical.push(file.path);
        } else {
          missingOptional.push(file.path);
        }
      }
    }

    // Check directories
    for (const dir of requiredDirs) {
      if (!fs.existsSync(dir)) {
        missingCritical.push(dir + '/');
      }
    }

    if (missingCritical.length > 0) {
      throw new Error(`Missing critical files/directories: ${missingCritical.join(', ')}`);
    }

    return {
      success: true,
      message: `All critical files present${missingOptional.length > 0 ? ` (${missingOptional.length} optional files missing)` : ''}`,
      details: { missingOptional }
    };
  }

  // Package.json validation
  validatePackageJson() {
    const packagePath = 'package.json';
    const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

    const requiredScripts = [
      'build',
      'start',
      'dev',
      'type-check',
      'postinstall'
    ];

    const requiredDependencies = [
      '@prisma/client',
      'next',
      'react',
      'react-dom'
    ];

    const missingScripts = requiredScripts.filter(script => !packageData.scripts[script]);
    const missingDeps = requiredDependencies.filter(dep => 
      !packageData.dependencies[dep] && !packageData.devDependencies[dep]
    );

    if (missingScripts.length > 0 || missingDeps.length > 0) {
      throw new Error(`Missing: scripts [${missingScripts.join(', ')}], dependencies [${missingDeps.join(', ')}]`);
    }

    return {
      success: true,
      message: 'Package.json configuration valid',
      details: { 
        scriptsCount: Object.keys(packageData.scripts).length,
        dependenciesCount: Object.keys(packageData.dependencies || {}).length 
      }
    };
  }

  // Vercel.json validation
  validateVercelConfig() {
    const vercelPath = 'vercel.json';
    const vercelData = JSON.parse(fs.readFileSync(vercelPath, 'utf8'));

    const requiredFields = ['buildCommand', 'framework'];
    const missingFields = requiredFields.filter(field => !vercelData[field]);

    if (missingFields.length > 0) {
      throw new Error(`Missing Vercel config fields: ${missingFields.join(', ')}`);
    }

    // Check cron jobs
    if (!vercelData.crons || vercelData.crons.length === 0) {
      return {
        success: false,
        message: 'No cron jobs configured - scheduled tasks will not work'
      };
    }

    // Validate function configurations
    if (!vercelData.functions) {
      return {
        success: false,
        message: 'No function timeouts configured - may cause timeouts'
      };
    }

    return {
      success: true,
      message: `Vercel config valid (${vercelData.crons.length} cron jobs, function timeouts configured)`,
      details: { 
        cronJobs: vercelData.crons.length,
        hasFunctionConfig: !!vercelData.functions,
        hasHeaders: !!vercelData.headers
      }
    };
  }

  // Prisma schema validation
  validatePrismaSchema() {
    const schemaPath = 'prisma/schema.prisma';
    const schemaContent = fs.readFileSync(schemaPath, 'utf8');

    // Check for PostgreSQL provider
    if (!schemaContent.includes('provider = "postgresql"')) {
      throw new Error('Prisma schema must use PostgreSQL provider for Vercel compatibility');
    }

    // Check for required models
    const requiredModels = ['Project', 'BlogPost', 'CaseStudy'];
    const missingModels = requiredModels.filter(model => 
      !schemaContent.includes(`model ${model}`)
    );

    if (missingModels.length > 0) {
      return {
        success: false,
        message: `Missing Prisma models: ${missingModels.join(', ')}`
      };
    }

    return {
      success: true,
      message: 'Prisma schema configured for PostgreSQL with required models'
    };
  }

  // Environment variables validation
  validateEnvironmentSetup() {
    const envExamplePath = '.env.example';
    const vercelEnvPath = '.env.vercel.example';

    if (!fs.existsSync(envExamplePath)) {
      throw new Error('Missing .env.example file');
    }

    if (!fs.existsSync(vercelEnvPath)) {
      return {
        success: false,
        message: 'Missing .env.vercel.example - deployment guide may be incomplete'
      };
    }

    const envContent = fs.readFileSync(envExamplePath, 'utf8');
    const criticalVars = [
      'DATABASE_URL',
      'NEXTAUTH_SECRET',
      'NEXTAUTH_URL'
    ];

    const missingVars = criticalVars.filter(varName => 
      !envContent.includes(varName)
    );

    if (missingVars.length > 0) {
      throw new Error(`Missing critical environment variables in .env.example: ${missingVars.join(', ')}`);
    }

    return {
      success: true,
      message: 'Environment variable templates configured properly'
    };
  }

  // API endpoints validation
  validateApiEndpoints() {
    const apiDir = 'app/api';
    const requiredEndpoints = [
      'health/route.ts',
      'health/detailed/route.ts',
      'monitoring/system/route.ts',
      'monitoring/alerts/route.ts',
      'backup/create/route.ts',
      'backup/restore/route.ts',
      'cleanup/cache/route.ts',
      'maintenance/database/route.ts',
      'cron/maintenance/route.ts'
    ];

    const missingEndpoints = [];
    for (const endpoint of requiredEndpoints) {
      const endpointPath = path.join(apiDir, endpoint);
      if (!fs.existsSync(endpointPath)) {
        missingEndpoints.push(endpoint);
      }
    }

    if (missingEndpoints.length > 0) {
      throw new Error(`Missing API endpoints: ${missingEndpoints.join(', ')}`);
    }

    return {
      success: true,
      message: `All ${requiredEndpoints.length} critical API endpoints present`
    };
  }

  // TypeScript validation
  validateTypeScript() {
    try {
      console.log('  Running TypeScript compilation check...');
      execSync('npx tsc --noEmit --skipLibCheck', { stdio: 'pipe' });
      
      return {
        success: true,
        message: 'TypeScript compilation successful'
      };
    } catch (error) {
      const errorOutput = error.stdout?.toString() || error.stderr?.toString() || error.message;
      throw new Error(`TypeScript errors found:\n${errorOutput}`);
    }
  }

  // Build validation
  validateBuild() {
    try {
      console.log('  Running production build...');
      execSync('npm run build', { stdio: 'pipe' });
      
      // Check if .next directory was created
      if (!fs.existsSync('.next')) {
        throw new Error('Build completed but .next directory not found');
      }

      return {
        success: true,
        message: 'Production build successful'
      };
    } catch (error) {
      const errorOutput = error.stdout?.toString() || error.stderr?.toString() || error.message;
      throw new Error(`Build failed:\n${errorOutput}`);
    }
  }

  // Dependency validation
  validateDependencies() {
    try {
      console.log('  Checking for security vulnerabilities...');
      execSync('npm audit --audit-level=moderate', { stdio: 'pipe' });
      
      return {
        success: true,
        message: 'No moderate or high security vulnerabilities found'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Security vulnerabilities found - run "npm audit fix" to resolve'
      };
    }
  }

  // Lint validation
  validateLinting() {
    try {
      console.log('  Running ESLint...');
      execSync('npm run lint', { stdio: 'pipe' });
      
      return {
        success: true,
        message: 'No linting errors found'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Linting errors found - run "npm run lint" to see details'
      };
    }
  }

  // Run all validations
  runValidations() {
    console.log('🚀 Running comprehensive deployment validation...\n');

    // File structure validation
    this.test('File Structure', () => this.validateFileStructure());
    
    // Configuration validation
    this.test('Package.json Configuration', () => this.validatePackageJson());
    this.test('Vercel Configuration', () => this.validateVercelConfig());
    this.test('Prisma Schema', () => this.validatePrismaSchema());
    this.test('Environment Variables', () => this.validateEnvironmentSetup());
    
    // Code validation
    this.test('API Endpoints', () => this.validateApiEndpoints());
    this.test('TypeScript Compilation', () => this.validateTypeScript());
    this.test('Linting', () => this.validateLinting());
    this.test('Dependencies Security', () => this.validateDependencies());
    
    // Build validation
    this.test('Production Build', () => this.validateBuild());
  }

  // Generate validation report
  generateReport() {
    console.log('\n📊 Validation Summary');
    console.log('='.repeat(50));
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`⚠️  Warnings: ${this.results.warnings}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`📋 Total Tests: ${this.results.tests.length}`);

    const passRate = ((this.results.passed / this.results.tests.length) * 100).toFixed(1);
    console.log(`📈 Pass Rate: ${passRate}%`);

    // Show detailed results
    if (this.results.failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.results.tests
        .filter(test => test.status === 'failed')
        .forEach(test => {
          console.log(`  • ${test.name}: ${test.message}`);
        });
    }

    if (this.results.warnings > 0) {
      console.log('\n⚠️  Warnings:');
      this.results.tests
        .filter(test => test.status === 'warning')
        .forEach(test => {
          console.log(`  • ${test.name}: ${test.message}`);
        });
    }

    // Deployment readiness assessment
    console.log('\n🎯 Deployment Readiness:');
    if (this.results.failed === 0) {
      console.log(`${colors.green}🚀 READY FOR DEPLOYMENT${colors.reset}`);
      console.log('All critical validations passed. You can safely deploy to Vercel.');
      
      if (this.results.warnings > 0) {
        console.log(`${colors.yellow}Note: ${this.results.warnings} warning(s) found. Review above for optimization opportunities.${colors.reset}`);
      }
    } else {
      console.log(`${colors.red}🚫 NOT READY FOR DEPLOYMENT${colors.reset}`);
      console.log('Critical issues found. Please fix the failed tests before deploying.');
    }

    return this.results.failed === 0;
  }
}

// Run validation
const validator = new ValidationRunner();

try {
  validator.runValidations();
  const isReady = validator.generateReport();
  
  console.log('\n🔗 Next Steps:');
  if (isReady) {
    console.log('1. Deploy to Vercel: npm run deploy:vercel:prod');
    console.log('2. Configure environment variables in Vercel dashboard');
    console.log('3. Set up database connection');
    console.log('4. Test the deployment');
  } else {
    console.log('1. Fix the failed validations above');
    console.log('2. Re-run this validation script');
    console.log('3. Deploy when all tests pass');
  }
  
  process.exit(isReady ? 0 : 1);
  
} catch (error) {
  console.error(`${colors.red}❌ Validation script failed: ${error.message}${colors.reset}`);
  process.exit(1);
}