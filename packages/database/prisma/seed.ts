import {
  PrismaClient,
  TxnStatus,
  PaymentStatus,
  TxnType,
  EntityType,
} from "../generated/prisma/client.js";
import crypto from "crypto";

const prisma = new PrismaClient({ log: [{ emit: "event", level: "query" }] });

async function main() {
  // Production safety check
  if (process.env.NODE_ENV === "production" && !process.env.ALLOW_PROD_SEED) {
    console.error("❌ Seeding is not allowed in production environment");
    console.error("   Set ALLOW_PROD_SEED=true to override (not recommended)");
    process.exit(1);
  }

  console.log("🌱 Starting database seed...");

  // ============================================
  // 0. FEATURE FLAGS (For tenant feature access control)
  // ============================================
  console.log("Creating feature flags...");

  const featureFlags = [
    {
      name: "manual_transactions",
      description: "Basic manual transaction recording",
      tiers: ["BASIC", "ADVANCED", "PREMIUM", "ENTERPRISE"],
      countries: ["KE", "TZ", "UG", "RW", "NG", "US", "UK", "EU"],
    },
    {
      name: "entity_management",
      description: "Customer and supplier management",
      tiers: ["BASIC", "ADVANCED", "PREMIUM", "ENTERPRISE"],
      countries: ["KE", "TZ", "UG", "RW", "NG", "US", "UK", "EU"],
    },
    {
      name: "payment_records",
      description: "Record and track payments",
      tiers: ["BASIC", "ADVANCED", "PREMIUM", "ENTERPRISE"],
      countries: ["KE", "TZ", "UG", "RW", "NG", "US", "UK", "EU"],
    },
    {
      name: "dashboard",
      description: "Analytics dashboard and reporting",
      tiers: ["BASIC", "ADVANCED", "PREMIUM", "ENTERPRISE"],
      countries: ["KE", "TZ", "UG", "RW", "NG", "US", "UK", "EU"],
    },
    {
      name: "mpesa_integration",
      description: "M-Pesa STK push and payment processing",
      tiers: ["ADVANCED", "PREMIUM", "ENTERPRISE"],
      countries: ["KE"],
    },
    {
      name: "whatsapp_integration",
      description: "WhatsApp Business API notifications",
      tiers: ["ADVANCED", "PREMIUM", "ENTERPRISE"],
      countries: ["KE", "TZ", "UG", "RW", "NG"],
    },
    {
      name: "quickbooks_sync",
      description: "QuickBooks Online synchronization",
      tiers: ["PREMIUM", "ENTERPRISE"],
      countries: ["KE", "TZ", "UG", "RW", "NG", "US", "UK", "EU"],
    },
    {
      name: "xero_sync",
      description: "Xero Accounting synchronization",
      tiers: ["PREMIUM", "ENTERPRISE"],
      countries: ["KE", "TZ", "UG", "RW", "NG", "US", "UK", "EU"],
    },
    {
      name: "shopify_sync",
      description: "Shopify store integration",
      tiers: ["PREMIUM", "ENTERPRISE"],
      countries: ["KE", "TZ", "UG", "RW", "NG", "US", "UK", "EU"],
    },
    {
      name: "advanced_reporting",
      description: "Advanced analytics and custom reports",
      tiers: ["PREMIUM", "ENTERPRISE"],
      countries: ["KE", "TZ", "UG", "RW", "NG", "US", "UK", "EU"],
    },
  ];

  for (const flag of featureFlags) {
    await prisma.featureFlag.upsert({
      where: { name: flag.name },
      update: {},
      create: {
        name: flag.name,
        description: flag.description,
        isActive: true,
        tiers: flag.tiers,
        countries: flag.countries,
      },
    });
    console.log(`  ✅ Feature flag: ${flag.name}`);
  }

  console.log(`✅ Created ${featureFlags.length} feature flags`);

  // ============================================
  // 0b. CREATE DOGFOOD TENANT (janders-dogfood)
  // ============================================
  console.log("Creating dogfood tenant (janders-dogfood)...");

  const dogfoodTenant = await prisma.tenant.upsert({
    where: { slug: "janders-dogfood" },
    update: {},
    create: {
      id: "11111111-1111-1111-1111-111111111111",
      name: "Janders Dogfood",
      slug: "janders-dogfood",
      tier: "ENTERPRISE",
      country: "KE",
      isActive: true,
      settings: {
        commissionRates: {
          mpesa: 0.02,
          whatsapp: 0.01,
          quickbooks: 0.015,
          xero: 0.015,
          shopify: 0.01,
        },
        complianceData: {
          dataRetention: { years: 7, anonymization: true },
          mpesaCompliance: {
            kycRequired: true,
            amlChecks: true,
            reportingThreshold: 1000000,
          },
        },
        rateLimits: { daily: 10000, monthly: 300000 },
        features: {
          manual_transactions: true,
          entity_management: true,
          payment_records: true,
          dashboard: true,
          mpesa_integration: true,
          whatsapp_integration: true,
          quickbooks_sync: true,
          xero_sync: true,
          shopify_sync: true,
          advanced_reporting: true,
        },
      },
    },
  });

  console.log("✅ Dogfood tenant created:", dogfoodTenant.name);

  // Create dogfood tenant integrations
  const dogfoodIntegrations = [
    { type: "MPESA", config: { environment: "sandbox", shortcode: "174379" } },
    { type: "WHATSAPP", config: { environment: "sandbox" } },
    { type: "QUICKBOOKS", config: { environment: "sandbox" } },
    { type: "XERO", config: { environment: "sandbox" } },
    { type: "SHOPIFY", config: { environment: "sandbox" } },
  ];

  for (const integration of dogfoodIntegrations) {
    await prisma.tenantIntegration.upsert({
      where: {
        tenantId_integrationType: {
          tenantId: dogfoodTenant.id,
          integrationType: integration.type,
        },
      },
      update: {},
      create: {
        tenantId: dogfoodTenant.id,
        integrationType: integration.type,
        encryptedConfig: integration.config,
        isActive: true,
        syncStatus: "ACTIVE",
      },
    });
    console.log(`  ✅ Integration: ${integration.type}`);
  }

  // Create dogfood admin user
  const dogfoodUser = await prisma.user.upsert({
    where: { id: "22222222-2222-2222-2222-222222222222" },
    update: {},
    create: {
      id: "22222222-2222-2222-2222-222222222222",
      tenantId: dogfoodTenant.id,
      phoneNumber: "+254700000001",
      email: "dogfood@janders.app",
      displayName: "Janders Dogfood Admin",
      role: "admin",
      metadata: { is_dogfood_user: true },
    },
  });

  console.log("✅ Dogfood admin user created:", dogfoodUser.displayName);

  // Dogfood manual-capture user (for quick-capture without JWT; FK for created_by_user_id)
  const dogfoodManualUser = await prisma.user.upsert({
    where: { id: "33333333-3333-3333-3333-333333333333" },
    update: {},
    create: {
      id: "33333333-3333-3333-3333-333333333333",
      tenantId: dogfoodTenant.id,
      phoneNumber: "+254700000002",
      email: null,
      displayName: "Manual Capture",
      role: "user",
      metadata: { manual_capture: true },
    },
  });
  console.log("✅ Dogfood manual user created:", dogfoodManualUser.displayName);

  // ============================================
  // 1. DEFAULT USER SETUP (Fixes foreign key issue!)
  // ============================================
  console.log("Creating default user...");

  const defaultUser = await prisma.user.upsert({
    where: { id: "00000000-0000-0000-0000-000000000000" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000000",
      tenantId: "00000000-0000-0000-0000-000000000000",
      phoneNumber: "+254700000000",
      email: "admin@example.com",
      displayName: "System Admin",
      role: "admin",
      metadata: { is_system_user: true },
    },
  });

  console.log("✅ Default user created:", defaultUser.displayName);

  // ============================================
  // 2. ENTITIES (CUSTOMERS & SUPPLIERS)
  // ============================================
  console.log("Creating entities...");

  const entities = await prisma.$transaction([
    prisma.entity.upsert({
      where: { id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890" },
      update: {},
      create: {
        id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        tenantId: "00000000-0000-0000-0000-000000000000",
        createdByUserId: defaultUser.id,
        type: EntityType.CUSTOMER,
        displayName: "John Kamau",
        phoneNumber: "+254712345678",
        metadata: { trust_score: 85, location: "Nairobi CBD" },
      },
    }),
    prisma.entity.upsert({
      where: { id: "b2c3d4e5-f6a7-8901-bcde-f23456789012" },
      update: {},
      create: {
        id: "b2c3d4e5-f6a7-8901-bcde-f23456789012",
        tenantId: "00000000-0000-0000-0000-000000000000",
        createdByUserId: defaultUser.id,
        type: EntityType.CUSTOMER,
        displayName: "Mary Wanjiku",
        phoneNumber: "+254723456789",
        metadata: { trust_score: 92, location: "Westlands" },
      },
    }),
    prisma.entity.upsert({
      where: { id: "c3d4e5f6-a7b8-9012-cdef-345678901234" },
      update: {},
      create: {
        id: "c3d4e5f6-a7b8-9012-cdef-345678901234",
        tenantId: "00000000-0000-0000-0000-000000000000",
        createdByUserId: defaultUser.id,
        type: EntityType.CUSTOMER,
        displayName: "Peter Ochieng",
        phoneNumber: "+254734567890",
        metadata: { trust_score: 78, location: "Eastleigh" },
      },
    }),
    prisma.entity.upsert({
      where: { id: "d4e5f6a7-b8c9-0123-defa-456789012345" },
      update: {},
      create: {
        id: "d4e5f6a7-b8c9-0123-defa-456789012345",
        tenantId: "00000000-0000-0000-0000-000000000000",
        createdByUserId: defaultUser.id,
        type: EntityType.SUPPLIER,
        displayName: "Tech Solutions Ltd",
        phoneNumber: "+254745678901",
        metadata: { business_type: "electronics", location: "Industrial Area" },
      },
    }),
    prisma.entity.upsert({
      where: { id: "e5f6a7b8-c9d0-1234-efab-567890123456" },
      update: {},
      create: {
        id: "e5f6a7b8-c9d0-1234-efab-567890123456",
        tenantId: "00000000-0000-0000-0000-000000000000",
        createdByUserId: defaultUser.id,
        type: EntityType.CUSTOMER,
        displayName: "Sarah Achieng",
        phoneNumber: "+254756789012",
        metadata: { trust_score: 88, location: "Karen" },
      },
    }),
  ]);

  console.log(`✅ Created ${entities.length} entities`);

  // ============================================
  // 3. SAMPLE TRANSACTIONS
  // ============================================
  console.log("Creating sample transactions...");

  // Transaction 1: Cash sale (POSTED)
  const txn1 = await prisma.transaction.upsert({
    where: { id: "11111111-1111-1111-1111-111111111111" },
    update: {},
    create: {
      id: "11111111-1111-1111-1111-111111111111",
      tenantId: "00000000-0000-0000-0000-000000000000",
      createdByUserId: defaultUser.id,
      entityId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      type: TxnType.RETAIL,
      currencyCode: "KES",
      totalAmount: 15000,
      status: TxnStatus.POSTED,
      paymentStatus: PaymentStatus.SETTLED,
      reference: "INV-001",
      metadata: {
        context: "Laptop accessories sale",
        tags: ["electronics", "cash"],
      },
      lines: {
        create: [
          {
            description: "Wireless Mouse",
            quantity: 2,
            unitPrice: 2500,
            totalLineAmount: 5000,
            accountCode: "SALES",
            sku: "MOUSE-001",
          },
          {
            description: "USB Cable",
            quantity: 5,
            unitPrice: 2000,
            totalLineAmount: 10000,
            accountCode: "SALES",
            sku: "CABLE-001",
          },
        ],
      },
    },
  });

  // Transaction 2: M-PESA sale (POSTED)
  const txn2 = await prisma.transaction.upsert({
    where: { id: "22222222-2222-2222-2222-222222222222" },
    update: {},
    create: {
      id: "22222222-2222-2222-2222-222222222222",
      tenantId: "00000000-0000-0000-0000-000000000000",
      createdByUserId: defaultUser.id,
      entityId: "b2c3d4e5-f6a7-8901-bcde-f23456789012",
      type: TxnType.RETAIL,
      currencyCode: "KES",
      totalAmount: 45000,
      status: TxnStatus.POSTED,
      paymentStatus: PaymentStatus.SETTLED,
      reference: "INV-002",
      metadata: {
        context: "Dell Laptop sale",
        tags: ["electronics", "laptop", "mpesa"],
      },
      lines: {
        create: [
          {
            description: "Dell Inspiron 15",
            quantity: 1,
            unitPrice: 45000,
            totalLineAmount: 45000,
            accountCode: "SALES",
            sku: "LAPTOP-DELL-001",
          },
        ],
      },
    },
  });

  // Transaction 3: Credit sale (POSTED - pending payment)
  const txn3 = await prisma.transaction.upsert({
    where: { id: "33333333-3333-3333-3333-333333333333" },
    update: {},
    create: {
      id: "33333333-3333-3333-3333-333333333333",
      tenantId: "00000000-0000-0000-0000-000000000000",
      createdByUserId: defaultUser.id,
      entityId: "c3d4e5f6-a7b8-9012-cdef-345678901234",
      type: TxnType.RETAIL,
      currencyCode: "KES",
      totalAmount: 8500,
      status: TxnStatus.POSTED,
      paymentStatus: PaymentStatus.PENDING,
      reference: "INV-003",
      metadata: {
        context: "Phone accessories on credit",
        tags: ["accessories", "credit"],
      },
      lines: {
        create: [
          {
            description: "Phone Case",
            quantity: 3,
            unitPrice: 1500,
            totalLineAmount: 4500,
            accountCode: "SALES",
            sku: "CASE-001",
          },
          {
            description: "Screen Protector",
            quantity: 2,
            unitPrice: 2000,
            totalLineAmount: 4000,
            accountCode: "SALES",
            sku: "SCREEN-001",
          },
        ],
      },
    },
  });

  // Transaction 4: DRAFT transaction (not posted yet)
  const txn4 = await prisma.transaction.upsert({
    where: { id: "44444444-4444-4444-4444-444444444444" },
    update: {},
    create: {
      id: "44444444-4444-4444-4444-444444444444",
      tenantId: "00000000-0000-0000-0000-000000000000",
      createdByUserId: defaultUser.id,
      entityId: "e5f6a7b8-c9d0-1234-efab-567890123456",
      type: TxnType.SERVICE,
      currencyCode: "KES",
      totalAmount: 12000,
      status: TxnStatus.DRAFT,
      paymentStatus: PaymentStatus.PENDING,
      reference: "INV-004",
      metadata: {
        context: "Computer repair service",
        tags: ["service", "repair"],
      },
      lines: {
        create: [
          {
            description: "Labor - Diagnostics",
            quantity: 1,
            unitPrice: 2000,
            totalLineAmount: 2000,
            accountCode: "SERVICE",
          },
          {
            description: "Labor - Repair",
            quantity: 1,
            unitPrice: 8000,
            totalLineAmount: 8000,
            accountCode: "SERVICE",
          },
          {
            description: "Replacement Parts",
            quantity: 1,
            unitPrice: 2000,
            totalLineAmount: 2000,
            accountCode: "PARTS",
          },
        ],
      },
    },
  });

  console.log("✅ Created 4 sample transactions");

  // ============================================
  // 4. SAMPLE PAYMENTS
  // ============================================
  console.log("Creating sample payments...");

  // Payment for Transaction 1 (CASH)
  const payment1 = await prisma.payment.upsert({
    where: { id: "55555555-5555-5555-5555-555555555555" },
    update: {},
    create: {
      id: "55555555-5555-5555-5555-555555555555",
      tenantId: "00000000-0000-0000-0000-000000000000",
      createdByUserId: defaultUser.id,
      amount: 15000,
      currencyCode: "KES",
      status: PaymentStatus.SETTLED,
      reference: "CASH-001",
      metadata: { method: "CASH", received_by: "Admin" },
    },
  });

  // Payment for Transaction 2 (M-PESA)
  const payment2 = await prisma.payment.upsert({
    where: { id: "66666666-6666-6666-6666-666666666666" },
    update: {},
    create: {
      id: "66666666-6666-6666-6666-666666666666",
      tenantId: "00000000-0000-0000-0000-000000000000",
      createdByUserId: defaultUser.id,
      amount: 45000,
      currencyCode: "KES",
      status: PaymentStatus.SETTLED,
      reference: "MPESA-S234567",
      metadata: {
        method: "MPESA",
        mpesa_code: "S234567",
        phone: "+254723456789",
      },
    },
  });

  console.log("✅ Created 2 sample payments");

  // ============================================
  // 5. PAYMENT APPLICATIONS
  // ============================================
  console.log("Creating payment applications...");

  await prisma.$transaction([
    prisma.paymentApplication.upsert({
      where: { id: "77777777-7777-7777-7777-777777777777" },
      update: {},
      create: {
        id: "77777777-7777-7777-7777-777777777777",
        paymentId: payment1.id,
        transactionId: txn1.id,
        appliedAmount: 15000,
      },
    }),
    prisma.paymentApplication.upsert({
      where: { id: "88888888-8888-8888-8888-888888888888" },
      update: {},
      create: {
        id: "88888888-8888-8888-8888-888888888888",
        paymentId: payment2.id,
        transactionId: txn2.id,
        appliedAmount: 45000,
      },
    }),
  ]);

  console.log("✅ Created payment applications");

  console.log("\n🎉 Database seed completed successfully!");
  console.log("\nSummary:");
  console.log(`- 1 default user created (ID: ${defaultUser.id})`);
  console.log(`- ${entities.length} entities created`);
  console.log("- 4 transactions created (3 POSTED, 1 DRAFT)");
  console.log("- 2 payments created");
  console.log("- 10 feature flags created");
  console.log(
    "- 1 dogfood tenant created (janders-dogfood) with full integrations",
  );
  console.log("\n✨ Your foreign key constraint issue is now FIXED!");
  console.log("   The default user exists, so entity creation will work.");
  console.log("\n🐕 Dogfood tenant ready for testing:");
  console.log("   Tenant ID: 11111111-1111-1111-1111-111111111111");
  console.log("   User ID: 22222222-2222-2222-2222-222222222222");
  console.log(
    "   Features: All integrations enabled (M-Pesa, WhatsApp, QuickBooks, Xero, Shopify)",
  );
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
