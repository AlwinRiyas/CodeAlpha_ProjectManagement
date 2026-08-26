# QA Matrix

| Area | Automated | Manual | Release Gate |
|---|---|---|---|
| Registration validation | Yes | Yes | Required |
| Login validation | Yes | Yes | Required |
| Protected API access | Planned integration | Yes | Required |
| Project membership | Planned integration | Yes | Required |
| Task lifecycle | Planned integration | Yes | Required |
| Comments | Planned integration | Yes | Required |
| Notifications | Planned integration | Yes | Required |
| Activity feed | Planned integration | Yes | Required |
| Socket.IO authorization | Planned integration | Yes | Required |
| Client production build | CI | Yes | Required |
| Server production build | CI | Yes | Required |
| Database schema | CI | Yes | Required |

## Rule

A green unit-test suite alone does not constitute production readiness. Database-backed integration tests and manual browser smoke testing must also pass before Phase 7 can be closed.
