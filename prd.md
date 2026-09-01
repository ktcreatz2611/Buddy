# Product Requirements Document (PRD) — Buddy

**Product Name:** Buddy  
**Document Version:** 1.0.0  
**Status:** Approved  
**Target Release:** v1.0  
**Author:** Principal System Architect & Engineering Team  

---

## 1. Vision & Executive Summary

**Buddy** is a unified, provider-agnostic AI chat and autonomous research workspace designed to deliver state-of-the-art conversational AI, model benchmarking, and deep investigation capabilities without vendor lock-in.

Users can connect any major cloud AI provider (OpenAI, Anthropic, Google Gemini, OpenRouter, Groq, DeepSeek, Mistral, xAI, Cerebras), self-hosted or local endpoints (Ollama, LM Studio, custom OpenAI-compatible APIs), and in-browser local execution engines (WebGPU/WebLLM) through a single, polished interface. 

Buddy solves three critical problems with today's AI tools:
1. **Vendor Lock-in & Siloed History:** Conversations, prompt workflows, and context are locked inside individual proprietary interfaces.
2. **Fragile, Transient Execution:** Long responses and deep multi-step research fail if the browser tab closes or connection drops.
3. **Black-Box Research:** Current "deep research" products lack rigorous claim verification, evidence provenance, contradiction tracking, and strict budget bounds.

---

## 2. Target Personas

### 2.1 Individual Developers & AI Engineers
- **Profile:** Power users testing prompts, comparing LLM outputs across models, running local LLMs (Ollama/LM Studio) for private code, and using high-throughput endpoints (Groq/Cerebras) for coding assistance.
- **Key Needs:** Low-latency streaming, syntax-highlighted code blocks, branching/editing message trees, full cost and token tracking per model, and exportable chat sessions.

### 2.2 Domain Researchers & Knowledge Workers
- **Profile:** Analysts, academics, and technical writers synthesizing complex topics across dense documentation, web sources, and research papers.
- **Key Needs:** Multi-agent autonomous research with claim verification, structured citations, contradiction detection, and document ingestion (PDF, DOCX, CSV) without manual copy-pasting.

### 2.3 Privacy-Conscious & Self-Hosted Teams
- **Profile:** Small teams or individuals requiring strict data sovereignty, running in self-hosted environments (Docker Compose / Render) with local embeddings, SearXNG search, and zero third-party telemetry.
- **Key Needs:** Full control over API keys (AES-256-GCM encrypted server-side), LAN-accessible local model support, and self-contained vector search via pgvector.

---

## 3. Use Cases & User Journeys

### UC-1: Resilient Multi-Turn Conversational Chat
- User initiates a conversation using Anthropic Claude 3.5 Sonnet.
- Mid-stream, the user refreshes or closes the browser tab.
- The durable background worker continues processing, writing chunks to the database and Redis stream.
- User re-opens the tab; the UI seamlessly reconnects and renders the completed response with full Markdown and code formatting.

### UC-2: Side-by-Side Model Benchmarking
- User enters a prompt: "Implement a lock-free ring buffer in Rust with safety explanations."
- User selects three models: OpenAI GPT-4o, Anthropic Claude 3.5 Sonnet, and DeepSeek-V3.
- All three models stream in parallel. Latency to first token, tokens per second, and estimated cost are calculated and displayed per column.
- User triggers "Critique Another" to have Claude analyze GPT-4o's edge cases, and "Synthesize All" to produce a merged optimal solution.

### UC-3: Budget-Bounded Multi-Agent Research Session
- User asks a complex question: "What are the latest production trade-offs between NVMe-oF and CXL shared memory in distributed databases?"
- User configures budgets: Max 12 turns, $1.50 cost limit, 10-minute timeout.
- The Orchestrator engages an Investigator/Skeptic agent and an Analyst/Researcher agent in a turn-based dialogue.
- Claims are logged with supporting and refuting evidence. Contradicting claims trigger targeted follow-up queries.
- When the budget or diminishing-returns threshold is reached, the Orchestrator forces synthesis, generating a structured report categorized by **Verified**, **Probable**, **Uncertain**, and **Conflicting** findings with clickable source citations.

### UC-4: Zero-Config Document Intelligence (RAG)
- User uploads a 100-page PDF financial report and a 10MB XLSX dataset.
- System parses files in an isolated worker, chunks content with structure awareness (headings, tables), generates vector embeddings using an in-process local model (ONNX/transformers.js), and stores them in pgvector.
- User queries the document; system retrieves relevant chunks with semantic similarity and answers with grounded citations.

