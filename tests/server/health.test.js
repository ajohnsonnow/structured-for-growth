/**
 * Unit Tests: Health Endpoint and Server Configuration
 * Tests the core Express app setup and health check
 */
import { describe, it, expect, vi } from 'vitest';

vi.mock('../../server/models/database.js', () => ({
  initializeDatabase: vi.fn(),
  getDatabase: vi.fn(),
  query: vi.fn(() => []),
  queryOne: vi.fn(() => null),
  execute: vi.fn(() => ({ changes: 1, lastInsertRowid: 1 })),
  logActivity: vi.fn(),
  default: {
    initializeDatabase: vi.fn(),
    getDatabase: vi.fn(),
    query: vi.fn(() => []),
    queryOne: vi.fn(() => null),
    execute: vi.fn(() => ({ changes: 1, lastInsertRowid: 1 })),
    logActivity: vi.fn(),
  },
}));

vi.mock('../../server/controllers/contactController.js', () => ({
  sendContactEmail: vi.fn(),
}));

describe('Server Configuration', () => {
  it('should define required environment variables', () => {
    expect(process.env.JWT_SECRET).toBeDefined();
  });

  it('should be configured for test environment', () => {
    expect(process.env.NODE_ENV).toBe('test');
  });
});
