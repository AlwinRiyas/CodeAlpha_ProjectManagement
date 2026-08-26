# Security Policy

## Supported Branch

Security fixes should be developed from `development` and reviewed before reaching `main`.

## Reporting

Do not publish credentials, tokens, database URLs with passwords, or exploitable vulnerability details in public issues. Report vulnerabilities privately through GitHub security reporting features.

Include a clear description, reproduction steps, affected component, impact, and suggested mitigation. Never include real credentials, tokens, personal data, or production secrets.

## Application Controls

- Passwords are hashed with bcrypt.
- JWT-protected routes reject missing or invalid tokens.
- Project membership is checked before project/task/comment access.
- Request bodies are validated with Zod.
- Helmet provides HTTP security headers.
- Rate limiting protects the API from excessive requests.
- Socket.IO connections require a valid JWT.

## Production Requirements

Replace development secrets, restrict CORS to the deployed client origin, use HTTPS, use a managed PostgreSQL deployment, rotate secrets when exposure is suspected, and keep dependencies updated.
