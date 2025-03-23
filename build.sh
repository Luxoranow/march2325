#!/bin/bash
# Simple build script for Render

echo "===== DEBUG INFO ====="
echo "Current directory: $(pwd)"
echo "Directory contents:"
ls -la
echo "===== END DEBUG INFO ====="

# Try to find package.json
echo "Searching for package.json..."
PACKAGE_JSON_PATH=$(find . -name "package.json" -type f | head -n 1)

if [ -n "$PACKAGE_JSON_PATH" ]; then
  echo "Found package.json at: $PACKAGE_JSON_PATH"
  PACKAGE_DIR=$(dirname "$PACKAGE_JSON_PATH")
  echo "Changing to directory: $PACKAGE_DIR"
  cd "$PACKAGE_DIR"
  
  echo "Current directory after change: $(pwd)"
  echo "Directory contents:"
  ls -la
  
  echo "Node version: $(node -v)"
  echo "NPM version: $(npm -v)"
  
  echo "Installing dependencies..."
  npm install
  
  echo "Building application..."
  npm run build
  
  echo "Build completed successfully!"
  exit 0
else
  echo "ERROR: Could not find package.json anywhere!"
  echo "Searching in parent directory..."
  ls -la ..
  
  # Last resort - check if we're in a weird directory structure
  if [ -d "../repo" ]; then
    echo "Found ../repo directory, trying there..."
    cd ../repo
    if [ -f "package.json" ]; then
      echo "Found package.json in ../repo!"
      npm install && npm run build
      exit 0
    fi
  fi
  
  echo "CRITICAL ERROR: No package.json found. Cannot continue build."
  exit 1
fi 