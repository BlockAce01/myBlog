#!/bin/bash

# MyBlog Environment Switcher
# Easily switch between development, staging, and production environments

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to update NODE_ENV in a file
update_node_env() {
    local file="$1"
    local env="$2"

    if [[ -f "$file" ]]; then
        # Use sed to replace NODE_ENV line
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s/^NODE_ENV=.*/NODE_ENV=$env/" "$file"
        else
            # Linux/Windows (Git Bash)
            sed -i "s/^NODE_ENV=.*/NODE_ENV=$env/" "$file"
        fi
        print_success "Updated $file to NODE_ENV=$env"
    else
        print_warning "File $file not found, skipping..."
    fi
}

# Function to switch environment
switch_environment() {
    local env="$1"

    print_info "Switching to $env environment..."

    # Update NODE_ENV in all files
    update_node_env ".env" "$env"
    update_node_env "apps/backend/.env" "$env"
    update_node_env "apps/frontend/.env.local" "$env"

    # Update Docker-specific variables based on environment
    if [[ "$env" == "development" ]]; then
        # Development: Use localhost URLs and ports
        update_docker_vars ".env" "BACKEND_PORT=8080" "FRONTEND_PORT=3000" "NEXT_PUBLIC_API_URL=http://localhost:8080" "NEXT_PUBLIC_BACKEND_BASE_URL=http://localhost:8080" "NEXTAUTH_URL=http://localhost:3000"
    elif [[ "$env" == "production" ]]; then
        # Production: Use Docker service names and standard ports
        update_docker_vars ".env" "BACKEND_PORT=3003" "FRONTEND_PORT=3000" "NEXT_PUBLIC_API_URL=http://backend:3003" "NEXT_PUBLIC_BACKEND_BASE_URL=http://backend:3003" "NEXTAUTH_URL=http://localhost:3000"
    fi

    print_success "Environment switched to $env!"
    print_info "Current NODE_ENV settings:"
    echo "  Root .env: $(grep '^NODE_ENV=' .env 2>/dev/null || echo 'Not set')"
    echo "  Backend: $(grep '^NODE_ENV=' apps/backend/.env 2>/dev/null || echo 'Not set')"
    echo "  Frontend: $(grep '^NODE_ENV=' apps/frontend/.env.local 2>/dev/null || echo 'Not set')"
}

# Function to update Docker-specific variables
update_docker_vars() {
    local file="$1"
    shift
    local vars=("$@")

    if [[ -f "$file" ]]; then
        for var in "${vars[@]}"; do
            local var_name="${var%%=*}"
            local var_value="${var#*=}"
            if [[ "$OSTYPE" == "darwin"* ]]; then
                # macOS
                sed -i '' "s|^${var_name}=.*|${var}|" "$file"
            else
                # Linux/Windows (Git Bash)
                sed -i "s|^${var_name}=.*|${var}|" "$file"
            fi
        done
        print_success "Updated Docker variables in $file"
    else
        print_warning "File $file not found, skipping Docker vars update..."
    fi
}

# Function to show current environment
show_current_env() {
    print_info "Current environment settings:"
    echo "  Root .env: $(grep '^NODE_ENV=' .env 2>/dev/null || echo 'Not set')"
    echo "  Backend: $(grep '^NODE_ENV=' apps/backend/.env 2>/dev/null || echo 'Not set')"
    echo "  Frontend: $(grep '^NODE_ENV=' apps/frontend/.env.local 2>/dev/null || echo 'Not set')"
}

# Function to show usage
show_usage() {
    echo "MyBlog Environment Switcher"
    echo "Usage: $0 [environment]"
    echo ""
    echo "Environments:"
    echo "  development  - Local development (runs on your PC)"
    echo "  production   - Production deployment (runs on servers)"
    echo "  staging      - Staging environment"
    echo ""
    echo "Commands:"
    echo "  status       - Show current environment settings"
    echo "  help         - Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 development    # Switch to local development"
    echo "  $0 production     # Switch to production"
    echo "  $0 status         # Show current settings"
}

# Main script logic
case "${1:-help}" in
    "development"|"dev")
        switch_environment "development"
        print_info "Ready for local development! Run: docker-compose up"
        ;;
    "production"|"prod")
        switch_environment "production"
        print_info "Ready for production deployment!"
        ;;
    "staging"|"stage")
        switch_environment "staging"
        print_info "Ready for staging deployment!"
        ;;
    "status")
        show_current_env
        ;;
    "help"|"-h"|"--help")
        show_usage
        ;;
    *)
        print_error "Unknown environment: $1"
        echo ""
        show_usage
        exit 1
        ;;
esac
