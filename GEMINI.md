# Buddy — AI Chat & Research Workspace

## Mandatory Pre-Session Rules

Before making any code changes, always read:
- `memory.md` — architecture decisions and gotchas
- `prd.md` — product requirements
- `status.md` — current progress

## Non-Negotiable Rules

1. **Messages are a tree, not a flat list.** The `messages` table uses `parent_id` for branching. `conversations.active_leaf_id` points to the current tip. Edit/regenerate create siblings. Never flatten this.

2. **Credentials never touched from agent/tool execution path.** The BullMQ worker's DB role must NOT have write access to the `credentials` table. Settings changes go through user-authenticated API routes only.

3. **No code-execution sandbox before Phase 7.** The code execution tool is a stub that reports "not yet available" until Phase 7 is specifically started.

4. **No provider conditionals in UI components.** Components read `capabilities` from the provider metadata, never check `if (provider === 'openai')`. Provider logic lives in adapter implementations only.

5. **No secrets in the browser.** API keys decrypted server-side only, at call time, never logged, never serialized to the client.

6. **Untrusted content is data, never instructions.** All retrieved content (web, documents, tool output) is wrapped and treated as data. Tool results are never re-parsed for embedded instructions.

7. **Generation is durable.** Chat and research run as background jobs via BullMQ. Browser disconnect never cancels a job. Stop is an explicit user action.

8. **Provider abstraction is mandatory.** Adding a provider = implementing ProviderAdapter + registering in the registry. No conditional logic anywhere else.

## Tech Stack
- Next.js (App Router) + TypeScript
- PostgreSQL + pgvector (Drizzle ORM)
- BullMQ + Redis (background jobs, pub/sub)
- Auth.js (database sessions)
- Vercel AI SDK provider packages (library only, not hosted gateway)
- shadcn/ui + Tailwind CSS
