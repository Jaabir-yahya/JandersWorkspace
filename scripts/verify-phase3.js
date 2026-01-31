#!/usr/bin/env node

/**
 * Phase 3 Verification Script
 * Validates that all Phase 3 requirements are met before locking
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CHECKS = {
  passed: [],
  failed: [],
  warnings: [],
};

function check(name, condition, message) {
  if (condition) {
    CHECKS.passed.push(name);
    console.log(`✓ ${name}`);
  } else {
    CHECKS.failed.push({ name, message });
    console.log(`✗ ${name}: ${message}`);
  }
}

function warn(name, message) {
  CHECKS.warnings.push({ name, message });
  console.log(`⚠ ${name}: ${message}`);
}

function fileExists(filePath) {
  return fs.existsSync(path.join(process.cwd(), filePath));
}

function dirExists(dirPath) {
  return fs.existsSync(path.join(process.cwd(), dirPath));
}

console.log('🔍 Phase 3 Verification\n');
console.log('=' .repeat(50));

// 1. Core Files Check
console.log('\n📁 Core Files:');
check('package.json exists', fileExists('package.json'), 'Missing root package.json');
check('README.md exists', fileExists('README.md'), 'Missing README.md');
check('CHANGELOG.md exists', fileExists('CHANGELOG.md'), 'Missing CHANGELOG.md');
check('CONTRIBUTING.md exists', fileExists('CONTRIBUTING.md'), 'Missing CONTRIBUTING.md');
check('.nvmrc exists', fileExists('.nvmrc'), 'Missing .nvmrc');
check('.editorconfig exists', fileExists('.editorconfig'), 'Missing .editorconfig');

// 2. API Structure Check
console.log('\n🔧 API Structure:');
check('API directory exists', dirExists('api'), 'Missing api/ directory');
check('API package.json exists', fileExists('api/package.json'), 'Missing api/package.json');
check('API src exists', dirExists('api/src'), 'Missing api/src/ directory');
check('Transactions module exists', dirExists('api/src/transactions'), 'Missing transactions module');
check('Dashboard module exists', dirExists('api/src/dashboard'), 'Missing dashboard module');
check('Payment records module exists', dirExists('api/src/payment-records'), 'Missing payment-records module');
check('Attachments module exists', dirExists('api/src/attachments'), 'Missing attachments module');

// 3. Web Structure Check
console.log('\n🌐 Web Structure:');
check('Web directory exists', dirExists('web/my-app'), 'Missing web/my-app/ directory');
check('Web package.json exists', fileExists('web/my-app/package.json'), 'Missing web/my-app/package.json');
check('Web app directory exists', dirExists('web/my-app/app'), 'Missing web/my-app/app/ directory');
check('Dashboard page exists', fileExists('web/my-app/app/dashboard/page.tsx'), 'Missing dashboard page');

// 4. Database Check
console.log('\n🗄️  Database:');
check('DB migrations directory exists', dirExists('db/migrations'), 'Missing db/migrations/');
check('Supabase migrations exist', dirExists('supabase/migrations'), 'Missing supabase/migrations/');

// 5. Documentation Check
console.log('\n📚 Documentation:');
check('docs/ directory exists', dirExists('docs'), 'Missing docs/ directory');
check('API_CONTRACT.md exists', fileExists('docs/API_CONTRACT.md'), 'Missing API_CONTRACT.md');
check('PRD.md exists', fileExists('docs/PRD.md'), 'Missing PRD.md');

// 6. Scripts Check
console.log('\n🔨 Scripts:');
check('scripts/ directory exists', dirExists('scripts'), 'Missing scripts/ directory');
check('health-check.js exists', fileExists('scripts/health-check.js'), 'Missing health-check.js');
check('setup-env.sh exists', fileExists('scripts/setup-env.sh'), 'Missing setup-env.sh');

// 7. Tests Check
console.log('\n🧪 Tests:');
check('tests/ directory exists', dirExists('tests'), 'Missing tests/ directory');
check('Integration tests exist', dirExists('tests/integration'), 'Missing tests/integration/');
check('jest.config.cjs exists', fileExists('jest.config.cjs'), 'Missing jest.config.cjs');

// 8. Environment Templates
console.log('\n🔐 Environment:');
check('API .env.example exists', fileExists('api/.env.example'), 'Missing api/.env.example');
check('Web .env.example exists', fileExists('web/my-app/.env.example'), 'Missing web/my-app/.env.example');

// 9. Git Check
console.log('\n📦 Git:');
try {
  const gitStatus = execSync('git status --porcelain', { encoding: 'utf-8', stdio: 'pipe' });
  const hasUncommitted = gitStatus.trim().length > 0;
  check('Git initialized', true, '');
  if (hasUncommitted) {
    warn('Uncommitted changes', 'There are uncommitted changes in the working directory');
  } else {
    check('Working directory clean', true, '');
  }
} catch (e) {
  warn('Git check', 'Unable to verify git status');
}

// 10. Package.json Scripts Check
console.log('\n⚡ Scripts:');
try {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
  check('dev script exists', !!pkg.scripts?.dev, 'Missing dev script');
  check('build script exists', !!pkg.scripts?.build, 'Missing build script');
  check('test script exists', !!pkg.scripts?.test, 'Missing test script');
  check('health-check script exists', !!pkg.scripts?.['health-check'], 'Missing health-check script');
} catch (e) {
  check('package.json valid', false, 'Unable to parse package.json');
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('\n📊 Summary:');
console.log(`  ✓ Passed: ${CHECKS.passed.length}`);
console.log(`  ✗ Failed: ${CHECKS.failed.length}`);
console.log(`  ⚠ Warnings: ${CHECKS.warnings.length}`);

if (CHECKS.failed.length === 0) {
  console.log('\n🎉 All checks passed! Phase 3 is ready to lock.');
  process.exit(0);
} else {
  console.log('\n❌ Some checks failed. Please fix before locking Phase 3.');
  CHECKS.failed.forEach(({ name, message }) => {
    console.log(`   - ${name}: ${message}`);
  });
  process.exit(1);
}
