/**
 * Seed script to create initial tenant and dev user
 * Run with: npx ts-node scripts/seed-dev-user.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Creating dev tenant and user...');

  // Create tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'dev-mvp' },
    update: {},
    create: {
      id: '550e8400-e29b-41d4-a716-446655440000', // Fixed UUID for dev
      name: 'Dev MVP Tenant',
      slug: 'dev-mvp',
      tier: 'ENTERPRISE', // Give full access for dev
      country: 'KE',
      isActive: true,
      settings: JSON.stringify({
        businessName: 'Project Bridge Dev',
        businessType: 'nairobi_mboga',
        currency: 'KES',
        timezone: 'Africa/Nairobi',
      }),
    },
  });

  console.log('✓ Tenant created:', tenant.id);

  // Create user
  const user = await prisma.user.upsert({
    where: {
      tenantId_email: {
        tenantId: tenant.id,
        email: 'jaabir_yahyaz@icloud.com',
      },
    },
    update: {},
    create: {
      id: '550e8400-e29b-41d4-a716-446655440001', // Fixed UUID for dev user
      email: 'jaabir_yahyaz@icloud.com',
      tenantId: tenant.id,
      displayName: 'Dev Admin',
      role: 'ADMIN',
      isActive: true,
      metadata: JSON.stringify({
        isDev: true,
        createdVia: 'seed-script',
      }),
    },
  });

  console.log('✓ User created:', user.id);
  console.log('\n✅ Dev setup complete!');
  console.log('Tenant ID:', tenant.id);
  console.log('User Email:', user.email);
  console.log('\nYou can now log in with:');
  console.log('Email: jaabir_yahyaz@icloud.com');
  console.log('Password: TESTING123');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
