# Testing Strategy

## Commands

```bash
npm test
npm run build
npx prisma generate
```

## Current coverage

- Health endpoint state logic
- TypeScript compilation
- Prisma client generation
- Client production build
- CI database synchronization

## Before release

1. Run the complete test suite.
2. Run a clean production build.
3. Start PostgreSQL from the documented environment.
4. Run Prisma schema synchronization/migrations.
5. Seed a fresh database and verify the demo account.
6. Verify registration and login.
7. Verify project membership authorization.
8. Verify task assignment and status movement.
9. Verify comments and notifications.
10. Verify Socket.IO project updates with two browser sessions.
11. Confirm no secrets or local `.env` files are committed.
