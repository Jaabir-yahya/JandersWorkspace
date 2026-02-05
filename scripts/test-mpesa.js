#!/usr/bin/env node
/**
 * test-mpesa.js
 * M-Pesa sandbox testing helper
 * Usage: npm run test:mpesa [-- --env=sandbox --phone=254712345678 --amount=100]
 */

const { execSync } = require('child_process');
const path = require('path');

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

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    env: 'sandbox',
    phone: '254712345678',
    amount: 100,
    accountRef: 'TEST001',
    description: 'Test payment',
  };

  args.forEach((arg) => {
    if (arg.startsWith('--env=')) {
      options.env = arg.split('=')[1];
    } else if (arg.startsWith('--phone=')) {
      options.phone = arg.split('=')[1];
    } else if (arg.startsWith('--amount=')) {
      options.amount = parseInt(arg.split('=')[1], 10);
    } else if (arg.startsWith('--account-ref=')) {
      options.accountRef = arg.split('=')[1];
    } else if (arg.startsWith('--description=')) {
      options.description = arg.split('=')[1];
    }
  });

  return options;
}

function checkCredentials() {
  const required = ['MPESA_CONSUMER_KEY', 'MPESA_CONSUMER_SECRET', 'MPESA_PASSKEY'];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    log('\n❌ Missing required environment variables:', 'red');
    missing.forEach((key) => log(`   - ${key}`, 'red'));
    log('\nPlease set these in your .env file or environment.', 'yellow');
    return false;
  }

  return true;
}

async function testSTKPush(options) {
  log('\n📱 Testing M-Pesa STK Push...', 'cyan');
  log(`   Environment: ${options.env}`, 'dim');
  log(`   Phone: ${options.phone}`, 'dim');
  log(`   Amount: KES ${options.amount}`, 'dim');

  const baseUrl = process.env.API_URL || 'http://localhost:3000';

  try {
    const response = await fetch(`${baseUrl}/api/v1/integrations/mpesa/stk-push`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.TEST_TOKEN || 'test-token'}`,
      },
      body: JSON.stringify({
        phoneNumber: options.phone,
        amount: options.amount,
        accountReference: options.accountRef,
        transactionDescription: options.description,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      log('✅ STK Push initiated successfully!', 'green');
      log(`   Checkout Request ID: ${data.checkoutRequestId}`, 'dim');
      log(`   Response Code: ${data.responseCode}`, 'dim');
      log(`   Response Description: ${data.responseDescription}`, 'dim');
      return data;
    } else {
      log('❌ STK Push failed', 'red');
      log(`   Error: ${JSON.stringify(data)}`, 'red');
      return null;
    }
  } catch (error) {
    log(`❌ Request failed: ${error.message}`, 'red');
    return null;
  }
}

async function testC2B(options) {
  log('\n💰 Testing M-Pesa C2B (Customer to Business)...', 'cyan');

  const baseUrl = process.env.API_URL || 'http://localhost:3000';

  try {
    const response = await fetch(`${baseUrl}/api/v1/integrations/mpesa/c2b-register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.TEST_TOKEN || 'test-token'}`,
      },
      body: JSON.stringify({
        validationUrl: `${baseUrl}/api/v1/integrations/mpesa/validation`,
        confirmationUrl: `${baseUrl}/api/v1/integrations/mpesa/confirmation`,
        responseType: 'Completed',
        shortCode: process.env.MPESA_SHORTCODE || '174379',
      }),
    });

    const data = await response.json();

    if (response.ok) {
      log('✅ C2B URLs registered successfully!', 'green');
      log(`   Response: ${JSON.stringify(data, null, 2)}`, 'dim');
      return data;
    } else {
      log('❌ C2B registration failed', 'red');
      log(`   Error: ${JSON.stringify(data)}`, 'red');
      return null;
    }
  } catch (error) {
    log(`❌ Request failed: ${error.message}`, 'red');
    return null;
  }
}

async function testBalance() {
  log('\n💳 Testing M-Pesa Balance Query...', 'cyan');

  const baseUrl = process.env.API_URL || 'http://localhost:3000';

  try {
    const response = await fetch(`${baseUrl}/api/v1/integrations/mpesa/balance`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.TEST_TOKEN || 'test-token'}`,
      },
    });

    const data = await response.json();

    if (response.ok) {
      log('✅ Balance query successful!', 'green');
      log(`   Balance: ${JSON.stringify(data, null, 2)}`, 'dim');
      return data;
    } else {
      log('❌ Balance query failed', 'red');
      log(`   Error: ${JSON.stringify(data)}`, 'red');
      return null;
    }
  } catch (error) {
    log(`❌ Request failed: ${error.message}`, 'red');
    return null;
  }
}

async function simulatePayment(options) {
  log('\n🔄 Simulating M-Pesa payment (sandbox only)...', 'cyan');

  if (options.env !== 'sandbox') {
    log('⚠️ Payment simulation is only available in sandbox mode', 'yellow');
    return null;
  }

  const baseUrl = process.env.API_URL || 'http://localhost:3000';

  try {
    const response = await fetch(`${baseUrl}/api/v1/integrations/mpesa/simulate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.TEST_TOKEN || 'test-token'}`,
      },
      body: JSON.stringify({
        phoneNumber: options.phone,
        amount: options.amount,
        shortCode: process.env.MPESA_SHORTCODE || '174379',
        billRefNumber: options.accountRef,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      log('✅ Payment simulation successful!', 'green');
      log(`   Response: ${JSON.stringify(data, null, 2)}`, 'dim');
      return data;
    } else {
      log('❌ Payment simulation failed', 'red');
      log(`   Error: ${JSON.stringify(data)}`, 'red');
      return null;
    }
  } catch (error) {
    log(`❌ Request failed: ${error.message}`, 'red');
    return null;
  }
}

async function runTests() {
  const options = parseArgs();

  console.log(`
${colors.bright}╔════════════════════════════════════════════════════════════╗
║              M-Pesa Sandbox Testing Tool                   ║
╚════════════════════════════════════════════════════════════╝${colors.reset}
`);

  // Check credentials
  if (!checkCredentials()) {
    process.exit(1);
  }

  log('✅ Credentials verified', 'green');

  // Check API health
  const baseUrl = process.env.API_URL || 'http://localhost:3000';
  try {
    const health = await fetch(`${baseUrl}/api/v1/health`);
    if (health.ok) {
      log('✅ API is running', 'green');
    } else {
      log('⚠️ API health check returned non-OK status', 'yellow');
    }
  } catch {
    log('⚠️ Could not connect to API. Make sure it is running.', 'yellow');
    log(`   Expected at: ${baseUrl}`, 'dim');
  }

  // Run tests based on environment
  log(`\n🚀 Running tests in ${options.env.toUpperCase()} mode...`, 'cyan');

  // Test 1: STK Push
  await testSTKPush(options);

  // Test 2: C2B Registration
  await testC2B(options);

  // Test 3: Balance Query
  await testBalance();

  // Test 4: Simulate Payment (sandbox only)
  if (options.env === 'sandbox') {
    await simulatePayment(options);
  }

  console.log(`
${colors.green}${colors.bright}✅ M-Pesa testing complete!${colors.reset}
`);

  log('Next steps:', 'cyan');
  log('  1. Check the API logs for callback responses', 'dim');
  log('  2. Verify transactions in the database', 'dim');
  log('  3. Check the admin dashboard for payment records', 'dim');
}

// Run tests
runTests().catch((error) => {
  log(`\n❌ Test suite failed: ${error.message}`, 'red');
  process.exit(1);
});
