#!/bin/sh

# ─────────────────────────────────────────────────────────────────────────────
#  Environment Variables Management Script
#  Helps set up and validate environment configuration
# ─────────────────────────────────────────────────────────────────────────────

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    printf "${BLUE}ℹ${NC} %s\n" "$1"
}

log_success() {
    printf "${GREEN}✅${NC} %s\n" "$1"
}

log_warning() {
    printf "${YELLOW}⚠${NC} %s\n" "$1"
}

log_error() {
    printf "${RED}❌${NC} %s\n" "$1"
}

# Show help
show_help() {
    echo "Environment Variables Management Script"
    echo
    echo "Usage: $0 [COMMAND]"
    echo
    echo "Commands:"
    echo "  check       - Check current environment configuration"
    echo "  template    - Generate .env.local template"
    echo "  validate    - Validate environment variables"
    echo "  sync        - Sync environment variables to Vercel"
    echo "  help        - Show this help message"
    echo
    echo "Examples:"
    echo "  $0 check"
    echo "  $0 template"
    echo "  $0 sync"
}

# Check if .env.local exists and show status
check_env() {
    log_info "🔍 Checking environment configuration..."
    
    if [ ! -f ".env.local" ]; then
        log_warning ".env.local file not found"
        log_info "Run: $0 template to generate one"
        return 1
    fi

    log_success ".env.local file found"
    
    # Check required variables
    required_vars="DATABASE_URL NEXTAUTH_SECRET NEXTAUTH_URL"
    missing_vars=""
    
    for var in $required_vars; do
        if ! grep -q "^${var}=" .env.local 2>/dev/null; then
            missing_vars="$missing_vars $var"
        fi
    done
    
    if [ -n "$missing_vars" ]; then
        log_warning "Missing required variables:$missing_vars"
        return 1
    fi
    
    log_success "All required environment variables are present"
    
    # Check optional variables
    optional_vars="GOOGLE_CLIENT_ID GOOGLE_CLIENT_SECRET GITHUB_CLIENT_ID GITHUB_CLIENT_SECRET NEXT_PUBLIC_POSTHOG_KEY"
    missing_optional=""
    
    for var in $optional_vars; do
        if ! grep -q "^${var}=" .env.local 2>/dev/null; then
            missing_optional="$missing_optional $var"
        fi
    done
    
    if [ -n "$missing_optional" ]; then
        log_info "Optional variables not set:$missing_optional"
    fi
    
    return 0
}

# Generate environment template
generate_template() {
    log_info "📝 Generating .env.local template..."
    
    cat > .env.local << 'EOF'
# Database Configuration
# Get from: https://neon.tech or your PostgreSQL provider
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"

# NextAuth Configuration
# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET="your-super-secret-jwt-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# OAuth Providers (Optional)
# Google: https://console.developers.google.com/
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# GitHub: https://github.com/settings/developers
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# Email Provider (Optional)
# For magic link authentication
EMAIL_SERVER_HOST=""
EMAIL_SERVER_PORT=""
EMAIL_SERVER_USER=""
EMAIL_SERVER_PASSWORD=""
EMAIL_FROM=""

# Analytics (Optional)
# PostHog: https://posthog.com
NEXT_PUBLIC_POSTHOG_KEY=""

# Development
NODE_ENV="development"
EOF

    log_success ".env.local template created"
    log_info "Please edit .env.local with your actual values"
}

# Validate environment variables
validate_env() {
    log_info "🔎 Validating environment variables..."
    
    if [ ! -f ".env.local" ]; then
        log_error ".env.local not found. Run: $0 template"
        exit 1
    fi
    
    # Source the env file for validation
    . ./.env.local 2>/dev/null || {
        log_error "Failed to load .env.local"
        exit 1
    }
    
    # Validate DATABASE_URL format
    if [ -n "$DATABASE_URL" ]; then
        if echo "$DATABASE_URL" | grep -q "^postgresql://"; then
            log_success "DATABASE_URL format is valid"
        else
            log_error "DATABASE_URL should start with postgresql://"
        fi
    else
        log_error "DATABASE_URL is required"
    fi
    
    # Validate NEXTAUTH_SECRET length
    if [ -n "$NEXTAUTH_SECRET" ]; then
        if [ ${#NEXTAUTH_SECRET} -ge 32 ]; then
            log_success "NEXTAUTH_SECRET is sufficiently long"
        else
            log_warning "NEXTAUTH_SECRET should be at least 32 characters long"
        fi
    else
        log_error "NEXTAUTH_SECRET is required"
    fi
    
    # Validate NEXTAUTH_URL format
    if [ -n "$NEXTAUTH_URL" ]; then
        if echo "$NEXTAUTH_URL" | grep -q "^https\?://"; then
            log_success "NEXTAUTH_URL format is valid"
        else
            log_error "NEXTAUTH_URL should start with http:// or https://"
        fi
    else
        log_error "NEXTAUTH_URL is required"
    fi
    
    log_success "Environment validation completed"
}

# Sync environment variables to Vercel
sync_to_vercel() {
    log_info "🔄 Syncing environment variables to Vercel..."
    
    if ! command -v vercel >/dev/null 2>&1; then
        log_error "Vercel CLI not found. Install with: npm i -g vercel"
        exit 1
    fi
    
    if [ ! -f ".env.local" ]; then
        log_error ".env.local not found. Run: $0 template first"
        exit 1
    fi
    
    # Push environment variables to Vercel
    if vercel env add < .env.local; then
        log_success "Environment variables synced to Vercel"
    else
        log_error "Failed to sync environment variables"
        log_info "You may need to set them manually in Vercel dashboard"
    fi
}

# Main script logic
case "${1:-help}" in
    check)
        check_env
        ;;
    template)
        generate_template
        ;;
    validate)
        validate_env
        ;;
    sync)
        sync_to_vercel
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        log_error "Unknown command: $1"
        echo
        show_help
        exit 1
        ;;
esac
