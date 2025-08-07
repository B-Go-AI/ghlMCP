#!/usr/bin/env node

// Railway-specific startup script
// This ensures the app starts properly on Railway

console.log('🚀 Railway startup script starting...');
console.log('📋 Environment check:');
console.log(`  NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
console.log(`  PORT: ${process.env.PORT || '3000'}`);
console.log(`  GHL_API_KEY: ${process.env.GHL_API_KEY ? '✅ Set' : '❌ Missing'}`);

// Execute the built app directly
console.log('🚀 Starting Express server...');
import('./build/index.js');
