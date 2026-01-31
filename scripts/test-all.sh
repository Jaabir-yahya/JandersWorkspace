#!/bin/bash

# ============================================
# Project Bridge - Automated Testing Script
# ============================================
# Comprehensive testing automation for solo development
# Usage: ./scripts/test-all.sh [options]
#
# Options:
#   --unit-only     Run unit tests only
#   --integration-only Run integration tests only  
#   --api-only      Run API manual tests only
#   --quick         Skip database setup
#   --full          Full testing suite (default)
#   --ci            CI mode (no interactive prompts)
# ============================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
API_DIR="$PROJECT_ROOT/apps/api"

# Logging functions
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Test results tracking
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Parse command line arguments
UNIT_ONLY=false
INTEGRATION_ONLY=false
API_ONLY=false
QUICK_MODE=false
CI_MODE=false

for arg in "$@"; do
    case $arg in
        --unit-only)
        UNIT_ONLY=true
        shift
        ;;
        --integration-only)
        INTEGRATION_ONLY=true
        shift
        ;;
        --api-only)
        API_ONLY=true
        shift
        ;;
        --quick)
        QUICK_MODE=true
        shift
        ;;
        --ci)
        CI_MODE=true
        shift
        ;;
        --full)
        # Default behavior
        shift
        ;;
    esac
done

# Function to run a test step
run_test_step() {
    local step_name="$1"
    local step_command="$2"
    
    log_info "Running: $step_name"
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if eval "$step_command" > /dev/null 2>&1; then
        log_success "✓ $step_name"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        return 0
    else
        log_error "✗ $step_name"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi
}

# Function to check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if we're in the right directory
    if [ ! -f "$PROJECT_ROOT/package.json" ]; then
        log_error "package.json not found. Please run from project root."
        exit 1
    fi
    
    # Check if required tools are installed
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Function to setup test database
setup_test_database() {
    if [ "$QUICK_MODE" = true ]; then
        log_warning "Skipping database setup in quick mode"
        return 0
    fi
    
    log_info "Setting up test database..."
    
    # Check if .env exists
    if [ ! -f "$API_DIR/.env" ]; then
        log_warning ".env file not found. Creating from sample..."
        cp "$PROJECT_ROOT/.env.sample" "$API_DIR/.env"
        
        if [ "$CI_MODE" != true ]; then
            log_warning "Please configure your database credentials in $API_DIR/.env"
            read -p "Press Enter to continue (or Ctrl+C to abort)..."
        fi
    fi
    
    # Generate Prisma client
    run_test_step "Generate Prisma client" "cd $API_DIR && npx prisma generate"
    
    # Run database migrations (if in non-production)
    if [ "$NODE_ENV" != "production" ]; then
        run_test_step "Database migrations" "cd $API_DIR && npx prisma db push"
    fi
    
    # Populate test data
    if [ -f "$PROJECT_ROOT/scripts/populate-test-data.sh" ]; then
        log_info "Populating test data..."
        run_test_step "Populate test data" "$PROJECT_ROOT/scripts/populate-test-data.sh"
    fi
}

# Function to run unit tests
run_unit_tests() {
    log_info "Running unit tests..."
    
    run_test_step "API Unit Tests" "cd $PROJECT_ROOT && npm run test --workspace=@project-bridge/api"
    run_test_step "TypeScript Type Check" "cd $PROJECT_ROOT && npm run type-check --workspace=@project-bridge/api"
    
    # Run linting but don't fail the build for warnings
    log_info "Running code linting..."
    if cd $PROJECT_ROOT && npm run lint --workspace=@project-bridge/api > /dev/null 2>&1; then
        log_success "✓ Code linting"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        log_warning "⚠ Code linting has warnings (not blocking)"
    fi
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
}

# Function to run integration tests
run_integration_tests() {
    log_info "Running integration tests..."
    
    # Check if test database is accessible
    if ! run_test_step "Test database connection" "cd $API_DIR && npx prisma db pull --force > /dev/null 2>&1"; then
        log_error "Cannot connect to test database. Please check your .env configuration."
        return 1
    fi
    
    run_test_step "API Integration Tests" "cd $PROJECT_ROOT && npm run test:integration"
}

