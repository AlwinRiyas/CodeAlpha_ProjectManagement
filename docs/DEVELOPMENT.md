# Development Guide

## Branch strategy

Use `development` as the integration branch. Create short-lived branches from it:

```bash
git switch development
git pull origin development
git switch -c feature/task-filters
```

After implementation:

```bash
git add .
git commit -m "feat: add task filters"
git push -u origin feature/task-filters
```

Open a pull request into `development`.

## Local services

- Client: `http://localhost:5173`
- API: `http://localhost:4000`
- Health: `http://localhost:4000/health`
- PostgreSQL: `localhost:5432`

## Recommended checks

```bash
cd server
npm run build
npm run test

cd ../client
npm run build
```

For schema-only local setup:

```bash
cd server
npx prisma generate
npx prisma db push
npm run db:seed
```

## Release flow

```text
feature/* or fix/*
        ↓
   development
        ↓
      main
```

Do not develop directly on `main`. Merge to `main` only after the integration branch is stable and CI is green.
