import { PrismaClient, TxnStatus, PaymentStatus, TxnType, EntityType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting Core Tenants Seed (Manual & Innovation)...');

    // ============================================
    // 1. MANUAL TENANT: Kibuye Market Traders
    // ============================================
    console.log('Creating Manual Tenant (Kibuye Market Traders)...');
    const manualTenant = await prisma.tenant.upsert({
        where: { slug: 'kibuye-traders' },
        update: {},
        create: {
            name: 'Kibuye Market Traders',
            slug: 'kibuye-traders',
            tier: 'BASIC',
            country: 'KE',
            isActive: true,
            settings: {
                features: {
                    manual_transactions: true, // Only core manual features
                    entity_management: true,
                    payment_records: true,
                    dashboard: false, // Explicitly disabled smart dashboard (will use Manual Dashboard)
                },
            },
        },
    });
    console.log('✅ Manual Tenant created:', manualTenant.name);

    // ============================================
    // 2. INNOVATION TENANT: Janders Tech
    // ============================================
    console.log('Creating Innovation Tenant (Janders Tech)...');
    const innovationTenant = await prisma.tenant.upsert({
        where: { slug: 'janders-tech' },
        update: {},
        create: {
            name: 'Janders Tech',
            slug: 'janders-tech',
            tier: 'PREMIUM',
            country: 'KE',
            isActive: true,
            settings: {
                features: {
                    manual_transactions: true,
                    entity_management: true,
                    payment_records: true,
                    dashboard: true, // Smart dashboard allowed
                    mpesa_integration: true,
                    advanced_analytics: true,
                },
            },
        },
    });
    console.log('✅ Innovation Tenant created:', innovationTenant.name);

    // ============================================
    // 3. USER SETUP: jaabir_yahyaz@icloud.com
    // ============================================
    const userEmail = 'jaabir_yahyaz@icloud.com';
    console.log(`Setting up user ${userEmail} for both tenants...`);

    // Manual Tenant User
    const manualUser = await prisma.user.upsert({
        where: {
            tenantId_email: {
                tenantId: manualTenant.id,
                email: userEmail,
            },
        },
        update: {}, // Don't overwrite if exists
        create: {
            email: userEmail,
            tenantId: manualTenant.id,
            displayName: 'Jaabir (Trader)',
            role: 'ADMIN',
            isActive: true,
            metadata: { context: 'Manual Data Entry Focus' },
        },
    });
    console.log('✅ User created in Manual Tenant');

    // Innovation Tenant User
    const innovationUser = await prisma.user.upsert({
        where: {
            tenantId_email: {
                tenantId: innovationTenant.id,
                email: userEmail,
            },
        },
        update: {},
        create: {
            email: userEmail,
            tenantId: innovationTenant.id,
            displayName: 'Jaabir (Tech)',
            role: 'ADMIN',
            isActive: true,
            metadata: { context: 'Innovation/Admin Focus' },
        },
    });
    console.log('✅ User created in Innovation Tenant');

    // ============================================
    // 4. TRUTH DATA SEEDING (Manual Tenant)
    // ============================================
    console.log('Seeding Truth Data for Manual Tenant...');

    // 4a. ENTITIES (The People/Truth)
    const supplier = await prisma.entity.create({
        data: {
            tenantId: manualTenant.id,
            createdByUserId: manualUser.id,
            entityType: EntityType.SUPPLIER,
            displayName: 'Mama Mboga Wholesale',
            phoneNumber: '+254700111222',
            systemTags: 'SUPPLIER,WHOLESALE',
            customTags: '',
            metadata: { notes: 'Main supplier for fresh produce' },
        },
    });

    const customerCredit = await prisma.entity.create({
        data: {
            tenantId: manualTenant.id,
            createdByUserId: manualUser.id,
            entityType: EntityType.CUSTOMER,
            displayName: 'Omondi Fixer',
            phoneNumber: '+254700333444',
            creditLimit: 5000,
            systemTags: 'CUSTOMER,LOCAL',
            customTags: '',
            metadata: { notes: 'Takes items on credit frequently' },
        },
    });

    console.log('✅ Entities created (Supplier & Credit Customer)');

    // 4b. TRANSACTIONS (The Movement of Money)

    // 1. Valid Expense (Paid Cash to Supplier)
    await prisma.transaction.create({
        data: {
            tenantId: manualTenant.id,
            createdByUserId: manualUser.id,
            entityId: supplier.id,
            type: TxnType.EXPENSE,
            totalAmount: 3500,
            status: TxnStatus.POSTED,
            paymentStatus: PaymentStatus.SETTLED, // Paid immediately
            reference: 'EXP-001',
            metadata: { description: 'Restock Tomatoes' },
            lines: {
                create: [
                    {
                        description: 'Crate of Tomatoes',
                        quantity: 1,
                        unitPrice: 3500,
                        totalLineAmount: 3500,
                        lineTotal: 3500,
                    }
                ]
            }
        }
    });

    // 2. Credit Sale (Goods given to Omondi, not paid yet) - THE TRUTH OF DEBT
    await prisma.transaction.create({
        data: {
            tenantId: manualTenant.id,
            createdByUserId: manualUser.id,
            entityId: customerCredit.id,
            type: TxnType.RETAIL,
            totalAmount: 1200,
            status: TxnStatus.POSTED,
            paymentStatus: PaymentStatus.PENDING, // Not paid!
            reference: 'SALE-CREDIT-001',
            metadata: { description: 'Taken lunch and airtime', is_credit: true },
            lines: {
                create: [
                    {
                        description: 'Lunch Pack',
                        quantity: 2,
                        unitPrice: 500,
                        totalLineAmount: 1000,
                        lineTotal: 1000,
                    },
                    {
                        description: 'Safaricom Airtime',
                        quantity: 2,
                        unitPrice: 100,
                        totalLineAmount: 200,
                        lineTotal: 200,
                    }
                ]
            }
        }
    });

    console.log('✅ Transactions seeded: Expense (Paid) & Sale (Credit/Debt)');
    console.log('\n✨ Core Tenants Seed Completed!');
}

main()
    .catch((e) => {
        console.error('❌ Core Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
