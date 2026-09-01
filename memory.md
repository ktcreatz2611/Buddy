# Buddy — Architecture Decisions & Gotchas

## Decisions

- **Package manager:** npm (not pnpm — wasn't installed on dev machine)
- **Deployment target:** Render (Web Service + Background Worker + managed Postgres + managed Redis). Docker Compose for local dev.
- **Vector store:** pgvector on the same Postgres instance. No separate vector DB in v1.
- **Embeddings:** Local ONNX model in-process by default (transformers.js). Provider embeddings as opt-in.
- **Web search:** SearXNG (self-hosted) by default. Brave Search API as pluggable paid alternative.
- **Offline mode:** v1 targets self-hosted/LAN only. Full PWA offline is a stretch goal.
- **Code execution:** Deferred to Phase 7. Stub only until then.
- **Streaming transport:** Per-request SSE backed by durable BullMQ job + Redis pub/sub. Not WebSocket.
- **File storage:** Local disk adapter by default, S3-compatible adapter available.
- **Auth:** Auth.js with database sessions (credentials provider for dev, OAuth optional).
- **API design:** Pure REST + SSE endpoints (no Server Actions dependency) — Flutter mobile app will consume the same API.

## Gotchas

- **Folder name is `Buddy` (capital B)** — npm doesn't allow capital letters in package names. package.json uses `buddy`.
- **Ollama/LM Studio** only work if the backend can reach the host running them (same machine or LAN). If backend is remote and Ollama is on laptop, they can't communicate. Surface this clearly in provider settings, not as a silent failure.
- **WebGPU/WebLLM** runs in the browser — cannot be used for background/agentic tasks. Mark as `executionContext: 'client'`.
- **pgvector embedding dimension** depends on the chosen embedding model. Default local model uses 384 dimensions. Confirm at implementation time.
- **Drizzle migrations** — use `drizzle-kit push` for dev, `drizzle-kit generate` + `drizzle-kit migrate` for production.
