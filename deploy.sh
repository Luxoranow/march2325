#!/bin/bash
# Deployment script for Luxora Unified
# This script automates the process of validating and deploying the app to Vercel

# Color codes for better readability
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}===== Luxora Unified Deployment Script =====${NC}"
echo "Starting deployment process..."

# Check if running in CI
if [ -z "$CI" ]; then
  # Check for .env.local file
  if [ ! -f .env.local ]; then
    echo -e "${YELLOW}WARNING: .env.local file not found!${NC}"
    echo "This is fine for CI/CD environments, but make sure all environment variables are set in Vercel."
  else
    echo -e "${GREEN}✓ Found .env.local file${NC}"
  fi
  
  # Check .env.local for required variables
  if [ -f .env.local ]; then
    REQUIRED_VARS=("NEXT_PUBLIC_SUPABASE_URL" "NEXT_PUBLIC_SUPABASE_ANON_KEY" "NEXT_PUBLIC_SITE_URL")
    MISSING_VARS=()
    
    for VAR in "${REQUIRED_VARS[@]}"; do
      if ! grep -q "^$VAR=" .env.local; then
        MISSING_VARS+=("$VAR")
      fi
    done
    
    if [ ${#MISSING_VARS[@]} -gt 0 ]; then
      echo -e "${YELLOW}WARNING: The following required variables are missing from .env.local:${NC}"
      for VAR in "${MISSING_VARS[@]}"; do
        echo "  - $VAR"
      done
      echo "Make sure to set these in your Vercel environment variables."
    else
      echo -e "${GREEN}✓ All required environment variables found${NC}"
    fi
  fi
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
  echo -e "${RED}ERROR: Vercel CLI is not installed!${NC}"
  echo "Please install it using: npm install -g vercel"
  exit 1
else
  echo -e "${GREEN}✓ Vercel CLI is installed${NC}"
fi

# Install dependencies
echo -e "\n${GREEN}===== Installing dependencies =====${NC}"
npm install
if [ $? -ne 0 ]; then
  echo -e "${RED}ERROR: Failed to install dependencies!${NC}"
  exit 1
else
  echo -e "${GREEN}✓ Dependencies installed successfully${NC}"
fi

# Lint code
echo -e "\n${GREEN}===== Linting code =====${NC}"
npm run lint
if [ $? -ne 0 ]; then
  echo -e "${YELLOW}WARNING: Linting found issues. Review them before proceeding.${NC}"
  read -p "Do you want to continue with deployment? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled."
    exit 1
  fi
else
  echo -e "${GREEN}✓ Linting passed${NC}"
fi

# TypeScript check
echo -e "\n${GREEN}===== Checking TypeScript =====${NC}"
npx tsc --noEmit
if [ $? -ne 0 ]; then
  echo -e "${YELLOW}WARNING: TypeScript check found issues. Review them before proceeding.${NC}"
  read -p "Do you want to continue with deployment? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled."
    exit 1
  fi
else
  echo -e "${GREEN}✓ TypeScript check passed${NC}"
fi

# Build check (without saving the build output)
echo -e "\n${GREEN}===== Checking build =====${NC}"
npm run build
if [ $? -ne 0 ]; then
  echo -e "${RED}ERROR: Build failed!${NC}"
  exit 1
else
  echo -e "${GREEN}✓ Build check passed${NC}"
fi

# Ask for deployment type
echo -e "\n${GREEN}===== Deployment Options =====${NC}"
echo "1) Preview deployment (staging)"
echo "2) Production deployment"
read -p "Choose deployment type (1/2): " -n 1 -r
echo

if [[ $REPLY =~ ^[1]$ ]]; then
  echo -e "\n${GREEN}===== Deploying to preview (staging) =====${NC}"
  vercel
elif [[ $REPLY =~ ^[2]$ ]]; then
  echo -e "\n${GREEN}===== Deploying to production =====${NC}"
  vercel --prod
else
  echo -e "${RED}Invalid choice. Deployment cancelled.${NC}"
  exit 1
fi

if [ $? -ne 0 ]; then
  echo -e "${RED}ERROR: Deployment failed!${NC}"
  exit 1
else
  echo -e "${GREEN}✓ Deployment successful!${NC}"
fi

echo -e "\n${GREEN}===== Deployment process completed =====${NC}" 