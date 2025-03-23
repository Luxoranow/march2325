// Simple test script to diagnose Render deployment issues
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('===== DIRECTORY STRUCTURE =====');
console.log('Current directory:', process.cwd());

try {
  const directoryContents = fs.readdirSync('.');
  console.log('Directory contents:', directoryContents);
} catch (err) {
  console.error('Error reading directory:', err.message);
}

console.log('\n===== SEARCHING FOR PACKAGE.JSON =====');
try {
  const result = execSync('find / -name "package.json" 2>/dev/null || echo "No package.json found"').toString();
  console.log('Search results:');
  console.log(result);
} catch (err) {
  console.error('Error searching for package.json:', err.message);
}

console.log('\n===== ENVIRONMENT VARIABLES =====');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PATH:', process.env.PATH);
console.log('HOME:', process.env.HOME);

console.log('\n===== NODE VERSION =====');
console.log('Node version:', process.version);
console.log('NPM version:', execSync('npm --version').toString().trim());

// Try to read package.json if it exists in current directory
try {
  const packageJson = require('./package.json');
  console.log('\n===== PACKAGE.JSON CONTENT =====');
  console.log('Name:', packageJson.name);
  console.log('Version:', packageJson.version);
  console.log('Scripts:', Object.keys(packageJson.scripts || {}));
} catch (err) {
  console.error('\nError reading package.json:', err.message);
} 