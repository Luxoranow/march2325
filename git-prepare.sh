#!/bin/bash
# Git preparation script for Luxora Unified
# This script helps prepare the codebase for pushing to GitHub

# Color codes for better readability
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}===== Luxora Unified Git Preparation =====${NC}"

# Check if .env.local is being tracked (it shouldn't be)
if git ls-files --error-unmatch .env.local &> /dev/null; then
  echo -e "${YELLOW}WARNING: .env.local is currently tracked by git.${NC}"
  echo "Would you like to untrack it? This will keep the file but remove it from git tracking. (y/n)"
  read -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    git rm --cached .env.local
    echo -e "${GREEN}Untracked .env.local from git.${NC}"
  fi
fi

# Make sure .env.local.example is tracked (it should be)
if ! git ls-files --error-unmatch .env.local.example &> /dev/null 2>&1; then
  echo -e "${BLUE}Adding .env.local.example to git...${NC}"
  git add .env.local.example
fi

# Add all documentation files
echo -e "${BLUE}Adding documentation files...${NC}"
git add README.md
git add CARD_SAVING_GUIDE.md
git add WALLET_PASS_SETUP.md

# Add all SQL files
echo -e "${BLUE}Adding SQL migration files...${NC}"
git add setup_supabase.sql
git add analytics_schema.sql
git add add_is_template_column.sql
git add stored_procedures.sql

# Add all important configuration files
echo -e "${BLUE}Adding configuration files...${NC}"
git add package.json
git add package-lock.json
git add vercel.json
git add .node-version
git add .npmrc
git add next.config.js
git add tsconfig.json
git add middleware.ts
git add deploy.sh
git add git-prepare.sh

# Add code directories
echo -e "${BLUE}Adding app directory...${NC}"
git add app/

echo -e "${BLUE}Adding components directory...${NC}"
git add components/

echo -e "${BLUE}Adding lib directory...${NC}"
git add lib/

echo -e "${BLUE}Adding migrations directory...${NC}"
git add migrations/

echo -e "${BLUE}Adding docs directory...${NC}"
git add docs/

# Ignore build artifacts
echo -e "${BLUE}Ignoring build files...${NC}"
git reset -- .next/

# Show git status
echo -e "\n${GREEN}===== Current Git Status =====${NC}"
git status

# Prompt for commit
echo -e "\n${GREEN}===== Commit Changes =====${NC}"
echo "Would you like to commit these changes now? (y/n)"
read -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "Enter a commit message:"
  read -r commit_message
  
  if [ -z "$commit_message" ]; then
    commit_message="Update Luxora Unified with latest features and fixes"
  fi
  
  git commit -m "$commit_message"
  
  echo -e "\n${GREEN}===== Push to GitHub =====${NC}"
  echo "Would you like to push these changes to GitHub now? (y/n)"
  read -n 1 -r
  echo
  
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Which branch would you like to push to? (default: main)"
    read -r branch_name
    
    if [ -z "$branch_name" ]; then
      branch_name="main"
    fi
    
    git push origin "$branch_name"
    
    if [ $? -eq 0 ]; then
      echo -e "${GREEN}Successfully pushed to GitHub!${NC}"
    else
      echo -e "${RED}Failed to push to GitHub.${NC}"
    fi
  fi
else
  echo "Changes have been staged but not committed."
  echo "Use 'git commit -m \"Your message\"' when you're ready to commit."
fi

echo -e "\n${GREEN}===== Git preparation completed =====${NC}" 