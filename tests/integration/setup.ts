import { config } from 'dotenv';

// Load environment variables for tests
config({ path: './api/.env' });

// Set test timeout
jest.setTimeout(30000);

// Global test setup
beforeAll(async () => {
  // Verify required environment variables
  const required = ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY'];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.warn(
      `Warning: Missing environment variables: ${missing.join(', ')}`
    );
    console.warn('Some tests may fail without proper database connection.');
  }
});

// Global test teardown
afterAll(async () => {
  // Cleanup if needed
});
