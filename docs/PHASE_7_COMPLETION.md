# Phase 7 — Quality Engineering

## Completed engineering work

- Validation rules are covered by unit tests.
- API error contracts are documented.
- Production client/server builds are CI release gates.
- PostgreSQL-backed integration testing is defined as a required release gate.
- Socket.IO authorization and event delivery are defined as a required release gate.
- Browser smoke testing is documented.
- Security regression scenarios are documented.

## Commands

Server:

```bash
npm ci
npx prisma generate
npm test
npm run build
```

Client:

```bash
npm ci
npm run build
```

## Release gate

Phase 7 must not be marked green until the commands above pass and the database, Socket.IO and browser smoke checks have been executed against the local environment.

GitHub-hosted CI can validate builds and an isolated PostgreSQL service. Local browser interaction still requires execution on the developer machine.
