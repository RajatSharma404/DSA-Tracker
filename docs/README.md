# DSA Tracker Documentation

This folder contains detailed product and engineering documentation for DSA Tracker.

## Documentation Map

### Start here

- [Getting Started](./getting-started.md): first-time local setup, boot commands, verification steps.
- [Product Overview](./product-overview.md): what the platform does and how major modules connect.
- [User Guide](./user-guide.md): end-to-end usage walkthrough for learners and admins.

### System and engineering

- [Architecture](./architecture.md): request flow, auth boundaries, runtime structure, extension integration.
- [Developer Operations](./developer-operations.md): development workflow, seeding, deployment modes, operational practices.

### Reference

- [Environment Variables](./reference/environment-variables.md): full frontend and backend environment matrix.
- [API Reference](./reference/api-reference.md): backend endpoint catalog by domain with auth and payload expectations.
- [Data Model Reference](./reference/data-model.md): Prisma models, relationships, enums, and lifecycle fields.

### Maintenance

- [Troubleshooting](./troubleshooting.md): known failure modes and practical fixes.

## Source of Truth Policy

When behavior in docs conflicts with implementation, implementation is authoritative. Keep these files aligned with:

- `backend/index.ts` for backend route behavior
- `frontend/src/lib/api.ts` for frontend-consumed API contract
- `backend/prisma/schema.prisma` and `frontend/prisma/schema.prisma` for data model
- `frontend/next.config.ts` and `frontend/src/proxy.ts` for request routing and access control
- `package.json` files for scripts and runtime commands

## Contribution Rule for Docs

Update docs in the same PR when changing any of the following:

- API path, request body, response shape, or auth requirement
- Prisma schema/model/enums and migration-impacting behavior
- Environment variable names or defaults
- Frontend route behavior that impacts user workflows
- Build, run, seed, or deployment commands
