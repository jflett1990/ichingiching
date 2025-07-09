#!/bin/bash

# Production Deployment Script for Wisdom Oracle I-Ching App
# Usage: ./scripts/deployment/deploy.sh [environment] [options]

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Default values
ENVIRONMENT=${1:-production}
SKIP_TESTS=${SKIP_TESTS:-false}
SKIP_BUILD=${SKIP_BUILD:-false}
ROLLBACK=${ROLLBACK:-false}
DRY_RUN=${DRY_RUN:-false}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Help function
show_help() {
    cat << EOF
Usage: $0 [ENVIRONMENT] [OPTIONS]

ENVIRONMENT:
    staging     Deploy to staging environment
    production  Deploy to production environment (default)

OPTIONS:
    --skip-tests    Skip running tests
    --skip-build    Skip building Docker image
    --rollback      Rollback to previous version
    --dry-run       Show what would be deployed without actually deploying
    --help          Show this help message

EXAMPLES:
    $0 staging
    $0 production --skip-tests
    $0 production --rollback
    SKIP_TESTS=true $0 staging

EOF
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        --skip-build)
            SKIP_BUILD=true
            shift
            ;;
        --rollback)
            ROLLBACK=true
            shift
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --help)
            show_help
            exit 0
            ;;
        staging|production)
            ENVIRONMENT=$1
            shift
            ;;
        *)
            log_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Environment-specific configuration
case $ENVIRONMENT in
    staging)
        DOCKER_COMPOSE_FILE="docker-compose.staging.yml"
        APP_URL="https://staging.wisdom-oracle.app"
        HEALTH_CHECK_URL="https://staging.wisdom-oracle.app/health"
        ;;
    production)
        DOCKER_COMPOSE_FILE="docker-compose.yml"
        APP_URL="https://wisdom-oracle.app"
        HEALTH_CHECK_URL="https://wisdom-oracle.app/health"
        ;;
    *)
        log_error "Invalid environment: $ENVIRONMENT"
        log_info "Supported environments: staging, production"
        exit 1
        ;;
esac

# Pre-deployment checks
pre_deployment_checks() {
    log_info "Running pre-deployment checks..."
    
    # Check if required files exist
    if [ ! -f "$PROJECT_DIR/$DOCKER_COMPOSE_FILE" ]; then
        log_error "Docker Compose file not found: $DOCKER_COMPOSE_FILE"
        exit 1
    fi
    
    # Check if Docker is running
    if ! docker info > /dev/null 2>&1; then
        log_error "Docker is not running"
        exit 1
    fi
    
    # Check if required environment variables are set
    if [ "$ENVIRONMENT" = "production" ]; then
        if [ -z "${POSTGRES_PASSWORD:-}" ]; then
            log_error "POSTGRES_PASSWORD environment variable is required for production"
            exit 1
        fi
    fi
    
    log_success "Pre-deployment checks passed"
}

# Run tests
run_tests() {
    if [ "$SKIP_TESTS" = "true" ]; then
        log_warning "Skipping tests"
        return 0
    fi
    
    log_info "Running tests..."
    cd "$PROJECT_DIR"
    
    if [ "$DRY_RUN" = "true" ]; then
        log_info "[DRY RUN] Would run: npm ci && npm run test:coverage"
        return 0
    fi
    
    npm ci
    npm run test:coverage
    
    log_success "Tests passed"
}

# Build Docker image
build_image() {
    if [ "$SKIP_BUILD" = "true" ]; then
        log_warning "Skipping Docker image build"
        return 0
    fi
    
    log_info "Building Docker image..."
    cd "$PROJECT_DIR"
    
    local image_tag="wisdom-oracle:$TIMESTAMP"
    
    if [ "$DRY_RUN" = "true" ]; then
        log_info "[DRY RUN] Would build Docker image: $image_tag"
        return 0
    fi
    
    docker build -t "$image_tag" .
    docker tag "$image_tag" "wisdom-oracle:latest"
    
    log_success "Docker image built: $image_tag"
}