### UC-5: Seamless Mid-Task Failover
- User is executing a complex prompt on OpenAI GPT-4o.
- OpenAI returns an HTTP 429 (Rate Limit) or 503 (Outage).
- Buddy's execution router intercepts the failure, reconstructs the active message tree and system instructions for a fallback model (e.g., Anthropic Claude 3.5 Sonnet), and resumes generation.
- A persistent `failover_notice` system message is stored in the transcript to maintain transparency.

---

## 4. Functional Requirements (Prioritized)

### 4.1 Feature 1: Chat Interface (Priority: P0)
- **Streaming & Rendering:** Real-time token streaming via Server-Sent Events (SSE). Full support for Markdown, GitHub Flavored Markdown (tables, checklists), LaTeX math equations ($ and $$), syntax-highlighted code blocks with copy/wrap actions, and inline image/attachment rendering.
- **Tree-Structured History:**
  - Conversations modeled as a directed tree where `messages.parent_id` references the ancestor.
  - `conversations.active_leaf_id` points to the active thread tip.
  - Editing any historical message creates a new branch (sibling message) without destroying existing history.
  - Regenerating assistant responses creates sibling candidate turns.
  - Branch navigation controls (`< 2 / 3 >`) allowing users to switch between sibling forks.
- **Controls & Operations:** Stop generation (explicit abort signal), retry response, edit prompt, copy raw markdown, export (JSON, Markdown, PDF), full-text search across conversation history, and project/folder tagging.
- **Model Selector:** Dynamically populated from database registry, filtering by model capabilities (vision, context length, tools).

### 4.2 Feature 2: Side-by-Side Model Comparison (Priority: P1)
- **Multi-Model Fan-Out:** Send a single user prompt simultaneously to 2 to 4 configured models.
- **Independent Streams:** Each model executes within an isolated worker job, streaming independently to the UI.
- **Per-Model Metrics:** Real-time telemetry displaying time-to-first-token (TTFT), total generation duration, prompt tokens, completion tokens, tokens per second, and estimated monetary cost.
- **Cross-Model Actions:**
  - *Critique:* Prompt Model A to evaluate and critique Model B's output.
  - *Synthesize:* Run an orchestrator prompt that reconciles all outputs into a unified consensus answer.
- **Responsive Layout:** Dynamic multi-column layout on desktop; tabbed/swipeable carousel on tablet/mobile screens (never squeezed or clipped).

### 4.3 Feature 3: Multi-Agent Deep Research Mode (Priority: P2)
- **Orchestrated Turn-Taking:** Centralized state machine controlling dialogue between:
  - **Investigator / Skeptic:** Formulates search queries, extracts facts, identifies gaps and logical inconsistencies.
  - **Analyst / Researcher:** Gathers evidence, evaluates source credibility, cross-examines facts.
- **Claim & Evidence Ledger:**
  - Structured storage of extracted claims linked to primary evidence.
  - Automated contradiction detection: claims tagged with both `supports` and `refutes` evidence rows are flagged as conflicting.
- **Diminishing Information Detection:** Embedding-based cosine similarity checks on consecutive finding summaries. Repeated high similarity indicates plateauing information and triggers synthesis.
- **Strict Budget Guardrails:** Hard enforcement of max turns, max token count, max monetary spend ($), and wall-clock timeout. If any budget is exhausted, the orchestrator immediately transitions to synthesis.
- **Final Structured Synthesis:** Outputs a comprehensive report classified into four confidence tiers:
  1. *Verified:* Corroborated by ≥ 2 independent authoritative sources.
  2. *Probable:* Supported by 1 credible source with no contradictions.
  3. *Uncertain:* Weak/ambiguous source or unverified model inference.
  4. *Conflicting:* Direct contradictory evidence across multiple sources.

### 4.4 Feature 4: Multimodal File Understanding & RAG (Priority: P3)
- **Supported Formats:** PDF, DOCX, PPTX, XLSX, CSV, TXT, Markdown, JSON, images (JPEG, PNG, WebP, GIF), audio, video, and web URLs.
- **Structure-Aware Chunking:** Header-based, markdown-aware, and row/column-aware chunking rather than fixed-width slicing.
- **Vector Pipeline:**
  - Default: In-process local ONNX embeddings (`transformers.js` with 384-dimensional models).
  - Opt-in: Cloud provider embeddings (OpenAI `text-embedding-3-small`, Google, Voyage).
  - Vector storage in PostgreSQL via `pgvector` with HNSW indexing.
