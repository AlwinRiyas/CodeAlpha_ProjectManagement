import { describe, expect, it } from 'vitest';
import { Priority } from '@prisma/client';
import { commentSchema, loginSchema, projectSchema, registerSchema, taskSchema } from './validation.js';

describe('registration validation', () => {
  it('accepts a valid registration payload', () => {
    expect(registerSchema.safeParse({ name: 'Alwin', email: 'alwin@example.com', password: 'StrongPass123!' }).success).toBe(true);
  });
  it('rejects short passwords', () => {
    expect(registerSchema.safeParse({ name: 'Alwin', email: 'alwin@example.com', password: 'short' }).success).toBe(false);
  });
  it('rejects invalid email addresses', () => {
    expect(registerSchema.safeParse({ name: 'Alwin', email: 'not-an-email', password: 'StrongPass123!' }).success).toBe(false);
  });
});

describe('login validation', () => {
  it('rejects an empty password', () => {
    expect(loginSchema.safeParse({ email: 'alwin@example.com', password: '' }).success).toBe(false);
  });
});

describe('project validation', () => {
  it('trims and accepts valid project input', () => {
    const result = projectSchema.safeParse({ name: '  ProjectFlow  ', description: 'Team workspace' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.name).toBe('ProjectFlow');
  });
  it('rejects an empty project name', () => {
    expect(projectSchema.safeParse({ name: ' ' }).success).toBe(false);
  });
});

describe('task validation', () => {
  it('accepts a valid task', () => {
    expect(taskSchema.safeParse({ title: 'Ship release', priority: Priority.HIGH }).success).toBe(true);
  });
  it('rejects an empty title', () => {
    expect(taskSchema.safeParse({ title: '' }).success).toBe(false);
  });
});

describe('comment validation', () => {
  it('rejects blank comments', () => {
    expect(commentSchema.safeParse({ body: '   ' }).success).toBe(false);
  });
  it('rejects comments over the maximum length', () => {
    expect(commentSchema.safeParse({ body: 'x'.repeat(2001) }).success).toBe(false);
  });
});
