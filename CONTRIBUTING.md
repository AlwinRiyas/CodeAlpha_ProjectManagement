# Contributing

## Branch model

- `main` — stable release branch
- `development` — integration branch for active development
- `feature/*` — isolated feature work
- `fix/*` — bug fixes

## Workflow

1. Create a branch from `development`.
2. Make one focused change at a time.
3. Run the client and server builds locally.
4. Run the available tests.
5. Open a pull request into `development`.
6. Keep `main` reserved for reviewed, stable releases.

## Commit style

Use concise conventional-style messages, for example:

- `feat: add task filters`
- `fix: prevent unauthorized project access`
- `docs: improve setup instructions`
- `test: cover project membership rules`

## Pull requests

A useful PR should explain:

- What changed
- Why it changed
- How it was tested
- Any migration or environment changes
- Any security implications

Never commit passwords, API keys, JWT secrets, `.env` files, database dumps, or user data.
