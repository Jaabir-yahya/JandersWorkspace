#!/usr/bin/env node
/**
 * tunnel-manager.js
 * Manages ngrok tunnels for webhooks
 * Usage: npm run tunnel:mpesa | npm run tunnel:whatsapp | node scripts/tunnel-manager.js <service>
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const http = require('http');

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

function checkNgrokAuth() {
  const ngrokConfigPath = path.join(require('os').homedir(), '.ngrok2', 'ngrok.yml');
  const ngrokConfigPathNew = path.join(require('os').homedir(), '.config', 'ngrok', 'ngrok.yml');

  if (!fs.existsSync(ngrokConfigPath) && !fs.existsSync(ngrokConfigPathNew)) {
    if (!process.env.NGROK_AUTH_TOKEN) {
      log('NGROK', '❌ ngrok not configured', 'red');
      log('NGROK', 'Please run: ngrok config add-authtoken <your-token>', 'yellow');
      log('NGROK', 'Get your token from: https://dashboard.ngrok.com/get-started/your-authtoken', 'dim');
      return false;
    }
  }

  return true;
}

async function getNgrokTunnels() {
  return new Promise((resolve, reject) => {
    const req = http.get('http://127.0.0.1:4040/api/tunnels', (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const tunnels = JSON.parse(data);
          resolve(tunnels.tunnels || []);
        } catch (e) {
          resolve([]);
        }
      });
    });

    req.on('error', () => resolve([]));
    req.setTimeout(2000, () => {
      req.destroy();
      resolve([]);
    });
  });
}

function startNgrok(port, subdomain = null) {
  return new Promise((resolve, reject) => {
    const args = ['http', port.toString()];

    if (subdomain) {
      args.push('--subdomain', subdomain);
    }

    if (process.env.NGROK_REGION) {
      args.push('--region', process.env.NGROK_REGION);
    }

    log('NGROK', `Starting tunnel on port ${port}...`, 'cyan');

    const ngrok = spawn('ngrok', args, {
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let url = null;

    ngrok.stdout.on('data', (data) => {
      const output = data.toString();
      const match = output.match(/https:\/\/[^\s]+\.ngrok\.io/);
      if (match && !url) {
        url = match[0];
        resolve({ process: ngrok, url });
      }
    });

    ngrok.stderr.on('data', (data) => {
      const output = data.toString();
      log('NGROK', output.trim(), 'yellow');
    });

    ngrok.on('error', (err) => {
      reject(new Error(`Failed to start ngrok: ${err.message}`));
    });

    // Timeout if URL not found within 10 seconds
    setTimeout(() => {
      if (!url) {
        reject(new Error('Timeout waiting for ngrok URL'));
      }
    }, 10000);
  });
}

async function updateEnvFile(service, url) {
  const root = path.resolve(__dirname, '..');
  const envPath = path.join(root, '.env');
  const apiEnvPath = path.join(root, 'apps/api/.env');

  const envVars = {
    mpesa: {
      MPESA_CALLBACK_URL: `${url}/api/v1/integrations/mpesa/webhook`,
      MPESA_STK_CALLBACK_URL: `${url}/api/v1/integrations/mpesa/stk-callback`,
    },
    whatsapp: {
      WHATSAPP_WEBHOOK_URL: `${url}/api/v1/integrations/whatsapp/webhook`,
    },
    all: {
      WEBHOOK_BASE_URL: url,
      MPESA_CALLBACK_URL: `${url}/api/v1/integrations/mpesa/webhook`,
      MPESA_STK_CALLBACK_URL: `${url}/api/v1/integrations/mpesa/stk-callback`,
      WHATSAPP_WEBHOOK_URL: `${url}/api/v1/integrations/whatsapp/webhook`,
      QUICKBOOKS_REDIRECT_URI: `${url}/api/v1/integrations/quickbooks/auth/callback`,
      XERO_REDIRECT_URI: `${url}/api/v1/integrations/xero/auth/callback`,
      SHOPIFY_REDIRECT_URI: `${url}/api/v1/integrations/shopify/auth/callback`,
    },
  };

  const updates = envVars[service] || envVars.all;

  // Update root .env
  if (fs.existsSync(envPath)) {
    let content = fs.readFileSync(envPath, 'utf8');
    Object.entries(updates).forEach(([key, value]) => {
      const regex = new RegExp(`^${key}=.*$`, 'm');
      if (regex.test(content)) {
        content = content.replace(regex, `${key}=${value}`);
      } else {
        content += `\n${key}=${value}`;
      }
    });
    fs.writeFileSync(envPath, content);
    log('ENV', `Updated ${path.relative(root, envPath)}`, 'green');
  }

  // Update apps/api/.env
  if (fs.existsSync(apiEnvPath)) {
    let content = fs.readFileSync(apiEnvPath, 'utf8');
    Object.entries(updates).forEach(([key, value]) => {
      const regex = new RegExp(`^${key}=.*$`, 'm');
      if (regex.test(content)) {
        content = content.replace(regex, `${key}=${value}`);
      } else {
        content += `\n${key}=${value}`;
      }
    });
    fs.writeFileSync(apiEnvPath, content);
    log('ENV', `Updated ${path.relative(root, apiEnvPath)}`, 'green');
  }
}

function printWebhookUrls(url) {
  console.log(`\n${colors.bright}Webhook URLs:${colors.reset}`);
  console.log(`  ${colors.cyan}M-Pesa Webhook:${colors.reset}      ${url}/api/v1/integrations/mpesa/webhook`);
  console.log(`  ${colors.cyan}M-Pesa STK Callback:${colors.reset} ${url}/api/v1/integrations/mpesa/stk-callback`);
  console.log(`  ${colors.cyan}WhatsApp Webhook:${colors.reset}    ${url}/api/v1/integrations/whatsapp/webhook`);
  console.log(`  ${colors.cyan}QuickBooks Callback:${colors.reset} ${url}/api/v1/integrations/quickbooks/auth/callback`);
  console.log(`  ${colors.cyan}Xero Callback:${colors.reset}       ${url}/api/v1/integrations/xero/auth/callback`);
  console.log(`  ${colors.cyan}Shopify Callback:${colors.reset}    ${url}/api/v1/integrations/shopify/auth/callback`);
}

async function runTunnel(service) {
  console.log(`
${colors.bright}╔════════════════════════════════════════════════════════════╗
║              ngrok Tunnel Manager                          ║
╚════════════════════════════════════════════════════════════╝${colors.reset}
`);

  // Check ngrok auth
  if (!checkNgrokAuth()) {
    process.exit(1);
  }

  // Check if ngrok is already running
  const existingTunnels = await getNgrokTunnels();
  if (existingTunnels.length > 0) {
    log('NGROK', 'Existing tunnels found:', 'yellow');
    existingTunnels.forEach((tunnel) => {
      log('NGROK', `  ${tunnel.public_url} -> ${tunnel.config.addr}`, 'dim');
    });
    console.log(`\n${colors.yellow}Please stop existing ngrok instances first.${colors.reset}`);
    process.exit(1);
  }

  // Determine port and configuration based on service
  const port = process.env.API_PORT || 3000;
  const subdomain = process.env.NGROK_SUBDOMAIN || null;

  log('NGROK', `Starting tunnel for ${service} service...`, 'cyan');
  log('NGROK', `Local API port: ${port}`, 'dim');

  try {
    const { process: ngrokProcess, url } = await startNgrok(port, subdomain);

    log('NGROK', `✅ Tunnel established!`, 'green');
    log('NGROK', `Public URL: ${url}`, 'green');

    // Update environment files
    await updateEnvFile(service, url);

    // Print webhook URLs
    printWebhookUrls(url);

    // Service-specific instructions
    console.log(`\n${colors.bright}Next Steps:${colors.reset}`);
    if (service === 'mpesa' || service === 'all') {
      console.log(`  ${colors.yellow}M-Pesa:${colors.reset}`);
      console.log(`    1. Go to https://developer.safaricom.co.ke/`);
      console.log(`    2. Navigate to your app settings`);
      console.log(`    3. Update callback URLs with the webhook URLs above`);
      console.log(`    4. Save changes`);
    }
    if (service === 'whatsapp' || service === 'all') {
      console.log(`  ${colors.yellow}WhatsApp:${colors.reset}`);
      console.log(`    1. Go to https://developers.facebook.com/apps/`);
      console.log(`    2. Select your app > WhatsApp > Configuration`);
      console.log(`    3. Set webhook URL to: ${url}/api/v1/integrations/whatsapp/webhook`);
      console.log(`    4. Set verify token from your .env file`);
      console.log(`    5. Subscribe to messages and message_deliveries events`);
    }

    console.log(`\n${colors.dim}Press Ctrl+C to stop the tunnel${colors.reset}\n`);

    // Graceful shutdown
    process.on('SIGINT', () => {
      log('NGROK', 'Shutting down tunnel...', 'yellow');
      ngrokProcess.kill('SIGTERM');
      setTimeout(() => {
        ngrokProcess.kill('SIGKILL');
        process.exit(0);
      }, 2000);
    });

    process.on('SIGTERM', () => {
      ngrokProcess.kill('SIGTERM');
      process.exit(0);
    });

    // Keep process alive
    ngrokProcess.on('close', (code) => {
      log('NGROK', `Tunnel closed with code ${code}`, 'yellow');
      process.exit(code);
    });
  } catch (error) {
    log('NGROK', `❌ ${error.message}`, 'red');
    process.exit(1);
  }
}

// Parse command line arguments
const service = process.argv[2] || 'all';
const validServices = ['mpesa', 'whatsapp', 'all'];

if (!validServices.includes(service)) {
  console.error(`\n${colors.red}Invalid service: ${service}${colors.reset}`);
  console.error(`Valid options: ${validServices.join(', ')}`);
  process.exit(1);
}

runTunnel(service);
