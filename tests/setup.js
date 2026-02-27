/**
 * Vitest Global Test Setup
 * Initializes test environment, mocks, and utilities
 */
import { afterEach, vi } from 'vitest';
import { TEST_SECRETS } from './fixtures.js';

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = TEST_SECRETS.jwtSecret;
process.env.PORT = '0'; // Use random available port

// Suppress console output during tests unless debugging
if (!process.env.DEBUG_TESTS) {
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
}

afterEach(() => {
  vi.restoreAllMocks();
});
