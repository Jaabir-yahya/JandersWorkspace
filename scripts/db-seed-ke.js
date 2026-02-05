#!/usr/bin/env node
/**
 * db-seed-ke.js
 * Seeds database with Kenyan test data
 * Usage: npm run db:seed:ke [-- --business-type=retail --count=10 --clean]
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

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
    businessType: 'retail',
    count: 10,
    clean: false,
    tenantId: null,
  };

  args.forEach((arg) => {
    if (arg.startsWith('--business-type=')) {
      options.businessType = arg.split('=')[1];
    } else if (arg.startsWith('--count=')) {
      options.count = parseInt(arg.split('=')[1], 10);
    } else if (arg.startsWith('--tenant-id=')) {
      options.tenantId = arg.split('=')[1];
    } else if (arg === '--clean') {
      options.clean = true;
    }
  });

  return options;
}

function checkDatabaseConnection() {
  const databaseUrl = process.env.DATABASE_URL || process.env.DIRECT_URL;

  if (!databaseUrl) {
    log('\n❌ DATABASE_URL or DIRECT_URL not set', 'red');
    log('Please set your database connection string in .env', 'yellow');
    return false;
  }

  return true;
}

// Kenyan business names
const businessNames = {
  retail: [
    'Mama Njoro Shop',
    'Kibanda Express',
    'Nairobi Mart',
    'Mombasa Traders',
    'Kisumu Retailers',
    'Nakuru Supermarket',
    'Eldoret Stores',
    'Thika Shop',
    'Machakos Retail',
    'Nyeri General Store',
    'Meru Traders',
    'Kakamega Shop',
    'Malindi Retail',
    'Kitale Stores',
    'Kericho Mart',
  ],
  hospitality: [
    'Safari Hotel Nairobi',
    'Mombasa Beach Resort',
    'Kisumu Lakeside Inn',
    'Maasai Mara Lodge',
    'Amboseli Camp',
    'Mount Kenya Resort',
    'Diani Beach Hotel',
    'Lamu Island Guesthouse',
    'Nakuru Lodge',
    'Eldoret Hotel',
    'Nanyuki Mountain Inn',
    'Naivasha Resort',
    'Tsavo Safari Camp',
    'Watamu Beach House',
    'Kilifi Cove Resort',
  ],
  transport: [
    'Nairobi Express Shuttle',
    'Mombasa Logistics',
    'Kenya Coast Transport',
    'Rift Valley Movers',
    'Lake Region Transport',
    'Central Kenya Car Hire',
    'Eastern Shuttle Services',
    'Western Kenya Logistics',
    'Northern Frontier Transport',
    'Safari Tours Kenya',
    'Airport Transfers Ltd',
    'City Hoppers Nairobi',
    'Upcountry Express',
    'Coastal Connections',
    'Highland Transport Co.',
  ],
  agriculture: [
    'Green Valley Farms',
    'Tea Plantation Ltd',
    'Coffee Exporters Kenya',
    'Maize Millers Co-op',
    'Dairy Farmers Union',
    'Horticulture Exports',
    'Livestock Traders',
    'Grain Merchants Kenya',
    'Fresh Produce Ltd',
    'Agrovet Supplies',
    'Seed Distributors',
    'Fertilizer Importers',
    'Irrigation Solutions',
    'Organic Farms Kenya',
    'AgriTech Solutions',
  ],
  services: [
    'Nairobi Tech Solutions',
    'Mombasa Consulting',
    'Kenya Legal Services',
    'East Africa Accounting',
    'Digital Marketing KE',
    'Construction Pros Ltd',
    'Security Services Kenya',
    'Cleaning Services Co.',
    'Event Planners Nairobi',
    'Photography Studio KE',
    'Printing Services Ltd',
    'Courier Services Kenya',
    'Training Institute',
    'Healthcare Services',
    'Real Estate Agency',
  ],
};

// Kenyan names
const kenyanNames = [
  'Wanjiku Mwangi',
  'Otieno Ochieng',
  'Njoroge Kamau',
  'Wanjiru Kariuki',
  'Mutua Musyoka',
  'Achieng Omondi',
  'Kipchoge Ruto',
  'Wambui Githinji',
  'Omondi Okoth',
  'Kamau Njoroge',
  'Wangari Maathai',
  'Kibet Rotich',
  'Akinyi Odhiambo',
  'Mbugua Kimani',
  'Chebet Langat',
  'Onyango Oloo',
  'Muthoni Muriuki',
  'Kiptoo Bett',
  'Nyambura Ndungu',
  'Wekesa Barasa',
];

// Kenyan phone numbers
function generatePhoneNumber() {
  const prefixes = ['254712', '254713', '254714', '254715', '254716', '254717', '254718', '254719', '254720', '254721', '254722', '254723', '254724', '254725', '254726', '254727', '254728', '254729', '254740', '254741'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return `${prefix}${suffix}`;
}

// M-Pesa transaction codes
function generateMpesaCode() {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const letter = letters[Math.floor(Math.random() * letters.length)];
  const numbers = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
  return `${letter}${numbers}`;
}

function generateSeedData(options) {
  const businessType = options.businessType;
  const count = options.count;
  const tenantId = options.tenantId || '00000000-0000-0000-0000-000000000000';

  const names = businessNames[businessType] || businessNames.retail;
  const selectedNames = names.slice(0, Math.min(count, names.length));

  const businesses = selectedNames.map((name, index) => ({
    id: `biz_${index + 1}`,
    name,
    type: businessType.toUpperCase(),
    phone: generatePhoneNumber(),
    email: `${name.toLowerCase().replace(/\s+/g, '.')}@example.co.ke`,
    location: ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret'][Math.floor(Math.random() * 5)],
    registered: Math.random() > 0.3,
    krapin: `A${Math.floor(Math.random() * 10000000).toString().padStart(8, '0')}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
  }));

  const transactions = [];
  const now = new Date();

  businesses.forEach((business) => {
    const numTransactions = Math.floor(Math.random() * 10) + 5;

    for (let i = 0; i < numTransactions; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - Math.floor(Math.random() * 30));

      const isMpesa = Math.random() > 0.3;
      const amount = Math.floor(Math.random() * 50000) + 100;

      transactions.push({
        id: `tx_${business.id}_${i}`,
        businessId: business.id,
        amount,
        currency: 'KES',
        type: Math.random() > 0.5 ? 'INCOME' : 'EXPENSE',
        method: isMpesa ? 'MPESA' : ['CASH', 'BANK', 'CARD'][Math.floor(Math.random() * 3)],
        mpesaCode: isMpesa ? generateMpesaCode() : null,
        description: [
          'Payment for goods',
          'Service fee',
          'Supplier payment',
          'Customer deposit',
          'Refund',
          'Salary payment',
          'Rent',
          'Utilities',
        ][Math.floor(Math.random() * 8)],
        date: date.toISOString(),
        status: ['COMPLETED', 'PENDING', 'COMPLETED', 'COMPLETED'][Math.floor(Math.random() * 4)],
        recordedBy: kenyanNames[Math.floor(Math.random() * kenyanNames.length)],
      });
    }
  });

  const contacts = businesses.map((business) => ({
    id: `contact_${business.id}`,
    businessId: business.id,
    name: kenyanNames[Math.floor(Math.random() * kenyanNames.length)],
    phone: business.phone,
    email: business.email,
    role: ['Owner', 'Manager', 'Accountant', 'Sales'][Math.floor(Math.random() * 4)],
    isPrimary: true,
  }));

  return {
    tenantId,
    businesses,
    transactions,
    contacts,
  };
}

async function seedDatabase(data) {
  const root = path.resolve(__dirname, '..');
  const apiPath = path.join(root, 'apps/api');

  log('\n🌱 Seeding database with Kenyan test data...', 'cyan');
  log(`   Business type: ${data.businesses[0]?.type || 'MIXED'}`, 'dim');
  log(`   Businesses: ${data.businesses.length}`, 'dim');
  log(`   Transactions: ${data.transactions.length}`, 'dim');
  log(`   Contacts: ${data.contacts.length}`, 'dim');

  // Create a temporary seed file
  const seedFile = path.join(apiPath, 'prisma', 'seed-ke-temp.ts');
  const seedContent = `
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const seedData = ${JSON.stringify(data, null, 2)};

async function main() {
  console.log('Starting Kenyan test data seed...');

  // Create tenant if doesn't exist
  await prisma.tenant.upsert({
    where: { id: seedData.tenantId },
    update: {},
    create: {
      id: seedData.tenantId,
      name: 'Kenya Test Tenant',
      slug: 'kenya-test',
      country: 'KE',
      currency: 'KES',
      timezone: 'Africa/Nairobi',
    },
  });

  // Create businesses
  for (const business of seedData.businesses) {
    await prisma.entity.upsert({
      where: { id: business.id },
      update: {
        name: business.name,
        type: business.type,
        phone: business.phone,
        email: business.email,
        location: business.location,
        metadata: {
          krapin: business.krapin,
          registered: business.registered,
        },
      },
      create: {
        id: business.id,
        tenantId: seedData.tenantId,
        name: business.name,
        type: business.type,
        phone: business.phone,
        email: business.email,
        location: business.location,
        metadata: {
          krapin: business.krapin,
          registered: business.registered,
        },
      },
    });
  }

  // Create transactions
  for (const tx of seedData.transactions) {
    await prisma.transaction.upsert({
      where: { id: tx.id },
      update: {
        amount: tx.amount,
        currency: tx.currency,
        type: tx.type,
        method: tx.method,
        description: tx.description,
        date: new Date(tx.date),
        status: tx.status,
        metadata: {
          mpesaCode: tx.mpesaCode,
          recordedBy: tx.recordedBy,
        },
      },
      create: {
        id: tx.id,
        tenantId: seedData.tenantId,
        entityId: tx.businessId,
        amount: tx.amount,
        currency: tx.currency,
        type: tx.type,
        method: tx.method,
        description: tx.description,
        date: new Date(tx.date),
        status: tx.status,
        metadata: {
          mpesaCode: tx.mpesaCode,
          recordedBy: tx.recordedBy,
        },
      },
    });
  }

  // Create contacts
  for (const contact of seedData.contacts) {
    await prisma.contact.upsert({
      where: { id: contact.id },
      update: {
        name: contact.name,
        phone: contact.phone,
        email: contact.email,
        role: contact.role,
        isPrimary: contact.isPrimary,
      },
      create: {
        id: contact.id,
        tenantId: seedData.tenantId,
        entityId: contact.businessId,
        name: contact.name,
        phone: contact.phone,
        email: contact.email,
        role: contact.role,
        isPrimary: contact.isPrimary,
      },
    });
  }

  console.log('✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.\$disconnect();
  });
`;

  fs.writeFileSync(seedFile, seedContent);

  try {
    // Run the seed
    execSync('npx ts-node prisma/seed-ke-temp.ts', {
      cwd: apiPath,
      stdio: 'inherit',
    });

    // Clean up
    fs.unlinkSync(seedFile);

    log('\n✅ Database seeded successfully!', 'green');
    log('\n📊 Summary:', 'cyan');
    log(`   - ${data.businesses.length} businesses created`, 'dim');
    log(`   - ${data.transactions.length} transactions created`, 'dim');
    log(`   - ${data.contacts.length} contacts created`, 'dim');
    log(`   - Tenant ID: ${data.tenantId}`, 'dim');

    return true;
  } catch (error) {
    // Clean up on error
    if (fs.existsSync(seedFile)) {
      fs.unlinkSync(seedFile);
    }
    throw error;
  }
}

async function cleanDatabase() {
  const root = path.resolve(__dirname, '..');
  const apiPath = path.join(root, 'apps/api');

  log('\n🧹 Cleaning existing test data...', 'yellow');

  try {
    execSync('npx prisma migrate reset --force', {
      cwd: apiPath,
      stdio: 'inherit',
    });
    log('✅ Database cleaned', 'green');
    return true;
  } catch (error) {
    log('⚠️ Could not clean database automatically', 'yellow');
    log('You may need to manually reset the database', 'dim');
    return false;
  }
}

async function main() {
  const options = parseArgs();

  console.log(`
${colors.bright}╔════════════════════════════════════════════════════════════╗
║         Kenyan Test Data Seeding Tool                      ║
╚════════════════════════════════════════════════════════════╝${colors.reset}
`);

  // Check database connection
  if (!checkDatabaseConnection()) {
    process.exit(1);
  }

  log('✅ Database connection string found', 'green');

  // Clean if requested
  if (options.clean) {
    await cleanDatabase();
  }

  // Generate seed data
  const data = generateSeedData(options);

  // Seed database
  try {
    await seedDatabase(data);

    console.log(`\n${colors.green}${colors.bright}✅ Seeding complete!${colors.reset}\n`);

    log('Next steps:', 'cyan');
    log('  1. Start the API: npm run dev:api', 'dim');
    log('  2. Check the data: npx prisma studio', 'dim');
    log('  3. View in admin: http://localhost:5173', 'dim');
  } catch (error) {
    log(`\n❌ Seeding failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run
main().catch((error) => {
  log(`\n❌ Unexpected error: ${error.message}`, 'red');
  process.exit(1);
});
