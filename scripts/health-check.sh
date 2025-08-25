#!/bin/bash

# Production Health Check Script
# This script performs comprehensive health checks for the portfolio application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BASE_URL=${1:-"http://localhost:3000"}
TIMEOUT=30
VERBOSE=${2:-false}

echo -e "${BLUE}🏥 Starting Production Health Check for ${BASE_URL}${NC}"
echo "================================================="

# Initialize counters
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0
WARNINGS=0

# Function to log results
log_result() {
    local test_name=$1
    local status=$2
    local message=$3
    local details=$4
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    
    if [ "$status" = "PASS" ]; then
        echo -e "${GREEN}✅ $test_name: PASS${NC}"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        if [ "$VERBOSE" = "true" ] && [ -n "$details" ]; then
            echo -e "   ${details}"
        fi
    elif [ "$status" = "FAIL" ]; then
        echo -e "${RED}❌ $test_name: FAIL - $message${NC}"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
        if [ -n "$details" ]; then
            echo -e "   ${details}"
        fi
    else
        echo -e "${YELLOW}⚠️  $test_name: WARNING - $message${NC}"
        WARNINGS=$((WARNINGS + 1))
        if [ -n "$details" ]; then
            echo -e "   ${details}"
        fi
    fi
}

# Function to check HTTP endpoint
check_endpoint() {
    local endpoint=$1
    local expected_status=${2:-200}
    local test_name=$3
    local check_content=$4
    
    local response
    local status_code
    
    response=$(curl -s -w "\n%{http_code}" --max-time $TIMEOUT "$BASE_URL$endpoint" 2>/dev/null || echo -e "\n000")
    status_code=$(echo "$response" | tail -n1)
    content=$(echo "$response" | head -n -1)
    
    if [ "$status_code" = "000" ]; then
        log_result "$test_name" "FAIL" "Connection failed or timeout"
        return 1
    elif [ "$status_code" != "$expected_status" ]; then
        log_result "$test_name" "FAIL" "Expected status $expected_status, got $status_code"
        return 1
    else
        if [ -n "$check_content" ] && ! echo "$content" | grep -q "$check_content"; then
            log_result "$test_name" "FAIL" "Response does not contain expected content: $check_content"
            return 1
        fi
        log_result "$test_name" "PASS" "" "Status: $status_code"
        return 0
    fi
}

# Function to check database connectivity
check_database() {
    echo -e "\n${BLUE}📊 Database Health Checks${NC}"
    echo "--------------------------------"
    
    # Check basic health endpoint that includes DB check
    if check_endpoint "/api/health" 200 "Database Connection"; then
        # Additional database-specific checks
        check_endpoint "/api/admin/analytics?action=overview" 200 "Database Query Performance" '"success":true'
        
        # Check for database tables (through API)
        check_endpoint "/api/admin/projects" 200 "Database Table Access"
    fi
}

# Function to check external services
check_external_services() {
    echo -e "\n${BLUE}🌐 External Services Health Checks${NC}"
    echo "----------------------------------------"
    
    # Check email service
    check_endpoint "/api/admin/email?action=test-connection" 200 "Email Service Connection"
    
    # Check caching system
    check_endpoint "/api/admin/cache/stats" 200 "Cache System Status"
}

# Function to check security measures
check_security() {
    echo -e "\n${BLUE}🔒 Security Health Checks${NC}"
    echo "------------------------------"
    
    # Check HTTPS redirect (if production)
    if [[ $BASE_URL == https* ]]; then
        local http_url=${BASE_URL/https/http}
        local redirect_response
        redirect_response=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$http_url" 2>/dev/null || echo "000")
        
        if [ "$redirect_response" = "301" ] || [ "$redirect_response" = "302" ]; then
            log_result "HTTPS Redirect" "PASS"
        else
            log_result "HTTPS Redirect" "WARN" "HTTP to HTTPS redirect not working properly"
        fi
    fi
    
    # Check security headers
    local headers
    headers=$(curl -s -I --max-time $TIMEOUT "$BASE_URL" 2>/dev/null || echo "")
    
    if echo "$headers" | grep -qi "x-frame-options"; then
        log_result "X-Frame-Options Header" "PASS"
    else
        log_result "X-Frame-Options Header" "WARN" "Security header missing"
    fi
    
    if echo "$headers" | grep -qi "content-security-policy"; then
        log_result "Content-Security-Policy Header" "PASS"
    else
        log_result "Content-Security-Policy Header" "WARN" "CSP header missing"
    fi
    
    if echo "$headers" | grep -qi "x-content-type-options"; then
        log_result "X-Content-Type-Options Header" "PASS"
    else
        log_result "X-Content-Type-Options Header" "WARN" "Security header missing"
    fi
}

# Function to check performance
check_performance() {
    echo -e "\n${BLUE}⚡ Performance Health Checks${NC}"
    echo "--------------------------------"
    
    # Check page load time
    local start_time=$(date +%s.%N)
    local response
    response=$(curl -s -o /dev/null -w "%{time_total}" --max-time $TIMEOUT "$BASE_URL" 2>/dev/null || echo "999")
    
    if (( $(echo "$response < 3.0" | bc -l) )); then
        log_result "Page Load Time" "PASS" "" "Load time: ${response}s"
    elif (( $(echo "$response < 5.0" | bc -l) )); then
        log_result "Page Load Time" "WARN" "Page load time is ${response}s (should be < 3s)"
    else
        log_result "Page Load Time" "FAIL" "Page load time is ${response}s (too slow)"
    fi
    
    # Check if gzip compression is enabled
    local gzip_response
    gzip_response=$(curl -s -H "Accept-Encoding: gzip" -I --max-time $TIMEOUT "$BASE_URL" 2>/dev/null || echo "")
    
    if echo "$gzip_response" | grep -qi "content-encoding.*gzip"; then
        log_result "Gzip Compression" "PASS"
    else
        log_result "Gzip Compression" "WARN" "Gzip compression not enabled"
    fi
}

