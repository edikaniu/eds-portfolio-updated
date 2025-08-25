#!/bin/bash

# Deployment script for portfolio application
# Usage: ./scripts/deploy.sh [environment] [options]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT=${1:-staging}
FORCE_DEPLOY=${2:-false}
DRY_RUN=${3:-false}

# Configuration
PROJECT_NAME="portfolio"
DOCKER_REGISTRY="ghcr.io/yourusername"
IMAGE_NAME="${DOCKER_REGISTRY}/${PROJECT_NAME}"

echo -e "${BLUE}🚀 Starting deployment to ${ENVIRONMENT}${NC}"

# Validate environment
validate_environment() {
    case $ENVIRONMENT in
        development|staging|production)
            echo -e "${GREEN}✅ Environment: ${ENVIRONMENT}${NC}"
            ;;
        *)
            echo -e "${RED}❌ Invalid environment: ${ENVIRONMENT}${NC}"
            echo "Valid environments: development, staging, production"
            exit 1
            ;;
    esac
}

# Load environment variables
load_environment() {
    local env_file=".env.${ENVIRONMENT}"
    
    if [[ -f "$env_file" ]]; then
        echo -e "${GREEN}📝 Loading environment from ${env_file}${NC}"
        set -a
        source "$env_file"
        set +a
    else
        echo -e "${YELLOW}⚠️  Environment file ${env_file} not found${NC}"
    fi
}

# Pre-deployment checks
pre_deployment_checks() {
    echo -e "${BLUE}🔍 Running pre-deployment checks${NC}"
    
    # Check if Docker is running
    if ! docker info > /dev/null 2>&1; then
        echo -e "${RED}❌ Docker is not running${NC}"
        exit 1
    fi
    
    # Check if required environment variables are set
    local required_vars=("NEXTAUTH_SECRET" "DATABASE_URL")
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var}" ]]; then
            echo -e "${RED}❌ Required environment variable ${var} is not set${NC}"
            exit 1
        fi
    done
    
    # Check if we're on the correct branch for production
    if [[ "$ENVIRONMENT" == "production" ]]; then
        local current_branch=$(git branch --show-current)
        if [[ "$current_branch" != "main" && "$FORCE_DEPLOY" != "true" ]]; then
            echo -e "${RED}❌ Production deployments must be from main branch${NC}"
            echo "Current branch: $current_branch"
            echo "Use FORCE_DEPLOY=true to override"
            exit 1
        fi
    fi
    
    echo -e "${GREEN}✅ Pre-deployment checks passed${NC}"
}

# Build Docker image
build_image() {
    echo -e "${BLUE}🔨 Building Docker image${NC}"
    
    local git_commit=$(git rev-parse --short HEAD)
    local timestamp=$(date +%Y%m%d%H%M%S)
    local tag="${ENVIRONMENT}-${git_commit}-${timestamp}"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        echo -e "${YELLOW}🏃 DRY RUN: Would build image ${IMAGE_NAME}:${tag}${NC}"
        return
    fi
    
    docker build \
        --platform linux/amd64 \
        --build-arg NODE_ENV=$ENVIRONMENT \
        --build-arg NEXTAUTH_SECRET="$NEXTAUTH_SECRET" \
        --build-arg NEXTAUTH_URL="$NEXTAUTH_URL" \
        --build-arg DATABASE_URL="$DATABASE_URL" \
        --tag "${IMAGE_NAME}:${tag}" \
        --tag "${IMAGE_NAME}:${ENVIRONMENT}-latest" \
        .
    
    echo -e "${GREEN}✅ Image built: ${IMAGE_NAME}:${tag}${NC}"
    echo "TAG=${tag}" > .deployment-info
}

# Run tests
run_tests() {
    echo -e "${BLUE}🧪 Running tests${NC}"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        echo -e "${YELLOW}🏃 DRY RUN: Would run tests${NC}"
        return
    fi
    
    # Run tests in Docker container
    docker run --rm \
        -e NODE_ENV=test \
        -e CI=true \
        "${IMAGE_NAME}:${ENVIRONMENT}-latest" \
        npm run test:ci
    
    echo -e "${GREEN}✅ Tests passed${NC}"
}

# Database migration
migrate_database() {
    echo -e "${BLUE}🗄️  Running database migrations${NC}"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        echo -e "${YELLOW}🏃 DRY RUN: Would run database migrations${NC}"
        return
    fi
    
    # Run migrations
    docker run --rm \
        -e DATABASE_URL="$DATABASE_URL" \
        "${IMAGE_NAME}:${ENVIRONMENT}-latest" \
        npx prisma migrate deploy
    
    echo -e "${GREEN}✅ Database migrations completed${NC}"
}

# Deploy to environment
deploy() {
    echo -e "${BLUE}🚢 Deploying to ${ENVIRONMENT}${NC}"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        echo -e "${YELLOW}🏃 DRY RUN: Would deploy to ${ENVIRONMENT}${NC}"
        return
    fi
    
    case $ENVIRONMENT in
        development|staging)
            deploy_to_staging
            ;;
        production)
            deploy_to_production
            ;;
    esac
    
    echo -e "${GREEN}✅ Deployment completed${NC}"
}

# Deploy to staging/development
deploy_to_staging() {
    echo -e "${BLUE}🎭 Deploying to staging environment${NC}"
    
    # Update docker-compose for staging
    docker-compose -f docker-compose.${ENVIRONMENT}.yml pull
    docker-compose -f docker-compose.${ENVIRONMENT}.yml up -d --remove-orphans
    
    # Wait for services to be ready
    sleep 30
    
    # Run health checks
    health_check "http://localhost:3000"
}

