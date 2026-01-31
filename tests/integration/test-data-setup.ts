import { PrismaClient } from "@prisma/client";
import { TxnType, EntityType, TxnStatus, PaymentStatus } from "@prisma/client";

const prisma = new PrismaClient();

export async function setupTestData() {
  console.log("Setting up test data...");

  const testTenantId = "00000000-0000-0000-0000-000000000000";
  const testUserId = "00000000-0000-0000-0000-000000000000";

  try {
    // Clean up existing test data
    await cleanupTestData(testTenantId);

    // Create test user
    const testUser = await prisma.user.upsert({
      where: {
        tenantId_phoneNumber: {
          tenantId: testTenantId,
          phoneNumber: "+254700000000",
        },
      },
      update: {},
      create: {
        id: testUserId,
        tenantId: testTenantId,
        phoneNumber: "+254700000000",
        displayName: "Test User",
        role: "admin",
      },
    });

    // Create test entity (customer) with fixed ID for tests
    const testEntityId = "d60c9094-6df2-47fe-9a35-864455e75a87";
    const testEntity = await prisma.entity.upsert({
      where: { id: testEntityId },
      update: {},
      create: {
        id: testEntityId,
        tenantId: testTenantId,
        type: EntityType.CUSTOMER,
        displayName: "Test Customer",
        phoneNumber: "+254711111111",
        createdByUserId: testUser.id,
      },
    });

    // Create some test transactions
    const testTransactions = await Promise.all([
      prisma.transaction.create({
        data: {
          tenantId: testTenantId,
          entityId: testEntity.id,
          reference: "TEST-RETAIL-001",
          status: TxnStatus.POSTED,
          type: TxnType.RETAIL,
          paymentStatus: PaymentStatus.SETTLED,
          totalAmount: 15000, // 2 * 5000 + 1 * 8000
          currencyCode: "KES",
          createdByUserId: testUser.id,
          lines: {
            create: [
              {
                description: "Nike Shoes",
                sku: "NIKE-001",
                quantity: 2,
                unitPrice: 5000,
                totalLineAmount: 10000,
                accountCode: "200-SALES",
              },
              {
                description: "Adidas Jacket",
                sku: "ADIDAS-002",
                quantity: 1,
                unitPrice: 8000,
                totalLineAmount: 8000,
                accountCode: "200-SALES",
              },
            ],
          },
        },
      }),
      prisma.transaction.create({
        data: {
          tenantId: testTenantId,
          entityId: testEntity.id,
          reference: "TEST-SERVICE-001",
          status: TxnStatus.POSTED,
          type: TxnType.SERVICE,
          paymentStatus: PaymentStatus.SETTLED,
          totalAmount: 10000, // 4 * 2500
          currencyCode: "KES",
          createdByUserId: testUser.id,
          lines: {
            create: [
              {
                description: "DJ Consultation",
                quantity: 4,
                unitPrice: 2500,
                totalLineAmount: 10000,
                accountCode: "300-SERVICE-INCOME",
              },
            ],
          },
        },
      }),
      prisma.transaction.create({
        data: {
          tenantId: testTenantId,
          entityId: testEntity.id,
          reference: "TEST-RENTAL-001",
          status: TxnStatus.POSTED,
          type: TxnType.RENTAL,
          paymentStatus: PaymentStatus.PENDING,
          totalAmount: 10500, // 7 * 1500
          currencyCode: "KES",
          createdByUserId: testUser.id,
          lines: {
            create: [
              {
                description: "Canon EOS Camera",
                quantity: 7,
                unitPrice: 1500,
                totalLineAmount: 10500,
                accountCode: "400-RENTAL-INCOME",
              },
            ],
          },
        },
      }),
    ]);

    console.log("Test data created successfully!");
    console.log(`User ID: ${testUser.id}`);
    console.log(`Entity ID: ${testEntity.id}`);
    console.log(`Created ${testTransactions.length} transactions`);

    return {
      user: testUser,
      entity: testEntity,
      transactions: testTransactions,
    };
  } catch (error) {
    console.error("Error setting up test data:", error);
    throw error;
  }
}

export async function cleanupTestData(tenantId: string) {
  console.log(`Cleaning up test data for tenant: ${tenantId}`);

  // Delete in order of dependencies
  await prisma.transactionLine.deleteMany({
    where: {
      transaction: {
        tenantId: tenantId,
      },
    },
  });

  await prisma.transaction.deleteMany({
    where: { tenantId },
  });

  await prisma.entity.deleteMany({
    where: { tenantId },
  });

  await prisma.user.deleteMany({
    where: { tenantId },
  });

  console.log("Test data cleaned up");
}

// If this file is run directly
if (require.main === module) {
  setupTestData()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
