/**
 * Test Setup File
 * ============================================================================
 * Global setup for all tests. Sets up environment variables and mocks.
 * ============================================================================
 */

// Set up test environment variables
process.env.NODE_ENV = 'test';
process.env.ENCRYPTION_KEY = 'a'.repeat(64);
process.env.SUPABASE_URL = 'https://test-project.supabase.co';
process.env.SUPABASE_ANON_KEY = 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';

// Suppress console output during tests (optional)
// Uncomment to reduce noise during test runs
// console.log = () => {};
// console.warn = () => {};
// console.error = () => {};
