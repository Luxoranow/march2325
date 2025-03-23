#!/bin/sh
# Simple start script for Render

# Go to the Render expected location
cd /opt/render/project/src || exit 1

# Verify we're in the right place
echo "Starting from directory: $(pwd)"
ls -la

# Start the application
npm start 