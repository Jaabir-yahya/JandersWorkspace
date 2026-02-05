#!/usr/bin/env node
/**
 * dev-tech.js
 * Orchestrates all services with integrations enabled
 * Usage: npm run dev:tech
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const root = path.resolve(__dirname, '..');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(service, message, color = 'reset') {
  const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
  const prefix = `${colors.dim}[${timestamp}]${colors.reset} ${colors[color]}[${service}]${colors.reset}`;
  console.log(`${prefix} ${message}`);
}

function checkEnvVars() {
  const required = [
    'MPESA_CONSUMER_KEY',
    'MPESA_CONSUMER_SECRET',
    'WHATSAPP_ACCESS_TOKEN',
    'WHATSAPP_PHONE_NUMBER_ID',
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.log(`${colors.yellow}⚠ Warning: Some integration credentials are missing:${colors.reset}`);
    missing.forEach((key) => console.log(`  - ${key}`));
    console.log(`${colors.dim}Services will start but integrations may fail.${colors.reset}\n`);
    return false;
  }

  return true;
}

function startService(name, command, args, cwd, color, envVars = {}) {
  log(name, `Starting ${name}...`, color);

  const proc = spawn(command, args, {
    cwd,
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true,
    env: {
      ...process.env,
      // Enable all integrations for tech mode
      MPESA_ENABLED: 'true',
      WHATSAPP_ENABLED: 'true',
      QUICKBOOKS_ENABLED: 'true',
      XERO_ENABLED: 'true',
      SHOPIFY_ENABLED: 'true',
      ...envVars,
    },
  });

  proc.stdout.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
    lines.forEach((line) => {
      if (line.trim()) {
        log(name, line, color);
      }
    });
  });

  proc.stderr.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
    lines.forEach((line) => {
      if (line.trim()) {
        log(name, `${colors.red}${line}${colors.reset}`, color);
      }
    });
  });

  proc.on('close', (code) => {
    log(name, `${colors.red}Process exited with code ${code}${colors.reset}`, color);
  });

  proc.on('error', (err) => {
    log(name, `${colors.red}Failed to start: ${err.message}${colors.reset}`, color);
  });

  return proc;
}

console.log(`
${colors.magenta}${colors.bright}╔════════════════════════════════════════════════════════════╗
║        Project Bridge - Tech Development Mode              ║
║         (All Services + Integrations Enabled)              ║
╚════════════════════════════════════════════════════════════╝${colors.reset}
`);

// Check environment
const envOk = checkEnvVars();
if (envOk) {
  log('SYSTEM', `${colors.green}✓ All integration credentials found${colors.reset}`, 'cyan');
}

// Load .env files if they exist
const envFiles = [
  path.join(root, '.env'),
  path.join(root, 'apps/api/.env'),
];

envFiles.forEach((envFile) => {
  if (fs.existsSync(envFile)) {
    log('SYSTEM', `Loading ${path.relative(root, envFile)}`, 'cyan');
    require('dotenv').config({ path: envFile });
  }
});

// Start API server
const apiProcess = startService(
  'API',
  'npm',
  ['run', 'dev'],
  path.join(root, 'apps/api'),
  'green'
);

// Start Admin frontend
const adminProcess = startService(
  'ADMIN',
  'npm',
  ['run', 'dev'],
  path.join(root, 'apps/bridge-admin'),
  'blue'
);

// Health checks and service info
setTimeout(() => {
  log('SYSTEM', `${colors.yellow}Checking services...${colors.reset}`, 'cyan');

  fetch('http://localhost:3000/api/v1/health')
    .then((res) => res.json())
    .then((data) => {
      log('SYSTEM', `${colors.green}✓ API is healthy${colors.reset}`, 'cyan');
      log('SYSTEM', `${colors.green}  - API URL: http://localhost:3000/api/v1${colors.reset}`, 'cyan');
      log('SYSTEM', `${colors.green}  - Health:  http://localhost:3000/api/v1/health${colors.reset}`, 'cyan');
      log('SYSTEM', `${colors.green}  - Docs:    http://localhost:3000/api/v1/docs${colors.reset}`, 'cyan');
    })
    .catch(() => {
      log('SYSTEM', `${colors.yellow}⚠ API health check pending...${colors.reset}`, 'cyan');
    });

  log('SYSTEM', `${colors.green}✓ Admin should be available at: http://localhost:5173${colors.reset}`, 'cyan');

  // Integration endpoints
  console.log(`\n${colors.bright}Integration Endpoints:${colors.reset}`);
  console.log(`  ${colors.cyan}M-Pesa:${colors.reset}  http://localhost:3000/api/v1/integrations/mpesa`);
  console.log(`  ${colors.cyan}WhatsApp:${colors.reset} http://localhost:3000/api/v1/integrations/whatsapp`);
  console.log(`  ${colors.cyan}QuickBooks:${colors.reset} http://localhost:3000/api/v1/integrations/quickbooks`);
  console.log(`  ${colors.cyan}Xero:${colors.reset} http://localhost:3000/api/v1/integrations/xero`);
  console.log(`  ${colors.cyan}Shopify:${colors.reset} http://localhost:3000/api/v1/integrations/shopify`);

  console.log(`\n${colors.dim}Press Ctrl+C to stop all services${colors.reset}`);
}, 5000);

// Graceful shutdown
function shutdown() {
  console.log(`\n${colors.yellow}Shutting down services...${colors.reset}`);
  apiProcess.kill('SIGTERM');
  adminProcess.kill('SIGTERM');
  setTimeout(() => {
    apiProcess.kill('SIGKILL');
    adminProcess.kill('SIGKILL');
    process.exit(0);
  }, 3000);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
