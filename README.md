# ProjectFlow

A full-stack collaborative project-management platform inspired by Trello and Asana. Built as CodeAlpha Task 3 with authentication, team projects, Kanban boards, task assignment, comments, notifications, and real-time updates.

## Stack

- Frontend: React, Vite, TypeScript, React Router, TanStack Query, Socket.IO Client
- Backend: Node.js, Express, TypeScript, Socket.IO, JWT, Zod
- Database: PostgreSQL with Prisma ORM
- Testing: Vitest
- DevOps: Docker Compose and GitHub Actions

## Core features

- Secure registration and login with hashed passwords and JWT access tokens
- Project creation and membership management
- Kanban boards with Todo, In Progress, and Done columns
- Task creation, editing, assignment, priority, due dates, and status changes
- Task comments and activity history
- In-app notifications
- Socket.IO real-time board/task/comment events
- Role-aware project access
- Health endpoint and structured API errors

## Local development

1. Install Node.js 20+ and PostgreSQL 16+.
2. Copy `server/.env.example` to `server/.env` and set `DATABASE_URL` and `JWT_SECRET`.
3. Run `npm install` in both `server` and `client`.
4. In `server`, run `npx prisma migrate dev` and `npm run db:seed`.
5. Start the API with `npm run dev` in `server`.
6. Start the UI with `npm run dev` in `client`.

The API defaults to `http://localhost:4000` and the UI to `http://localhost:5173`.

## Demo account

The seed creates:

- Email: `demo@projectflow.local`
- Password: `ProjectFlow123!`

Change demo credentials before using a deployed environment.

## Security notes

Secrets are environment variables and are never committed. Passwords are hashed with bcrypt, JWTs are validated server-side, request payloads are validated with Zod, and protected resources verify project membership before mutation.
