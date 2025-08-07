#!/usr/bin/env node

// Railway-specific startup script
// This ensures the app starts properly on Railway

console.log('🚀 Railway startup script starting...');
console.log('📋 Environment check:');
console.log(`  NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
console.log(`  PORT: ${process.env.PORT || '3000'}`);
console.log(`  GHL_API_KEY: ${process.env.GHL_API_KEY ? '✅ Set' : '❌ Missing'}`);

// Import and start the app
import('./build/index.js').then(() => {
  console.log('✅ Railway startup script completed');
}).catch((error) => {
  console.error('❌ Railway startup script failed:', error);
  process.exit(1);
});
