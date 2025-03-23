// Simple pre-build script for Render deployment
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('===== PREBUILD SCRIPT STARTED =====');
console.log('Working directory:', process.cwd());

// Verify that we're in the correct directory
try {
  const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
  console.log('Found package.json:', packageJson.name, packageJson.version);
  
  // Check if we have the correct node version
  console.log('Node version:', process.version);
  console.log('Required node version:', packageJson.engines?.node || 'Not specified');
  
  // Check if .npmrc exists, create if needed
  if (!fs.existsSync('./.npmrc')) {
    console.log('Creating .npmrc file');
    fs.writeFileSync('./.npmrc', 'legacy-peer-deps=true\nstrict-peer-dependencies=false\n');
  }
  
  // List all available environment variables (excluding secrets)
  console.log('\n===== ENVIRONMENT VARIABLES =====');
  const envVars = Object.keys(process.env)
    .filter(key => !key.includes('KEY') && !key.includes('SECRET') && !key.includes('TOKEN'))
    .reduce((obj, key) => {
      obj[key] = process.env[key];
      return obj;
    }, {});
  
  console.log(JSON.stringify(envVars, null, 2));
  
  // Check if the public directory exists
  if (!fs.existsSync('./public')) {
    console.log('WARNING: public directory does not exist, creating it');
    fs.mkdirSync('./public', { recursive: true });
  }
  
  // Check next.config.js
  if (fs.existsSync('./next.config.js')) {
    console.log('Found next.config.js');
  } else {
    console.log('WARNING: next.config.js does not exist!');
  }
  
  console.log('\n===== PREBUILD CHECKS COMPLETED SUCCESSFULLY =====');
} catch (error) {
  console.error('PREBUILD ERROR:', error.message);
  process.exit(1);
} 