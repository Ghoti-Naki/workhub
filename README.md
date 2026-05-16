# AI Work Hub

AI Work Hub is a self-hosted, single-user productivity OS that brings together projects, tasks, notes, inbox items, calendar events, and file records into one focused dashboard — with AI assistance grounded in your live workspace data.

> Built with Next.js 15, TypeScript, Prisma 7, PostgreSQL, Tailwind CSS v4, and OpenAI.

---

## Table of Contents

- [Why This Project Exists](#why-this-project-exists)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Key Design Decisions](#key-design-decisions)
- [Screenshots](#screenshots)
- [Getting Started](#getting-started)
- [Docker Deployment](#docker-deployment)
- [Environment Variables](#environment-variables)
- [Available Commands](#available-commands)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Database](#database)
- [AI Behavior](#ai-behavior)
- [Automation Webhooks](#automation-webhooks)
- [API Overview](#api-overview)
- [Folder Structure](#folder-structure)
- [Testing](#testing)
- [Security Notes](#security-notes)
- [Roadmap](#roadmap)

---

## Why This Project Exists

Modern productivity work is fragmented across task managers, notes apps, calendars, emails, and cloud storage. AI Work Hub solves this by providing one central workspace where you can capture work, organize it, understand priorities, and act — with context.

Three core problems it addresses:

1. Important work is scattered across too many tools.
2. Tasks lose meaning when separated from related notes, files, and events.
3. AI is most useful when grounded in your actual data, not used as a generic chatbot.

---

## Key Features

### Core Productivity

- **Projects** with status, priority, due dates, and linked tasks, notes, files, and inbox items
- **Tasks** with completion states, priority, due dates, recurrence, and project association
- **Notes** workspace with Markdown support and AI-powered task extraction
- **Unified Inbox** for manual captures and automation-imported items (with bulk archive)
- **Calendar** for deadline and event visibility, with date grouping
- **File Records** for linking external documents and project assets
- **Dashboard** aggregating today's work, overdue tasks, upcoming deadlines, inbox items, and active projects

### AI Features

- **Daily Brief** — AI-generated summary grounded in live tasks, events, and inbox
- **Project Summary** — AI-generated context summary for any project
- **Note-to-Task Extraction** — AI suggests tasks from note content; user approves before creation
- **AI Copilot** — ask free-form questions about your workspace; answers cite sources
- **AI History** — all generated outputs persisted and reviewable
- **Graceful fallback** — all AI features work without an OpenAI key

### UX & Accessibility

- Keyboard shortcuts (n, m, c, /, ?, Esc)
- Collapsible sidebar with icon-only mode
- Undo-able task deletion with 5-second countdown
- Toast notification system with undo support
- ARIA labels on all interactive controls
- WCAG AA-compliant badge color palette
- Filter + sort controls on Tasks, Projects, Notes, Files, and Inbox pages

### Automation

- n8n webhook ingestion for inbox items, calendar events, and file records
- Secret-protected endpoints (`AUTOMATION_SECRET` required)
- Per-IP rate limiting (60 req/min) on all automation routes
- Automation run logs with full payload and result tracking

---

## Architecture

```
Browser / React UI
  └─► Next.js App Router (server + client components)
        └─► API Routes (/app/api/**)
              └─► Prisma ORM
                    └─► PostgreSQL
```

**AI flow:**
```
User triggers AI action
  └─► /api/ai/* route
        └─► lib/ai.ts (generateText helper)
              ├─► OpenAI API  (if OPENAI_API_KEY set)
              └─► Heuristic fallback  (if key absent)
        └─► AiOutput or AiExtraction persisted in DB
```

**Automation flow:**
```
Gmail / Calendar / Drive / custom trigger
  └─► n8n workflow
        └─► POST /api/automation/* (AUTOMATION_SECRET required)
              └─► Rate limit check (60 req/min per IP)
                    └─► Prisma upsert + AutomationRun log
```

---

## Key Design Decisions

| Decision | Rationale |
|---|---|
| Single-user architecture | Personal OS, not a team tool. No multi-tenancy complexity. |
| AI with graceful fallback | App stays usable without an OpenAI key — heuristic responses replace AI calls. |
| API response envelope `{ data, meta, error }` | Consistent shape across all routes; clients can always expect the same structure. |
| n8n for automation ingestion | Avoids direct OAuth flows; n8n handles credential storage and retry logic. |
| Prisma generated client at `generated/prisma/` | Non-default output path — all imports must reference this location. |
| Undo-based delete pattern | Soft-remove from state → 5-second countdown → commit API delete on timeout; cancel on undo. |
| No multi-file refactor during feature work | The main component (`AIWorkHubApp.tsx`) is large; incremental extraction to `components/pages/` and `components/modals/` is the safe path. |
| DEMO_MODE fixture responses | Enables compelling demos with zero API cost; set `DEMO_MODE=true` in environment. |

---

## Screenshots

<!-- Replace placeholder paths with actual screenshots before publishing -->

| Page | Preview |
|---|---|
| Home Dashboard | ![Home](docs/screenshots/home-dashboard.png) |
| Inbox Triage | ![Inbox](docs/screenshots/inbox-triage.png) |
| Project Detail | ![Projects](docs/screenshots/project-detail.png) |
| Tasks | ![Tasks](docs/screenshots/tasks-page.png) |
| Note Extraction | ![Notes](docs/screenshots/note-extraction.png) |
| AI Copilot | ![Copilot](docs/screenshots/ai-copilot.png) |

> Screenshots are in `docs/screenshots/`. See [`DEMO_SCRIPT.md`](DEMO_SCRIPT.md) for the recommended 90-second demo flow.

---

## Getting Started

### Prerequisites

- Node.js **22+**
- npm
- PostgreSQL database
- OpenAI API key *(optional — app works without it)*
- n8n instance *(optional — only needed for automation workflows)*

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd workhub
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and fill in at minimum:

```env
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/workhub
AUTH_PASSWORD=your-strong-passphrase
AUTH_SECRET=<output of: openssl rand -hex 32>
AUTOMATION_SECRET=<output of: openssl rand -hex 32>
OPENAI_API_KEY=sk-...   # optional
```

### 4. Run database migrations

```bash
npx prisma migrate dev
```

### 5. Generate Prisma client

```bash
npx prisma generate
```

### 6. Start the development server

```bash
npm run dev
```

Open **http://localhost:3000** — you'll be prompted to log in with `AUTH_PASSWORD`.

---

## Docker Deployment

The fastest way to run AI Work Hub in production is with Docker Compose:

```bash
# 1. Copy and edit the environment file
cp .env.example .env
# Fill in AUTH_PASSWORD, AUTH_SECRET, AUTOMATION_SECRET (and optionally OPENAI_API_KEY)

# 2. Build and start
docker compose up -d

# 3. Run migrations (first time only)
docker compose exec app npx prisma migrate deploy
```

The app will be available at **http://localhost:3000**.

A PostgreSQL container (`db`) is included. Data is persisted to a named Docker volume (`postgres_data`).

To stop:

```bash
docker compose down
```

To stop and remove data:

```bash
docker compose down -v
```

---

## Environment Variables

| Variable | Required | Purpose |
|---|:---:|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `AUTH_PASSWORD` | Yes | Password for the single-user login gate |
| `AUTH_SECRET` | Yes | HMAC secret for signing session tokens (use `openssl rand -hex 32`) |
| `AUTOMATION_SECRET` | Yes* | Bearer token protecting `/api/automation/*` routes. *Required only if using automation. |
| `OPENAI_API_KEY` | No | Enables real AI responses. Fallback heuristics are used if absent. |
| `DEMO_MODE` | No | Set to `true` to return static fixture AI responses (no API calls). |

---

## Available Commands

```bash
npm run dev          # Start local development server (http://localhost:3000)
npm run build        # Production build
npm start            # Run production server
npm run lint         # Lint checks
npm run test         # Run test suite (Vitest)

npx prisma generate  # Regenerate Prisma client after schema changes
npx prisma migrate dev        # Apply + create migrations (development)
npx prisma migrate deploy     # Apply pending migrations (production)
npx prisma studio    # Open Prisma database GUI
```

---

## Keyboard Shortcuts

| Key | Action |
|---|---|
| `n` | New task |
| `m` | New note |
| `c` | Quick Capture (open inbox capture modal) |
| `/` | Focus search |
| `?` | Show keyboard shortcuts |
| `Esc` | Close modal / dismiss |

---

## Database

AI Work Hub uses PostgreSQL via Prisma ORM.

**Schema:** `prisma/schema.prisma`
**Generated client:** `generated/prisma/` *(non-default output — all imports use this path)*

Core models:

| Model | Purpose |
|---|---|
| `Project` | Top-level work container |
| `Task` | Actionable work item, linked to a project |
| `Note` | Markdown note, linked to a project |
| `InboxItem` | Unprocessed capture or automation import |
| `Event` | Calendar event (manual or from n8n) |
| `FileRecord` | Metadata for linked external files |
| `AiOutput` | Persisted AI-generated content (briefs, summaries, copilot answers) |
| `AiExtraction` | AI-suggested tasks from notes, pending user approval |
| `AutomationRun` | Log of every automation webhook call |
| `WorkspaceSettings` | Workspace name, timezone, onboarding state |

After changing the schema:

```bash
npx prisma migrate dev
npx prisma generate
npm run build
```

---

## AI Behavior

All AI features remain fully functional without an OpenAI key — heuristic fallbacks replace real responses.

| Feature | Route | Behavior without key |
|---|---|---|
| Daily Brief | `POST /api/ai/daily-brief` | Returns heuristic summary from task counts |
| Project Summary | `POST /api/ai/projects/[id]/summary` | Returns placeholder summary |
| Note Task Extraction | `POST /api/ai/notes/[id]/extract` | Returns heuristic task suggestions |
| Copilot | `POST /api/ai/copilot` | Returns static grounding message |

**DEMO_MODE:** Set `DEMO_MODE=true` to return polished fixture responses for all three AI routes — ideal for demos with no API cost.

**Important:** AI may suggest and summarize, but must never silently modify canonical records. All AI-generated tasks require explicit user approval before creation.

---

## Automation Webhooks

All write-based automation routes require:

```
Authorization: Bearer <AUTOMATION_SECRET>
```

Rate limit: **60 requests per minute per IP** — returns `429 Too Many Requests` with a `Retry-After` header when exceeded.

| Route | Method | Purpose |
|---|---|---|
| `/api/automation/inbox-import` | `POST` | Create or update an inbox item |
| `/api/automation/events-upsert` | `POST` | Create or update a calendar event (match by `externalId`) |
| `/api/automation/files-upsert` | `POST` | Create or update a file record (match by `externalUrl`) |
| `/api/automation/runs` | `GET` | List automation run history |

All endpoints support an `Idempotency-Key` request header to prevent duplicate processing on n8n retries.

---

## API Overview

All responses use the standard envelope:

```json
{ "data": {}, "meta": {}, "error": null }
```

Main route groups:

```
/api/dashboard/home          GET    Home page aggregated data
/api/projects                GET POST
/api/projects/[id]           GET PATCH DELETE
/api/tasks                   GET POST
/api/tasks/[id]              GET PATCH DELETE
/api/notes                   GET POST
/api/notes/[id]              GET PATCH DELETE
/api/inbox                   GET POST
/api/inbox/[id]              GET PATCH DELETE
/api/events                  GET POST
/api/events/[id]             PATCH DELETE
/api/files                   GET POST
/api/files/[id]              DELETE
/api/workspace               GET PATCH
/api/ai/daily-brief          POST
/api/ai/copilot              POST
/api/ai/copilot/history      DELETE
/api/ai/projects/[id]/summary  POST
/api/ai/notes/[id]/extract   POST
/api/ai/extractions          GET
/api/ai/outputs              GET
/api/automation/inbox-import   POST
/api/automation/events-upsert  POST
/api/automation/files-upsert   POST
/api/automation/runs           GET
/api/search                  GET
/api/health                  GET
```

---

## Folder Structure

```
workhub/
├── app/
│   ├── api/                  # API route handlers
│   ├── globals.css           # Tailwind global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Entry page (wraps app in ErrorBoundary + Suspense)
├── components/
│   ├── app-shell/            # AppHeader, Sidebar, BottomNav
│   ├── modals/               # Form modals (Task, Project, Note, Event, Capture…)
│   ├── pages/                # Page components (HomePage, TasksPage, ProjectsPage…)
│   ├── shared/               # Reusable UI (Badge, Toast, EmptyState, FilterBar…)
│   ├── AIWorkHubApp.tsx      # Root app component, state, routing
│   └── ErrorBoundary.tsx     # React error boundary
├── docs/screenshots/         # Screenshot images for README
├── generated/prisma/         # Generated Prisma client (non-default output path)
├── hooks/
│   └── useWorkspaceData.ts   # All API fetch/mutation logic
├── lib/
│   ├── ai/
│   │   └── demoFixtures.ts   # Static AI responses for DEMO_MODE
│   ├── ai.ts                 # AI text generation helper (with fallback)
│   ├── ai-task-extraction.ts # Note-to-task extraction helper
│   ├── automation.ts         # AUTOMATION_SECRET validation
│   ├── automation-runs.ts    # AutomationRun CRUD helpers
│   ├── prisma.ts             # Prisma singleton
│   ├── rateLimit.ts          # In-memory sliding-window rate limiter
│   └── types.ts              # Shared TypeScript types and interfaces
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── migrations/           # Migration history
├── tests/                    # Test suite (Vitest)
├── .env.example              # Environment variable template
├── .dockerignore
├── docker-compose.yml
├── Dockerfile
├── CLAUDE.md                 # AI coding assistant rules
├── DEMO_SCRIPT.md            # 90-second demo walk-through
├── next.config.ts
├── package.json
├── PROJECT_CONTEXT.md        # Full project context (read before large changes)
└── README.md
```

---

## Testing

```bash
npm run test        # Run test suite
npm run lint        # Lint checks
npm run build       # Production build (catches TypeScript errors)
```

Tests live in `tests/`. The test suite uses Vitest. Database-dependent tests use `describe.skipIf(!DB_AVAILABLE)` so they are visible in test output but skipped gracefully when no database is configured in CI.

---

## Security Notes

- Never commit `.env` — it is in `.gitignore`.
- Use a strong `AUTH_PASSWORD` and a random `AUTH_SECRET` (min 32 bytes).
- Use a random `AUTOMATION_SECRET` (min 32 bytes) — rotate it if compromised.
- Automation routes reject requests without a valid Bearer token.
- Rate limiting (60 req/min) prevents automation endpoint abuse.
- Do not expose `OPENAI_API_KEY` to the browser — it is only used server-side.
- Use HTTPS in production.
- AI-generated changes require user approval — the system does not silently modify records.

---

## Roadmap

Potential future improvements:

- Semantic search with vector embeddings
- Weekly AI review digest
- Recurring tasks (full UI support)
- PWA / mobile optimization
- Direct Google OAuth as an alternative to n8n
- File summarization for PDFs
- Notification and reminder system
- Source-linked AI citations in the UI

---

## License

MIT License — see `LICENSE` for details.