# Deploy to production
deploy_to_production() {
    echo -e "${BLUE}🌟 Deploying to production environment${NC}"
    
    # Create backup before deployment
    create_backup
    
    # Deploy with zero-downtime
    docker-compose -f docker-compose.production.yml pull
    docker-compose -f docker-compose.production.yml up -d --remove-orphans
    
    # Wait for services to be ready
    sleep 60
    
    # Run health checks
    health_check "https://yoursite.com"
    
    # Run smoke tests
    run_smoke_tests
}

# Create backup
create_backup() {
    echo -e "${BLUE}💾 Creating backup${NC}"
    
    local backup_name="backup-$(date +%Y%m%d%H%M%S)"
    
    # Database backup
    docker-compose exec db pg_dump -U portfolio portfolio > "backups/${backup_name}.sql"
    
    # Upload files backup
    tar -czf "backups/${backup_name}-uploads.tar.gz" uploads/
    
    echo -e "${GREEN}✅ Backup created: ${backup_name}${NC}"
}

# Health check
health_check() {
    local url=$1
    local max_attempts=30
    local attempt=1
    
    echo -e "${BLUE}🏥 Running health check: ${url}${NC}"
    
    while [[ $attempt -le $max_attempts ]]; do
        if curl -f -s "${url}/api/health" > /dev/null; then
            echo -e "${GREEN}✅ Health check passed${NC}"
            return 0
        fi
        
        echo -e "${YELLOW}⏳ Health check attempt ${attempt}/${max_attempts}${NC}"
        sleep 10
        ((attempt++))
    done
    
    echo -e "${RED}❌ Health check failed${NC}"
    return 1
}

# Run smoke tests
run_smoke_tests() {
    echo -e "${BLUE}💨 Running smoke tests${NC}"
    
    # Run critical path tests
    npx playwright test --grep "smoke" --reporter=line
    
    if [[ $? -eq 0 ]]; then
        echo -e "${GREEN}✅ Smoke tests passed${NC}"
    else
        echo -e "${RED}❌ Smoke tests failed${NC}"
        
        # Rollback on failure
        if [[ "$ENVIRONMENT" == "production" ]]; then
            echo -e "${YELLOW}🔄 Rolling back deployment${NC}"
            rollback
        fi
        
        exit 1
    fi
}

# Rollback deployment
rollback() {
    echo -e "${BLUE}🔄 Rolling back deployment${NC}"
    
    # Get previous image
    local previous_image=$(docker images --format "table {{.Repository}}:{{.Tag}}" | grep "${IMAGE_NAME}:production" | head -2 | tail -1)
    
    if [[ -n "$previous_image" ]]; then
        echo -e "${YELLOW}⏮️  Rolling back to: ${previous_image}${NC}"
        
        # Update deployment to use previous image
        docker tag "$previous_image" "${IMAGE_NAME}:production-latest"
        docker-compose -f docker-compose.production.yml up -d --remove-orphans
        
        # Verify rollback
        sleep 30
        health_check "https://yoursite.com"
        
        echo -e "${GREEN}✅ Rollback completed${NC}"
    else
        echo -e "${RED}❌ No previous image found for rollback${NC}"
        exit 1
    fi
}

# Post-deployment tasks
post_deployment() {
    echo -e "${BLUE}📋 Running post-deployment tasks${NC}"
    
    # Clear caches
    echo -e "${BLUE}🧹 Clearing caches${NC}"
    curl -X POST "${NEXTAUTH_URL}/api/admin/cache/clear" -H "Authorization: Bearer $ADMIN_API_KEY" || true
    
    # Update monitoring
    echo -e "${BLUE}📊 Updating monitoring${NC}"
    # Add monitoring update logic here
    
    # Send deployment notification
    send_notification
    
    echo -e "${GREEN}✅ Post-deployment tasks completed${NC}"
}

# Send deployment notification
send_notification() {
    if [[ -n "$SLACK_WEBHOOK_URL" ]]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"🚀 Deployment to ${ENVIRONMENT} completed successfully!\"}" \
            "$SLACK_WEBHOOK_URL" || true
    fi
}

# Cleanup old images
cleanup() {
    echo -e "${BLUE}🧹 Cleaning up old images${NC}"
    
    # Keep last 5 images
    docker images --format "table {{.Repository}}:{{.Tag}}\t{{.CreatedAt}}" | \
        grep "${IMAGE_NAME}:${ENVIRONMENT}" | \
        sort -k2 -r | \
        tail -n +6 | \
        awk '{print $1}' | \
        xargs -r docker rmi || true
    
    echo -e "${GREEN}✅ Cleanup completed${NC}"
}

# Main deployment flow
main() {
    echo -e "${BLUE}🎯 Portfolio Deployment Script${NC}"
    echo -e "${BLUE}Environment: ${ENVIRONMENT}${NC}"
    echo -e "${BLUE}Dry Run: ${DRY_RUN}${NC}"
    echo ""
    
    validate_environment
    load_environment
    pre_deployment_checks
    build_image
    
    if [[ "$ENVIRONMENT" != "development" ]]; then
        run_tests
    fi
    
    migrate_database
    deploy
    post_deployment
    cleanup
    
    echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
}

# Handle script termination
trap 'echo -e "${RED}❌ Deployment interrupted${NC}"; exit 1' INT TERM

# Run main function
main "$@"