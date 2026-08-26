# Security Policy

## Supported Version

Security fixes are applied to the latest version on `main`.

## Reporting a Vulnerability

Do not open a public issue for a security vulnerability.

Instead, report it privately through the repository's GitHub security reporting features with:

- A clear description of the issue
- Reproduction steps or proof of concept
- Affected component or endpoint
- Potential impact
- Any suggested mitigation

Please do not include real credentials, tokens, personal data, or production secrets in a report.

## Security Controls

ProjectFlow currently uses:

- bcrypt password hashing
- JWT authentication
- Zod request validation
- Helmet security headers
- API rate limiting
- Project membership authorization
- Environment-based secrets
- Restricted CORS configuration

## Deployment Notes

Before production deployment:

1. Replace all development secrets.
2. Use HTTPS.
3. Use a managed PostgreSQL instance with restricted network access.
4. Configure a production-specific `CLIENT_URL`.
5. Never commit `.env` files or credentials.
6. Rotate JWT secrets if exposure is suspected.
