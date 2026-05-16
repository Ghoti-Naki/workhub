# AI Work Hub

AI Work Hub is a single-user AI-assisted productivity workspace built with Next.js, TypeScript, Prisma, and PostgreSQL.

It centralizes projects, tasks, notes, inbox items, calendar events, file records, AI summaries, AI task extraction, and external automation imports through n8n.

---

## Current Status

This repository is not just a concept document. It already contains a working application foundation with:

- Next.js App Router frontend/backend
- Prisma + PostgreSQL data layer
- Dashboard aggregation
- Projects, tasks, notes, inbox, events, and file APIs
- AI daily brief
- AI project summaries
- AI note-to-task extraction
- AI Copilot
- n8n webhook ingestion routes
- Automation run logs

However, some important pieces are still incomplete:

- no authentication
- no `.env.example`
- debug buttons still visible in UI
- Quick Capture is not a real modal yet
- Search bar is not functional yet
- create/edit forms are still stub-like in places
- `AIWorkHubAppStarterV1.tsx` is a large monolithic component
- no automated tests

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js App Router |
| Language | TypeScript |
| UI | React |
| Styling | Tailwind CSS |
| ORM | Prisma |
| Database | PostgreSQL |
| AI | OpenAI API, optional fallback |
| Automation | n8n webhooks |

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create `.env`

Create `.env` in the project root:

```env
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/workhub
OPENAI_API_KEY=
AUTOMATION_SECRET=replace-with-a-long-random-secret
```

### 3. Run migrations

```bash
npx prisma migrate dev
```

### 4. Start development server

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

---

## Commands

```bash
npm run dev
npm run build
npm start
npm run lint
npx prisma generate
npx prisma migrate dev
```

---

## Important Files

| File | Purpose |
|---|---|
| `PROJECT_CONTEXT.md` | Main repository context. Read first. |
| `CLAUDE.md` | Claude Code operating instructions. |
| `TASK_LIST.md` | Development checklist and known issues. |
| `components/AIWorkHubAppStarterV1.tsx` | Current frontend app. |
| `app/api/**/route.ts` | API routes. |
| `lib/prisma.ts` | Prisma singleton. |
| `lib/ai.ts` | OpenAI/fallback generation helper. |
| `lib/ai-task-extraction.ts` | Note-to-task extraction helper. |
| `prisma/schema.prisma` | Database schema source of truth. |

---

## Development Priority

Start here:

1. Remove debug test buttons.
2. Add `.env.example`.
3. Fix `.gitignore` for `generated/prisma/`.
4. Wire Inbox Archive button.
5. Build Quick Capture modal.
6. Replace placeholder create/edit handlers with real forms.
7. Make Search functional.
8. Add authentication before public deployment.

See `TASK_LIST.md` for the full checklist.

---

## Safety Notes

Do not deploy publicly without authentication.

Do not commit `.env`.

Do not remove OpenAI fallback logic.

Do not rewrite the app from scratch.

Do not change the Prisma schema without a migration plan.

Do not replace n8n with direct OAuth unless explicitly planned.
