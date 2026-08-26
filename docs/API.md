# API Notes

All protected endpoints require:

```http
Authorization: Bearer <JWT>
```

## Authentication

### Register

`POST /api/auth/register`

```json
{
  "name": "Alex",
  "email": "alex@example.com",
  "password": "StrongPassword123!"
}
```

### Login

`POST /api/auth/login`

```json
{
  "email": "alex@example.com",
  "password": "StrongPassword123!"
}
```

## Projects

`GET /api/projects`

`POST /api/projects`

```json
{
  "name": "Website Redesign",
  "description": "Plan and ship the new website"
}
```

`GET /api/projects/:projectId`

`POST /api/projects/:projectId/members`

```json
{
  "email": "member@example.com",
  "role": "MEMBER"
}
```

## Tasks

`POST /api/projects/:projectId/tasks`

```json
{
  "title": "Create landing page",
  "description": "Build the first responsive version",
  "priority": "HIGH",
  "columnId": "<column-id>",
  "assigneeId": "<user-id>"
}
```

`PATCH /api/tasks/:taskId`

The same task fields can be updated, including `columnId`, `assigneeId`, `priority`, `dueDate`, and `position`.

## Comments

`GET /api/tasks/:taskId/comments`

`POST /api/tasks/:taskId/comments`

```json
{
  "body": "The first draft is ready for review."
}
```

## Notifications

`GET /api/notifications`

`PATCH /api/notifications/:id/read`

## Real-time events

The Socket.IO client authenticates with the JWT:

```ts
io(API_URL, { auth: { token } })
```

Project rooms are joined with:

```text
project:join(projectId)
```

Server events include:

- `task:created`
- `task:updated`
- `comment:created`
- `activity:created`
- `member:changed`
- `notification:created`
