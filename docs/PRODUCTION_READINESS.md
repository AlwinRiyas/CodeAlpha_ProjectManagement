# Production Readiness

## Required before deployment

- [ ] Set a unique `JWT_SECRET` with at least 32 characters.
- [ ] Set `NODE_ENV=production`.
- [ ] Set `CLIENT_URL` to the exact deployed frontend origin.
- [ ] Use a managed PostgreSQL database and TLS-enabled `DATABASE_URL` where supported.
- [ ] Do not deploy the seeded demo credentials.
- [ ] Configure secrets through the deployment platform, not committed `.env` files.
- [ ] Run database migrations/push as part of the controlled deployment process.
- [ ] Run client and server builds successfully in CI.
- [ ] Verify `/health` after deployment.
- [ ] Verify registration, login, project access, task creation, comments, notifications and Socket.IO connectivity.
- [ ] Confirm CORS allows only the production frontend origin.
- [ ] Review rate limits against expected traffic.
- [ ] Configure application/database backups and a restore procedure.
- [ ] Add centralized logs and error monitoring.

## Security review

The API already uses authentication, project-membership checks, request validation, Helmet and rate limiting. Production deployment must additionally ensure secrets are strong and externalized, the frontend origin is restricted, and the seeded demo account is removed or disabled.

## Release gate

A release is production-ready only when CI is green and the manual smoke checklist above has been completed against the deployment environment.
