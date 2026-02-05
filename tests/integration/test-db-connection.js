const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log("Testing database connection...");
    const tenants = await prisma.tenant.findMany();
    console.log("Connected to database, found", tenants.length, "tenants");
    return true;
  } catch (error) {
    console.error("Database connection error:", error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

testConnection().then((success) => {
  if (success) {
    console.log("Database connection successful!");
    process.exit(0);
  } else {
    console.log("Database connection failed");
    process.exit(1);
  }
});
