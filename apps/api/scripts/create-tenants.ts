/**
 * Script to create two tenants for testing:
 * 1. admin-lab - Admin/development tenant
 * 2. kibuye-market - Manual use case tenant
 */
import { PrismaClient } from '@project-bridge/database';

const prisma = new PrismaClient();

async function main() {
  console.log('Creating test tenants...\n');

  // Create admin-lab tenant
  const adminLab = await prisma.tenant.upsert({
    where: { slug: 'admin-lab' },
    update: {},
    create: {
      name: 'Admin Lab',
      slug: 'admin-lab',
      tier: 'ENTERPRISE',
      country: 'KENYA',
      isActive: true,
      settings: {
        features: {
          manualBookkeeping: true,
          mpesa: true,
          whatsapp: true,
          quickbooks: true,
          xero: true,
          shopify: true,
        },
        compliance: {
          kycRequired: true,
          amlChecks: true,
          reportingThreshold: 1000000,
        },
      },
    },
  });
  console.log('✓ Created admin-lab tenant:', adminLab.id);

  // Create kibuye-market tenant
  const kibuyeMarket = await prisma.tenant.upsert({
    where: { slug: 'kibuye-market' },
    update: {},
    create: {
      name: 'Kibuye Market',
      slug: 'kibuye-market',
      tier: 'MANUAL',
      country: 'KENYA',
      isActive: true,
      settings: {
        features: {
          manualBookkeeping: true,
          mpesa: false,
          whatsapp: false,
          quickbooks: false,
          xero: false,
          shopify: false,
        },
        compliance: {
          kycRequired: true,
          amlChecks: false,
          reportingThreshold: 500000,
        },
      },
    },
  });
  console.log('✓ Created kibuye-market tenant:', kibuyeMarket.id);

  console.log('\n✅ Tenants created successfully!');
  console.log('\nYou can now access these tenants:');
  console.log('  - http://localhost:3003/?tenant=admin-lab');
  console.log('  - http://localhost:3003/?tenant=kibuye-market');
}

main()
  .catch((e) => {
    console.error('❌ Error creating tenants:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
