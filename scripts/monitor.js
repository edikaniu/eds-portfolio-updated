#!/usr/bin/env node

/**
 * Production Monitoring Script
 * Monitors system health, performance, and alerts
 */

const os = require('os');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Configuration
const CONFIG = {
  healthCheckUrl: process.env.HEALTH_CHECK_URL || 'http://localhost:3000/api/health',
  checkInterval: parseInt(process.env.MONITOR_INTERVAL) || 60000, // 1 minute
  alertThresholds: {
    cpu: 80,
    memory: 85,
    disk: 90,
    responseTime: 5000, // 5 seconds
  },
  notifications: {
    slack: process.env.SLACK_WEBHOOK_URL,
    email: process.env.ALERT_EMAIL,
    discord: process.env.DISCORD_WEBHOOK_URL,
  },
  logFile: path.join(process.cwd(), 'logs', 'monitor.log'),
};

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
};

class ProductionMonitor {
  constructor() {
    this.stats = {
      uptime: 0,
      checks: 0,
      failures: 0,
      lastFailure: null,
      alertsSent: 0,
    };
    
    this.lastAlerts = new Map();
    this.alerts = [];
    
    this.initializeLogFile();
    console.log(colors.blue + '🔍 Production Monitor Starting...' + colors.reset);
    this.log('info', 'Production monitor initialized');
  }

