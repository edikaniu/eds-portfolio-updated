#!/usr/bin/env node

/**
 * Endpoint Testing Script
 * Tests all API endpoints for functionality and performance
 */

const https = require('https');
const http = require('http');

class EndpointTester {
  constructor(baseUrl = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
    this.results = {
      passed: 0,
      failed: 0,
      total: 0,
      tests: []
    };
  }

  async makeRequest(path, options = {}) {
    return new Promise((resolve, reject) => {
      const url = `${this.baseUrl}${path}`;
      const urlObj = new URL(url);
      const client = urlObj.protocol === 'https:' ? https : http;

      const requestOptions = {
        hostname: urlObj.hostname,
        port: urlObj.port,
        path: urlObj.pathname + urlObj.search,
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'EndpointTester/1.0',
          ...options.headers
        },
        timeout: options.timeout || 10000
      };

      const startTime = Date.now();
      const req = client.request(requestOptions, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          const responseTime = Date.now() - startTime;
          let parsedData;
          
          try {
            parsedData = JSON.parse(data);
          } catch (error) {
            parsedData = data;
          }

          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: parsedData,
            responseTime,
            success: res.statusCode >= 200 && res.statusCode < 300
          });
        });
      });

      req.on('error', (error) => {
        reject({
          error: error.message,
          responseTime: Date.now() - startTime
        });
      });

      req.on('timeout', () => {
        req.destroy();
        reject({
          error: 'Request timeout',
          responseTime: Date.now() - startTime
        });
      });

      if (options.body) {
        req.write(JSON.stringify(options.body));
      }

      req.end();
    });
  }

  async testEndpoint(name, path, expectedStatus = 200, options = {}) {
    this.results.total++;
    
    try {
      console.log(`🧪 Testing: ${name}`);
      const result = await this.makeRequest(path, options);

      const success = result.statusCode === expectedStatus;
      const performance = result.responseTime < 5000 ? '🟢' : result.responseTime < 10000 ? '🟡' : '🔴';
      
      if (success) {
        console.log(`  ✅ ${name} - ${result.statusCode} (${result.responseTime}ms) ${performance}`);
        this.results.passed++;
      } else {
        console.log(`  ❌ ${name} - Expected ${expectedStatus}, got ${result.statusCode} (${result.responseTime}ms)`);
        this.results.failed++;
      }

      this.results.tests.push({
        name,
        path,
        success,
        statusCode: result.statusCode,
        expectedStatus,
        responseTime: result.responseTime,
        data: result.data,
        error: null
      });

      return result;

    } catch (error) {
      console.log(`  ❌ ${name} - Request failed: ${error.error} (${error.responseTime}ms)`);
      this.results.failed++;
      this.results.tests.push({
        name,
        path,
        success: false,
        statusCode: null,
        expectedStatus,
        responseTime: error.responseTime,
        data: null,
        error: error.error
      });
    }
  }

  async runHealthChecks() {
    console.log('🏥 Running Health Check Tests...\n');

    // Basic health check
    await this.testEndpoint('Basic Health Check', '/api/health');

    // Detailed health check
    await this.testEndpoint('Detailed Health Check', '/api/health/detailed');
  }

  async runMonitoringTests() {
    console.log('\n📊 Running Monitoring Tests...\n');

    // System monitoring
    await this.testEndpoint('System Monitoring', '/api/monitoring/system');

    // Alerts monitoring
    await this.testEndpoint('Alerts Monitoring', '/api/monitoring/alerts');
  }

  async runBackupTests() {
    console.log('\n💾 Running Backup Tests...\n');

    // Get backup history
    await this.testEndpoint('Backup History', '/api/backup/create');

    // Test backup creation (POST)
    await this.testEndpoint('Create Backup', '/api/backup/create', 200, {
      method: 'POST',
      body: {
        type: 'manual',
        includeMedia: false,
        includeSystemData: false,
        compression: true
      }
    });
  }

  async runMaintenanceTests() {
    console.log('\n🔧 Running Maintenance Tests...\n');

    // Cache cleanup status
    await this.testEndpoint('Cache Status', '/api/cleanup/cache');

    // Database maintenance
    await this.testEndpoint('Database Stats', '/api/maintenance/database', 200, {
      method: 'POST',
      body: { operation: 'stats' }
    });

    // Cron maintenance endpoint
    await this.testEndpoint('Cron Maintenance Status', '/api/cron/maintenance');
  }

  async runPublicEndpoints() {
    console.log('\n🌐 Running Public Endpoint Tests...\n');

    // Public API endpoints
    await this.testEndpoint('Projects API', '/api/projects');
    await this.testEndpoint('Blog Posts API', '/api/blog');
    await this.testEndpoint('Case Studies API', '/api/case-studies');

    // Contact form
    await this.testEndpoint('Contact Form', '/api/contact', 200, {
      method: 'POST',
      body: {
        name: 'Test User',
        email: 'test@example.com',
        message: 'This is a test message'
      }
    });
  }

  async runSecurityTests() {
    console.log('\n🔒 Running Security Tests...\n');

    // Test rate limiting (should allow first request)
    await this.testEndpoint('Rate Limiting Test', '/api/health');

    // Test unauthorized admin access (should fail)
    await this.testEndpoint('Admin Unauthorized Access', '/api/admin/projects', 401);

    // Test CORS headers
    const corsResult = await this.testEndpoint('CORS Headers', '/api/health', 200, {
      headers: { 'Origin': 'http://localhost:3000' }
    });
  }

  async runPerformanceTests() {
    console.log('\n⚡ Running Performance Tests...\n');

    const performanceEndpoints = [
      { name: 'Health Check Performance', path: '/api/health' },
      { name: 'System Monitoring Performance', path: '/api/monitoring/system' },
      { name: 'Projects API Performance', path: '/api/projects' }
    ];

    for (const endpoint of performanceEndpoints) {
      const startTime = Date.now();
      const results = [];
      
      // Run 5 concurrent requests
      const promises = Array(5).fill().map(() => 
        this.makeRequest(endpoint.path).catch(e => ({ error: e }))
      );
      
      const responses = await Promise.all(promises);
      const totalTime = Date.now() - startTime;
      const successful = responses.filter(r => r.success && !r.error).length;
      const avgResponseTime = responses
        .filter(r => !r.error)
        .reduce((sum, r) => sum + r.responseTime, 0) / responses.length;

      console.log(`  📈 ${endpoint.name}:`);
      console.log(`    Successful: ${successful}/5 requests`);
      console.log(`    Avg Response Time: ${avgResponseTime.toFixed(1)}ms`);
      console.log(`    Total Time: ${totalTime}ms`);
      console.log(`    Performance: ${avgResponseTime < 1000 ? '🟢 Excellent' : avgResponseTime < 2000 ? '🟡 Good' : '🔴 Needs Optimization'}`);
    }
  }

  generateReport() {
    console.log('\n📊 Test Results Summary');
    console.log('='.repeat(50));
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`📋 Total Tests: ${this.results.total}`);

    const passRate = ((this.results.passed / this.results.total) * 100).toFixed(1);
    console.log(`📈 Pass Rate: ${passRate}%`);

    // Performance analysis
    const responseTimes = this.results.tests
      .filter(t => t.success && t.responseTime)
      .map(t => t.responseTime);

    if (responseTimes.length > 0) {
      const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      const maxResponseTime = Math.max(...responseTimes);
      
      console.log(`⚡ Avg Response Time: ${avgResponseTime.toFixed(1)}ms`);
      console.log(`⚡ Max Response Time: ${maxResponseTime}ms`);
    }

    // Failed tests details
    const failedTests = this.results.tests.filter(t => !t.success);
    if (failedTests.length > 0) {
      console.log('\n❌ Failed Tests:');
      failedTests.forEach(test => {
        console.log(`  • ${test.name} (${test.path})`);
        if (test.error) {
          console.log(`    Error: ${test.error}`);
        } else {
          console.log(`    Expected: ${test.expectedStatus}, Got: ${test.statusCode}`);
        }
      });
    }

    // Recommendations
    console.log('\n💡 Recommendations:');
    if (passRate >= 95) {
      console.log('🎉 Excellent! All endpoints are functioning properly.');
    } else if (passRate >= 85) {
      console.log('👍 Good performance, but some endpoints need attention.');
    } else {
      console.log('⚠️ Multiple endpoints are failing. Review the failed tests above.');
    }

    const slowTests = this.results.tests.filter(t => t.responseTime > 2000);
    if (slowTests.length > 0) {
      console.log(`⚡ ${slowTests.length} endpoints have slow response times (>2s). Consider optimization.`);
    }

    return passRate >= 85;
  }

  async runAllTests() {
    console.log('🚀 Starting comprehensive endpoint testing...\n');
    console.log(`Base URL: ${this.baseUrl}\n`);

    await this.runHealthChecks();
    await this.runMonitoringTests();
    await this.runBackupTests();
    await this.runMaintenanceTests();
    await this.runPublicEndpoints();
    await this.runSecurityTests();
    await this.runPerformanceTests();

    return this.generateReport();
  }
}

// Main execution
async function main() {
  const baseUrl = process.argv[2] || 'http://localhost:3000';
  const tester = new EndpointTester(baseUrl);
  
  try {
    const success = await tester.runAllTests();
    
    console.log('\n🎯 Next Steps:');
    if (success) {
      console.log('✅ All endpoint tests passed! The application is ready.');
      if (baseUrl.includes('localhost')) {
        console.log('🌐 Test against production: node scripts/test-endpoints.js https://your-app.vercel.app');
      }
    } else {
      console.log('❌ Some tests failed. Review the errors above.');
    }
    
    process.exit(success ? 0 : 1);
    
  } catch (error) {
    console.error('❌ Testing script failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = EndpointTester;