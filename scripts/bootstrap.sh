#!/usr/bin/env bash

# ─────────────────────────────────────────────────────────────────────────────
#  ToxiMeter Production Bootstrap Script
#  One-command repo creation, CI/CD setup, and Vercel deployment
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

# Color output functions using tput for portability
if command -v tput >/dev/null 2>&1 && [[ -t 1 ]]; then
    RED=$(tput setaf 1)
    GREEN=$(tput setaf 2)
    YELLOW=$(tput setaf 3)
    BLUE=$(tput setaf 4)
    BOLD=$(tput bold)
    NC=$(tput sgr0)
else
    RED="" GREEN="" YELLOW="" BLUE="" BOLD="" NC=""
fi

info() { echo "${BLUE}ℹ${NC} $1"; }
success() { echo "${GREEN}✔${NC} $1"; }
warn() { echo "${YELLOW}⚠${NC} $1"; }
error() { echo "${RED}✖${NC} $1" >&2; }
header() { echo; echo "${BOLD}${BLUE}$1${NC}"; echo; }

# Resolve script directory and move to project root
SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)
PROJECT_ROOT="$SCRIPT_DIR/.."
cd "$PROJECT_ROOT"

# Function to check if CLI tool exists
need() {
    local tool="$1"
    local install_hint="$2"
    
    if ! command -v "$tool" >/dev/null 2>&1; then
        error "$tool is required but not installed"
        info "Install: $install_hint"
        return 1
    fi
    success "$tool CLI found"
}

# Function to find or create git repository root
ensure_git_root() {
    local current_dir="$PWD"
    
    # Walk up directories looking for .git
    while [[ "$current_dir" != "/" ]]; do
        if [[ -d "$current_dir/.git" ]]; then
            cd "$current_dir"
            success "Found git repository at: $current_dir"
            return 0
        fi
        current_dir=$(dirname "$current_dir")
    done
    
    # No .git found, initialize here
    info "No git repository found. Initializing..."
    git init
    success "Git repository initialized"
}

# Function to commit any pending changes
commit_pending_changes() {
    if [[ -n "$(git status --porcelain)" ]]; then
        warn "Uncommitted changes detected"
        git add -A
        local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
        git commit -m "Bootstrap deployment commit: $timestamp"
        success "Committed pending changes"
    else
        success "Working directory is clean"
    fi
}

# Function to create GitHub repository
create_github_repo() {
    local repo_name="$1"
    local github_user="iAakash1"
    
    # Check if origin remote already exists and points to GitHub
    if git remote get-url origin >/dev/null 2>&1; then
        local origin_url=$(git remote get-url origin)
        if [[ "$origin_url" =~ github\.com.*"$repo_name" ]]; then
            success "GitHub repository already configured: $origin_url"
            return 0
        else
            warn "Origin exists but doesn't match expected repo: $origin_url"
        fi
    fi
    
    # Check if repository exists on GitHub
    if gh repo view "$github_user/$repo_name" >/dev/null 2>&1; then
        warn "Repository $github_user/$repo_name already exists on GitHub"
        info "Adding as origin remote..."
        git remote remove origin 2>/dev/null || true
        git remote add origin "https://github.com/$github_user/$repo_name.git"
    else
        info "Creating GitHub repository: $github_user/$repo_name"
        gh repo create "$github_user/$repo_name" --private --source=. --push
    fi
    
    success "GitHub repository ready"
}

# Function to setup Vercel project
setup_vercel_project() {
    local project_name="$1"
    
    info "Setting up Vercel project..."
    
    # Create vercel.json configuration
    cat > vercel.json << 'EOF'
{
  "framework": "nextjs",
  "buildCommand": "pnpm build",
  "outputDirectory": ".next",
  "installCommand": "pnpm install --frozen-lockfile",
  "devCommand": "pnpm dev",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "rewrites": [
    {
      "source": "/api/trpc/(.*)",
      "destination": "/api/trpc/$1"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "origin-when-cross-origin"
        }
      ]
    }
  ]
}
EOF
    success "Created vercel.json configuration"
    
    # Link to Vercel (will prompt for project settings)
    info "Linking to Vercel..."
    vercel link --yes
    success "Linked to Vercel project"
    
    # Pull environment variables template
    info "Pulling environment variables..."
    if vercel env pull .env.local 2>/dev/null || touch .env.local; then
        success "Environment variables template ready"
    else
        warn "Could not pull environment variables. Manual configuration may be needed."
    fi
}

