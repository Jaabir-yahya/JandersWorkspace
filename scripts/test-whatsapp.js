#!/usr/bin/env node
/**
 * test-whatsapp.js
 * WhatsApp testing helper
 * Usage: npm run test:whatsapp [-- --phone=254712345678 --message="Hello" --template=welcome]
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
    phone: '254712345678',
    message: 'Hello from Project Bridge! 👋',
    template: null,
    media: null,
    interactive: false,
  };

  args.forEach((arg) => {
    if (arg.startsWith('--phone=')) {
      options.phone = arg.split('=')[1];
    } else if (arg.startsWith('--message=')) {
      options.message = arg.split('=')[1];
    } else if (arg.startsWith('--template=')) {
      options.template = arg.split('=')[1];
    } else if (arg.startsWith('--media=')) {
      options.media = arg.split('=')[1];
    } else if (arg === '--interactive') {
      options.interactive = true;
    }
  });

  return options;
}

function checkCredentials() {
  const required = ['WHATSAPP_ACCESS_TOKEN', 'WHATSAPP_PHONE_NUMBER_ID'];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    log('\n❌ Missing required environment variables:', 'red');
    missing.forEach((key) => log(`   - ${key}`, 'red'));
    log('\nPlease set these in your .env file or environment.', 'yellow');
    log('\nTo get these credentials:', 'dim');
    log('  1. Go to https://developers.facebook.com/apps', 'dim');
    log('  2. Create or select your app', 'dim');
    log('  3. Add WhatsApp product', 'dim');
    log('  4. Copy the Access Token and Phone Number ID', 'dim');
    return false;
  }

  return true;
}

async function sendTextMessage(options) {
  log('\n📱 Sending WhatsApp text message...', 'cyan');
  log(`   To: ${options.phone}`, 'dim');
  log(`   Message: "${options.message}"`, 'dim');

  const baseUrl = process.env.API_URL || 'http://localhost:3000';

  try {
    const response = await fetch(`${baseUrl}/api/v1/integrations/whatsapp/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.TEST_TOKEN || 'test-token'}`,
      },
      body: JSON.stringify({
        to: options.phone,
        type: 'text',
        text: {
          body: options.message,
        },
      }),
    });

    const data = await response.json();

    if (response.ok) {
      log('✅ Message sent successfully!', 'green');
      log(`   Message ID: ${data.messages?.[0]?.id}`, 'dim');
      return data;
    } else {
      log('❌ Failed to send message', 'red');
      log(`   Error: ${JSON.stringify(data)}`, 'red');
      return null;
    }
  } catch (error) {
    log(`❌ Request failed: ${error.message}`, 'red');
    return null;
  }
}

async function sendTemplateMessage(options) {
  log(`\n📋 Sending WhatsApp template message (${options.template})...`, 'cyan');
  log(`   To: ${options.phone}`, 'dim');

  const baseUrl = process.env.API_URL || 'http://localhost:3000';

  try {
    const response = await fetch(`${baseUrl}/api/v1/integrations/whatsapp/send-template`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.TEST_TOKEN || 'test-token'}`,
      },
      body: JSON.stringify({
        to: options.phone,
        template: {
          name: options.template,
          language: {
            code: 'en_US',
          },
        },
      }),
    });

    const data = await response.json();

    if (response.ok) {
      log('✅ Template message sent successfully!', 'green');
      log(`   Message ID: ${data.messages?.[0]?.id}`, 'dim');
      return data;
    } else {
      log('❌ Failed to send template message', 'red');
      log(`   Error: ${JSON.stringify(data)}`, 'red');
      return null;
    }
  } catch (error) {
    log(`❌ Request failed: ${error.message}`, 'red');
    return null;
  }
}

async function sendMediaMessage(options) {
  log(`\n🖼️ Sending WhatsApp media message...`, 'cyan');
  log(`   To: ${options.phone}`, 'dim');
  log(`   Media URL: ${options.media}`, 'dim');

  const baseUrl = process.env.API_URL || 'http://localhost:3000';

  try {
    const response = await fetch(`${baseUrl}/api/v1/integrations/whatsapp/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.TEST_TOKEN || 'test-token'}`,
      },
      body: JSON.stringify({
        to: options.phone,
        type: 'image',
        image: {
          link: options.media,
          caption: options.message,
        },
      }),
    });

    const data = await response.json();

    if (response.ok) {
      log('✅ Media message sent successfully!', 'green');
      log(`   Message ID: ${data.messages?.[0]?.id}`, 'dim');
      return data;
    } else {
      log('❌ Failed to send media message', 'red');
      log(`   Error: ${JSON.stringify(data)}`, 'red');
      return null;
    }
  } catch (error) {
    log(`❌ Request failed: ${error.message}`, 'red');
    return null;
  }
}

async function getMessageStatus(messageId) {
  log(`\n📊 Checking message status...`, 'cyan');
  log(`   Message ID: ${messageId}`, 'dim');

  const baseUrl = process.env.API_URL || 'http://localhost:3000';

  try {
    const response = await fetch(`${baseUrl}/api/v1/integrations/whatsapp/message/${messageId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.TEST_TOKEN || 'test-token'}`,
      },
    });

    const data = await response.json();

    if (response.ok) {
      log('✅ Message status retrieved!', 'green');
      log(`   Status: ${data.status}`, 'dim');
      return data;
    } else {
      log('❌ Failed to get message status', 'red');
      return null;
    }
  } catch (error) {
    log(`❌ Request failed: ${error.message}`, 'red');
    return null;
  }
}

async function getBusinessProfile() {
  log('\n🏢 Fetching WhatsApp Business profile...', 'cyan');

  const baseUrl = process.env.API_URL || 'http://localhost:3000';

  try {
    const response = await fetch(`${baseUrl}/api/v1/integrations/whatsapp/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.TEST_TOKEN || 'test-token'}`,
      },
    });

    const data = await response.json();

    if (response.ok) {
      log('✅ Business profile retrieved!', 'green');
      log(`   Name: ${data.name}`, 'dim');
      log(`   Phone: ${data.phone}`, 'dim');
      return data;
    } else {
      log('❌ Failed to get business profile', 'red');
      return null;
    }
  } catch (error) {
    log(`❌ Request failed: ${error.message}`, 'red');
    return null;
  }
}

async function runInteractiveMode() {
  log('\n🎮 Interactive WhatsApp Testing Mode', 'cyan');
  log('Commands:', 'dim');
  log('  1. Send text message', 'dim');
  log('  2. Send template message', 'dim');
  log('  3. Send media message', 'dim');
  log('  4. Check message status', 'dim');
  log('  5. Get business profile', 'dim');
  log('  q. Quit', 'dim');

  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const askQuestion = (query) => new Promise((resolve) => readline.question(query, resolve));

  while (true) {
    const choice = await askQuestion('\nEnter choice: ');

    switch (choice.trim()) {
      case '1': {
        const phone = await askQuestion('Phone number (e.g., 254712345678): ');
        const message = await askQuestion('Message: ');
        await sendTextMessage({ phone, message });
        break;
      }
      case '2': {
        const phone = await askQuestion('Phone number (e.g., 254712345678): ');
        const template = await askQuestion('Template name: ');
        await sendTemplateMessage({ phone, template });
        break;
      }
      case '3': {
        const phone = await askQuestion('Phone number (e.g., 254712345678): ');
        const media = await askQuestion('Media URL: ');
        const message = await askQuestion('Caption: ');
        await sendMediaMessage({ phone, media, message });
        break;
      }
      case '4': {
        const messageId = await askQuestion('Message ID: ');
        await getMessageStatus(messageId);
        break;
      }
      case '5':
        await getBusinessProfile();
        break;
      case 'q':
      case 'quit':
        readline.close();
        return;
      default:
        log('Invalid choice', 'yellow');
    }
  }
}

async function runTests() {
  const options = parseArgs();

  console.log(`
${colors.bright}╔════════════════════════════════════════════════════════════╗
║              WhatsApp Testing Tool                         ║
╚════════════════════════════════════════════════════════════╝${colors.reset}
`);

  // Check credentials
  if (!checkCredentials()) {
    process.exit(1);
  }

  log('✅ Credentials verified', 'green');
  log(`   Phone Number ID: ${process.env.WHATSAPP_PHONE_NUMBER_ID}`, 'dim');

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

  // Run interactive mode or single test
  if (options.interactive) {
    await runInteractiveMode();
  } else {
    log(`\n🚀 Running WhatsApp tests...`, 'cyan');

    // Get business profile first
    await getBusinessProfile();

    // Send message based on options
    if (options.template) {
      await sendTemplateMessage(options);
    } else if (options.media) {
      await sendMediaMessage(options);
    } else {
      await sendTextMessage(options);
    }

    console.log(`
${colors.green}${colors.bright}✅ WhatsApp testing complete!${colors.reset}
`);

    log('Next steps:', 'cyan');
    log('  1. Check your phone for the message', 'dim');
    log('  2. Check the API logs for webhook events', 'dim');
    log('  3. Use --interactive flag for more options', 'dim');
  }
}

// Run tests
runTests().catch((error) => {
  log(`\n❌ Test suite failed: ${error.message}`, 'red');
  process.exit(1);
});