# Function to check application features
check_application_features() {
    echo -e "\n${BLUE}🚀 Application Feature Checks${NC}"
    echo "-----------------------------------"
    
    # Check main pages
    check_endpoint "/" 200 "Homepage"
    check_endpoint "/projects" 200 "Projects Page"
    check_endpoint "/blog" 200 "Blog Page"
    check_endpoint "/case-studies" 200 "Case Studies Page"
    
    # Check API endpoints
    check_endpoint "/api/health" 200 "Health API"
    check_endpoint "/api/health/detailed" 200 "Detailed Health API"
    
    # Check sitemap
    check_endpoint "/sitemap.xml" 200 "Sitemap"
    
    # Check robots.txt
    check_endpoint "/robots.txt" 200 "Robots.txt"
}

# Function to check monitoring and analytics
check_monitoring() {
    echo -e "\n${BLUE}📈 Monitoring & Analytics Checks${NC}"
    echo "------------------------------------"
    
    # Check analytics endpoints
    check_endpoint "/api/admin/analytics?action=metrics" 200 "Real-time Analytics"
    
    # Check monitoring system
    check_endpoint "/api/admin/monitoring/system" 200 "System Monitoring"
    
    # Check error tracking
    if [ -n "$SENTRY_DSN" ]; then
        log_result "Error Tracking Configuration" "PASS" "" "Sentry configured"
    else
        log_result "Error Tracking Configuration" "WARN" "Sentry not configured"
    fi
}

# Main execution
echo -e "\n${BLUE}🌟 Basic Connectivity Check${NC}"
echo "------------------------------"

# Test basic connectivity first
if ! curl -s --max-time 10 "$BASE_URL" > /dev/null; then
    echo -e "${RED}❌ CRITICAL: Cannot connect to $BASE_URL${NC}"
    echo -e "${RED}Health check aborted. Please verify the application is running and accessible.${NC}"
    exit 1
fi

log_result "Basic Connectivity" "PASS"

# Run all health checks
check_application_features
check_database
check_external_services  
check_security
check_performance
check_monitoring

# System resource checks (if running locally)
if [[ $BASE_URL == *"localhost"* ]] || [[ $BASE_URL == *"127.0.0.1"* ]]; then
    echo -e "\n${BLUE}💻 System Resource Checks${NC}"
    echo "------------------------------"
    
    # Check disk space
    local disk_usage
    disk_usage=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
    
    if [ "$disk_usage" -lt 80 ]; then
        log_result "Disk Usage" "PASS" "" "Usage: ${disk_usage}%"
    elif [ "$disk_usage" -lt 90 ]; then
        log_result "Disk Usage" "WARN" "Disk usage is ${disk_usage}%"
    else
        log_result "Disk Usage" "FAIL" "Disk usage is ${disk_usage}% (critical)"
    fi
    
    # Check memory usage
    if command -v free > /dev/null; then
        local memory_usage
        memory_usage=$(free | grep Mem | awk '{print int($3/$2 * 100)}')
        
        if [ "$memory_usage" -lt 80 ]; then
            log_result "Memory Usage" "PASS" "" "Usage: ${memory_usage}%"
        elif [ "$memory_usage" -lt 90 ]; then
            log_result "Memory Usage" "WARN" "Memory usage is ${memory_usage}%"
        else
            log_result "Memory Usage" "FAIL" "Memory usage is ${memory_usage}% (critical)"
        fi
    fi
fi

# Summary
echo -e "\n${BLUE}📊 Health Check Summary${NC}"
echo "========================"
echo -e "Total Checks: $TOTAL_CHECKS"
echo -e "${GREEN}Passed: $PASSED_CHECKS${NC}"
echo -e "${RED}Failed: $FAILED_CHECKS${NC}"
echo -e "${YELLOW}Warnings: $WARNINGS${NC}"

# Calculate health score
local health_score
health_score=$(echo "scale=1; ($PASSED_CHECKS * 100) / $TOTAL_CHECKS" | bc -l)

echo -e "\n${BLUE}Overall Health Score: ${health_score}%${NC}"

# Exit with appropriate code
if [ "$FAILED_CHECKS" -gt 0 ]; then
    echo -e "\n${RED}❌ HEALTH CHECK FAILED${NC}"
    echo -e "${RED}Critical issues detected. Please review and address the failures above.${NC}"
    exit 1
elif [ "$WARNINGS" -gt 5 ]; then
    echo -e "\n${YELLOW}⚠️  HEALTH CHECK COMPLETED WITH WARNINGS${NC}"
    echo -e "${YELLOW}Multiple warnings detected. Consider addressing them for optimal performance.${NC}"
    exit 2
else
    echo -e "\n${GREEN}✅ HEALTH CHECK PASSED${NC}"
    echo -e "${GREEN}All critical systems are functioning properly.${NC}"
    exit 0
fi