- **Grounding & Citation:** Retrieval-Augmented Generation (RAG) injects only relevant chunks into context, appending verified source chunk IDs and offsets to model outputs.

### 4.5 Feature 5: Automatic Mid-Task Failover (Priority: P4)
- **Error Interception:** Catches provider HTTP 429 (Rate Limit), 500/503 (Service Unavailable), context window overflow, or network timeouts.
- **Context Reconstruction:** Intelligently reconstructs the prompt payload from the canonical DB message tree according to the target fallback provider's context window and token limits.
- **Audit & Notice:** Inserts a persistent system message (`failover_notice`) into the conversation history detailing the switch.

### 4.6 Provider & Model Registry
- **Data-Driven Configuration:** All providers and models stored in database tables (`providers`, `models`), seedable from JSON configuration.
- **Universal Provider Adapter:** Uniform interface implemented over `@ai-sdk/*` library packages and `@ai-sdk/openai-compatible`.
- **Capability Metadata:** Flags indicating `chat`, `streaming`, `vision`, `fileInput`, `toolCalling`, `embeddings`, `maxContextTokens`, `maxOutputTokens`, and `executionContext` (`server` vs `client`).

---

## 5. Non-Functional Requirements

### 5.1 Performance & Latency
- **Time to First Token (TTFT):** Streaming UI updates within < 100ms from the arrival of the first SSE packet from the provider.
- **UI Rendering Performance:** Streaming Markdown and syntax highlighting throttled to 30–60 fps to eliminate DOM churn during high-speed token bursts (>100 tokens/sec).
- **Search Latency:** Full-text and vector similarity search queries resolved in < 250ms for collections under 100,000 chunks.

### 5.2 Durability & Reliability
- **Background Worker Decoupling:** Long-running chat generations and research sessions are managed by BullMQ worker processes. Client disconnections, tab closes, or network drops do not abort jobs.
- **Stateless Web Layer:** Web servers can scale horizontally or restart without losing active generation streams.
- **Graceful Degradation:** When optional tools (e.g., SearXNG search or local embeddings) are unreachable, the UI provides clear diagnostic feedback without crashing.

### 5.3 Scalability
- **Storage Strategy:** Relational schema optimized with composite indexes on `(conversation_id, parent_id)` and `(workspace_id, created_at)`.
- **Concurrency:** Per-workspace Redis token-bucket rate limiting to prevent concurrent model calls from exhausting provider limits or system memory.

---

## 6. System Architecture & Tech Stack

```
+-----------------------------------------------------------------------+
|                              Web Client                               |
|        (Next.js App Router, React 19, Tailwind CSS, shadcn/ui)        |
+------------------------------------+----------------------------------+
                                     | REST / SSE
                                     v
+-----------------------------------------------------------------------+
|                          Next.js API Routes                           |
|       (Auth.js, Request Validation, Queue Dispatcher, SSE Streamer)   |
+------------------+---------------------------------+------------------+
                   |                                 |
                   | Redis Queue                     | SQL / pgvector
                   v                                 v
+------------------------------------+   +------------------------------+
|          BullMQ Worker             |   |      PostgreSQL + pgvector   |
| (Generation, RAG, Multi-Agent,     |   |   (Canonical State, Chunks,  |
|  Failover, Vector Embeddings)      |   |    Messages, Audit Ledger)   |
+------------------+-----------------+   +------------------------------+
                   |
     +-------------+-------------+
     |                           |
     v                           v
+--------------------+   +--------------------+
| Cloud AI Providers |   | Local AI Engines   |
| (OpenAI, Anthropic,|   | (Ollama, LM Studio,|
|  Google, Mistral)  |   |  SearXNG Search)   |
+--------------------+   +--------------------+
```

### 6.1 Core Technology Choices
- **App Framework:** Next.js (App Router) + TypeScript in strict mode.
- **Database & ORM:** PostgreSQL + `pgvector` managed via Drizzle ORM with `node-postgres`.
- **Job Queue & Pub/Sub:** BullMQ + Redis for background job orchestration and real-time SSE stream multiplexing.
- **Authentication:** Auth.js (NextAuth) with database session persistence (revocable sessions).
- **UI Components:** shadcn/ui built on Radix UI primitives + Tailwind CSS.
- **LLM Layer:** Direct integration using Vercel AI SDK provider libraries (`@ai-sdk/openai`, `@ai-sdk/anthropic`, `@ai-sdk/google`, `@ai-sdk/openai-compatible`). No hosted AI Gateway dependencies.
- **Deployment Platform:** Render (Web Service + Background Worker + Managed Postgres + Managed Redis) and Docker Compose for local environments.

