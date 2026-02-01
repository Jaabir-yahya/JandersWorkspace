#!/usr/bin/env node
/**
 * Verify env files exist and run build + tests (no secrets printed).
 * Usage: node scripts/verify-env-and-build.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

function checkExists(name, filePath) {
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${name}`);
    return true;
  }
  console.warn(`⚠ ${name} not found`);
  return false;
}

function run(cmd, cwd = root) {
  execSync(cmd, { cwd, stdio: 'inherit' });
}

console.log('🔍 Checking env files...\n');

const ok =
  checkExists('Root .env', path.join(root, '.env')) &&
  checkExists('apps/api/.env', path.join(root, 'apps/api/.env')) &&
  checkExists('apps/bridge-manual/.env.local', path.join(root, 'apps/bridge-manual/.env.local'));

if (!ok) {
  console.log('\n❌ Create missing env files: cp .env.example .env && ./scripts/setup-env.sh');
  process.exit(1);
}

console.log('\n📦 Prisma generate...');
run('npx prisma generate', path.join(root, 'apps/api'));

console.log('\n📦 Build API...');
run('npm run build', path.join(root, 'apps/api'));

console.log('\n📦 Build bridge-manual...');
run('npm run build', path.join(root, 'apps/bridge-manual'));

console.log('\n🧪 API unit tests...');
run('npm test', path.join(root, 'apps/api'));

console.log('\n✅ Verify complete: env ok, builds ok, API tests passed.');
process.exit(0);
