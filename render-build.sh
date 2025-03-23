#!/usr/bin/env bash
# This is a build script specifically for Render deployment

# Exit on error
set -e

# Print Node and NPM versions for debugging
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

# Install dependencies (using regular install instead of ci)
npm install

# Use our custom render-build script that combines build and sitemap generation
npm run render-build

echo "Build completed successfully!" 