  initializeLogFile() {
    const logDir = path.dirname(CONFIG.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  log(level, message, data = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...data,
    };
    
    // Console output
    const color = {
      error: colors.red,
      warn: colors.yellow,
      info: colors.blue,
      debug: colors.cyan,
    }[level] || colors.white;
    
    console.log(`${color}[${timestamp}] ${level.toUpperCase()}: ${message}${colors.reset}`);
    
    // File output
    try {
      fs.appendFileSync(CONFIG.logFile, JSON.stringify(logEntry) + '\n');
    } catch (error) {
      console.error('Failed to write to log file:', error.message);
    }
  }

  async checkHealth() {
    const startTime = Date.now();
    
    return new Promise((resolve, reject) => {
      const url = new URL(CONFIG.healthCheckUrl);
      const client = url.protocol === 'https:' ? https : http;
      
      const request = client.get(CONFIG.healthCheckUrl, {
        timeout: CONFIG.alertThresholds.responseTime,
      }, (response) => {
        let data = '';
        
        response.on('data', (chunk) => {
          data += chunk;
        });
        
        response.on('end', () => {
          const responseTime = Date.now() - startTime;
          
          try {
            const healthData = JSON.parse(data);
            resolve({
              success: response.statusCode === 200 && healthData.success,
              statusCode: response.statusCode,
              responseTime,
              data: healthData,
            });
          } catch (error) {
            resolve({
              success: false,
              statusCode: response.statusCode,
              responseTime,
              error: 'Invalid JSON response',
            });
          }
        });
      });
      
      request.on('error', (error) => {
        reject({
          success: false,
          responseTime: Date.now() - startTime,
          error: error.message,
        });
      });
      
      request.on('timeout', () => {
        request.destroy();
        reject({
          success: false,
          responseTime: Date.now() - startTime,
          error: 'Request timeout',
        });
      });
    });
  }

  getSystemMetrics() {
    const cpuUsage = os.loadavg()[0] / os.cpus().length * 100;
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const memoryUsage = ((totalMemory - freeMemory) / totalMemory) * 100;
    
    // Disk usage (approximate)
    let diskUsage = 0;
    try {
      const stats = fs.statSync(process.cwd());
      diskUsage = 50; // Placeholder - would need better disk monitoring
    } catch (error) {
      this.log('warn', 'Could not get disk usage');
    }
    
    return {
      cpu: Math.round(cpuUsage * 100) / 100,
      memory: Math.round(memoryUsage * 100) / 100,
      disk: diskUsage,
      uptime: process.uptime(),
      systemUptime: os.uptime(),
    };
  }

  checkThresholds(metrics, healthResult) {
    const alerts = [];
    
    // CPU check
    if (metrics.cpu > CONFIG.alertThresholds.cpu) {
      alerts.push({
        type: 'cpu',
        level: 'warning',
        message: `High CPU usage: ${metrics.cpu}%`,
        value: metrics.cpu,
        threshold: CONFIG.alertThresholds.cpu,
      });
    }
    
    // Memory check
    if (metrics.memory > CONFIG.alertThresholds.memory) {
      alerts.push({
        type: 'memory',
        level: 'warning',
        message: `High memory usage: ${metrics.memory}%`,
        value: metrics.memory,
        threshold: CONFIG.alertThresholds.memory,
      });
    }
    
    // Disk check
    if (metrics.disk > CONFIG.alertThresholds.disk) {
      alerts.push({
        type: 'disk',
        level: 'critical',
        message: `High disk usage: ${metrics.disk}%`,
        value: metrics.disk,
        threshold: CONFIG.alertThresholds.disk,
      });
    }
    
    // Response time check
    if (healthResult.responseTime > CONFIG.alertThresholds.responseTime) {
      alerts.push({
        type: 'response_time',
        level: 'warning',
        message: `Slow response time: ${healthResult.responseTime}ms`,
        value: healthResult.responseTime,
        threshold: CONFIG.alertThresholds.responseTime,
      });
    }
    
    // Health check failure
    if (!healthResult.success) {
      alerts.push({
        type: 'health_check',
        level: 'critical',
        message: `Health check failed: ${healthResult.error || 'Unknown error'}`,
        value: healthResult.statusCode || 0,
        error: healthResult.error,
      });
    }
    
    return alerts;
  }

  async sendAlert(alert) {
    const alertKey = `${alert.type}_${alert.level}`;
    const now = Date.now();
    const lastAlert = this.lastAlerts.get(alertKey);
    
    // Rate limiting - don't send same alert more than once every 15 minutes
    if (lastAlert && (now - lastAlert) < 900000) {
      return;
    }
    
    this.lastAlerts.set(alertKey, now);
    this.stats.alertsSent++;
    
    const message = this.formatAlertMessage(alert);
    
    // Send to configured notification channels
    if (CONFIG.notifications.slack) {
      await this.sendSlackAlert(message, alert);
    }
    
    if (CONFIG.notifications.discord) {
      await this.sendDiscordAlert(message, alert);
    }
    
    this.log('warn', `Alert sent: ${alert.message}`, { alert });
  }

  formatAlertMessage(alert) {
    const emoji = {
      critical: '🚨',
      warning: '⚠️',
      info: 'ℹ️',
    }[alert.level] || '📊';
    
    const timestamp = new Date().toISOString();
    
    return {
      text: `${emoji} **Production Alert**\n\n` +
            `**Type:** ${alert.type.replace('_', ' ').toUpperCase()}\n` +
            `**Level:** ${alert.level.toUpperCase()}\n` +
            `**Message:** ${alert.message}\n` +
            `**Time:** ${timestamp}\n` +
            `**Server:** ${os.hostname()}`,
      alert,
    };
  }

  async sendSlackAlert(message, alert) {
    if (!CONFIG.notifications.slack) return;
    
    try {
      const payload = {
        text: message.text,
        attachments: [{
          color: alert.level === 'critical' ? 'danger' : 'warning',
          fields: [
            {
              title: 'Alert Type',
              value: alert.type,
              short: true,
            },
            {
              title: 'Level',
              value: alert.level,
              short: true,
            },
          ],
        }],
      };
      
      await this.makeHttpRequest(CONFIG.notifications.slack, 'POST', payload);
      this.log('info', 'Slack alert sent successfully');
    } catch (error) {
      this.log('error', 'Failed to send Slack alert', { error: error.message });
    }
  }

  async sendDiscordAlert(message, alert) {
    if (!CONFIG.notifications.discord) return;
    
    try {
      const color = {
        critical: 15158332, // Red
        warning: 15105570,  // Orange
        info: 3447003,      // Blue
      }[alert.level] || 3447003;
      
      const payload = {
        embeds: [{
          title: '🔍 Production Monitor Alert',
          description: message.text,
          color: color,
          timestamp: new Date().toISOString(),
          footer: {
            text: `Server: ${os.hostname()}`,
          },
        }],
      };
      
      await this.makeHttpRequest(CONFIG.notifications.discord, 'POST', payload);
      this.log('info', 'Discord alert sent successfully');
    } catch (error) {
      this.log('error', 'Failed to send Discord alert', { error: error.message });
    }
  }

  async makeHttpRequest(url, method, data) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const client = urlObj.protocol === 'https:' ? https : http;
      
      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port,
        path: urlObj.pathname + urlObj.search,
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };
      
      const request = client.request(options, (response) => {
        let responseData = '';
        
        response.on('data', (chunk) => {
          responseData += chunk;
        });
        
        response.on('end', () => {
          if (response.statusCode >= 200 && response.statusCode < 300) {
            resolve(responseData);
          } else {
            reject(new Error(`HTTP ${response.statusCode}: ${responseData}`));
          }
        });
      });
      
      request.on('error', reject);
      
