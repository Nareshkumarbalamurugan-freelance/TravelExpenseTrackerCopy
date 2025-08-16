#!/usr/bin/env node

// Simple production start script for Render.com
console.log('🚀 Starting Noveltech Travel Expense Tracker...');

const port = process.env.PORT || 10000;
console.log(`📦 Starting production server on port ${port}...`);

// Import and start the preview server
import { preview } from 'vite';

const server = await preview({
  preview: {
    port: parseInt(port),
    host: '0.0.0.0'
  }
});

console.log(`✅ Server started at http://0.0.0.0:${port}`);
