# 7. Unified Project Structure (Source Tree)

This structure reflects the user's naming and folder preferences.
Dependency management is handled by `pnpm workspaces`.

```
myBlog/
├── .github/
│   └── workflows/
│       └── ci-cd.yml
├── apps/
│   ├── frontend/             # The AI-generated Next.js frontend
│   │   ├── components/
│   │   ├── pages/
│   │   └── ...
│   └── backend/              # Single backend app containing all services
│       ├── src/
│       │   ├── api/          # Express routes, organized by service
│       │   ├── services/     # Business logic modules (blog, auth, analytics)
│       │   ├── models/     # Mongoose schemas
│       │   └── index.js      # Main server entry point
│       ├── Dockerfile
│       └── package.json
├── infrastructure/
│   ├── terraform/
│   └── ansible/
├── packages/
│   └── shared-types/
└── package.json
