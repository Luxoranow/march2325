#!/usr/bin/env bash
# This is a build script specifically for Render deployment

# Exit on error
set -e

# Print current directory and list files for debugging
echo "Current directory: $(pwd)"
echo "Directory contents:"
ls -la

# Check if package.json exists
if [ ! -f "package.json" ]; then
  echo "ERROR: package.json not found in current directory!"
  echo "Searching for package.json in parent directories..."
  find /opt/render -name "package.json" -type f
  exit 1
fi

# Print Node and NPM versions for debugging
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

# Install dependencies (using regular install instead of ci)
echo "Installing dependencies..."
npm install

# Build the application
echo "Building the application..."
npm run build

# Generate sitemap if the script exists
if grep -q "\"render-build\"" package.json; then
  echo "Running render-build script..."
  npm run render-build
else
  echo "Render-build script not found, running next-sitemap directly..."
  npx next-sitemap || echo "Sitemap generation skipped"
fi

echo "Build completed successfully!" 