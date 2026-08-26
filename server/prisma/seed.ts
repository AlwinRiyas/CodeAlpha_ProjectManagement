import { PrismaClient, Priority, ProjectRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('ProjectFlow123!', 12);
  const demo = await prisma.user.upsert({ where: { email: 'demo@projectflow.local' }, update: {}, create: { name: 'Demo User', email: 'demo@projectflow.local', passwordHash } });
  const teammate = await prisma.user.upsert({ where: { email: 'teammate@projectflow.local' }, update: {}, create: { name: 'Demo Teammate', email: 'teammate@projectflow.local', passwordHash } });

  let project = await prisma.project.findFirst({ where: { name: 'ProjectFlow Demo' } });
  if (!project) {
    project = await prisma.project.create({ data: {
      name: 'ProjectFlow Demo', description: 'A seeded collaborative workspace for testing the full workflow.',
      members: { create: [{ userId: demo.id, role: ProjectRole.OWNER }, { userId: teammate.id, role: ProjectRole.MEMBER }] },
      columns: { create: [{ name: 'Todo', position: 0 }, { name: 'In Progress', position: 1 }, { name: 'Done', position: 2 }] }
    } });
  }
  const columns = await prisma.boardColumn.findMany({ where: { projectId: project.id }, orderBy: { position: 'asc' } });
  const existing = await prisma.task.count({ where: { projectId: project.id } });
  if (existing === 0) {
    await prisma.task.createMany({ data: [
      { title: 'Plan product requirements', description: 'Define the MVP scope and acceptance criteria.', priority: Priority.HIGH, projectId: project.id, columnId: columns[0].id, creatorId: demo.id, assigneeId: teammate.id, position: 1 },
      { title: 'Build authentication flow', description: 'Register, login, JWT validation, and protected routes.', priority: Priority.URGENT, projectId: project.id, columnId: columns[1].id, creatorId: demo.id, assigneeId: demo.id, position: 1 },
      { title: 'Write project documentation', description: 'Document setup, architecture, security, and deployment.', priority: Priority.MEDIUM, projectId: project.id, columnId: columns[2].id, creatorId: demo.id, assigneeId: demo.id, position: 1 }
    ] });
  }
  console.log('Seed complete:', { demo: demo.email, project: project.name });
}

main().finally(() => prisma.$disconnect());
