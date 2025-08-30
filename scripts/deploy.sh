#!/bin/bash

# Deployment script for The Robot Overlord
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-staging}
BUILD_ID=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups"

echo -e "${GREEN}🚀 Starting deployment for ${ENVIRONMENT} environment${NC}"

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(staging|production)$ ]]; then
    echo -e "${RED}❌ Invalid environment. Use 'staging' or 'production'${NC}"
    exit 1
fi

# Check if required files exist
if [ ! -f ".env.${ENVIRONMENT}" ]; then
    echo -e "${RED}❌ Environment file .env.${ENVIRONMENT} not found${NC}"
    exit 1
fi

# Create backup directory
mkdir -p $BACKUP_DIR

# Pre-deployment checks
echo -e "${YELLOW}🔍 Running pre-deployment checks...${NC}"

# Check Node.js version
NODE_VERSION=$(node --version)
echo "Node.js version: $NODE_VERSION"

# Check npm version
NPM_VERSION=$(npm --version)
echo "npm version: $NPM_VERSION"

# Run tests
echo -e "${YELLOW}🧪 Running tests...${NC}"
npm run test -- --passWithNoTests --watchAll=false
npm run type-check

# Run linting
echo -e "${YELLOW}🔍 Running linting...${NC}"
npm run lint

# Build the application
echo -e "${YELLOW}🏗️  Building application...${NC}"
cp ".env.${ENVIRONMENT}" .env.production
npm run build

# Run E2E tests on build
if [ "$ENVIRONMENT" = "staging" ]; then
    echo -e "${YELLOW}🎭 Running E2E tests...${NC}"
    npm run test:e2e -- --reporter=line
fi

# Create deployment package
echo -e "${YELLOW}📦 Creating deployment package...${NC}"
tar -czf "${BACKUP_DIR}/build_${BUILD_ID}.tar.gz" \
    .next \
    public \
    package.json \
    package-lock.json \
    next.config.js \
    .env.production

# Docker build and deployment
if [ "$ENVIRONMENT" = "production" ]; then
    echo -e "${YELLOW}🐳 Building Docker image...${NC}"
    docker build -t therobotoverlord-web:${BUILD_ID} .
    docker tag therobotoverlord-web:${BUILD_ID} therobotoverlord-web:latest
    
    echo -e "${YELLOW}🚢 Deploying to production...${NC}"
    docker-compose down
    docker-compose up -d
    
    # Wait for health check
    echo -e "${YELLOW}⏳ Waiting for application to be ready...${NC}"
    sleep 30
    
    # Health check
    if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Health check passed${NC}"
    else
        echo -e "${RED}❌ Health check failed${NC}"
        docker-compose logs web
        exit 1
    fi
fi

# Cleanup old builds (keep last 5)
echo -e "${YELLOW}🧹 Cleaning up old builds...${NC}"
ls -t ${BACKUP_DIR}/build_*.tar.gz 2>/dev/null | tail -n +6 | xargs -r rm

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${GREEN}Build ID: ${BUILD_ID}${NC}"
echo -e "${GREEN}Environment: ${ENVIRONMENT}${NC}"

# Send deployment notification (if configured)
if [ -n "$WEBHOOK_URL" ]; then
    curl -X POST "$WEBHOOK_URL" \
        -H "Content-Type: application/json" \
        -d "{\"text\":\"🚀 The Robot Overlord deployed to ${ENVIRONMENT} - Build: ${BUILD_ID}\"}"
fi
