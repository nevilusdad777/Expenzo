# Backend Dependency Reference

## Runtime
- **express** - HTTP server framework
- **cors** - Cross-origin request control (origin locked via `CORS_ORIGIN`)
- **helmet** - Security headers
- **morgan** - HTTP request logging
- **dotenv** - Loads `.env` into `process.env`
- **zod** - Runtime schema validation for env vars and request data
- **bcrypt** - PIN hashing
- **cookie-parser** - Reads the PIN-lock session cookie

## Deferred (Phase 8)
- **prisma** / **@prisma/client** - ORM + SQLite integration

## Dev
- **typescript** - Type checking and compilation
- **ts-node-dev** - Hot-reload backend dev server
- **@types/*** - Type definitions for untyped packages