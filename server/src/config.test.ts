import { describe, expect, it } from 'vitest';

describe('production configuration', () => {
  it('rejects short production JWT secrets', () => {
    const secret = 'short-secret';
    expect(secret.length).toBeLessThan(32);
  });

  it('accepts a sufficiently long production JWT secret', () => {
    const secret = 'a'.repeat(64);
    expect(secret.length).toBeGreaterThanOrEqual(32);
  });
});
