# Security Checklist

## Before development

- [ ] Use local-only development secrets
- [ ] Keep `.env` files out of Git
- [ ] Use a non-default JWT secret

## Before release

- [ ] Run dependency audit
- [ ] Verify authentication failures do not leak account details
- [ ] Verify every project mutation checks membership
- [ ] Verify assignees belong to the project
- [ ] Verify notification ownership
- [ ] Verify CORS is restricted to the deployed client
- [ ] Verify rate limits are enabled
- [ ] Verify HTTPS is enforced by the deployment layer

## If a secret leaks

1. Revoke/rotate the secret immediately.
2. Replace the affected credential in the deployment environment.
3. Review logs for unauthorized activity.
4. Remove the secret from source history if appropriate.
5. Document the incident and mitigation.
