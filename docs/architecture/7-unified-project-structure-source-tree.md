# 7. Unified Project Structure (Source Tree)

This structure reflects the user's naming and folder preferences.
Dependency management is handled by `pnpm workspaces`.

```
myBlog/
├── .github/
│   └── workflows/
│       └── ci-cd.yml
├── apps/
│   ├── analytics-service/    # Analytics service for view counts
│   │   ├── index.js
│   │   └── package.json
│   ├── backend/              # Backend app containing blog and comment services
│   │   ├── src/
│   │   │   ├── api/          # Express routes
│   │   │   ├── models/     # Mongoose schemas
│   │   │   ├── utils/      # Database connection utility
│   │   │   └── index.js      # Main server entry point
│   │   ├── Dockerfile
│   │   └── package.json
│   └── frontend/             # Next.js frontend
│       ├── app/
│       ├── components/
│       ├── lib/
│       └── ...
├── docs/
│   ├── architecture/
│   ├── prd/
│   ├── qa/
│   └── stories/
├── packages/
│   └── README.md
├── .gitignore
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
└── tsconfig.json
```