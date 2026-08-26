# Final Release — ProjectFlow

## Release gate

ProjectFlow is now consolidated on the `development` branch after the production-readiness and quality-engineering phases.

### Final checks

- Server test suite passes locally with Vitest.
- Prisma client generation is verified.
- PostgreSQL schema is synchronized with the current Prisma schema.
- Production configuration and API error handling are covered by the existing QA checks.
- Client and server builds are defined in the CI workflow.
- Authentication, projects, tasks, comments, members and notifications are connected to the API.
- Socket.IO is used for live task and notification updates.
- Global Home, My Work, Calendar and Inbox navigation is implemented in the client.
- The authentication screen received a final visual polish without changing the authentication flow.

## Local release verification

```powershell
cd server
npm ci
npx prisma generate
npm test
npx prisma db push
npm run dev
```

In a second terminal:

```powershell
cd client
npm ci
npm run build
npm run dev
```

Then verify `http://localhost:5173` and the API health endpoint at `http://localhost:4000/health`.

## Branch flow

`development` is the integration branch for the completed ProjectFlow implementation. The earlier phase branch remains available as release history.
