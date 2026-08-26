import 'dotenv/config';
import http from 'node:http';
import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Server } from 'socket.io';
import { PrismaClient, Priority, ProjectRole } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();
const app = express();
const httpServer = http.createServer(app);
const clientUrl = process.env.CLIENT_URL ?? 'http://localhost:5173';
const jwtSecret = process.env.JWT_SECRET ?? 'development-only-secret';
const io = new Server(httpServer, { cors: { origin: clientUrl, credentials: true } });
app.use(helmet());
app.use(cors({ origin: clientUrl, credentials: true }));
app.use(express.json({ limit: '100kb' }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: true }));

interface AuthRequest extends Request { user?: { id: string; email: string }; params: Record<string, string> }
const tokenFor = (user: { id: string; email: string }) => jwt.sign({ sub: user.id, email: user.email }, jwtSecret, { expiresIn: '7d' });
const auth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Authentication required' });
  try {
    const payload = jwt.verify(token, jwtSecret) as { sub: string; email: string };
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch { return res.status(401).json({ error: 'Invalid or expired token' }); }
};

const asyncRoute = (fn: (req: AuthRequest, res: Response) => Promise<unknown>) => (req: AuthRequest, res: Response, next: NextFunction) => Promise.resolve(fn(req, res)).catch(next);
const registerSchema = z.object({ name: z.string().trim().min(2).max(60), email: z.string().email().max(120), password: z.string().min(8).max(72) });
const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });
const projectSchema = z.object({ name: z.string().trim().min(2).max(80), description: z.string().trim().max(500).optional() });
const taskSchema = z.object({ title: z.string().trim().min(1).max(160), description: z.string().max(5000).optional(), priority: z.nativeEnum(Priority).optional(), dueDate: z.string().datetime().nullable().optional(), assigneeId: z.string().uuid().nullable().optional(), columnId: z.string().uuid().optional() });
const commentSchema = z.object({ body: z.string().trim().min(1).max(2000) });

async function membership(userId: string, projectId: string) { return prisma.projectMember.findUnique({ where: { userId_projectId: { userId, projectId } } }); }
async function logActivity(projectId: string, actorId: string, action: string, details?: string) { const activity = await prisma.activity.create({ data: { projectId, actorId, action, details } }); io.to(`project:${projectId}`).emit('activity:created', activity); return activity; }
async function notify(userId: string, type: 'TASK_ASSIGNED' | 'TASK_UPDATED' | 'COMMENT_ADDED' | 'PROJECT_INVITE', message: string) { const notification = await prisma.notification.create({ data: { userId, type, message } }); io.to(`user:${userId}`).emit('notification:created', notification); return notification; }

app.get('/health', async (_req, res, next) => { try { await prisma.$queryRaw`SELECT 1`; res.json({ status: 'ok', service: 'projectflow-api', database: 'ok', timestamp: new Date().toISOString() }); } catch (e) { next(e); } });
app.post('/api/auth/register', async (req, res, next) => { try { const input = registerSchema.parse(req.body); const email = input.email.toLowerCase(); const exists = await prisma.user.findUnique({ where: { email } }); if (exists) return res.status(409).json({ error: 'Email already registered' }); const passwordHash = await bcrypt.hash(input.password, 12); const user = await prisma.user.create({ data: { name: input.name, email, passwordHash } }); return res.status(201).json({ token: tokenFor(user), user: { id: user.id, name: user.name, email: user.email } }); } catch (e) { next(e); } });
app.post('/api/auth/login', async (req, res, next) => { try { const input = loginSchema.parse(req.body); const user = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } }); if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) return res.status(401).json({ error: 'Invalid email or password' }); return res.json({ token: tokenFor(user), user: { id: user.id, name: user.name, email: user.email } }); } catch (e) { next(e); } });
app.get('/api/auth/me', auth, asyncRoute(async (req, res) => { const user = await prisma.user.findUnique({ where: { id: req.user!.id }, select: { id: true, name: true, email: true } }); if (!user) return res.status(404).json({ error: 'User not found' }); res.json(user); }));

