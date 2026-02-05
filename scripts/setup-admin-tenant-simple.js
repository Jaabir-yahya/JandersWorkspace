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
      },
      create: {
        name: "Admin System",
        slug: "admin",
        tier: "ENTERPRISE",
        country: "KE",
        isActive: true,
      },
    });

    console.log("✅ Admin Tenant created:", adminTenant.name);

    // 2. Generate API Key
    const apiKey = crypto.randomBytes(32).toString("hex");
    const apiKeyHash = crypto.createHash("sha256").update(apiKey).digest("hex");

    await prisma.tenant.update({
      where: { id: adminTenant.id },
      data: { apiKeyHash },
    });

    console.log("🔑 API Key generated:", apiKey);

    // 3. Create Admin User
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
        role: "ADMIN"
      },
      create: {
        tenantId: adminTenant.id,
        email: "admin@nairobi-commerce.ledger",
        displayName: "System Administrator",
        phoneNumber: "+254700000000",
        isActive: true,
        role: "ADMIN"
      }
}

// Run if called directly
if (require.main === module) {
  setupAdminTenant();
}

module.exports = { setupAdminTenant };
