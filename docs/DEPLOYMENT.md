# Deployment Guide

## Production requirements

- Node.js 20+
- PostgreSQL 16+
- HTTPS reverse proxy
- Strong JWT secret stored in a secret manager
- Production `CLIENT_URL`

## Environment

```env
DATABASE_URL=<managed-postgresql-url>
JWT_SECRET=<long-random-secret>
CLIENT_URL=https://your-frontend.example
PORT=4000
```

Client:

```env
VITE_API_URL=https://your-api.example
```

## Deployment sequence

1. Provision PostgreSQL.
2. Configure production environment variables.
3. Install server dependencies.
4. Generate Prisma Client.
5. Apply the project's versioned database migrations when migrations are introduced.
6. Build the server.
7. Build and deploy the client.
8. Put the API behind HTTPS.
9. Verify `/health` and authentication.
10. Verify Socket.IO connectivity from the deployed client.

Do not use the development database password or demo credentials in production.