app.get('/api/projects', auth, asyncRoute(async (req, res) => { const projects = await prisma.project.findMany({ where: { members: { some: { userId: req.user!.id } } }, include: { members: { include: { user: { select: { id: true, name: true, email: true } } } }, _count: { select: { tasks: true } } }, orderBy: { updatedAt: 'desc' } }); res.json(projects); }));
app.post('/api/projects', auth, asyncRoute(async (req, res) => { const input = projectSchema.parse(req.body); const project = await prisma.project.create({ data: { ...input, members: { create: { userId: req.user!.id, role: ProjectRole.OWNER } }, columns: { create: [{ name: 'Todo', position: 0 }, { name: 'In Progress', position: 1 }, { name: 'Done', position: 2 }] } }, include: { members: true, columns: { orderBy: { position: 'asc' } } } }); await logActivity(project.id, req.user!.id, 'project.created', `Created ${project.name}`); res.status(201).json(project); }));
app.get('/api/projects/:projectId', auth, asyncRoute(async (req, res) => { const projectId = req.params.projectId; if (!(await membership(req.user!.id, projectId))) return res.status(403).json({ error: 'Project access denied' }); const project = await prisma.project.findUnique({ where: { id: projectId }, include: { members: { include: { user: { select: { id: true, name: true, email: true } } } }, columns: { orderBy: { position: 'asc' } }, tasks: { include: { assignee: { select: { id: true, name: true, email: true } }, creator: { select: { id: true, name: true } }, column: true, _count: { select: { comments: true } } }, orderBy: { position: 'asc' } } } }); if (!project) return res.status(404).json({ error: 'Project not found' }); res.json(project); }));
app.post('/api/projects/:projectId/members', auth, asyncRoute(async (req, res) => { const projectId = req.params.projectId; const requester = await membership(req.user!.id, projectId); if (!requester || (requester.role !== ProjectRole.OWNER && requester.role !== ProjectRole.ADMIN)) return res.status(403).json({ error: 'Admin access required' }); const input = z.object({ email: z.string().email(), role: z.nativeEnum(ProjectRole).optional() }).parse(req.body); const user = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } }); if (!user) return res.status(404).json({ error: 'User must register before being added' }); const member = await prisma.projectMember.upsert({ where: { userId_projectId: { userId: user.id, projectId } }, update: { role: input.role ?? ProjectRole.MEMBER }, create: { userId: user.id, projectId, role: input.role ?? ProjectRole.MEMBER }, include: { user: { select: { id: true, name: true, email: true } } } }); await notify(user.id, 'PROJECT_INVITE', 'You were added to a project'); io.to(`project:${projectId}`).emit('member:changed', member); res.status(201).json(member); }));

app.post('/api/projects/:projectId/tasks', auth, asyncRoute(async (req, res) => { const projectId = req.params.projectId; if (!(await membership(req.user!.id, projectId))) return res.status(403).json({ error: 'Project access denied' }); const input = taskSchema.parse(req.body); const column = input.columnId ? await prisma.boardColumn.findFirst({ where: { id: input.columnId, projectId } }) : await prisma.boardColumn.findFirst({ where: { projectId }, orderBy: { position: 'asc' } }); if (!column) return res.status(400).json({ error: 'Invalid board column' }); if (input.assigneeId && !(await membership(input.assigneeId, projectId))) return res.status(400).json({ error: 'Assignee is not a project member' }); const last = await prisma.task.findFirst({ where: { columnId: column.id }, orderBy: { position: 'desc' } }); const task = await prisma.task.create({ data: { title: input.title, description: input.description, priority: input.priority ?? Priority.MEDIUM, dueDate: input.dueDate ? new Date(input.dueDate) : null, columnId: column.id, projectId, creatorId: req.user!.id, assigneeId: input.assigneeId ?? null, position: (last?.position ?? 0) + 1 }, include: { assignee: { select: { id: true, name: true, email: true } }, column: true, creator: { select: { id: true, name: true } }, _count: { select: { comments: true } } } }); await logActivity(projectId, req.user!.id, 'task.created', `Created ${task.title}`); if (task.assigneeId && task.assigneeId !== req.user!.id) await notify(task.assigneeId, 'TASK_ASSIGNED', `You were assigned: ${task.title}`); io.to(`project:${projectId}`).emit('task:created', task); res.status(201).json(task); }));
app.patch('/api/tasks/:taskId', auth, asyncRoute(async (req, res) => { const taskId = req.params.taskId; const existing = await prisma.task.findUnique({ where: { id: taskId } }); if (!existing || !(await membership(req.user!.id, existing.projectId))) return res.status(404).json({ error: 'Task not found' }); const input = taskSchema.partial().extend({ position: z.number().optional() }).parse(req.body); if (input.columnId) { const valid = await prisma.boardColumn.findFirst({ where: { id: input.columnId, projectId: existing.projectId } }); if (!valid) return res.status(400).json({ error: 'Invalid board column' }); } if (input.assigneeId && !(await membership(input.assigneeId, existing.projectId))) return res.status(400).json({ error: 'Assignee is not a project member' }); const data: any = { ...input }; if (input.dueDate !== undefined) data.dueDate = input.dueDate ? new Date(input.dueDate) : null; const task = await prisma.task.update({ where: { id: taskId }, data, include: { assignee: { select: { id: true, name: true, email: true } }, column: true, creator: { select: { id: true, name: true } }, _count: { select: { comments: true } } } }); await logActivity(existing.projectId, req.user!.id, 'task.updated', `Updated ${task.title}`); if (task.assigneeId && task.assigneeId !== req.user!.id && task.assigneeId !== existing.assigneeId) await notify(task.assigneeId, 'TASK_ASSIGNED', `You were assigned: ${task.title}`); io.to(`project:${existing.projectId}`).emit('task:updated', task); res.json(task); }));

