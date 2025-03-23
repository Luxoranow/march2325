#!/bin/bash
# exit on error
set -e

echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

# Install dependencies 
npm install --production=false

# Build the app
npm run build

# We'll run next-sitemap directly to avoid issues with postbuild script
npx next-sitemap

echo "Build completed successfully!" 