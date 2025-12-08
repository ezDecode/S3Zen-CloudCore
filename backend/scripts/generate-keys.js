#!/usr/bin/env node

const crypto = require('crypto');

console.log('\n==============================================');
console.log('🔑 CloudCore Environment Keys Generator');
console.log('==============================================\n');

console.log('📋 Copy these values to your .env file:\n');

console.log('# API Key (for server-to-server authentication)');
const apiKey = crypto.randomBytes(32).toString('hex');
console.log(`API_KEY=${apiKey}\n`);

console.log('# Encryption Key (for AES-256-GCM credential encryption)');
const encryptionKey = crypto.randomBytes(32).toString('hex');
console.log(`ENCRYPTION_KEY=${encryptionKey}\n`);

console.log('==============================================');
console.log('⚠️  SECURITY REMINDERS:');
console.log('==============================================');
console.log('1. Never commit .env files to version control');
console.log('2. Store keys in a secure password manager');
console.log('3. Use different keys for dev/staging/production');
console.log('4. If you lose ENCRYPTION_KEY, encrypted data is lost');
console.log('5. Rotate keys periodically\n');

console.log('==============================================');
console.log('📖 GET SUPABASE KEYS:');
console.log('==============================================');
console.log('1. Go to: https://supabase.com/dashboard');
console.log('2. Select your project');
console.log('3. Go to Settings → API');
console.log('4. Copy:');
console.log('   - Project URL → SUPABASE_URL');
console.log('   - anon/public key → SUPABASE_ANON_KEY');
console.log('   - service_role key → SUPABASE_SERVICE_ROLE_KEY');
console.log('==============================================\n');
