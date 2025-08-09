#!/usr/bin/env node

// Production start script for Render.com
const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Travel Expense Tracker in production mode...');

// For production, we want to serve the built files
const isProduction = process.env.NODE_ENV === 'production';
const port = process.env.PORT || 10000;

if (isProduction) {
  console.log('📦 Running production build server...');
  
  // Use vite preview to serve the built dist folder
  const viteProcess = spawn('npx', ['vite', 'preview', '--host', '0.0.0.0', '--port', port], {
    stdio: 'inherit',
    cwd: process.cwd()
  });

  viteProcess.on('error', (error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });

  viteProcess.on('close', (code) => {
    console.log(`Server process exited with code ${code}`);
    process.exit(code);
  });
} else {
  console.log('🔧 Running development server...');
  
  // Use vite dev for development
  const viteProcess = spawn('npx', ['vite', '--host', '0.0.0.0', '--port', port], {
    stdio: 'inherit',
    cwd: process.cwd()
  });

  viteProcess.on('error', (error) => {
    console.error('Failed to start dev server:', error);
    process.exit(1);
  });

  viteProcess.on('close', (code) => {
    console.log(`Dev server process exited with code ${code}`);
    process.exit(code);
  });
}

// Handle process termination
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully...');
  process.exit(0);
});
