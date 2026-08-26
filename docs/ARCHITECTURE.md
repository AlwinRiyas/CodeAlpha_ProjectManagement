# Architecture

## Frontend

The React client owns authentication state, project navigation, Kanban rendering, task interactions, and Socket.IO event handling.

## API

Express exposes REST endpoints for authentication, projects, members, tasks, comments, activity, and notifications. Protected routes validate the JWT and verify project membership before allowing project mutations.

## Real-time layer

Socket.IO authenticates clients with the same JWT. Users join a private notification room and authorized clients can join project rooms. Task, comment, activity, membership, and notification events are emitted to the appropriate room.

## Data layer

Prisma provides typed access to PostgreSQL. Projects own columns and tasks; users connect to projects through memberships and tasks through assignment/creation relationships.

## Security boundary

```text
Browser
  │
  ├── JWT
  │
  ▼
Express / Socket.IO
  │
  ├── authentication
  ├── validation
  ├── membership authorization
  ├── rate limiting
  └── security headers
  │
  ▼
Prisma
  │
  ▼
PostgreSQL
```
