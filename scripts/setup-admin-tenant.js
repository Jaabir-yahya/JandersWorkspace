#!/usr/bin/env node

/**
 * Admin Tenant Setup Script
 * Creates an admin tenant with API keys and sample data for testing
 */

const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");

const prisma = new PrismaClient();

async function setupAdminTenant() {
  try {
    console.log("🏗️  Setting up Admin Tenant...");

    // 1. Create Admin Tenant
    const adminTenant = await prisma.tenant.upsert({
      where: { slug: "admin" },
      update: {
        name: "Admin System",
        tier: "ENTERPRISE",
        settings: {
          features: {
            universal_truth: true,
            multi_tenant: true,
            advanced_reporting: true,
            api_access: true
          }
        }
      },
      create: {
        name: "Admin System",
        slug: "admin",
        tier: "ENTERPRISE",
        country: "KE",
        isActive: true,
        settings: {
          features: {
            universal_truth: true,
            multi_tenant: true,
            advanced_reporting: true,
            api_access: true
          }
        }
      }
    });

      console.log(
        `📝 Transaction Reason created: ${reason.name} (${reason.type})`,
      );
    }

    // 6. Create Sample Entities
    const entities = [
      {
        name: "Sample Customer",
        phone: "+254711111111",
        email: "customer@example.com",
        type: "CUSTOMER",
      },
      {
        name: "Sample Supplier",
        phone: "+254722222222",
        email: "supplier@example.com",
        type: "SUPPLIER",
      },
    ];

    for (const entityData of entities) {
      const entity = await prisma.entity.upsert({
        where: {
          tenantId_phone: {
            tenantId: adminTenant.id,
            phone: entityData.phone,
          },
        },
        update: {
          name: entityData.name,
          email: entityData.email,
          entityType: entityData.type,
          isActive: true,
        },
        create: {
          tenantId: adminTenant.id,
          name: entityData.name,
          phone: entityData.phone,
          email: entityData.email,
          entityType: entityData.type,
          isActive: true,
          createdByUserId: adminUser.id,
        },
      });

      console.log(`🏪 Entity created: ${entity.name} (${entity.entityType})`);
    }

    // 7. Create Sample Transactions
    const cashAccount = await prisma.account.findFirst({
      where: { tenantId: adminTenant.id, type: "CASH" },
    });

    const bankAccount = await prisma.account.findFirst({
      where: { tenantId: adminTenant.id, type: "BANK" },
    });

    const salesReason = await prisma.transactionReason.findFirst({
      where: { tenantId: adminTenant.id, name: "Sales Revenue" },
    });

    if (cashAccount && bankAccount && salesReason) {
      const sampleTransaction = await prisma.transaction.create({
        data: {
          tenantId: adminTenant.id,
          fromAccountId: cashAccount.id,
          toAccountId: bankAccount.id,
          amount: 10000,
          date: new Date(),
          reasonId: salesReason.id,
          notes: "Sample sales revenue deposit",
          reference: "DEMO-001",
          createdByUserId: adminUser.id,
          status: "COMPLETED",
          type: "RETAIL",
          paymentStatus: "PAID",
        },
      });

      console.log(
        `💸 Sample transaction created: ${sampleTransaction.reference}`,
      );
    }

    console.log("\n🎉 Admin Tenant Setup Complete!");
    console.log("\n📋 Login Details:");
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Password: ${adminPassword}`);
    console.log(`   API Key: ${apiKey}`);
    console.log(`   Tenant Slug: ${adminTenant.slug}`);

    console.log("\n🔗 URLs:");
    console.log(`   Frontend: http://localhost:3000`);
    console.log(`   API: http://localhost:3001`);
    console.log(`   API Docs: http://localhost:3001/docs`);
  } catch (error) {
    console.error("❌ Error setting up admin tenant:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  setupAdminTenant();
}

module.exports = { setupAdminTenant };