app.get('/api/tasks/:taskId/comments', auth, asyncRoute(async (req, res) => { const task = await prisma.task.findUnique({ where: { id: req.params.taskId }, select: { projectId: true } }); if (!task || !(await membership(req.user!.id, task.projectId))) return res.status(404).json({ error: 'Task not found' }); const comments = await prisma.comment.findMany({ where: { taskId: req.params.taskId }, include: { author: { select: { id: true, name: true } } }, orderBy: { createdAt: 'asc' } }); res.json(comments); }));
app.post('/api/tasks/:taskId/comments', auth, asyncRoute(async (req, res) => { const task = await prisma.task.findUnique({ where: { id: req.params.taskId } }); if (!task || !(await membership(req.user!.id, task.projectId))) return res.status(404).json({ error: 'Task not found' }); const input = commentSchema.parse(req.body); const comment = await prisma.comment.create({ data: { body: input.body, taskId: task.id, authorId: req.user!.id }, include: { author: { select: { id: true, name: true } } } }); await logActivity(task.projectId, req.user!.id, 'comment.created', `Commented on ${task.title}`); if (task.assigneeId && task.assigneeId !== req.user!.id) await notify(task.assigneeId, 'COMMENT_ADDED', `New comment on: ${task.title}`); io.to(`project:${task.projectId}`).emit('comment:created', { ...comment, taskId: task.id }); res.status(201).json(comment); }));
app.get('/api/projects/:projectId/activities', auth, asyncRoute(async (req, res) => { if (!(await membership(req.user!.id, req.params.projectId))) return res.status(403).json({ error: 'Project access denied' }); const activities = await prisma.activity.findMany({ where: { projectId: req.params.projectId }, include: { actor: { select: { id: true, name: true } } }, orderBy: { createdAt: 'desc' }, take: 50 }); res.json(activities); }));
app.get('/api/notifications', auth, asyncRoute(async (req, res) => { const notifications = await prisma.notification.findMany({ where: { userId: req.user!.id }, orderBy: { createdAt: 'desc' }, take: 50 }); res.json(notifications); }));
app.patch('/api/notifications/:id/read', auth, asyncRoute(async (req, res) => { const notification = await prisma.notification.updateMany({ where: { id: req.params.id, userId: req.user!.id }, data: { read: true } }); res.json({ updated: notification.count }); }));

io.use((socket, next) => { try { const token = socket.handshake.auth?.token; const payload = jwt.verify(token, jwtSecret) as { sub: string }; socket.data.userId = payload.sub; next(); } catch { next(new Error('Unauthorized')); } });
io.on('connection', (socket) => { socket.join(`user:${socket.data.userId}`); socket.on('project:join', async (projectId: string) => { if (await membership(socket.data.userId, projectId)) socket.join(`project:${projectId}`); }); socket.on('project:leave', (projectId: string) => socket.leave(`project:${projectId}`)); });

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => { if (err instanceof z.ZodError) return res.status(400).json({ error: 'Validation failed', details: err.issues }); console.error(err); res.status(500).json({ error: 'Internal server error' }); });
const port = Number(process.env.PORT ?? 4000);
httpServer.listen(port, () => console.log(`ProjectFlow API listening on :${port}`));
process.on('SIGINT', async () => { await prisma.$disconnect(); process.exit(0); });
process.on('SIGTERM', async () => { await prisma.$disconnect(); process.exit(0); });
