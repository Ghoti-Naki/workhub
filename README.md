# AI Work Hub

AI Work Hub is an AI-powered personal productivity workspace for managing projects, tasks, notes, inbox items, calendar events, file records, and work context in one focused dashboard.

It combines a structured productivity system with practical AI assistance: daily briefs, project summaries, note-to-task extraction, AI Copilot, and automation imports through n8n.

> Built as a full-stack Next.js application with TypeScript, Prisma, PostgreSQL, Tailwind CSS, OpenAI-compatible AI workflows, and external automation support.

---

## Table of Contents

- [Overview](#overview)
- [Why This Project Exists](#why-this-project-exists)
- [Key Features](#key-features)
- [Demo Flow](#demo-flow)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Screenshots](#screenshots)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Commands](#available-commands)
- [Database](#database)
- [AI Behavior](#ai-behavior)
- [Automation Webhooks](#automation-webhooks)
- [API Overview](#api-overview)
- [Folder Structure](#folder-structure)
- [Testing](#testing)
- [Deployment](#deployment)
- [Security Notes](#security-notes)
- [Roadmap](#roadmap)
- [Project Documentation](#project-documentation)

---

## Overview

Modern productivity work is fragmented across task managers, notes apps, calendars, emails, cloud files, and project documents. AI Work Hub solves that problem by giving one central workspace where users can capture work, organize it, understand priorities, and act with context.

The application is designed for a single user who wants a personal command center for daily work. It is not a team collaboration platform. Instead, it focuses on individual productivity, AI-assisted clarity, and automation-friendly data ingestion.

Core idea:

```txt
Capture work quickly → organize it into projects/tasks/notes → summarize context with AI → act on the next priority.
```

---

## Why This Project Exists

Most productivity tools store information, but they do not always help users understand what matters next.

AI Work Hub focuses on three practical problems:

1. Important work is scattered across too many tools.
2. Tasks lose context when separated from notes, files, events, and inbox items.
3. AI is most useful when it is grounded in the user's actual workspace data, not used as a generic chatbot.

AI Work Hub addresses these problems by combining structured data, dashboard visibility, and AI-generated assistance in one interface.

---

## Key Features

### Core Productivity

- Project management with status, priority, due dates, related tasks, notes, files, and inbox items
- Task management with completion state, priority, due dates, and project association
- Notes workspace for ideas, meeting notes, planning, and research
- Unified inbox for manual capture and automation-imported items
- Calendar event display for deadlines and scheduled commitments
- File records for linking external documents and project assets
- Dashboard aggregation for today's work, overdue tasks, upcoming deadlines, inbox items, and project stats

### AI Features

- AI Daily Brief based on live task, inbox, and calendar data
- AI Project Summary generated from project context
- AI note-to-task extraction with user approval before task creation
- AI Copilot for asking questions about the workspace
- AI output history for reviewing generated summaries and answers
- Fallback heuristic behavior when no OpenAI API key is configured

### Automation Features

- n8n webhook ingestion for inbox items
- n8n webhook ingestion for calendar events
- n8n webhook ingestion for file records
- Secret-protected automation endpoints
- Automation run logs with status tracking

### Developer Features

- Full-stack Next.js App Router structure
- TypeScript-first implementation
- Prisma ORM with PostgreSQL
- Consistent API response shape: `{ data, meta, error }`
- Environment-variable based configuration
- Production-build and lint workflow

---

## Demo Flow

A strong demo of AI Work Hub should show the full productivity loop:

1. Open the Home dashboard.
2. Review the AI Daily Brief.
3. Add a new item using Quick Capture.
4. Process the item in the Unified Inbox.
5. Convert the item into a task or note.
6. Open a project detail page.
7. Generate an AI Project Summary.
8. Open a note and extract tasks with AI.
9. Ask AI Copilot: "What should I focus on today?"
10. Show that the answer is grounded in actual tasks, projects, notes, and inbox data.

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
| AI Provider | OpenAI API with local fallback behavior |
| Automation | n8n webhook workflows |
| Deployment | Vercel or Node-compatible hosting |

---

## Architecture

```txt
Browser / React UI
  ↓
Next.js App Router
  ↓
Next.js API Routes
  ↓
Prisma ORM
  ↓
PostgreSQL Database
```

AI flow:

```txt
User action
  ↓
/api/ai/* route
  ↓
AI helper service
  ↓
OpenAI API if key exists
  ↓
Fallback heuristic if no key exists
  ↓
AiOutput or AiExtraction stored in database
```

Automation flow:

```txt
External source: Gmail / Calendar / Drive / custom trigger
  ↓
n8n workflow
  ↓
Secret-protected webhook endpoint
  ↓
Database write through Prisma
  ↓
AutomationRun log entry
  ↓
New data appears in the app
```

---

## Screenshots

Add screenshots here before publishing the repository publicly.

Recommended screenshots:

```txt
assets/screenshots/home-dashboard.png
assets/screenshots/inbox-triage.png
assets/screenshots/project-detail.png
assets/screenshots/tasks-page.png
assets/screenshots/note-extraction.png
assets/screenshots/ai-copilot.png
assets/screenshots/calendar-page.png
assets/screenshots/settings-automation.png
```

Example README layout:

```md
![Home Dashboard](assets/screenshots/home-dashboard.png)
![AI Copilot](assets/screenshots/ai-copilot.png)
```

---

## Getting Started

### Prerequisites

- Node.js 18 or newer
- npm
- PostgreSQL database
- OpenAI API key, optional
- n8n instance, optional for automation workflows

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd workhub
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create environment file

Create `.env` in the project root.

```env
DATABASE_URL=postgresql://USER:PASSWORD@localhost:1101/workhub
OPENAI_API_KEY=
AUTOMATION_SECRET=replace-with-a-long-random-secret
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

Open the app at:

```txt
http://localhost:3000
```

---

## Environment Variables

| Variable | Required | Purpose |
|---|---:|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `OPENAI_API_KEY` | No | Enables real AI responses. If empty, fallback logic is used. |
| `AUTOMATION_SECRET` | Required for automation | Bearer token used to protect n8n webhook routes |

Optional production deployments may also require platform-specific variables for hostnames, build settings, analytics, or authentication depending on your deployment target.

---

## Available Commands

```bash
npm run dev        # Start local development server
npm run build      # Build production app
npm start          # Run production server
npm run lint       # Run lint checks
npx prisma generate
npx prisma migrate dev
```

---

## Database

AI Work Hub uses PostgreSQL with Prisma.

Core data areas:

- Projects
- Tasks
- Notes
- Inbox items
- Events
- File records
- AI outputs
- AI extractions
- Automation run logs
- Workspace settings

The database schema source of truth is:

```txt
prisma/schema.prisma
```

After changing the schema, create a migration and regenerate the Prisma client.

```bash
npx prisma migrate dev
npx prisma generate
```

---

## AI Behavior

AI Work Hub is designed to remain functional even without an AI API key.

When `OPENAI_API_KEY` is configured:

- AI Daily Brief uses workspace data to generate summaries.
- AI Project Summary summarizes project context.
- AI Note Extraction suggests tasks from note content.
- AI Copilot answers workspace-related questions.

When `OPENAI_API_KEY` is not configured:

- The app uses fallback heuristic or static responses.
- Core workflows continue working normally.
- Users can still manage tasks, projects, notes, inbox items, events, and files.

AI-generated changes should remain user-approved. The system should suggest actions, not silently modify important records.

---

## Automation Webhooks

AI Work Hub supports external automation through n8n.

Webhook routes include:

```txt
POST /api/automation/inbox-import
POST /api/automation/events-upsert
POST /api/automation/files-upsert
GET  /api/automation/runs
```

All write-based automation routes require:

```txt
Authorization: Bearer <AUTOMATION_SECRET>
```

Typical automation use cases:

- Import Gmail items into the unified inbox
- Upsert Google Calendar events
- Link Google Drive file metadata
- Log automation runs for debugging and visibility

---

## API Overview

Main API route groups:

```txt
/api/dashboard/home
/api/projects
/api/tasks
/api/notes
/api/inbox
/api/events
/api/files
/api/workspace
/api/ai/*
/api/automation/*
/api/health
```

Standard response shape:

```json
{
  "data": {},
  "meta": {},
  "error": null
}
```

Error response shape:

```json
{
  "data": null,
  "meta": {},
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  }
}
```

---

## Folder Structure

```txt
workhub/
├── app/
│   ├── api/                  # Backend API routes
│   ├── globals.css           # Global styling
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Root page
├── components/               # React components
├── generated/prisma/         # Generated Prisma client
├── lib/                      # Shared server helpers
├── prisma/                   # Prisma schema and migrations
├── PROJECT_CONTEXT.md        # Detailed project context
├── CLAUDE.md                 # Claude Code instructions
├── TASK_LIST.md              # Development checklist
├── package.json
└── README.md
```

Important files:

| File | Purpose |
|---|---|
| `PROJECT_CONTEXT.md` | Main source of truth for project context |
| `CLAUDE.md` | Instructions for Claude Code or AI-assisted development |
| `TASK_LIST.md` | Development checklist and roadmap |
| `app/api/**/route.ts` | API route handlers |
| `lib/prisma.ts` | Prisma singleton |
| `lib/ai.ts` | AI generation helper |
| `lib/ai-task-extraction.ts` | Note-to-task extraction helper |
| `prisma/schema.prisma` | Database schema |

---

## Testing

Recommended validation before deployment:

```bash
npm run lint
npm run build
```

Recommended future test coverage:

- API route tests for projects, tasks, notes, inbox, files, events, and AI routes
- Automation route tests for secret validation and idempotency
- AI fallback tests when no OpenAI key is provided
- End-to-end tests for dashboard, quick capture, search, note extraction, and Copilot
- Database migration tests against a clean PostgreSQL instance

---

## Deployment

Recommended deployment setup:

| Layer | Recommended Option |
|---|---|
| App hosting | Vercel, Railway, Render, or another Node-compatible platform |
| Database | Supabase Postgres, Neon, Railway Postgres, or managed PostgreSQL |
| Automation | n8n Cloud or self-hosted n8n |
| AI | OpenAI API |

Deployment checklist:

- Configure `DATABASE_URL`
- Configure `OPENAI_API_KEY`, optional
- Configure `AUTOMATION_SECRET`
- Run database migrations
- Run production build
- Verify automation endpoints are protected
- Verify no `.env` file is committed
- Verify dashboard loads with production database

---

## Security Notes

- Do not commit `.env` files.
- Use a strong `AUTOMATION_SECRET`.
- Protect all private workspace routes before public deployment.
- Do not expose OpenAI keys to the browser.
- Keep AI-generated changes user-approved.
- Avoid storing unnecessary sensitive email content.
- Use HTTPS in production.

---

## Roadmap

Potential future improvements:

- Semantic search with embeddings
- Weekly AI review
- Recurring tasks
- Personal productivity analytics
- Direct Google OAuth integration as an alternative to n8n
- PWA/mobile optimization
- Source-linked AI citations inside the UI
- File summarization for PDFs and documents
- Command palette with keyboard shortcuts
- Notification and reminder system

---

## Project Documentation

This repository includes additional development documents:

```txt
PROJECT_CONTEXT.md  # Full project context and architecture notes
CLAUDE.md           # AI coding assistant rules
TASK_LIST.md        # Practical task checklist
```

Read `PROJECT_CONTEXT.md` before making large changes.

---

## License

Add your license here.

Example:

```txt
MIT License
```