# Function to run API manual tests
run_api_manual_tests() {
    log_info "Running API manual tests..."
    
    # Check if API is running
    API_URL="http://localhost:3000/api/v1"
    if ! curl -s "$API_URL/health" > /dev/null 2>&1; then
        log_warning "API is not running at $API_URL"
        
        if [ "$CI_MODE" != true ]; then
            read -p "Would you like to start the API server? (y/N): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                log_info "Starting API server in background..."
                cd $API_DIR && npm run dev > /dev/null 2>&1 &
                API_PID=$!
                sleep 5  # Give it time to start
                
                # Check if it started successfully
                if curl -s "$API_URL/health" > /dev/null 2>&1; then
                    log_success "API server started successfully"
                else
                    log_error "Failed to start API server"
                    kill $API_PID 2>/dev/null || true
                    return 1
                fi
            else
                log_warning "Skipping API tests - server not running"
                return 0
            fi
        else
            log_warning "Skipping API tests in CI mode - server not running"
            return 0
        fi
    fi
    
    # Test basic endpoints using curl
    run_test_step "API Health Check" "curl -s -f $API_URL/health > /dev/null"
    
    # Test the three major transaction types
    log_info "Testing three major transaction types..."
    
    # Test RETAIL transaction
    run_test_step "RETAIL Transaction API" "curl -s -f -X POST $API_URL/transactions \
        -H 'Content-Type: application/json' \
        -d '{
            \"tenant_id\": \"22222222-2222-2222-2222-222222222222\",
            \"entity_id\": \"11111111-1111-1111-1111-111111111111\", 
            \"created_by_user_id\": \"33333333-3333-3333-3333-333333333333\",
            \"type\": \"RETAIL\",
            \"currency_code\": \"KES\",
            \"reference\": \"TEST-RETAIL-$(date +%s)\",
            \"lines\": [{\"description\": \"Test Product\", \"quantity\": 1, \"unit_price\": 100, \"account_code\": \"200-SALES\"}]
        }' > /dev/null"
    
    # Test SERVICE transaction  
    run_test_step "SERVICE Transaction API" "curl -s -f -X POST $API_URL/transactions \
        -H 'Content-Type: application/json' \
        -d '{
            \"tenant_id\": \"22222222-2222-2222-2222-222222222222\",
            \"entity_id\": \"11111111-1111-1111-1111-111111111111\",
            \"created_by_user_id\": \"33333333-3333-3333-3333-333333333333\", 
            \"type\": \"SERVICE\",
            \"currency_code\": \"KES\",
            \"reference\": \"TEST-SERVICE-$(date +%s)\",
            \"lines\": [{\"description\": \"Test Service\", \"quantity\": 1, \"unit_price\": 100, \"account_code\": \"300-SERVICE-INCOME\"}]
        }' > /dev/null"
    
    # Test RENTAL transaction
    run_test_step "RENTAL Transaction API" "curl -s -f -X POST $API_URL/transactions \
        -H 'Content-Type: application/json' \
        -d '{
            \"tenant_id\": \"22222222-2222-2222-2222-222222222222\",
            \"entity_id\": \"11111111-1111-1111-1111-111111111111\",
            \"created_by_user_id\": \"33333333-3333-3333-3333-333333333333\",
            \"type\": \"RENTAL\", 
            \"currency_code\": \"KES\",
            \"reference\": \"TEST-RENTAL-$(date +%s)\",
            \"lines\": [{\"description\": \"Test Rental\", \"quantity\": 1, \"unit_price\": 100, \"account_code\": \"400-RENTAL-INCOME\"}]
        }' > /dev/null"
    
    # Clean up background process if we started it
    if [ ! -z "$API_PID" ]; then
        kill $API_PID 2>/dev/null || true
        wait $API_PID 2>/dev/null || true
    fi
}

# Function to generate test report
generate_report() {
    echo ""
    log_info "================================="
    log_info "TEST EXECUTION SUMMARY"
    log_info "================================="
    echo "Total Test Steps: $TOTAL_TESTS"
    echo -e "Passed: ${GREEN}$PASSED_TESTS${NC}"
    echo -e "Failed: ${RED}$FAILED_TESTS${NC}"
    
    if [ $FAILED_TESTS -eq 0 ]; then
        log_success "🎉 All tests passed!"
        return 0
    else
        log_error "❌ $FAILED_TESTS test step(s) failed"
        return 1
    fi
}

# Main execution
main() {
    log_info "================================="
    log_info "PROJECT BRIDGE - AUTOMATED TESTS"
    log_info "================================="
    log_info "Starting at $(date)"
    echo ""
    
    check_prerequisites
    
    if [ "$UNIT_ONLY" = true ]; then
        run_unit_tests
    elif [ "$INTEGRATION_ONLY" = true ]; then
        setup_test_database
        run_integration_tests  
    elif [ "$API_ONLY" = true ]; then
        run_api_manual_tests
    else
        # Full testing suite
        setup_test_database
        run_unit_tests
        run_integration_tests
        run_api_manual_tests
    fi
    
    echo ""
    generate_report
    
    # Exit with proper code
    if [ $FAILED_TESTS -eq 0 ]; then
        exit 0
    else
        exit 1
    fi
}

# Trap to handle interruption
trap 'log_warning "Test execution interrupted"; exit 1' INT

# Run main function
main "$@"