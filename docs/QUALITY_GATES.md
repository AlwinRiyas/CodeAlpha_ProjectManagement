# Quality Gates

Before `development` is promoted to `main`:

1. Server build passes.
2. Client build passes.
3. Backend tests pass.
4. Authentication and project authorization are verified.
5. Database changes are reviewed.
6. No secrets are present in the diff.
7. README and release notes reflect the current behavior.
8. Docker/local startup instructions remain valid.
9. The release has been tested through the main user flow.