---

## 7. UX & Frontend Requirements

1. **Strict Capability-Driven UI:** Components never evaluate provider IDs (`if (provider === 'openai')`). All UI controls (file upload, vision toggles, tool buttons) conditionally render strictly based on the active model's `capabilities` record.
2. **Virtualization:** Message transcripts and document chunk listings utilize DOM virtualization to ensure buttery 60fps scrolling on conversations exceeding 500+ messages.
3. **Branching Navigation:** Intuitive visual fork indicators displaying the current active branch index, total branches, and simple left/right traversal buttons.
4. **Accessible Streaming:** Streaming message blocks use `aria-live="polite"` regions with reduced-motion awareness to ensure screen-reader accessibility.
5. **Mobile-First Responsive Comparison:** Responsive design rendering side-by-side columns on desktop screens (>1024px) and swipeable tabs/carousels on mobile viewports.

---

## 8. Security & Privacy Requirements

### 8.1 Zero-Trust Credential Security
- **Encryption:** Provider API keys are encrypted at rest using AES-256-GCM envelope encryption. Master key stored in server-only `ENCRYPTION_KEY` environment variable.
- **Server-Only Exposure:** Keys are decrypted strictly in memory inside server/worker processes at request execution time. Keys are never transmitted to the browser, never logged, and never included in API serialization.
- **Database Role Isolation:** The BullMQ background worker database role has no `UPDATE` or `DELETE` permissions on the `credentials` table. Credential modifications are restricted exclusively to user-authenticated web API routes.

### 8.2 Server-Side Request Forgery (SSRF) Protection
- **Outbound Filtering:** All URL-fetching, document ingestion, and search tool calls validate destination IPs against private, loopback, and link-local ranges (RFC1918, RFC3927, `127.0.0.0/8`, `169.254.169.254`).
- **DNS Rebinding Prevention:** IP validation occurs immediately prior to socket connection, re-verifying every redirect hop.

### 8.3 Prompt Injection & Untrusted Content Isolation
- **Channel Separation:** All external content (web scrapes, parsed documents, tool outputs) is wrapped in isolated data delimiters with explicit system instructions prohibiting execution as directives.
- **No Auto-Chaining:** Tool outputs are never re-parsed for executable syntax. Tool calls must originate exclusively from model structured outputs validated against Zod schemas.

### 8.4 Upload & Document Parsing Hardening
- **File Validation:** Magic-byte sniffing for file format validation (client-declared MIME types rejected).
- **Decompression Bomb Protection:** Strict zip-ratio and size checks for DOCX/XLSX/PPTX files prior to parsing.
- **Process Isolation:** Document extraction runs inside worker sub-processes with strict memory caps and execution timeouts.

---

## 9. Data Model Summary

```
+--------------------------------------------------------------------------+
|                              Core Entities                               |
+--------------------------------------------------------------------------+
| users                 | User accounts, credentials, timestamps           |
| workspaces            | Tenant boundaries, configuration, quotas         |
| workspace_members     | User-workspace membership and roles              |
| projects              | Project folders for organizing conversations     |
| providers             | Provider definitions (OpenAI, Anthropic, etc.)   |
| credentials           | Encrypted API keys & endpoints (AES-256-GCM)     |
| models                | Model metadata, context windows, capabilities    |
| conversations         | Conversation roots with active_leaf_id           |
| messages              | Tree nodes (parent_id), status, tokens, cost     |
| attachments           | File attachments linked to messages              |
| documents             | Uploaded raw documents and metadata              |
| document_chunks       | Text chunks with pgvector embeddings             |
| research_sessions     | Research sessions, budgets, status, synthesis    |
| research_questions    | Sub-questions spawned during research            |
| agent_turns           | Individual dialogue turns between agents         |
| sources               | Discovered web/document references               |
| evidence              | Extracted text snippets linked to sources        |
| claims                | Structured claims identified during research     |
| claim_evidence        | Many-to-many join: claim <-> evidence (stance)   |
| tool_calls            | Audit log of tool execution inputs and outputs   |
| usage_records         | Aggregated token usage and cost metrics          |
| audit_events          | Security and administrative audit trail          |
+--------------------------------------------------------------------------+
```

### Tree-Structured Message Mechanics
- `messages.id`: Unique UUID identifier.
- `messages.conversation_id`: Associated conversation.
- `messages.parent_id`: Pointer to ancestor message UUID (nullable for conversation root).
- `conversations.active_leaf_id`: Pointer to current leaf message UUID.
- **Path Resolution:** Walking upwards from `active_leaf_id` to root generates the active conversation transcript.
- **Edit/Regenerate:** Creates a new child message with `parent_id` matching the edited turn, then shifts `active_leaf_id` to the newly created branch tip.

