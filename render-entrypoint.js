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
  
  // Copy the entire project to the Render directory
  console.log(`Copying entire project to ${renderDir}`);
  try {
    // Using shell commands for more reliable copying
    execSync(`cp -r ${currentDir}/* ${renderDir}/`);
    // Try to copy hidden files too
    execSync(`cp -r ${currentDir}/.* ${renderDir}/`).toString();
  } catch (error) {
    // Ignore errors from copying dot files (like .. and .)
    console.log('Note: Errors copying dot files are normal and can be ignored');
  }
  
  // Verify package.json was copied
  if (fs.existsSync(path.join(renderDir, 'package.json'))) {
    console.log('Successfully copied package.json to Render directory');
  } else {
    console.error('Failed to copy package.json to Render directory');
  }
  
  // Log directory contents
  console.log('Contents of Render directory:');
  try {
    const output = execSync(`ls -la ${renderDir}`).toString();
    console.log(output);
  } catch (error) {
    console.error('Error listing Render directory:', error.message);
  }
  
  // Change to the Render directory to continue build there
  try {
    process.chdir(renderDir);
    console.log(`Successfully changed to directory: ${process.cwd()}`);
  } catch (error) {
    console.error('Error changing directory:', error.message);
  }
}

// Exit with success
console.log('===== RENDER ENTRYPOINT SCRIPT COMPLETED =====');
process.exit(0); 