// This script runs at the beginning of the Render build process
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('===== RENDER ENTRYPOINT SCRIPT =====');

// Get the current directory
const currentDir = process.cwd();
console.log('Current directory:', currentDir);

// Check if package.json exists in the current directory
const packagePath = path.join(currentDir, 'package.json');
if (fs.existsSync(packagePath)) {
  console.log('Found package.json in current directory');
  const packageJson = require(packagePath);
  console.log('Package name:', packageJson.name);
  console.log('Package version:', packageJson.version);
} else {
  console.log('No package.json found in current directory');
}

// Expected Render directory
const renderDir = '/opt/render/project/src';
if (currentDir !== renderDir) {
  console.log(`Current directory ${currentDir} is not the expected Render directory ${renderDir}`);
  
  // Create the Render directory if it doesn't exist
  if (!fs.existsSync(renderDir)) {
    console.log(`Creating directory: ${renderDir}`);
    try {
      fs.mkdirSync(renderDir, { recursive: true });
    } catch (error) {
      console.error('Error creating directory:', error.message);
    }
  }
  
  // Copy package.json to the Render directory
  if (fs.existsSync(packagePath)) {
    try {
      console.log(`Copying package.json to ${renderDir}`);
      fs.copyFileSync(packagePath, path.join(renderDir, 'package.json'));
      console.log('package.json copied successfully');
    } catch (error) {
      console.error('Error copying package.json:', error.message);
    }
  }
}

// Exit with success
console.log('===== RENDER ENTRYPOINT SCRIPT COMPLETED =====');
process.exit(0); 