---

## 10. Acceptance Criteria

### 10.1 Chat Experience
- [ ] User can stream responses from OpenAI, Anthropic, Gemini, Groq, Mistral, Ollama, and WebGPU models.
- [ ] Code blocks render syntax highlighting, line numbers, and copy button. LaTeX formulas render cleanly.
- [ ] Editing any previous message forks a new branch; all branches remain accessible via branch navigator.
- [ ] Closing the browser during a generation does not lose the response; reconnecting displays full output.

### 10.2 Model Comparison
- [ ] User can select 2 to 4 models and run a synchronous comparison on the same prompt.
- [ ] Each column displays independent TTFT, total tokens, tokens/sec, and cost estimate.
- [ ] Clicking "Critique" generates a valid critique of a selected model's output.

### 10.3 Multi-Agent Research
- [ ] Initiating research executes Investigator and Analyst agents under Orchestrator control.
- [ ] Claims with contradictory evidence are flagged in the final report under "Conflicting".
- [ ] Exceeding turn, cost, or time budgets triggers automatic synthesis without crashing.
- [ ] Final report provides direct clickable source links and evidence snippets for all verified claims.

### 10.4 Multimodal RAG
- [ ] Uploaded PDF, DOCX, and CSV files are chunked, embedded locally, and stored in `pgvector`.
- [ ] Asking questions against uploaded documents returns accurate answers with chunk citations.

### 10.5 Security
- [ ] Decrypted API keys are never visible in browser network traffic or client-side bundles.
- [ ] SSRF attempts to `http://169.254.169.254` or internal LAN IPs are rejected.
- [ ] Injected instructions in retrieved web pages do not trigger automated tool calls.

---

## 11. Phased Implementation Roadmap

- **Phase 0: Foundation & Environment Setup**  
  Scaffold Next.js App Router, TypeScript, Drizzle ORM schema, PostgreSQL + pgvector, Redis + BullMQ, Docker Compose, Auth.js authentication, and project documentation.
- **Phase 1: Walking Skeleton & Provider Abstraction**  
  Implement Provider Adapter interfaces, basic chat streaming via BullMQ worker + Redis SSE, dynamic model registry, and core chat UI.
- **Phase 2: Conversation Tree & Full Chat Experience**  
  Message tree branching (`parent_id`, `active_leaf_id`), message editing/regeneration, Markdown/LaTeX/code rendering, conversation search, and exports.
- **Phase 3: Side-by-Side Model Comparison Mode**  
  Multi-model parallel streaming, latency/cost/token telemetry, critique/synthesis tools, and mobile-responsive comparison views.
- **Phase 4: Multimodal File Ingestion & Local RAG**  
  Structure-aware document parsing, local ONNX embeddings (`transformers.js`), pgvector similarity search, and citation injection.
- **Phase 5: Multi-Agent Deep Research Engine**  
  Orchestrator state machine, Investigator/Analyst turn loops, Claim/Evidence ledger, contradiction detection, budget enforcement, and confidence synthesis.
- **Phase 6: Failover, Context Management & Resilience**  
  Automatic error failover, intelligent context reconstruction, rate limiting, and prompt-injection mitigations.
- **Phase 7: Sandboxed Code Execution & Advanced Tooling**  
  Hardened code execution sandbox (ephemeral container, no network, non-root), advanced web scrapers, and external tool integrations.

---

## 12. Out of Scope (v1)

The following capabilities are explicitly excluded from the v1 scope to ensure stability and rapid execution:
- **Billing & Subscriptions:** No Stripe or payment gateway integrations (designed for self-hosted and internal small-team use).
- **Enterprise IAM:** No SSO, SAML, or SCIM directory sync in v1.
- **Real-Time Multi-User Collaboration:** No Google Docs-style live multi-cursor collaborative editing.
- **Native Mobile Binaries:** Dedicated Flutter mobile applications are deferred (REST/SSE backend is fully API-compatible for subsequent mobile consumption).
- **Full Offline PWA Service Worker:** Offline client caching with IndexedDB background sync is a stretch goal; v1 targets self-hosted LAN offline support.
- **Unsandboxed Code Execution:** No raw host system code evaluation before Phase 7 hardening.
- **ML-Based Source Credibility Scoring:** Complex source reputation models are deferred; v1 relies on multi-source corroboration heuristics.
