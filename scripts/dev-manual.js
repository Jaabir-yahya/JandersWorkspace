#!/usr/bin/env node
/**
 * dev-manual.js
 * Orchestrates API and Admin with manual features only (no integrations)
 * Usage: npm run dev:manual
 */

const { spawn } = require('child_process');
const path = require('path');

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

function startService(name, command, args, cwd, color) {
  log(name, `Starting ${name}...`, color);

  const proc = spawn(command, args, {
    cwd,
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true,
    env: {
      ...process.env,
      // Disable integrations for manual mode
      MPESA_ENABLED: 'false',
      WHATSAPP_ENABLED: 'false',
      QUICKBOOKS_ENABLED: 'false',
      XERO_ENABLED: 'false',
      SHOPIFY_ENABLED: 'false',
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
${colors.cyan}${colors.bright}╔════════════════════════════════════════════════════════════╗
║          Project Bridge - Manual Development Mode          ║
║              (API + Admin, Integrations Disabled)          ║
╚════════════════════════════════════════════════════════════╝${colors.reset}
`);

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

// Health check
setTimeout(() => {
  log('SYSTEM', `${colors.yellow}Checking services...${colors.reset}`, 'cyan');

  fetch('http://localhost:3000/api/v1/health')
    .then((res) => res.json())
    .then((data) => {
      log('SYSTEM', `${colors.green}✓ API is healthy${colors.reset}`, 'cyan');
      log('SYSTEM', `${colors.green}  - API URL: http://localhost:3000/api/v1${colors.reset}`, 'cyan');
      log('SYSTEM', `${colors.green}  - Health:  http://localhost:3000/api/v1/health${colors.reset}`, 'cyan');
    })
    .catch(() => {
      log('SYSTEM', `${colors.yellow}⚠ API health check pending...${colors.reset}`, 'cyan');
    });

  log('SYSTEM', `${colors.green}✓ Admin should be available at: http://localhost:5173${colors.reset}`, 'cyan');
  log('SYSTEM', `${colors.dim}Press Ctrl+C to stop all services${colors.reset}`, 'cyan');
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
