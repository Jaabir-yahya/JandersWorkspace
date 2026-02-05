import { PrismaClient } from "../generated/prisma/client.js";
import { createHash } from "crypto";

const prisma = new PrismaClient({ log: [] });

async function createAdminTenant() {
  console.log("🏗️ Creating Universal Truth Admin Tenant...");

  // Create Admin Tenant with full capabilities
  const adminTenant = await prisma.tenant.upsert({
    where: { slug: "admin" },
    update: {},
    create: {
      name: "Platform Admin",
      slug: "admin",
      accountingStandard: "IFRS",
      isAdminTenant: true,
      currency: "KES",
      country: "KE",
      isActive: true,
      capabilities: {
        live_balances: true,
        bulk_transactions: true,
        reconciliation: true,
        proof_vault: true,
        agents: true,
        admin_panel: true,
        raw_truth_access: true,
        emergency_overrides: true,
        system_monitoring: true,
        data_warehouse: true,
        integration_testing: true,
        api_access: true,
        webhooks: true,
        exports: true,
      },
      settings: {
        emergency_overrides_enabled: true,
        audit_retention_days: 365,
        auto_backup_enabled: true,
        debug_mode: true,
      },
    },
  });

  console.log("✅ Admin Tenant created:", adminTenant.id);

  // Create Admin User
  const hashedPassword = createHash("sha256")
    .update("admin-dev-password-2024")
    .digest("hex");

  const adminUser = await prisma.user.upsert({
    where: {
      tenantId_email: {
        tenantId: adminTenant.id,
        email: "admin@projectbridge.local",
      },
    },
    update: {},
    create: {
      tenantId: adminTenant.id,
      email: "admin@projectbridge.local",
      displayName: "Platform Administrator",
      phoneNumber: "+254700000000",
      role: "ADMIN",
      isAdmin: true,
      isActive: true,
      metadata: {
        context: "Platform administration and dogfooding",
        access_level: "GOD_MODE",
        emergency_override: true,
      },
    },
  });

  console.log("✅ Admin User created:", adminUser.id);

  console.log("\n🎉 Admin Tenant Setup Complete!");
  console.log("📊 Summary:");
  console.log(`   - Tenant ID: ${adminTenant.id}`);
  console.log(`   - Admin Email: admin@projectbridge.local`);
  console.log(`   - Admin Password: admin-dev-password-2024`);
}

async function createKenyaMarketTenants() {
  console.log("\n🇰🇪 Creating Kenya Market Sample Tenants...");

  // Kibuye Market Traders (Manual)
  const kibuyeTenant = await prisma.tenant.upsert({
    where: { slug: "kibuye-traders" },
    update: {},
    create: {
      name: "Kibuye Market Traders",
      slug: "kibuye-traders",
      accountingStandard: "SIMPLE",
      isAdminTenant: false,
      currency: "KES",
      country: "KE",
      isActive: true,
      capabilities: {
        live_balances: true,
        bulk_transactions: false,
        reconciliation: false,
        proof_vault: true,
        agents: false,
        admin_panel: false,
        raw_truth_access: false,
        emergency_overrides: false,
        system_monitoring: false,
        data_warehouse: false,
        integration_testing: false,
        api_access: false,
        webhooks: false,
        exports: true,
      },
      settings: {
        ui_complexity: "simple",
        mobile_first: true,
        proof_required: false,
        auto_backup_enabled: true,
      },
    },
  });

  // Ahmed-style Export Trader (Complex)
  const ahmedTenant = await prisma.tenant.upsert({
    where: { slug: "ahmed-export" },
    update: {},
    create: {
      name: "Ahmed Fresh Produce Export",
      slug: "ahmed-export",
      accountingStandard: "IFRS",
      isAdminTenant: false,
      currency: "KES",
      country: "KE",
      isActive: true,
      capabilities: {
        live_balances: true,
        bulk_transactions: true,
        reconciliation: true,
        proof_vault: true,
        agents: false,
        admin_panel: false,
        raw_truth_access: true,
        emergency_overrides: false,
        system_monitoring: true,
        data_warehouse: true,
        integration_testing: false,
        api_access: true,
        webhooks: false,
        exports: true,
        inventory_tracking: true,
        container_management: true,
      },
      settings: {
        ui_complexity: "advanced",
        mobile_first: false,
        proof_required: true,
        auto_backup_enabled: true,
        container_tracking: true,
        multi_currency: false,
      },
    },
  });

  console.log("✅ Created Kenya sample tenants");
  console.log(`   - Kibuye Traders: ${kibuyeTenant.id} (Simple)`);
  console.log(`   - Ahmed Export: ${ahmedTenant.id} (Complex)`);
}

async function main() {
  try {
    await createAdminTenant();
    await createKenyaMarketTenants();

    console.log("\n✨ Universal Truth seeding complete!");
    console.log("🚀 Ready for Phase 1 testing and validation");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
