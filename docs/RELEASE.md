# Release Process

1. Complete feature work on a `feature/*` or `fix/*` branch.
2. Merge into `development` after review and CI validation.
3. Test the integrated development branch locally.
4. Verify database/schema changes and environment configuration.
5. Open a release PR from `development` into `main`.
6. Merge only when CI is green and the release is stable.
7. Tag the release using semantic versioning when appropriate.

Example:

```text
v1.1.0 — new product capability
v1.0.1 — bug/security fix
```
