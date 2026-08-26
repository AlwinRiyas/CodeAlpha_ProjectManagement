# ProjectFlow

> A full-stack collaborative project-management platform for teams to plan work, assign tasks, communicate inside tasks, and track progress in real time.

**CodeAlpha — Task 3: Project Management Tool**

## What it does

ProjectFlow is a Trello/Asana-style workspace built around projects, team membership, Kanban task management, comments, notifications, and live updates.

### Core capabilities

- 🔐 Registration, login, JWT authentication, and bcrypt password hashing
- 👥 Project membership with owner/admin/member roles
- 📋 Kanban boards with Todo, In Progress, and Done columns
- 🎯 Task creation, assignment, priorities, due dates, and status changes
- 💬 Task-level comments and activity history
- 🔔 In-app notifications for assignments and comments
- ⚡ Socket.IO events for live project, task, comment, and notification updates
- 🛡️ Zod validation, Helmet security headers, rate limiting, CORS, and authorization checks
- 🐘 PostgreSQL persistence through Prisma ORM
- 🐳 Docker Compose development environment
- 🤖 GitHub Actions CI for client and server builds

## Architecture

```text
React + Vite + TypeScript
          │
          │ REST / Socket.IO
          ▼
Node.js + Express + Socket.IO
          │
          │ Prisma ORM
          ▼
     PostgreSQL
```

## Technology

| Layer | Technology |
|---|---|
| Frontend | React, Vite, TypeScript, Socket.IO Client |
| Backend | Node.js, Express, TypeScript, Socket.IO |
| Authentication | JWT + bcrypt |
| Validation | Zod |
| Database | PostgreSQL + Prisma |
| Testing | Vitest |
| DevOps | Docker Compose + GitHub Actions |

## Repository structure

```text
CodeAlpha_ProjectManagement/
├── client/                  # React/Vite application
│   └── src/
├── server/                  # Express API + Socket.IO
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── src/
├── .github/workflows/       # CI pipeline
├── docker-compose.yml
├── CONTRIBUTING.md
└── SECURITY.md
```

## Quick start

### Option A — local Node + PostgreSQL

Requirements:

- Node.js 20+
- PostgreSQL 16+
- npm

1. Clone the repository.
2. Create `server/.env` from `server/.env.example`.
3. Set `DATABASE_URL` and a strong `JWT_SECRET`.
4. Install dependencies:

```bash
cd server
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

In another terminal:

```bash
cd client
npm install
npm run dev
```

Open `http://localhost:5173`.

### Option B — Docker PostgreSQL

From the repository root:

```bash
docker compose up -d postgres
```

Then run the server and client using the local commands above.

> The full application can also be containerized with the included server Dockerfile. For production, use a managed PostgreSQL service and production secrets rather than the development credentials in `docker-compose.yml`.

## Environment

### Server

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/projectflow?schema=public"
JWT_SECRET="replace-with-a-long-random-secret"
CLIENT_URL="http://localhost:5173"
PORT=4000
```

### Client

```env
VITE_API_URL="http://localhost:4000"
```

Never commit real `.env` files or production secrets.

## Demo account

The seed includes:

```text
Email:    demo@projectflow.local
Password: ProjectFlow123!
```

Change or remove these credentials before any public deployment.

## API overview

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Register a user |
| POST | `/api/auth/login` | Authenticate a user |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/projects` | List user's projects |
| POST | `/api/projects` | Create a project |
| GET | `/api/projects/:projectId` | Get board and members |
| POST | `/api/projects/:projectId/members` | Add a member |
| POST | `/api/projects/:projectId/tasks` | Create a task |
| PATCH | `/api/tasks/:taskId` | Update a task |
| GET | `/api/tasks/:taskId/comments` | List comments |
| POST | `/api/tasks/:taskId/comments` | Add a comment |
| GET | `/api/projects/:projectId/activities` | View activity history |
| GET | `/api/notifications` | List notifications |
| PATCH | `/api/notifications/:id/read` | Mark notification read |
| GET | `/health` | API health check |

## Development workflow

```text
main
 ↑
development
 ↑
feature/*  /  fix/*
```

`main` is the stable branch. Active work is integrated into `development`, and focused changes should use feature/fix branches before being merged into `development`.

## Security

ProjectFlow applies authentication and authorization at the API layer. Passwords are hashed, request bodies are validated, protected resources verify project membership, and common HTTP hardening/rate limiting are enabled.

See [`SECURITY.md`](SECURITY.md) for the vulnerability-reporting policy and deployment security checklist.

## CI

GitHub Actions builds the backend against PostgreSQL and builds the frontend on every push to `main`/`development` and on pull requests targeting `main`.

## License

This project is developed as a CodeAlpha internship project and is intended primarily for portfolio and educational use.
