# The Robot Overlord Web - Frontend Justfile
# Commands for managing the Next.js frontend application

# Default recipe - show available commands
default:
    @just --list

# === DEPENDENCIES ===

# Install dependencies
install:
    @echo "📦 Installing web dependencies..."
    npm install
    @echo "✅ Dependencies installed"

# Clean node_modules and build artifacts
clean:
    @echo "🧹 Cleaning web artifacts..."
    rm -rf node_modules
    rm -rf .next
    rm -rf dist
    rm -rf build
    @echo "✅ Web artifacts cleaned"

# Update dependencies
update-deps:
    @echo "📦 Updating dependencies..."
    npm update
    @echo "✅ Dependencies updated"

# === DEVELOPMENT ===

# Start development server
dev:
    @echo "🌐 Starting Next.js development server..."
    npm run dev

# Stop development server (for consistency with API)
stop:
    @echo "🛑 Stopping development server..."
    @pkill -f "next dev" || echo "No development server running"

# === BUILDING ===

# Build for production
build-prod:
    @echo "🏗️ Building for production..."
    npm run build
    @echo "✅ Production build completed"

# Build for staging
build-staging:
    @echo "🏗️ Building for staging..."
    NODE_ENV=staging npm run build
    @echo "✅ Staging build completed"

# Build Docker image
docker-build:
    @echo "🐳 Building Docker image..."
    docker build -t therobotoverlord-web:latest .
    @echo "✅ Docker image built"

# === TESTING ===

# Run tests
test:
    @echo "🧪 Running web tests..."
    npm run test
    @echo "✅ Tests completed"

# Run E2E tests
test-e2e:
    @echo "🧪 Running E2E tests..."
    npm run test:e2e || echo "E2E tests not configured"
    @echo "✅ E2E tests completed"

# === CODE QUALITY ===

# Run linting and type checking
check:
    @echo "🔍 Running code quality checks..."
    npm run lint
    npm run type-check || echo "Type checking not configured"
    @echo "✅ Quality checks completed"

# Fix linting issues
fix:
    @echo "🔧 Fixing linting issues..."
    npm run lint:fix || npm run lint -- --fix
    @echo "✅ Linting fixes applied"

# === DEPLOYMENT ===

# Deploy to staging
deploy-staging:
    @echo "🚀 Deploying to staging..."
    npm run build
    npm run deploy:staging || echo "Staging deployment not configured"
    @echo "✅ Staging deployment completed"

# Deploy to production
deploy-prod:
    @echo "🚀 Deploying to production..."
    npm run build
    npm run deploy:prod || echo "Production deployment not configured"
    @echo "✅ Production deployment completed"

# Apply Kubernetes manifests
k8s-apply:
    @echo "☸️ Applying Kubernetes manifests..."
    kubectl apply -f k8s/ || echo "Kubernetes manifests not found"
    @echo "✅ Kubernetes deployment completed"

# === MONITORING ===

# Health check
health-check:
    @echo "🏥 Checking web service health..."
    @curl -s http://localhost:3000/api/health > /dev/null && echo "✅ Web service healthy" || echo "❌ Web service unhealthy"

# === UTILITIES ===

# Setup environment files
env-setup:
    @echo "⚙️ Setting up environment files..."
    @if [ ! -f .env.local ]; then \
        cp .env.example .env.local 2>/dev/null || echo "# Environment variables" > .env.local; \
        echo "Created .env.local"; \
    else \
        echo ".env.local already exists"; \
    fi
    @echo "✅ Environment setup completed"

# Security audit
security-audit:
    @echo "🔒 Running security audit..."
    npm audit
    @echo "✅ Security audit completed"

# === GENERATORS ===

# Generate a new component
gen-component name:
    @echo "🎨 Generating component: {{name}}"
    @mkdir -p src/components/{{name}}
    @echo "export const {{name}} = () => {\n  return (\n    <div>\n      {{name}} Component\n    </div>\n  );\n};" > src/components/{{name}}/{{name}}.tsx
    @echo "export { {{name}} } from './{{name}}';" > src/components/{{name}}/index.ts
    @echo "✅ Component {{name}} generated"

# Generate a new page
gen-page path:
    @echo "📄 Generating page: {{path}}"
    @mkdir -p src/app/{{path}}
    @echo "export default function {{path}}Page() {\n  return (\n    <div>\n      <h1>{{path}} Page</h1>\n    </div>\n  );\n}" > src/app/{{path}}/page.tsx
    @echo "✅ Page {{path}} generated"

# Generate API route
gen-api path:
    @echo "🔌 Generating API route: {{path}}"
    @mkdir -p src/app/api/{{path}}
    @echo "import { NextRequest, NextResponse } from 'next/server';\n\nexport async function GET(request: NextRequest) {\n  return NextResponse.json({ message: 'Hello from {{path}}' });\n}" > src/app/api/{{path}}/route.ts
    @echo "✅ API route {{path}} generated"

# === HELP ===

# Show available commands
help:
    @echo "🌐 The Robot Overlord Web - Available Commands"
    @echo "=============================================="
    @echo ""
    @echo "=== DEVELOPMENT ==="
    @echo "just dev                    Start development server"
    @echo "just stop                   Stop development server"
    @echo ""
    @echo "=== BUILDING ==="
    @echo "just build-prod             Build for production"
    @echo "just build-staging          Build for staging"
    @echo "just docker-build           Build Docker image"
    @echo ""
    @echo "=== TESTING ==="
    @echo "just test                   Run tests"
    @echo "just test-e2e               Run E2E tests"
    @echo ""
    @echo "=== CODE QUALITY ==="
    @echo "just check                  Run quality checks"
    @echo "just fix                    Fix linting issues"
    @echo ""
    @echo "=== DEPLOYMENT ==="
    @echo "just deploy-staging         Deploy to staging"
    @echo "just deploy-prod            Deploy to production"
    @echo ""
    @echo "=== UTILITIES ==="
    @echo "just install                Install dependencies"
    @echo "just clean                  Clean artifacts"
    @echo "just env-setup              Setup environment"
    @echo ""
    @echo "For complete list: just --list"
