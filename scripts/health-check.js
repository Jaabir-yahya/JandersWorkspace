#!/usr/bin/env node
/**
 * Health Check Script
 * Verifies that all services are running correctly
 */

const API_URL = process.env.API_URL || 'http://localhost:3000';
const WEB_URL = process.env.WEB_URL || 'http://localhost:3001';

const checks = [];

async function checkAPI() {
  try {
    const response = await fetch(`${API_URL}/api/v1/entities`);
    if (response.ok) {
      console.log('✅ API is running on port 3000');
      return true;
    } else {
      console.log('❌ API returned error:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ API is not accessible:', error.message);
    return false;
  }
}

async function checkWeb() {
  try {
    const response = await fetch(WEB_URL);
    if (response.ok) {
      console.log('✅ Web is running on port 3001');
      return true;
    } else {
      console.log('❌ Web returned error:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Web is not accessible:', error.message);
    return false;
  }
}

async function main() {
  console.log('🔍 Running health checks...\n');
  
  const apiOk = await checkAPI();
  const webOk = await checkWeb();
  
  console.log('\n' + '='.repeat(40));
  
  if (apiOk && webOk) {
    console.log('✅ All services are healthy');
    process.exit(0);
  } else {
    console.log('❌ Some services are not running');
    console.log('\nTo start services:');
    console.log('  npm run dev');
    process.exit(1);
  }
}

main();
