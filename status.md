# Buddy — Project Status

## Current Phase: 1 Complete — Ready for Phase 2

### Completed
- [x] Phase 0: Foundation (git, deps, Docker, schema, auth, docs, CI)
- [x] Phase 1: Walking Skeleton (provider abstraction, OpenAI adapter, BullMQ worker, chat API, stream endpoint, chat UI, app shell)
- [x] TypeScript compilation: 0 errors
- [x] Next.js production build: passes (19 routes)
- [x] 71 source files created

### In Progress
- Nothing

### Blocked
- Docker Desktop not running — cannot test DB push or runtime yet

### Known Issues
- `uuid` package imported in chat-panel.tsx but not in dependencies (used for optimistic IDs — needs adding or replacing with crypto.randomUUID)
- useChatStream hook has EventSource code commented out (mock mode) — needs real SSE connection
- 13 npm audit vulnerabilities (6 low, 6 moderate, 1 high) — not yet addressed

### Technical Debt
- API route auth checks could be extracted into a shared middleware/helper
- Dynamic imports in edit/regenerate routes (for credential lookup) should use top-level imports
- Provider adapter error classification needs real-world testing

### Next Recommended Tasks
1. Start Docker Desktop, run `docker compose up -d`, push schema
2. Test auth flow end-to-end
3. Add provider management UI (settings page)
4. Implement Anthropic and Google adapters
5. Enable real SSE in useChatStream hook
