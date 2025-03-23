#!/bin/bash
# Script to handle Render's expected directory structure

set -e  # Exit on error

echo "===== RENDER BUILD RUN SCRIPT ====="

# If we're not in the right directory, copy everything there
if [ "$(pwd)" != "/opt/render/project/src" ]; then
  echo "Current directory: $(pwd)"
  echo "Expected directory: /opt/render/project/src"
  echo "Creating directory structure..."
  
  # Create the target directory if it doesn't exist
  mkdir -p /opt/render/project/src
  
  # Copy all files to the expected location
  echo "Copying files to /opt/render/project/src"
  cp -r * /opt/render/project/src/ || true
  cp -r .* /opt/render/project/src/ 2>/dev/null || true
  
  # Change to the expected directory
  echo "Changing to /opt/render/project/src"
  cd /opt/render/project/src
fi

echo "Current directory after setup: $(pwd)"
echo "Contents of directory:"
ls -la

# Check if package.json exists
if [ -f "package.json" ]; then
  echo "Found package.json"
  
  # Install dependencies
  echo "Installing dependencies..."
  npm install --no-optional
  
  # Build the application
  echo "Building application..."
  npm run build
  
  echo "Build completed successfully!"
else
  echo "ERROR: package.json not found in $(pwd)"
  echo "Directory contents:"
  ls -la
  exit 1
fi 