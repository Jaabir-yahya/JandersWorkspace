import { config } from "dotenv";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { setupTestData, cleanupTestData } from "./test-data-setup";

// Load environment variables for tests
config({ path: "./api/.env" });

// Set test timeout
jest.setTimeout(30000);

// Global test setup
beforeAll(async () => {
  // Verify required environment variables
  const required = ["SUPABASE_URL"];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.warn(
      `Warning: Missing environment variables: ${missing.join(", ")}`,
    );
    console.warn("Some tests may fail without proper database connection.");
  }

  // Set up test data
  try {
    console.log("Setting up test data for integration tests...");
    await setupTestData();
    console.log("Test data setup completed");
  } catch (error) {
    console.warn("Failed to set up test data, tests may fail:", error);
  }
});

// Export a helper function to create test app with proper setup
export const createTestApp = async (AppModule: any) => {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix("api/v1");

  return app;
};

// Global test teardown
afterAll(async () => {
  // Clean up test data
  try {
    const testTenantId = "00000000-0000-0000-0000-000000000000";
    await cleanupTestData(testTenantId);
    console.log("Test data cleaned up");
  } catch (error) {
    console.warn("Failed to clean up test data:", error);
  }
});
