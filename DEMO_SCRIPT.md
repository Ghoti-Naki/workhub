# AI Work Hub — 90-Second Demo Script

A tight walk-through for live demos and video recordings.

---

## Setup (before you present)

1. Have the app running locally (`npm run dev`) or on a live URL.
2. Seed the workspace with at least:
   - 2–3 active **projects** (e.g. "Website Redesign", "Q3 Report")
   - 4–5 **tasks** across projects with mixed priorities and statuses
   - 1–2 **notes** with a few sentences of body text
   - 2–3 **inbox items** in `new` status
3. Open the app in a browser at full-screen (1280 × 800 min).
4. Log in with your `AUTH_PASSWORD`.

---

## Scene 1 — Dashboard Overview (0:00 – 0:20)

> "This is AI Work Hub, a personal productivity OS that brings together tasks, projects, calendar, notes, and an AI copilot in one place."

1. Land on the **Home** page.
2. Point to the **stats bar** at the top — open tasks, active projects, new inbox.
3. Click **Generate Daily Brief** → show the AI summary loading and appearing.
4. Point to the **Today's Events** strip and the overdue task highlight.

---

## Scene 2 — Quick Capture (0:20 – 0:35)

> "Capturing an idea takes one keystroke."

1. Press **C** (or click **Quick Capture** in the header).
2. Type a quick capture: `"Follow up with design team about logo revisions"`.
3. Click **Save** → toast confirms capture → item appears in inbox.

---

## Scene 3 — Inbox Triage (0:35 – 0:50)

> "The inbox turns unstructured captures into actionable records."

1. Navigate to **Inbox**.
2. Click the just-captured item → right panel shows AI triage suggestion.
3. Click **Convert to Task** → task is created, item status changes to `converted`.
4. Briefly show the **bulk select** checkboxes for batch archiving.

---

## Scene 4 — Project + AI Summary (0:50 – 1:10)

> "Projects act as context containers — tasks, notes, inbox items, and files all link to a project."

1. Navigate to **Projects** → click **Open Project** on "Website Redesign".
2. Right panel shows tasks, notes, stats at a glance.
3. Click **Generate Summary** → AI summary appears, grounded in real project data.

---

## Scene 5 — Copilot (1:10 – 1:25)

> "The AI Copilot answers questions grounded in your live workspace data — no hallucinations about tasks that don't exist."

1. Navigate to **Copilot**.
2. Ask: `"What's the most urgent thing I should work on today?"`
3. Show the streaming answer and the **Sources** list underneath.

---

## Scene 6 — Wrap (1:25 – 1:30)

> "Everything syncs via n8n webhooks — Gmail, Google Calendar, and Google Drive can push data in automatically. The app runs fully offline-capable for AI features with a graceful fallback when no OpenAI key is set."

---

## Key Talking Points

| What | Why it matters |
|------|---------------|
| Single-user, self-hosted | No SaaS subscription, full data ownership |
| AI with fallback | Works without an OpenAI key |
| n8n automation | Gmail/Calendar/Drive ingestion without custom OAuth |
| Undo delete | Prevents accidental data loss |
| Keyboard shortcuts | Power-user efficiency (n, m, c, /, ?, Esc) |

---

## Common Questions

**Q: Is this multi-user?**
A: Intentionally single-user — it's a personal OS, not a team tool.

**Q: What AI model does it use?**
A: OpenAI (GPT-4o by default). The model is configurable in `lib/ai.ts`.

**Q: Can I import existing tasks/projects?**
A: Yes — via the n8n automation webhooks at `/api/automation/*`.
