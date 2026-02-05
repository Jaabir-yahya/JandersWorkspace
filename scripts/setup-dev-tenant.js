#!/usr/bin/env node

/**
 * Dev Tenant Setup Script
 * Creates a "dev" tenant for innovating and experimenting with new features.
 * Use this tenant for local development and testing without affecting production data.
 *
 * Usage:
 *   node scripts/setup-dev-tenant.js
 *   node scripts/setup-dev-tenant.js --email your@email.com   # Link dev tenant to your Supabase user
 *
 * After running:
 *   - Sign in with your Supabase account; if no tenant is in metadata, you'll see tenant selection.
 *   - Select "Dev Workspace" (or the slug "dev") to use the dev tenant.
 *   - Or ensure your Supabase user has user_metadata.tenant_id = <dev-tenant-uuid> for auto-select.
 */

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function setupDevTenant() {
  try {
    console.log("🔧 Setting up Dev Tenant (for innovating)...\n");

    const devTenant = await prisma.tenant.upsert({
      where: { slug: "dev" },
      update: {
        name: "Dev Workspace",
        tier: "BASIC",
        country: "KE",
        isActive: true,
        settings: {
          features: {
            manual_transactions: true,
            entity_management: true,
            payment_records: true,
            dashboard: true,
            advanced_reporting: true,
            mpesa_integration: false,
            whatsapp_integration: false,
            quickbooks_sync: false,
            xero_sync: false,
            shopify_sync: false,
          },
          dev: true,
          innovating: true,
        },
      },
      create: {
        name: "Dev Workspace",
        slug: "dev",
        tier: "BASIC",
        country: "KE",
        isActive: true,
        settings: {
          features: {
            manual_transactions: true,
            entity_management: true,
            payment_records: true,
            dashboard: true,
            advanced_reporting: true,
            mpesa_integration: false,
            whatsapp_integration: false,
            quickbooks_sync: false,
            xero_sync: false,
            shopify_sync: false,
          },
          dev: true,
          innovating: true,
        },
      },
    });

    console.log(`✅ Dev tenant: ${devTenant.name} (slug: ${devTenant.slug}, id: ${devTenant.id})\n`);

    // Optional: link to a dev user by email (create User record so GET /tenants/my-tenants returns dev)
    const emailArg = process.argv.find((a) => a.startsWith("--email="));
    const devEmail = emailArg ? emailArg.replace("--email=", "").trim() : null;

    if (devEmail) {
      const existingUser = await prisma.user.findFirst({
        where: { tenantId: devTenant.id, email: devEmail },
      });
      if (existingUser) {
        console.log(`   User already linked: ${devEmail}`);
      } else {
        const devUser = await prisma.user.create({
          data: {
            tenantId: devTenant.id,
            email: devEmail,
            displayName: "Dev User",
            phoneNumber: "+254700000000",
            role: "admin",
            metadata: { dev: true },
          },
        });
        console.log(`   Linked user: ${devEmail} (id: ${devUser.id})`);
        console.log(`   After sign-in, select "Dev Workspace" or set Supabase user_metadata.tenant_id = ${devTenant.id}`);
      }
    } else {
      console.log("   To link this tenant to your account, run:");
      console.log('   node scripts/setup-dev-tenant.js --email=your@email.com\n');
    }

    console.log("🎉 Dev tenant ready for innovating.\n");
  } catch (error) {
    console.error("❌ Error setting up dev tenant:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  setupDevTenant();
}

module.exports = { setupDevTenant };