      if (data) {
        request.write(JSON.stringify(data));
      }
      
      request.end();
    });
  }

  displayStatus(metrics, healthResult, alerts) {
    console.clear();
    console.log(colors.blue + '🔍 Production Monitor Dashboard' + colors.reset);
    console.log('='.repeat(50));
    console.log(`${colors.cyan}Uptime:${colors.reset} ${Math.floor(this.stats.uptime / 3600)}h ${Math.floor((this.stats.uptime % 3600) / 60)}m`);
    console.log(`${colors.cyan}Checks:${colors.reset} ${this.stats.checks} (${this.stats.failures} failures)`);
    console.log(`${colors.cyan}Alerts Sent:${colors.reset} ${this.stats.alertsSent}`);
    console.log();
    
    // Health Status
    const healthColor = healthResult.success ? colors.green : colors.red;
    const healthIcon = healthResult.success ? '✅' : '❌';
    console.log(`${healthColor}${healthIcon} Health Status: ${healthResult.success ? 'HEALTHY' : 'UNHEALTHY'}${colors.reset}`);
    console.log(`   Response Time: ${healthResult.responseTime}ms`);
    console.log();
    
    // System Metrics
    console.log(colors.yellow + '📊 System Metrics' + colors.reset);
    console.log('-'.repeat(30));
    
    const cpuColor = metrics.cpu > CONFIG.alertThresholds.cpu ? colors.red : colors.green;
    console.log(`${cpuColor}CPU Usage: ${metrics.cpu}%${colors.reset}`);
    
    const memColor = metrics.memory > CONFIG.alertThresholds.memory ? colors.red : colors.green;
    console.log(`${memColor}Memory Usage: ${metrics.memory}%${colors.reset}`);
    
    const diskColor = metrics.disk > CONFIG.alertThresholds.disk ? colors.red : colors.green;
    console.log(`${diskColor}Disk Usage: ${metrics.disk}%${colors.reset}`);
    
    console.log(`${colors.cyan}System Uptime: ${Math.floor(metrics.systemUptime / 3600)}h${colors.reset}`);
    console.log();
    
    // Active Alerts
    if (alerts.length > 0) {
      console.log(colors.red + '🚨 Active Alerts' + colors.reset);
      console.log('-'.repeat(30));
      alerts.forEach(alert => {
        const alertColor = alert.level === 'critical' ? colors.red : colors.yellow;
        console.log(`${alertColor}${alert.message}${colors.reset}`);
      });
      console.log();
    }
    
    console.log(`${colors.magenta}Last Update: ${new Date().toLocaleTimeString()}${colors.reset}`);
    console.log(`${colors.magenta}Next Check: ${Math.ceil((CONFIG.checkInterval - (Date.now() % CONFIG.checkInterval)) / 1000)}s${colors.reset}`);
  }

  async runCheck() {
    try {
      this.stats.checks++;
      const metrics = this.getSystemMetrics();
      const healthResult = await this.checkHealth();
      
      if (!healthResult.success) {
        this.stats.failures++;
        this.stats.lastFailure = Date.now();
      }
      
      const alerts = this.checkThresholds(metrics, healthResult);
      
      // Send alerts
      for (const alert of alerts) {
        await this.sendAlert(alert);
      }
      
      // Update display
      this.displayStatus(metrics, healthResult, alerts);
      
      // Log check result
      this.log('info', 'Health check completed', {
        metrics,
        health: {
          success: healthResult.success,
          responseTime: healthResult.responseTime,
        },
        alerts: alerts.length,
      });
      
    } catch (error) {
      this.stats.failures++;
      this.stats.lastFailure = Date.now();
      this.log('error', 'Health check failed', { error: error.message });
      
      // Send critical alert
      await this.sendAlert({
        type: 'monitor_error',
        level: 'critical',
        message: `Monitor check failed: ${error.message}`,
        error: error.message,
      });
    }
  }

  start() {
    console.log(colors.green + '✅ Monitor started. Press Ctrl+C to stop.' + colors.reset);
    
    // Initial check
    this.runCheck();
    
    // Schedule regular checks
    this.interval = setInterval(() => {
      this.stats.uptime = Math.floor(process.uptime());
      this.runCheck();
    }, CONFIG.checkInterval);
    
    // Graceful shutdown
    process.on('SIGINT', () => {
      console.log(colors.yellow + '\n🛑 Shutting down monitor...' + colors.reset);
      clearInterval(this.interval);
      this.log('info', 'Monitor shutdown');
      process.exit(0);
    });
  }
}

// Start monitoring
const monitor = new ProductionMonitor();
monitor.start();