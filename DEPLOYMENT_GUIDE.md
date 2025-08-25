<<<<<<< HEAD
# Production Deployment Guide

This guide covers the complete deployment process for the portfolio application, including all enterprise-grade features implemented in Phase 4.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Database Configuration](#database-configuration)
- [Security Configuration](#security-configuration)
- [Performance Optimization](#performance-optimization)
- [Deployment Process](#deployment-process)
- [Monitoring Setup](#monitoring-setup)
- [Backup Configuration](#backup-configuration)
- [Post-Deployment Checklist](#post-deployment-checklist)

## Prerequisites

### System Requirements
- **Server**: Minimum 4GB RAM, 2 CPU cores, 50GB storage
- **Node.js**: v18+ or v20+
- **Database**: PostgreSQL 15+ (recommended) or SQLite for development
- **Redis**: v7+ for caching
- **Docker**: v20+ (optional but recommended)

### Required Services
- **Email Provider**: One of Gmail, SendGrid, Mailgun, AWS SES, or SMTP server
- **Domain**: Custom domain with SSL certificate
- **CDN**: Cloudflare or AWS CloudFront (optional but recommended)

## Environment Setup

### 1. Environment Variables

Create production environment files:

#### `.env.production`
```bash
# Application
NODE_ENV=production
PORT=3000
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-super-secure-secret-key-min-32-chars

# Database
DATABASE_URL=postgresql://username:password@host:5432/portfolio_prod
# Or for SQLite: file:./data/prod.db

# Redis (for caching)
REDIS_URL=redis://localhost:6379

# Email Configuration
EMAIL_PROVIDER=sendgrid  # or gmail, mailgun, ses, smtp
EMAIL_FROM=noreply@yourdomain.com
CONTACT_EMAIL=contact@yourdomain.com

# SendGrid
SENDGRID_API_KEY=your-sendgrid-api-key

# Gmail (if using Gmail)
EMAIL_USER=your-gmail@gmail.com
EMAIL_APP_PASSWORD=your-app-password

# Security
JWT_SECRET=your-jwt-secret-key
ENCRYPTION_KEY=your-32-char-encryption-key
ADMIN_SECRET=your-admin-secret

# API Keys
OPENAI_API_KEY=your-openai-api-key
GOOGLE_ANALYTICS_ID=GA-XXXXX-X

# Monitoring
SENTRY_DSN=your-sentry-dsn
LOG_LEVEL=info

# Admin Configuration
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=secure-admin-password

# Rate Limiting
RATE_LIMIT_REQUESTS_PER_MINUTE=100

# Session Configuration
SESSION_TIMEOUT=24h
MAX_SESSIONS_PER_USER=5

# File Upload
MAX_FILE_SIZE=10485760  # 10MB
UPLOAD_DIR=./uploads

# Performance
CACHE_TTL=3600
ENABLE_COMPRESSION=true
```

#### `.env.staging`
```bash
# Similar to production but with staging values
NODE_ENV=staging
NEXTAUTH_URL=https://staging.yourdomain.com
DATABASE_URL=postgresql://username:password@host:5432/portfolio_staging
# ... other staging-specific values
```

### 2. Domain and SSL Setup

#### DNS Configuration
```
A Record:     @           -> your-server-ip
CNAME Record: www         -> yourdomain.com
CNAME Record: staging     -> yourdomain.com
CNAME Record: api         -> yourdomain.com
```

#### SSL Certificate (Let's Encrypt)
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d staging.yourdomain.com
```

## Database Configuration

### PostgreSQL Setup (Recommended)

#### 1. Install PostgreSQL
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# Configure PostgreSQL
sudo -u postgres psql
CREATE DATABASE portfolio_prod;
CREATE USER portfolio_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE portfolio_prod TO portfolio_user;
\q
```

#### 2. Database Migration
```bash
# Install dependencies
npm install

# Run database migrations
npx prisma migrate deploy

# Seed initial data
npm run seed:production
```

### Database Optimization
```sql
-- Add performance indexes
CREATE INDEX CONCURRENTLY idx_analytics_events_timestamp ON analytics_events(timestamp);
CREATE INDEX CONCURRENTLY idx_page_views_session_timestamp ON page_views(session_id, timestamp);
CREATE INDEX CONCURRENTLY idx_audit_logs_timestamp ON audit_logs(timestamp);

-- Configure connection pooling
ALTER SYSTEM SET max_connections = 200;
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
```

## Security Configuration

### 1. Firewall Setup
```bash
# Ubuntu UFW
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 5432  # PostgreSQL (if external)
sudo ufw enable
```

### 2. Nginx Configuration
Create `/etc/nginx/sites-available/portfolio`:

```nginx
# Rate limiting
limit_req_zone $binary_remote_addr zone=general:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=api:10m rate=30r/s;

# Security headers
add_header X-Frame-Options DENY;
add_header X-Content-Type-Options nosniff;
add_header X-XSS-Protection "1; mode=block";
add_header Referrer-Policy "strict-origin-when-cross-origin";
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;";

# Gzip compression
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    
    # Rate limiting
    limit_req zone=general burst=20 nodelay;
    
    # Static files
    location /_next/static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    location /uploads/ {
        expires 1y;
        add_header Cache-Control "public";
    }
    
    # API routes
    location /api/ {
        limit_req zone=api burst=50 nodelay;
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Main application
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Admin panel (additional security)
    location /admin {
        # Optional: IP whitelist
        # allow YOUR_IP;
        # deny all;
        
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/portfolio /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 3. Application Security

#### Security Headers Middleware
The application includes comprehensive security headers and middleware for:
- CSRF protection
- Rate limiting
- Input validation
- SQL injection prevention
- XSS protection
- Admin authentication
- Session management
- Two-factor authentication

## Performance Optimization

### 1. Caching Configuration

The application includes multi-layer caching:
- **Memory Cache**: In-memory LRU cache for frequent data
- **Redis Cache**: Distributed caching for API responses
- **Database Query Cache**: Optimized database queries
- **Static Asset Cache**: CDN and browser caching

### 2. Database Performance
```sql
-- Regular maintenance tasks (add to cron)
-- Analyze query performance
SELECT query, calls, mean_exec_time, total_exec_time 
FROM pg_stat_statements 
ORDER BY total_exec_time DESC 
LIMIT 10;

-- Vacuum and analyze regularly
VACUUM ANALYZE;
```

### 3. Monitoring Performance
The application includes:
- Performance monitoring
- Core Web Vitals tracking
- Database query optimization
- Memory usage monitoring
- Error tracking and alerting

## Deployment Process

### Option 1: Docker Deployment (Recommended)

#### 1. Build Docker Images
```bash
# Build production image
docker build -t portfolio:production .

# Or use docker-compose
docker-compose -f docker-compose.production.yml build
```

#### 2. Deploy with Docker Compose
```bash
# Start all services
docker-compose -f docker-compose.production.yml up -d

# View logs
docker-compose -f docker-compose.production.yml logs -f app

# Health check
curl -f http://localhost:3000/api/health
```

### Option 2: Manual Deployment

#### 1. Server Setup
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Create application user
sudo useradd -m -s /bin/bash portfolio
sudo mkdir -p /var/www/portfolio
sudo chown portfolio:portfolio /var/www/portfolio
```

#### 2. Application Deployment
```bash
# Switch to application user
sudo su - portfolio

# Clone repository
git clone https://github.com/yourusername/portfolio.git /var/www/portfolio
cd /var/www/portfolio

# Install dependencies
npm ci --production

# Build application
npm run build

# Start with PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

#### 3. PM2 Configuration
Create `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'portfolio',
    script: 'npm',
    args: 'start',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    // Logging
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    
    // Auto-restart
    watch: false,
    max_memory_restart: '1G',
    
    // Health checks
    health_check_grace_period: 3000,
    health_check_fatal_exceptions: true
  }]
}
```

### Automated Deployment Script

Use the provided deployment script:
```bash
# Make executable
chmod +x scripts/deploy.sh

# Deploy to production
./scripts/deploy.sh production

# Deploy to staging
./scripts/deploy.sh staging
```

## Monitoring Setup

### 1. Application Monitoring

The application includes comprehensive monitoring:
- **Real-time Analytics**: Page views, user behavior, performance metrics
- **Error Tracking**: Automatic error reporting and alerts
- **Performance Monitoring**: Core Web Vitals, load times, database performance
- **Security Monitoring**: Failed login attempts, suspicious activity
- **System Health**: CPU, memory, disk usage

### 2. Log Management

#### Configure Log Rotation
Create `/etc/logrotate.d/portfolio`:
```
/var/www/portfolio/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    notifempty
    create 644 portfolio portfolio
    postrotate
        pm2 reload portfolio
    endscript
}
```

### 3. Health Checks

The application provides health check endpoints:
- `GET /api/health` - Basic health check
- `GET /api/health/detailed` - Comprehensive system status
- `GET /api/admin/monitoring/system` - Admin system metrics

Set up external monitoring (recommended):
- **Uptime Robot**: Monitor uptime and response times
- **Sentry**: Error tracking and performance monitoring
- **CloudWatch/DataDog**: Server metrics and alerts

## Backup Configuration

### 1. Database Backups

#### Automated PostgreSQL Backups
Create `/opt/backup/db-backup.sh`:
```bash
#!/bin/bash
BACKUP_DIR="/opt/backup/database"
DB_NAME="portfolio_prod"
RETENTION_DAYS=30

mkdir -p $BACKUP_DIR

# Create backup with timestamp
pg_dump $DB_NAME | gzip > $BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).sql.gz

# Remove old backups
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete

# Upload to cloud storage (optional)
# aws s3 sync $BACKUP_DIR s3://your-backup-bucket/database/
```

Add to crontab:
```bash
# Daily backup at 2 AM
0 2 * * * /opt/backup/db-backup.sh
```

### 2. File Backups

The application includes backup functionality:
- **Database Export**: Full database export with admin panel
- **File Backup**: Upload files and content backup
- **Configuration Backup**: Environment and settings backup

#### Automated File Backups
```bash
#!/bin/bash
# Backup uploads and important files
tar -czf /opt/backup/files/files_$(date +%Y%m%d).tar.gz \
  /var/www/portfolio/uploads \
  /var/www/portfolio/.env.production \
  /var/www/portfolio/prisma
```

## Post-Deployment Checklist

### 1. Functional Testing
- [ ] Homepage loads correctly
- [ ] Admin panel accessible and secure
- [ ] Contact forms working
- [ ] Email notifications working
- [ ] Database connections stable
- [ ] API endpoints responding
- [ ] File uploads working
- [ ] Analytics tracking active
- [ ] Search functionality working
- [ ] Chatbot functioning (if enabled)

### 2. Security Testing
- [ ] HTTPS enforced
- [ ] Security headers present
- [ ] Admin login protected
- [ ] Rate limiting active
- [ ] File upload restrictions working
- [ ] SQL injection protection
- [ ] XSS protection enabled
- [ ] CSRF protection active
- [ ] Two-factor authentication working

### 3. Performance Testing
- [ ] Page load times < 3 seconds
- [ ] Core Web Vitals passing
- [ ] Database queries optimized
- [ ] Caching working correctly
- [ ] CDN configured (if applicable)
- [ ] Image optimization active
- [ ] Gzip compression enabled

### 4. Monitoring Setup
- [ ] Error tracking configured
- [ ] Uptime monitoring active
- [ ] Performance monitoring working
- [ ] Log aggregation configured
- [ ] Backup systems tested
- [ ] Alert notifications working

### 5. SEO and Analytics
- [ ] Google Analytics configured
- [ ] Sitemap generated and submitted
- [ ] Robots.txt configured
- [ ] Meta tags optimized
- [ ] Open Graph tags set
- [ ] Schema markup implemented

## Maintenance Tasks

### Daily
- Monitor error logs
- Check system resources
- Review security alerts

### Weekly
- Review performance metrics
- Check backup integrity
- Update dependencies (security)
- Review analytics data

### Monthly
- Full security audit
- Performance optimization review
- Database maintenance
- Update documentation

## Troubleshooting

### Common Issues

#### 1. Database Connection Issues
```bash
# Check database status
sudo systemctl status postgresql
sudo -u postgres psql -l

# Test connection
psql $DATABASE_URL -c "SELECT version();"
```

#### 2. Memory Issues
```bash
# Check memory usage
free -h
pm2 monit

# Restart application
pm2 restart portfolio
```

#### 3. Permission Issues
```bash
# Fix file permissions
sudo chown -R portfolio:portfolio /var/www/portfolio
sudo chmod -R 755 /var/www/portfolio
```

### Logs and Debugging

Important log locations:
- Application logs: `/var/www/portfolio/logs/`
- Nginx logs: `/var/log/nginx/`
- PostgreSQL logs: `/var/log/postgresql/`
- System logs: `/var/log/syslog`

## Support and Updates

### Update Process
1. Test updates in staging environment
2. Create database backup
3. Run deployment script with new version
4. Monitor for issues
5. Rollback if necessary using backup

### Emergency Procedures
- **Rollback**: Use deployment script with previous version
- **Database Restore**: Restore from latest backup
- **Security Incident**: Follow security incident response plan

---

=======
# Production Deployment Guide

This guide covers the complete deployment process for the portfolio application, including all enterprise-grade features implemented in Phase 4.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Database Configuration](#database-configuration)
- [Security Configuration](#security-configuration)
- [Performance Optimization](#performance-optimization)
- [Deployment Process](#deployment-process)
- [Monitoring Setup](#monitoring-setup)
- [Backup Configuration](#backup-configuration)
- [Post-Deployment Checklist](#post-deployment-checklist)

## Prerequisites

### System Requirements
- **Server**: Minimum 4GB RAM, 2 CPU cores, 50GB storage
- **Node.js**: v18+ or v20+
- **Database**: PostgreSQL 15+ (recommended) or SQLite for development
- **Redis**: v7+ for caching
- **Docker**: v20+ (optional but recommended)

### Required Services
- **Email Provider**: One of Gmail, SendGrid, Mailgun, AWS SES, or SMTP server
- **Domain**: Custom domain with SSL certificate
- **CDN**: Cloudflare or AWS CloudFront (optional but recommended)

## Environment Setup

### 1. Environment Variables

Create production environment files:

#### `.env.production`
```bash
# Application
NODE_ENV=production
PORT=3000
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-super-secure-secret-key-min-32-chars

# Database
DATABASE_URL=postgresql://username:password@host:5432/portfolio_prod
# Or for SQLite: file:./data/prod.db

# Redis (for caching)
REDIS_URL=redis://localhost:6379

# Email Configuration
EMAIL_PROVIDER=sendgrid  # or gmail, mailgun, ses, smtp
EMAIL_FROM=noreply@yourdomain.com
CONTACT_EMAIL=contact@yourdomain.com

# SendGrid
SENDGRID_API_KEY=your-sendgrid-api-key

# Gmail (if using Gmail)
EMAIL_USER=your-gmail@gmail.com
EMAIL_APP_PASSWORD=your-app-password

# Security
JWT_SECRET=your-jwt-secret-key
ENCRYPTION_KEY=your-32-char-encryption-key
ADMIN_SECRET=your-admin-secret

# API Keys
OPENAI_API_KEY=your-openai-api-key
GOOGLE_ANALYTICS_ID=GA-XXXXX-X

# Monitoring
SENTRY_DSN=your-sentry-dsn
LOG_LEVEL=info

# Admin Configuration
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=secure-admin-password

# Rate Limiting
RATE_LIMIT_REQUESTS_PER_MINUTE=100

# Session Configuration
SESSION_TIMEOUT=24h
MAX_SESSIONS_PER_USER=5

# File Upload
MAX_FILE_SIZE=10485760  # 10MB
UPLOAD_DIR=./uploads

# Performance
CACHE_TTL=3600
ENABLE_COMPRESSION=true
```

#### `.env.staging`
```bash
# Similar to production but with staging values
NODE_ENV=staging
NEXTAUTH_URL=https://staging.yourdomain.com
DATABASE_URL=postgresql://username:password@host:5432/portfolio_staging
# ... other staging-specific values
```

### 2. Domain and SSL Setup

#### DNS Configuration
```
A Record:     @           -> your-server-ip
CNAME Record: www         -> yourdomain.com
CNAME Record: staging     -> yourdomain.com
CNAME Record: api         -> yourdomain.com
```

#### SSL Certificate (Let's Encrypt)
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d staging.yourdomain.com
```

## Database Configuration

### PostgreSQL Setup (Recommended)

#### 1. Install PostgreSQL
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# Configure PostgreSQL
sudo -u postgres psql
CREATE DATABASE portfolio_prod;
CREATE USER portfolio_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE portfolio_prod TO portfolio_user;
\q
```

#### 2. Database Migration
```bash
# Install dependencies
npm install

# Run database migrations
npx prisma migrate deploy

# Seed initial data
npm run seed:production
```

### Database Optimization
```sql
-- Add performance indexes
CREATE INDEX CONCURRENTLY idx_analytics_events_timestamp ON analytics_events(timestamp);
CREATE INDEX CONCURRENTLY idx_page_views_session_timestamp ON page_views(session_id, timestamp);
CREATE INDEX CONCURRENTLY idx_audit_logs_timestamp ON audit_logs(timestamp);

-- Configure connection pooling
ALTER SYSTEM SET max_connections = 200;
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
```

## Security Configuration

### 1. Firewall Setup
```bash
# Ubuntu UFW
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 5432  # PostgreSQL (if external)
sudo ufw enable
```

### 2. Nginx Configuration
Create `/etc/nginx/sites-available/portfolio`:

```nginx
# Rate limiting
limit_req_zone $binary_remote_addr zone=general:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=api:10m rate=30r/s;

# Security headers
add_header X-Frame-Options DENY;
add_header X-Content-Type-Options nosniff;
add_header X-XSS-Protection "1; mode=block";
add_header Referrer-Policy "strict-origin-when-cross-origin";
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;";

# Gzip compression
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    
    # Rate limiting
    limit_req zone=general burst=20 nodelay;
    
    # Static files
    location /_next/static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    location /uploads/ {
        expires 1y;
        add_header Cache-Control "public";
    }
    
    # API routes
    location /api/ {
        limit_req zone=api burst=50 nodelay;
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Main application
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Admin panel (additional security)
    location /admin {
        # Optional: IP whitelist
        # allow YOUR_IP;
        # deny all;
        
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/portfolio /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 3. Application Security

#### Security Headers Middleware
The application includes comprehensive security headers and middleware for:
- CSRF protection
- Rate limiting
- Input validation
- SQL injection prevention
- XSS protection
- Admin authentication
- Session management
- Two-factor authentication

## Performance Optimization

### 1. Caching Configuration

The application includes multi-layer caching:
- **Memory Cache**: In-memory LRU cache for frequent data
- **Redis Cache**: Distributed caching for API responses
- **Database Query Cache**: Optimized database queries
- **Static Asset Cache**: CDN and browser caching

### 2. Database Performance
```sql
-- Regular maintenance tasks (add to cron)
-- Analyze query performance
SELECT query, calls, mean_exec_time, total_exec_time 
FROM pg_stat_statements 
ORDER BY total_exec_time DESC 
LIMIT 10;

-- Vacuum and analyze regularly
VACUUM ANALYZE;
```

### 3. Monitoring Performance
The application includes:
- Performance monitoring
- Core Web Vitals tracking
- Database query optimization
- Memory usage monitoring
- Error tracking and alerting

## Deployment Process

### Option 1: Docker Deployment (Recommended)

#### 1. Build Docker Images
```bash
# Build production image
docker build -t portfolio:production .

# Or use docker-compose
docker-compose -f docker-compose.production.yml build
```

#### 2. Deploy with Docker Compose
```bash
# Start all services
docker-compose -f docker-compose.production.yml up -d

# View logs
docker-compose -f docker-compose.production.yml logs -f app

# Health check
curl -f http://localhost:3000/api/health
```

### Option 2: Manual Deployment

#### 1. Server Setup
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Create application user
sudo useradd -m -s /bin/bash portfolio
sudo mkdir -p /var/www/portfolio
sudo chown portfolio:portfolio /var/www/portfolio
```

#### 2. Application Deployment
```bash
# Switch to application user
sudo su - portfolio

# Clone repository
git clone https://github.com/yourusername/portfolio.git /var/www/portfolio
cd /var/www/portfolio

# Install dependencies
npm ci --production

# Build application
npm run build

# Start with PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

#### 3. PM2 Configuration
Create `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'portfolio',
    script: 'npm',
    args: 'start',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    // Logging
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    
    // Auto-restart
    watch: false,
    max_memory_restart: '1G',
    
    // Health checks
    health_check_grace_period: 3000,
    health_check_fatal_exceptions: true
  }]
}
```

### Automated Deployment Script

Use the provided deployment script:
```bash
# Make executable
chmod +x scripts/deploy.sh

# Deploy to production
./scripts/deploy.sh production

# Deploy to staging
./scripts/deploy.sh staging
```

## Monitoring Setup

### 1. Application Monitoring

The application includes comprehensive monitoring:
- **Real-time Analytics**: Page views, user behavior, performance metrics
- **Error Tracking**: Automatic error reporting and alerts
- **Performance Monitoring**: Core Web Vitals, load times, database performance
- **Security Monitoring**: Failed login attempts, suspicious activity
- **System Health**: CPU, memory, disk usage

### 2. Log Management

#### Configure Log Rotation
Create `/etc/logrotate.d/portfolio`:
```
/var/www/portfolio/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    notifempty
    create 644 portfolio portfolio
    postrotate
        pm2 reload portfolio
    endscript
}
```

### 3. Health Checks

The application provides health check endpoints:
- `GET /api/health` - Basic health check
- `GET /api/health/detailed` - Comprehensive system status
- `GET /api/admin/monitoring/system` - Admin system metrics

Set up external monitoring (recommended):
- **Uptime Robot**: Monitor uptime and response times
- **Sentry**: Error tracking and performance monitoring
- **CloudWatch/DataDog**: Server metrics and alerts

## Backup Configuration

### 1. Database Backups

#### Automated PostgreSQL Backups
Create `/opt/backup/db-backup.sh`:
```bash
#!/bin/bash
BACKUP_DIR="/opt/backup/database"
DB_NAME="portfolio_prod"
RETENTION_DAYS=30

mkdir -p $BACKUP_DIR

# Create backup with timestamp
pg_dump $DB_NAME | gzip > $BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).sql.gz

# Remove old backups
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete

# Upload to cloud storage (optional)
# aws s3 sync $BACKUP_DIR s3://your-backup-bucket/database/
```

Add to crontab:
```bash
# Daily backup at 2 AM
0 2 * * * /opt/backup/db-backup.sh
```

### 2. File Backups

The application includes backup functionality:
- **Database Export**: Full database export with admin panel
- **File Backup**: Upload files and content backup
- **Configuration Backup**: Environment and settings backup

#### Automated File Backups
```bash
#!/bin/bash
# Backup uploads and important files
tar -czf /opt/backup/files/files_$(date +%Y%m%d).tar.gz \
  /var/www/portfolio/uploads \
  /var/www/portfolio/.env.production \
  /var/www/portfolio/prisma
```

## Post-Deployment Checklist

### 1. Functional Testing
- [ ] Homepage loads correctly
- [ ] Admin panel accessible and secure
- [ ] Contact forms working
- [ ] Email notifications working
- [ ] Database connections stable
- [ ] API endpoints responding
- [ ] File uploads working
- [ ] Analytics tracking active
- [ ] Search functionality working
- [ ] Chatbot functioning (if enabled)

### 2. Security Testing
- [ ] HTTPS enforced
- [ ] Security headers present
- [ ] Admin login protected
- [ ] Rate limiting active
- [ ] File upload restrictions working
- [ ] SQL injection protection
- [ ] XSS protection enabled
- [ ] CSRF protection active
- [ ] Two-factor authentication working

### 3. Performance Testing
- [ ] Page load times < 3 seconds
- [ ] Core Web Vitals passing
- [ ] Database queries optimized
- [ ] Caching working correctly
- [ ] CDN configured (if applicable)
- [ ] Image optimization active
- [ ] Gzip compression enabled

### 4. Monitoring Setup
- [ ] Error tracking configured
- [ ] Uptime monitoring active
- [ ] Performance monitoring working
- [ ] Log aggregation configured
- [ ] Backup systems tested
- [ ] Alert notifications working

### 5. SEO and Analytics
- [ ] Google Analytics configured
- [ ] Sitemap generated and submitted
- [ ] Robots.txt configured
- [ ] Meta tags optimized
- [ ] Open Graph tags set
- [ ] Schema markup implemented

## Maintenance Tasks

### Daily
- Monitor error logs
- Check system resources
- Review security alerts

### Weekly
- Review performance metrics
- Check backup integrity
- Update dependencies (security)
- Review analytics data

### Monthly
- Full security audit
- Performance optimization review
- Database maintenance
- Update documentation

## Troubleshooting

### Common Issues

#### 1. Database Connection Issues
```bash
# Check database status
sudo systemctl status postgresql
sudo -u postgres psql -l

# Test connection
psql $DATABASE_URL -c "SELECT version();"
```

#### 2. Memory Issues
```bash
# Check memory usage
free -h
pm2 monit

# Restart application
pm2 restart portfolio
```

#### 3. Permission Issues
```bash
# Fix file permissions
sudo chown -R portfolio:portfolio /var/www/portfolio
sudo chmod -R 755 /var/www/portfolio
```

### Logs and Debugging

Important log locations:
- Application logs: `/var/www/portfolio/logs/`
- Nginx logs: `/var/log/nginx/`
- PostgreSQL logs: `/var/log/postgresql/`
- System logs: `/var/log/syslog`

## Support and Updates

### Update Process
1. Test updates in staging environment
2. Create database backup
3. Run deployment script with new version
4. Monitor for issues
5. Rollback if necessary using backup

### Emergency Procedures
- **Rollback**: Use deployment script with previous version
- **Database Restore**: Restore from latest backup
- **Security Incident**: Follow security incident response plan

---

>>>>>>> 177dc73edd19f0ab5571599bf2c6435fbada064e
This deployment guide ensures a secure, performant, and maintainable production environment for your portfolio application with all enterprise-grade features properly configured.