# Local Release Smoke Test

Run from a clean checkout of the release candidate.

## Backend

```bash
cd server
npm ci
npx prisma generate
npm run db:push
npm run db:seed
npm test
npm run build
npm run dev
```

Verify `GET http://localhost:4000/health` returns HTTP 200.

## Frontend

```bash
cd client
npm ci
npm run build
npm run dev
```

Verify `http://localhost:5173` loads.

## User journey

1. Register a user.
2. Log in and refresh the browser.
3. Create a project.
4. Create a task in Todo.
5. Move the task to In Progress and Done.
6. Invite a second registered user.
7. Assign the task to the second user.
8. Add a comment.
9. Verify notification delivery.
10. Open the same project in a second browser session and verify real-time task/comment updates.
11. Verify a non-member cannot access the project API.
12. Log out and verify protected routes require authentication.

Record failures rather than bypassing them. A failed smoke step blocks release until fixed and retested.
