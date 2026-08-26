# Phase 7 — Quality Engineering

Phase 7 makes testing a release requirement instead of an optional development step.

## Completed in this phase foundation

- Reusable request-validation schemas
- Registration/login validation tests
- Project/task/comment validation tests
- API error-contract regression tests
- QA coverage matrix
- Clean local smoke-test procedure
- CI remains responsible for server/client production builds and database setup

## Remaining integration work

The application needs live PostgreSQL-backed tests for authenticated routes and Socket.IO behavior. These cannot honestly be marked passing until they execute against an isolated test database.

## Exit criteria

- `npm ci`
- `npx prisma generate`
- `npm test`
- `npm run build`
- client `npm run build`
- database-backed integration suite passes
- Socket.IO authorization/event suite passes
- manual smoke test passes
- no release-blocking failures remain
