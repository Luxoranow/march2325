#!/bin/bash
# Comprehensive deployment script for Render that handles different repository structures

set -e # Exit on error

echo "================= RENDER DEPLOYMENT SCRIPT ================="
echo "Current directory: $(pwd)"
echo "Directory structure:"
find . -maxdepth 2 -type d

# Function to try building in the current directory
try_build_here() {
  if [ -f "package.json" ]; then
    echo "Found package.json in current directory"
    echo "Node version: $(node -v)"
    echo "NPM version: $(npm -v)"
    echo "Installing dependencies..."
    npm install
    echo "Building application..."
    npm run build
    return 0
  else
    echo "No package.json in current directory"
    return 1
  fi
}

# Function to try building in a subdirectory
try_build_in_dir() {
  local dir=$1
  if [ -d "$dir" ] && [ -f "$dir/package.json" ]; then
    echo "Found package.json in $dir"
    echo "Changing to directory: $dir"
    cd "$dir"
    echo "Node version: $(node -v)"
    echo "NPM version: $(npm -v)"
    echo "Installing dependencies..."
    npm install
    echo "Building application..."
    npm run build
    return 0
  else
    echo "No valid package.json found in $dir"
    return 1
  fi
}

# Try building in the current directory first
if try_build_here; then
  echo "Build completed successfully in current directory!"
  exit 0
fi

# Try common subdirectory patterns
echo "Trying common subdirectory patterns..."
for dir in "app" "client" "frontend" "src" "web" "www" "."; do
  if try_build_in_dir "$dir"; then
    echo "Build completed successfully in $dir!"
    exit 0
  fi
done

# Last resort: search for package.json and try there
echo "Searching for package.json files..."
package_files=$(find . -name "package.json" -type f | sort)

if [ -n "$package_files" ]; then
  echo "Found the following package.json files:"
  echo "$package_files"
  
  # Try each directory containing a package.json
  for package_file in $package_files; do
    dir=$(dirname "$package_file")
    echo "Trying build in directory: $dir"
    if try_build_in_dir "$dir"; then
      echo "Build completed successfully in $dir!"
      exit 0
    fi
  done
fi

echo "ERROR: Could not find a valid package.json to build. Deployment failed."
exit 1 