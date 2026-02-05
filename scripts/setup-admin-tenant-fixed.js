#!/usr/bin/env node

const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");

const prisma = new PrismaClient();

async function setupAdminTenant() {
  try {
    console.log("🏗️  Setting up Admin Tenant...");

    const adminTenant = await prisma.tenant.upsert({
      where: { slug: "admin" },
      update: { name: "Admin System", tier: "ENTERPRISE" },
      create: {
        name: "Admin System",
        slug: "admin",
        tier: "ENTERPRISE",
        country: "KE",
        isActive: true,
      },
    });

    console.log("✅ Admin Tenant created:", adminTenant.name);

    const apiKey = crypto.randomBytes(32).toString("hex");
    const apiKeyHash = crypto.createHash("sha256").update(apiKey).digest("hex");

    await prisma.tenant.update({
      where: { id: adminTenant.id },
      data: { apiKeyHash },
    });

    console.log("🔑 API Key generated:", apiKey);

    const adminUser = await prisma.user.upsert({
      where: {
        tenantId_email: {
          tenantId: adminTenant.id,
          email: "admin@nairobi-commerce.ledger",
        },
      },
      update: {
        displayName: "System Administrator",
        phoneNumber: "+254700000000",
        isActive: true,
        role: "ADMIN",
      },
      create: {
        tenantId: adminTenant.id,
        email: "admin@nairobi-commerce.ledger",
        displayName: "System Administrator",
        phoneNumber: "+254700000000",
        isActive: true,
        role: "ADMIN",
      },
    });

    console.log("👤 Admin User created:", adminUser.displayName);

    console.log("\n🎉 Admin Tenant Setup Complete!");
    console.log("\n📋 Login Details:");
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   API Key: ${apiKey}`);
    console.log(`   Tenant Slug: ${adminTenant.slug}`);
  } catch (error) {
    console.error("❌ Error setting up admin tenant:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  setupAdminTenant();
}

module.exports = { setupAdminTenant };
