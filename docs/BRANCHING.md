# Branching Strategy

```text
main
 ↑
development
 ↑
feature/*  fix/*  docs/*
```

## Rules

- Never commit feature work directly to `main`.
- `development` is the integration branch.
- Use short-lived branches for focused changes.
- Pull requests from feature branches target `development`.
- Release pull requests target `main` from `development`.
