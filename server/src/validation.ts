import { z } from 'zod';
import { Priority, ProjectRole } from '@prisma/client';

export const registerSchema = z.object({ name: z.string().trim().min(2).max(60), email: z.string().email().max(120), password: z.string().min(8).max(72) });
export const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });
export const projectSchema = z.object({ name: z.string().trim().min(2).max(80), description: z.string().trim().max(500).optional() });
export const taskSchema = z.object({ title: z.string().trim().min(1).max(160), description: z.string().max(5000).optional(), priority: z.nativeEnum(Priority).optional(), dueDate: z.string().datetime().nullable().optional(), assigneeId: z.string().uuid().nullable().optional(), columnId: z.string().uuid().optional() });
export const commentSchema = z.object({ body: z.string().trim().min(1).max(2000) });
export const memberSchema = z.object({ email: z.string().email(), role: z.nativeEnum(ProjectRole).optional() });
