/**
 * Demo-mode fixture responses for AI routes.
 *
 * When DEMO_MODE=true, AI routes return these static strings instead of
 * calling OpenAI. This lets you run a compelling demo with zero API cost
 * and no OpenAI key required — on top of the existing no-key fallback.
 *
 * Usage: set DEMO_MODE=true in your environment.
 */

export const DEMO_DAILY_BRIEF = `Good morning. Here's your workspace briefing for today.

**Focus:** You have 3 active tasks due this week, with "Finalize homepage copy" marked urgent. Clearing that should be your first action.

**Watch out:** 2 tasks are overdue — "Update project dependencies" and "Send weekly report". These should be addressed before end of day.

**Meetings:** You have a team sync at 2:00 PM and a client review at 4:30 PM. Prepare the slide deck before the afternoon block.

**Inbox:** 4 items are waiting for triage. The automation has flagged one as a potential task — review it when you have 5 minutes.

**Projects:** "Website Redesign" is at 65% progress. "Q3 Report" is on hold pending stakeholder feedback.

Stay focused on your top priority first. You've got this.`;

export const DEMO_COPILOT_ANSWER = `Based on your current workspace data, here's what I found:

Your most urgent open task is **"Finalize homepage copy"** (due today, priority: urgent). It belongs to the "Website Redesign" project, which is your most active project at 65% completion.

After that, I'd recommend addressing the 2 overdue tasks — they've been sitting past their due dates and may be blocking downstream work.

For today's meetings, the client review at 4:30 PM is the most time-sensitive prep item. The related note "Client feedback summary" in your Notes section has the latest context.

Is there a specific project or task you'd like me to dig into further?`;

export const DEMO_PROJECT_SUMMARY = `## Project Summary: Website Redesign

**Status:** Active — 65% complete (13 of 20 tasks done)

**What's going well:** The design phase is fully complete. All wireframes are approved and the component library is built.

**Blockers:** The homepage copy is still outstanding (due today). Two tasks in the "Development" group are blocked waiting for final copy.

**Overdue:** 1 task — "Update dependencies" — has slipped past its due date without a status change.

**Next recommended actions:**
1. Complete "Finalize homepage copy" (urgent, due today)
2. Unblock the development tasks waiting on copy
3. Schedule a review meeting once copy is merged

**Upcoming:** A client review is scheduled for this afternoon — the project should be at 70%+ by then.`;
