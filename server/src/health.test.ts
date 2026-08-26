import { describe, expect, it } from 'vitest';
import { healthSnapshot } from './health.js';

describe('healthSnapshot', () => {
  it('reports a healthy service when the database is reachable', () => {
    expect(healthSnapshot(true)).toMatchObject({
      status: 'ok',
      service: 'projectflow-api',
      database: 'ok',
    });
  });

  it('reports degraded state when the database is unavailable', () => {
    expect(healthSnapshot(false)).toMatchObject({
      status: 'degraded',
      database: 'unavailable',
    });
  });
});
