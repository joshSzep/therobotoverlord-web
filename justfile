# The Robot Overlord - Web Frontend Justfile
# Commands for development, testing, building, and deployment

# Default recipe - show available commands
default:
    @just --list

# === DEVELOPMENT ===

# Install dependencies
install:
    npm install

# Start development server
dev:
    npm run dev

# Start development server with specific port
dev-port port="3000":
    npm run dev -- --port {{port}}

# Start development server with turbo mode
dev-turbo:
    npm run dev -- --turbo

# Stop development server
stop:
    @echo "🛑 Stopping web development server..."
    @pkill -f "next dev" || echo "No development server running"
    @echo "✅ Web development server stopped"

# Clean all build artifacts and node_modules
clean:
    rm -rf .next
    rm -rf node_modules
    rm -rf dist
    rm -rf coverage
    rm -rf playwright-report
    rm -rf test-results

# Fresh install - clean and reinstall everything
fresh: clean install

# === CODE QUALITY ===

# Run ESLint
lint:
    npm run lint

# Fix ESLint issues automatically
lint-fix:
    npm run lint -- --fix

# Run Prettier formatting
format:
    npx prettier --write .

# Run TypeScript type checking
type-check:
    npx tsc --noEmit

# Run all code quality checks
check: lint type-check
    @echo "✅ All code quality checks passed"

# Fix all auto-fixable issues
fix: lint-fix format
    @echo "✅ Code formatting and linting fixes applied"

# === TESTING ===

# Run all unit tests
test:
    npm run test

# Run tests in watch mode
test-watch:
    npm run test -- --watch

# Run tests with coverage
test-coverage:
    npm run test -- --coverage

# Run integration tests
test-integration:
    npm run test -- --testPathPattern=integration

# Run E2E tests
test-e2e:
    npx playwright test

# Run E2E tests in headed mode (with browser UI)
test-e2e-headed:
    npx playwright test --headed

# Run E2E tests for specific browser
test-e2e-browser browser="chromium":
    npx playwright test --project={{browser}}

# Install Playwright browsers
test-e2e-install:
    npx playwright install

# Generate Playwright test report
test-e2e-report:
    npx playwright show-report

# Run all tests (unit + integration + e2e)
test-all: test test-e2e
    @echo "✅ All tests completed"

# === BUILDING ===

# Build for production
build:
    npm run build

# Build for staging
build-staging:
    NODE_ENV=production NEXT_PUBLIC_APP_ENV=staging npm run build

# Build for production
build-prod:
    NODE_ENV=production NEXT_PUBLIC_APP_ENV=production npm run build

# Start production server locally
start:
    npm run start

# Analyze bundle size
analyze:
    ANALYZE=true npm run build

# === DOCKER ===

# Build Docker image
docker-build tag="therobotoverlord-web:latest":
    docker build -t {{tag}} .

# Build Docker image for production
docker-build-prod tag="therobotoverlord-web:prod":
    docker build -t {{tag}} --target production .

# Run Docker container
docker-run tag="therobotoverlord-web:latest" port="3000":
    docker run -p {{port}}:3000 {{tag}}

# Run Docker container with environment file
docker-run-env tag="therobotoverlord-web:latest" port="3000" env-file=".env.local":
    docker run -p {{port}}:3000 --env-file {{env-file}} {{tag}}

# Build and run Docker container
docker-dev: (docker-build) (docker-run)

# Clean Docker images and containers
docker-clean:
    docker system prune -f
    docker image prune -f

# === DEPLOYMENT ===

# Deploy to staging
deploy-staging:
    ./scripts/deploy.sh staging

# Deploy to production
deploy-prod:
    ./scripts/deploy.sh production

# Check deployment health
health-check url="http://localhost:3000":
    curl -f {{url}}/api/health || echo "❌ Health check failed"

# Check readiness
ready-check url="http://localhost:3000":
    curl -f {{url}}/api/ready || echo "❌ Readiness check failed"

# === KUBERNETES ===

# Apply Kubernetes manifests
k8s-apply:
    kubectl apply -f k8s/

# Delete Kubernetes resources
k8s-delete:
    kubectl delete -f k8s/

# Get Kubernetes pods status
k8s-pods:
    kubectl get pods -l app=therobotoverlord-web

# Get Kubernetes services
k8s-services:
    kubectl get services -l app=therobotoverlord-web

# View Kubernetes logs
k8s-logs:
    kubectl logs -l app=therobotoverlord-web --tail=100 -f

# Port forward to Kubernetes service
k8s-port-forward port="3000":
    kubectl port-forward service/therobotoverlord-web {{port}}:80

# === DATABASE & BACKEND ===

# Check backend API health
api-health url="http://localhost:8000":
    curl -f {{url}}/health || echo "❌ Backend API health check failed"

# Check WebSocket connection
ws-check url="ws://localhost:8001":
    @echo "WebSocket URL: {{url}}/ws"
    @echo "Use browser dev tools to test WebSocket connection"