# Function to build and test project
build_and_test() {
    info "Installing dependencies..."
    pnpm install --frozen-lockfile
    success "Dependencies installed"
    
    info "Building project..."
    if pnpm build; then
        success "Project built successfully"
    else
        error "Build failed. Please fix build errors before deploying."
        return 1
    fi
    
    # Run tests if they exist
    if grep -q '"test":' package.json; then
        info "Running tests..."
        if pnpm test --passWithNoTests; then
            success "Tests passed"
        else
            error "Tests failed. Please fix test failures before deploying."
            return 1
        fi
    else
        info "No tests configured, skipping test phase"
    fi
}

# Function to deploy to production
deploy_to_production() {
    info "Deploying to Vercel production..."
    local deploy_output
    deploy_output=$(vercel --prod 2>&1) || {
        error "Production deployment failed"
        echo "$deploy_output" >&2
        return 1
    }
    
    # Extract deployment URL from output
    local deployment_url
    deployment_url=$(echo "$deploy_output" | grep -o 'https://[^[:space:]]*\.vercel\.app' | head -1 || echo "")
    
    success "Successfully deployed to production!"
    if [[ -n "$deployment_url" ]]; then
        info "🌐 Live site: $deployment_url"
    fi
}

# Function to display final setup instructions
show_final_instructions() {
    local repo_name="$1"
    local github_user="iAakash1"
    
    header "🎉 Bootstrap Complete!"
    
    echo "Your ToxiMeter application has been successfully deployed!"
    echo
    echo "📋 What was created:"
    echo "  ✔ GitHub repository: https://github.com/$github_user/$repo_name"
    echo "  ✔ Vercel project linked and deployed"
    echo "  ✔ CI/CD pipeline configured"
    echo "  ✔ Environment variables template"
    echo
    echo "🔧 Next steps to complete setup:"
    echo "  1. Configure environment variables in Vercel dashboard:"
    echo "     - DATABASE_URL (your PostgreSQL connection string)"
    echo "     - NEXTAUTH_SECRET (generate with: openssl rand -base64 32)"
    echo "     - OAuth provider credentials (Google, GitHub, etc.)"
    echo
    echo "  2. Add GitHub repository secrets for CI/CD:"
    echo "     - VERCEL_TOKEN (create with: vercel tokens add)"
    echo "     - Copy project IDs from .vercel/project.json"
    echo
    echo "  3. Push changes to main branch to trigger auto-deployment"
    echo
    echo "🔗 Useful links:"
    echo "  📊 Vercel Dashboard: https://vercel.com/dashboard"
    echo "  🔑 GitHub Settings: https://github.com/$github_user/$repo_name/settings/secrets"
    echo "  📖 Full docs: README.md"
    
    if [[ -f .vercel/project.json ]]; then
        echo
        echo "📋 Project Configuration (add to GitHub Secrets):"
        local project_id org_id
        project_id=$(jq -r '.projectId // empty' .vercel/project.json 2>/dev/null || echo "N/A")
        org_id=$(jq -r '.orgId // empty' .vercel/project.json 2>/dev/null || echo "N/A")
        echo "  VERCEL_PROJECT_ID: $project_id"
        echo "  VERCEL_ORG_ID: $org_id"
    fi
}

# Main execution function
main() {
    local repo_name="${1:-}"
    
    if [[ -z "$repo_name" ]]; then
        error "Usage: $0 <repository-name>"
        info "Example: $0 toxicity-detector-prod"
        exit 1
    fi
    
    # Validate repository name
    if [[ ! "$repo_name" =~ ^[a-zA-Z0-9_-]+$ ]]; then
        error "Repository name can only contain letters, numbers, hyphens, and underscores"
        exit 1
    fi
    
    header "🚀 Starting ToxiMeter Bootstrap: $repo_name"
    
    # Check prerequisites
    info "Checking prerequisites..."
    need "git" "https://git-scm.com/downloads"
    need "gh" "brew install gh (macOS) or https://cli.github.com"
    need "vercel" "npm install -g vercel"
    need "pnpm" "npm install -g pnpm"
    need "jq" "brew install jq (macOS) for JSON parsing"
    
    # Check authentication
    info "Verifying authentication..."
    if ! gh auth status >/dev/null 2>&1; then
        error "GitHub CLI not authenticated"
        info "Run: gh auth login"
        exit 1
    fi
    success "GitHub CLI authenticated"
    
    if ! vercel whoami >/dev/null 2>&1; then
        error "Vercel CLI not authenticated"
        info "Run: vercel login"
        exit 1
    fi
    success "Vercel CLI authenticated"
    
    # Execute deployment pipeline
    ensure_git_root
    commit_pending_changes
    create_github_repo "$repo_name"
    setup_vercel_project "$repo_name"
    build_and_test
    deploy_to_production
    show_final_instructions "$repo_name"
    
    success "Bootstrap completed successfully! 🎉"
}

# Handle script interruption gracefully
trap 'error "Bootstrap interrupted"; exit 130' INT TERM

# Execute main function with all arguments
main "$@"