# Deploy application
deploy_application() {
    log_info "Deploying to $ENVIRONMENT environment..."
    cd "$PROJECT_DIR"
    
    if [ "$DRY_RUN" = "true" ]; then
        log_info "[DRY RUN] Would deploy using: docker-compose -f $DOCKER_COMPOSE_FILE --profile prod up -d"
        return 0
    fi
    
    # Create backup of current deployment
    if docker-compose -f "$DOCKER_COMPOSE_FILE" ps | grep -q "Up"; then
        log_info "Creating backup of current deployment..."
        docker-compose -f "$DOCKER_COMPOSE_FILE" --profile prod exec app tar -czf "/tmp/backup_$TIMESTAMP.tar.gz" /usr/share/nginx/html 2>/dev/null || true
    fi
    
    # Deploy new version
    docker-compose -f "$DOCKER_COMPOSE_FILE" --profile prod up -d
    
    log_success "Application deployed to $ENVIRONMENT"
}

# Health check
health_check() {
    log_info "Performing health check..."
    
    if [ "$DRY_RUN" = "true" ]; then
        log_info "[DRY RUN] Would check health at: $HEALTH_CHECK_URL"
        return 0
    fi
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s "$HEALTH_CHECK_URL" > /dev/null; then
            log_success "Health check passed (attempt $attempt/$max_attempts)"
            return 0
        fi
        
        log_info "Health check failed, retrying in 10 seconds... (attempt $attempt/$max_attempts)"
        sleep 10
        ((attempt++))
    done
    
    log_error "Health check failed after $max_attempts attempts"
    return 1
}

# Rollback deployment
rollback_deployment() {
    log_info "Rolling back deployment..."
    cd "$PROJECT_DIR"
    
    if [ "$DRY_RUN" = "true" ]; then
        log_info "[DRY RUN] Would rollback deployment"
        return 0
    fi
    
    # Get previous image
    local previous_image
    previous_image=$(docker images wisdom-oracle --format "table {{.Tag}}" | grep -v "latest" | grep -v "TAG" | head -1)
    
    if [ -z "$previous_image" ]; then
        log_error "No previous image found for rollback"
        exit 1
    fi
    
    log_info "Rolling back to image: wisdom-oracle:$previous_image"
    
    # Tag previous image as latest
    docker tag "wisdom-oracle:$previous_image" "wisdom-oracle:latest"
    
    # Restart services
    docker-compose -f "$DOCKER_COMPOSE_FILE" --profile prod up -d
    
    log_success "Rollback completed"
}

# Post-deployment tasks
post_deployment_tasks() {
    log_info "Running post-deployment tasks..."
    
    if [ "$DRY_RUN" = "true" ]; then
        log_info "[DRY RUN] Would run post-deployment tasks"
        return 0
    fi
    
    # Clean up old Docker images
    log_info "Cleaning up old Docker images..."
    docker image prune -f
    
    # Send deployment notification (if configured)
    if [ -n "${SLACK_WEBHOOK_URL:-}" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"✅ Wisdom Oracle deployed to $ENVIRONMENT at $(date)\"}" \
            "$SLACK_WEBHOOK_URL" || log_warning "Failed to send Slack notification"
    fi
    
    log_success "Post-deployment tasks completed"
}

# Main deployment function
main() {
    log_info "Starting deployment to $ENVIRONMENT environment..."
    log_info "Timestamp: $TIMESTAMP"
    
    if [ "$ROLLBACK" = "true" ]; then
        rollback_deployment
        health_check
        log_success "Rollback completed successfully!"
        return 0
    fi
    
    pre_deployment_checks
    run_tests
    build_image
    deploy_application
    
    if health_check; then
        post_deployment_tasks
        log_success "Deployment to $ENVIRONMENT completed successfully!"
        log_info "Application URL: $APP_URL"
    else
        log_error "Deployment failed health check"
        log_warning "Consider rolling back with: $0 $ENVIRONMENT --rollback"
        exit 1
    fi
}

# Trap errors
trap 'log_error "Deployment failed on line $LINENO"' ERR

# Run main function
main "$@"