#!/bin/bash
# This script helps diagnose and fix path issues on Render

echo "============= DIRECTORY STRUCTURE DEBUGGING ============="
echo "Current directory: $(pwd)"
echo "User: $(whoami)"
echo "Home directory: $HOME"
echo "Render project directory: /opt/render/project"
echo ""

echo "============= SEARCHING FOR PACKAGE.JSON ============="
find /opt/render -name "package.json" -type f

echo "============= DIRECTORY CONTENTS ============="
echo "Current directory:"
ls -la

echo "============= PARENT DIRECTORY CONTENTS ============="
ls -la ..

echo "============= RENDER PROJECT DIRECTORY CONTENTS ============="
ls -la /opt/render/project || echo "Cannot access /opt/render/project"

# If package.json is not in the expected location, but we find it elsewhere,
# we could create a symlink or copy it
if [ ! -f "/opt/render/project/src/package.json" ]; then
  FOUND_PACKAGE=$(find /opt/render -name "package.json" -type f | head -1)
  if [ -n "$FOUND_PACKAGE" ]; then
    echo "============= PACKAGE.JSON FOUND ============="
    echo "Found package.json at: $FOUND_PACKAGE"
    PARENT_DIR=$(dirname "$FOUND_PACKAGE")
    echo "Parent directory: $PARENT_DIR"
    
    echo "============= ATTEMPTING TO FIX PATHS ============="
    # Create symbolic link to the directory containing package.json
    ln -sf "$PARENT_DIR" /opt/render/project/src
    echo "Created symbolic link from $PARENT_DIR to /opt/render/project/src"
    
    # Verify the link
    echo "Verifying link:"
    ls -la /opt/render/project/src/package.json || echo "Link verification failed"
  else
    echo "============= NO PACKAGE.JSON FOUND ============="
  fi
fi 