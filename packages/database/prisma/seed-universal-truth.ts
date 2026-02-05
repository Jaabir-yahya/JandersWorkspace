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
        // All capabilities enabled for admin dogfooding
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

  // Create System Accounts
  const systemAccounts = [
    {
      name: "System Cash",
      type: "CASH",
      currency: "KES",
      balance: 1000000, // 10M KES for testing
      metadata: { purpose: "System cash operations and testing" },
    },
    {
      name: "Clearing Account",
      type: "CLEARING",
      currency: "KES",
      balance: 0,
      metadata: { purpose: "Multi-bank and inter-tenant settlements" },
    },
    {
      name: "FX Float Account",
      type: "FX_FLOAT",
      currency: "KES",
      balance: 500000, // 5M KES for forex operations
      metadata: { purpose: "Foreign exchange operations and hedging" },
    },
    {
      name: "Trust Account",
      type: "TRUST",
      currency: "KES",
      balance: 0,
      metadata: { purpose: "Escrow and trusted party operations" },
    },
    {
      name: "Agent Operations",
      type: "AGENT",
      currency: "KES",
      balance: 200000, // 2M KES for agent settlements
      metadata: { purpose: "Agent network operations and settlements" },
    },
    {
      name: "Inventory Holding",
      type: "INVENTORY",
      currency: "KES",
      balance: 0,
      metadata: { purpose: "Inventory valuation and cost tracking" },
    },
    {
      name: "Bank Settlement",
      type: "BANK",
      currency: "KES",
      balance: 800000, // 8M KES for bank operations
      metadata: { purpose: "Bank transfers and settlements" },
    },
  ];

  for (const accountData of systemAccounts) {
    await prisma.account.create({
      data: {
        tenantId: adminTenant.id,
        ...accountData,
        isActive: true,
      },
    });
  }

  console.log(`✅ Created ${systemAccounts.length} system accounts`);

  // Create Standard Transaction Reasons
  const standardReasons = [
    { name: "Payment", type: "TRANSFER" },
    { name: "Deposit", type: "INCOME" },
    { name: "Withdrawal", type: "EXPENSE" },
    { name: "Fee", type: "EXPENSE" },
    { name: "Interest", type: "INCOME" },
    { name: "Adjustment", type: "ADJUSTMENT" },
    { name: "Correction", type: "ADJUSTMENT" },
    { name: "Reversal", type: "ADJUSTMENT" },
    { name: "Settlement", type: "TRANSFER" },
    { name: "Commission", type: "INCOME" },
    { name: "Charge", type: "EXPENSE" },
    { name: "Exchange", type: "TRANSFER" },
    { name: "Refund", type: "EXPENSE" },
    { name: "Purchase", type: "EXPENSE" },
    { name: "Sale", type: "INCOME" },
    { name: "Service Fee", type: "INCOME" },
    { name: "Operating Expense", type: "EXPENSE" },
    { name: "Investment", type: "TRANSFER" },
    { name: "Dividend", type: "INCOME" },
  ];

  for (const reasonData of standardReasons) {
    await prisma.transactionReason.create({
      data: {
        tenantId: adminTenant.id,
        ...reasonData,
        isActive: true,
      },
    });
  }

  console.log(
    `✅ Created ${standardReasons.length} standard transaction reasons`,
  );

  // Create Sample Entities for Testing
  const sampleEntities = [
    {
      name: "Test Customer",
      type: "CUSTOMER",
      phoneNumber: "+254711111111",
      email: "test.customer@demo.local",
    },
    {
      name: "Test Supplier",
      type: "SUPPLIER",
      phoneNumber: "+254722222222",
      email: "test.supplier@demo.local",
    },
    {
      name: "Test Agent",
      type: "AGENT",
      phoneNumber: "+254733333333",
      email: "test.agent@demo.local",
    },
    {
      name: "Test Bank",
      type: "CONTACT",
      phoneNumber: "+254720000000",
      email: "test.bank@demo.local",
    },
  ];

  for (const entityData of sampleEntities) {
    await prisma.entity.create({
      data: {
        tenantId: adminTenant.id,
        createdByUserId: adminUser.id,
        ...entityData,
        isActive: true,
        metadata: {
          context: "Admin testing and validation",
          test_data: true,
        },
      },
    });
  }

  console.log(`✅ Created ${sampleEntities.length} test entities`);

  console.log("\n🎉 Admin Tenant Setup Complete!");
  console.log("📊 Summary:");
  console.log(`   - Tenant ID: ${adminTenant.id}`);
  console.log(`   - Admin Email: admin@projectbridge.local`);
  console.log(`   - Admin Password: admin-dev-password-2024`);
  console.log(`   - System Accounts: ${systemAccounts.length}`);
  console.log(`   - Transaction Reasons: ${standardReasons.length}`);
  console.log(`   - Test Entities: ${sampleEntities.length}`);

  console.log("\n🔐 Admin tenant ready for dogfooding with:");
  console.log("   - Full capability access");
  console.log("   - Emergency override powers");
  console.log("   - System monitoring");
  console.log("   - Integration testing");
  console.log("   - Raw truth access");
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