# === MONITORING ===

# View application logs
logs:
    tail -f .next/trace

# Monitor performance
perf-monitor:
    @echo "Performance monitoring endpoints:"
    @echo "- Health: http://localhost:3000/api/health"
    @echo "- Ready: http://localhost:3000/api/ready"
    @echo "- Performance: http://localhost:3000/api/monitoring/performance"

# === UTILITIES ===

# Generate component
gen-component name:
    mkdir -p src/components/{{name}}
    echo "export function {{name}}() { return <div>{{name}}</div>; }" > src/components/{{name}}/{{name}}.tsx
    echo "export { {{name}} } from './{{name}}'" > src/components/{{name}}/index.ts

# Generate page
gen-page path:
    mkdir -p src/app/{{path}}
    echo "export default function {{path}}Page() { return <div>{{path}} Page</div>; }" > src/app/{{path}}/page.tsx

# Generate API route
gen-api path:
    mkdir -p src/app/api/{{path}}
    echo "import { NextRequest, NextResponse } from 'next/server';\n\nexport async function GET(request: NextRequest) {\n  return NextResponse.json({ message: 'Hello from {{path}}' });\n}" > src/app/api/{{path}}/route.ts

# Update dependencies
update-deps:
    npm update
    npm audit fix

# Check for outdated dependencies
check-deps:
    npm outdated

# Security audit
security-audit:
    npm audit

# === ENVIRONMENT ===

# Copy environment template
env-setup:
    cp .env.example .env.local
    @echo "✅ Environment file created. Please edit .env.local with your configuration."

# Validate environment variables
env-check:
    @echo "Checking required environment variables..."
    @test -n "$$NEXT_PUBLIC_API_BASE_URL" || echo "❌ NEXT_PUBLIC_API_BASE_URL not set"
    @test -n "$$NEXT_PUBLIC_WEBSOCKET_URL" || echo "❌ NEXT_PUBLIC_WEBSOCKET_URL not set"
    @echo "✅ Environment check completed"

# Show environment info
env-info:
    @echo "Environment Information:"
    @echo "NODE_ENV: $${NODE_ENV:-development}"
    @echo "NEXT_PUBLIC_APP_ENV: $${NEXT_PUBLIC_APP_ENV:-development}"
    @echo "API URL: $${NEXT_PUBLIC_API_BASE_URL:-http://localhost:8000}"
    @echo "WebSocket URL: $${NEXT_PUBLIC_WEBSOCKET_URL:-ws://localhost:8001/ws}"

# === GIT & CI/CD ===

# Run pre-commit checks
pre-commit: lint type-check test
    @echo "✅ Pre-commit checks passed"

# Prepare for commit
commit-prep: fix test
    @echo "✅ Ready for commit"

# Create release build and tag
release version:
    @echo "Creating release {{version}}"
    git tag -a v{{version}} -m "Release v{{version}}"
    just build-prod
    @echo "✅ Release v{{version}} created"

# === HELP ===

# Show development setup instructions
setup-help:
    @echo "🤖 The Robot Overlord - Development Setup"
    @echo ""
    @echo "1. Install dependencies:     just install"
    @echo "2. Setup environment:        just env-setup"
    @echo "3. Start development:        just dev"
    @echo "4. Run tests:               just test"
    @echo "5. Check code quality:      just check"
    @echo ""
    @echo "For full command list:      just --list"

# Show deployment instructions
deploy-help:
    @echo "🚀 Deployment Commands"
    @echo ""
    @echo "Local Docker:               just docker-dev"
    @echo "Build for staging:          just build-staging"
    @echo "Build for production:       just build-prod"
    @echo "Deploy to staging:          just deploy-staging"
    @echo "Deploy to production:       just deploy-prod"
    @echo "Kubernetes deployment:      just k8s-apply"
    @echo ""
    @echo "Health checks:              just health-check"

# Show all available recipes with descriptions
help:
    @echo "🤖 The Robot Overlord - Web Frontend Commands"
    @echo ""
    @echo "=== QUICK START ==="
    @echo "just setup-help             Show setup instructions"
    @echo "just deploy-help            Show deployment instructions"
    @echo ""
    @echo "=== DEVELOPMENT ==="
    @echo "just install                Install dependencies"
    @echo "just dev                    Start development server"
    @echo "just fresh                  Clean install everything"
    @echo ""
    @echo "=== TESTING ==="
    @echo "just test                   Run unit tests"
    @echo "just test-e2e               Run E2E tests"
    @echo "just test-all               Run all tests"
    @echo ""
    @echo "=== BUILDING ==="
    @echo "just build                  Build for production"
    @echo "just docker-build           Build Docker image"
    @echo ""
    @echo "=== DEPLOYMENT ==="
    @echo "just deploy-staging         Deploy to staging"
    @echo "just deploy-prod            Deploy to production"
    @echo "just k8s-apply              Deploy to Kubernetes"
    @echo ""
    @echo "For complete list: just --list"
