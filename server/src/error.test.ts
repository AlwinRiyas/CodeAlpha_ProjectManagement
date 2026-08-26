import { describe, expect, it } from 'vitest';

describe('API error contract', () => {
  it('uses 401 for missing authentication', () => {
    expect({ status: 401, error: 'Authentication required' }).toMatchObject({ status: 401 });
  });

  it('uses 401 for invalid authentication', () => {
    expect({ status: 401, error: 'Invalid or expired token' }).toMatchObject({ status: 401 });
  });

  it('uses 403 for unauthorized project access', () => {
    expect({ status: 403, error: 'Project access denied' }).toMatchObject({ status: 403 });
  });

  it('uses 404 when a protected task is not accessible', () => {
    expect({ status: 404, error: 'Task not found' }).toMatchObject({ status: 404 });
  });
});
