# Testing Strategy

## Backend

The backend uses Vitest. Tests should cover:

- Registration validation
- Login success/failure
- Project access control
- Owner/admin/member permissions
- Task assignment restrictions
- Task updates across project columns
- Comment authorization
- Notification ownership

## Frontend

Client tests should cover:

- Authentication flows
- Project selection
- Empty/loading/error states
- Task creation and editing
- Drag-and-drop status changes
- Comment submission
- Notification state

## Required pre-merge checks

```bash
cd server
npm run build
npm run test

cd ../client
npm run build
```
