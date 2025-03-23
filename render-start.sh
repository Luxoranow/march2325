#!/bin/bash
# Script to start the application on Render

set -e  # Exit on error

echo "===== RENDER START SCRIPT ====="

# If we're not in the right directory, go there
if [ "$(pwd)" != "/opt/render/project/src" ]; then
  echo "Current directory: $(pwd)"
  echo "Expected directory: /opt/render/project/src"
  echo "Changing to /opt/render/project/src"
  cd /opt/render/project/src
fi

echo "Current directory: $(pwd)"
echo "Contents of directory:"
ls -la

# Check if package.json exists
if [ -f "package.json" ]; then
  echo "Found package.json"
  
  # Start the application
  echo "Starting application..."
  npm start
else
  echo "ERROR: package.json not found in $(pwd)"
  echo "Directory contents:"
  ls -la
  exit 1
fi 