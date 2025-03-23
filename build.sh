#!/bin/sh
# Simple build script for Render

# Display current directory and its contents
echo "Current directory: $(pwd)"
ls -la

# Create the Render expected directory if needed
mkdir -p /opt/render/project/src

# Copy all files to the expected location
echo "Copying files to Render's expected location..."
cp -r . /opt/render/project/src/

# Go to the expected location
cd /opt/render/project/src

# Verify we're in the right place with package.json
echo "Build directory: $(pwd)"
ls -la

# Install and build
npm install
npm run build 