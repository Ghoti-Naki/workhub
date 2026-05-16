import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Dates relative to seed time
const now = new Date();
const daysFromNow = (n: number) => new Date(now.getTime() + n * 86_400_000);

async function main() {
  console.log("Seeding database…");

  // Clear existing data in dependency order
  await prisma.aiExtraction.deleteMany();
  await prisma.aiOutput.deleteMany();
  await prisma.automationRun.deleteMany();
  await prisma.fileRecord.deleteMany();
  await prisma.event.deleteMany();
  await prisma.inboxItem.deleteMany();
  await prisma.note.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.workspaceSettings.deleteMany();

  // ── Workspace ─────────────────────────────────────────────────────────────
  await prisma.workspaceSettings.create({
    data: {
      workspaceName: "My Work Hub",
      timezone: "Asia/Jakarta",
      onboardingCompleted: true,
    },
  });

  // ── Projects ──────────────────────────────────────────────────────────────
  const portfolio = await prisma.project.create({
    data: {
      title: "Portfolio Website Redesign",
      description:
        "Rebuild personal portfolio with new case studies, improved UX, and a blog section.",
      goal: "Launch updated portfolio before end of month to support job applications.",
      status: "active",
      priority: "high",
      color: "#6366f1",
      startDate: daysFromNow(-14),
      dueDate: daysFromNow(10),
    },
  });

  const mlCourse = await prisma.project.create({
    data: {
      title: "Machine Learning Fundamentals",
      description:
        "Complete the Stanford ML course and build two practical projects to demonstrate skills.",
      goal: "Finish all course modules and publish both projects to GitHub by next month.",
      status: "active",
      priority: "medium",
      color: "#10b981",
      startDate: daysFromNow(-30),
      dueDate: daysFromNow(30),
    },
  });

  const q3Review = await prisma.project.create({
    data: {
      title: "Q3 Team Presentation",
      description: "Prepare and deliver the Q3 progress review for the product team.",
      goal: "Present clear progress metrics and the Q4 roadmap to stakeholders.",
      status: "completed",
      priority: "high",
      color: "#f59e0b",
      startDate: daysFromNow(-21),
      dueDate: daysFromNow(-3),
    },
  });

  // ── Tasks ─────────────────────────────────────────────────────────────────
  await prisma.task.createMany({
    data: [
      // Portfolio project
      {
        title: "Write case study for AI Work Hub project",
        description: "Document problem, solution, tech stack, and outcomes. Include screenshots.",
        status: "in_progress",
        priority: "high",
        projectId: portfolio.id,
        dueDate: daysFromNow(2),
        estimatedMinutes: 120,
      },
      {
        title: "Design new hero section",
        description: "Redesign landing page hero with updated tagline and project highlight cards.",
        status: "todo",
        priority: "high",
        projectId: portfolio.id,
        dueDate: daysFromNow(4),
        estimatedMinutes: 90,
      },
      {
        title: "Set up custom domain and deploy",
        description: "Configure DNS, deploy to Vercel, test all pages in production.",
        status: "todo",
        priority: "medium",
        projectId: portfolio.id,
        dueDate: daysFromNow(8),
        estimatedMinutes: 60,
      },
      {
        title: "Write blog post: How I built AI Work Hub",
        description: "Technical write-up covering architecture decisions and lessons learned.",
        status: "todo",
        priority: "low",
        projectId: portfolio.id,
        dueDate: daysFromNow(12),
        estimatedMinutes: 180,
      },
      // ML Course project
      {
        title: "Complete Week 5: Neural Networks",
        description: "Finish lectures, quizzes, and programming assignment for Week 5.",
        status: "done",
        priority: "medium",
        projectId: mlCourse.id,
        dueDate: daysFromNow(-7),
        estimatedMinutes: 240,
      },
      {
        title: "Build image classifier project",
        description:
          "Train CNN on CIFAR-10 dataset, evaluate accuracy, write README, push to GitHub.",
        status: "in_progress",
        priority: "high",
        projectId: mlCourse.id,
        dueDate: daysFromNow(5),
        estimatedMinutes: 300,
      },
      {
        title: "Complete Week 6: Optimization Methods",
        description: "Lectures and assignment on gradient descent variants and learning rate tuning.",
        status: "todo",
        priority: "medium",
        projectId: mlCourse.id,
        dueDate: daysFromNow(7),
        estimatedMinutes: 200,
      },
      // Q3 project (completed)
      {
        title: "Compile Q3 metrics",
        description: "Pull data from analytics dashboard and format into slide-ready numbers.",
        status: "done",
        priority: "high",
        projectId: q3Review.id,
        dueDate: daysFromNow(-6),
        estimatedMinutes: 60,
      },
      {
        title: "Deliver Q3 presentation",
        status: "done",
        priority: "high",
        projectId: q3Review.id,
        dueDate: daysFromNow(-3),
        estimatedMinutes: 60,
      },
      // Standalone tasks
      {
        title: "Review pull request from teammate",
        description: "Read through the auth refactor PR, leave comments, approve or request changes.",
        status: "todo",
        priority: "high",
        dueDate: daysFromNow(-1), // overdue
        estimatedMinutes: 30,
      },
      {
        title: "Update resume with new projects",
        description: "Add AI Work Hub and ML classifier to the projects section.",
        status: "todo",
        priority: "medium",
        dueDate: daysFromNow(6),
        estimatedMinutes: 45,
      },
      {
        title: "Schedule 1:1 with mentor",
        status: "todo",
        priority: "low",
        dueDate: daysFromNow(3),
        estimatedMinutes: 15,
      },
    ],
  });

  // ── Notes ─────────────────────────────────────────────────────────────────
  await prisma.note.createMany({
    data: [
      {
        title: "Portfolio redesign — meeting notes",
        body: `## Notes from portfolio review session

Feedback from mentor:
- Hero section feels outdated, needs stronger visual hook
- Case studies lack outcome metrics — add numbers where possible
- Blog is a strong differentiator, prioritize at least one post

Action items I captured:
- Redesign hero section with project highlight cards
- Add quantified outcomes to each case study
- Draft first blog post about AI Work Hub
- Set up analytics to track visitor flow
- Get at least 3 peers to review before launch`,
        projectId: portfolio.id,
      },
      {
        title: "ML Course — week 5 notes",
        body: `## Neural Networks key concepts

Activation functions:
- ReLU: max(0, x) — default choice, fast, avoids vanishing gradient
- Sigmoid: squashes to (0,1) — use only in output for binary classification
- Softmax: multi-class output, sums to 1

Backpropagation:
- Compute loss gradient at output
- Chain rule propagates gradient back through each layer
- Update weights: w = w - lr * gradient

Key things to revisit:
- Re-read the vanishing gradient section
- Practice implementing backprop from scratch in numpy
- Look up batch normalization before starting Week 6`,
        projectId: mlCourse.id,
      },
      {
        title: "Ideas: AI Work Hub improvements",
        body: `Ideas captured after demo session:

Things people asked about:
- Can it connect directly to Gmail without n8n? (future roadmap)
- Does it support multiple users? (no, single-user by design)
- Can I see which tasks came from inbox items?

Quick wins I should build next:
- Add filter bar on tasks page (by status, priority, project)
- Show task count badges in sidebar navigation
- Add keyboard shortcut Ctrl+K for command palette
- Export daily brief as PDF or email
- Link inbox items to the tasks they were converted into

Bigger ideas:
- Weekly AI review that summarizes the past 7 days
- Deadline risk score per project based on incomplete tasks vs due date
- Mobile-friendly layout for quick capture on the go`,
      },
      {
        title: "Job search checklist",
        body: `## Active job search checklist

Application materials:
- [ ] Update resume with AI Work Hub project
- [ ] Update LinkedIn headline and summary
- [ ] Polish GitHub profile README
- [ ] Prepare 3-minute project pitch for phone screens
- [ ] Write cold outreach template

Companies to research this week:
- Check open roles at Vercel and Linear
- Look at YC W25 batch for interesting startups
- Check if old internship contacts are hiring

Interview prep:
- Practice system design: design a task management API
- Review React and Next.js fundamentals
- Re-read the Prisma docs on transactions
- Prepare answers for "tell me about a hard technical problem"`,
      },
    ],
  });

  // ── Inbox items ───────────────────────────────────────────────────────────
  await prisma.inboxItem.createMany({
    data: [
      {
        title: "Recruiter message from TechCorp",
        content:
          "Hi, I came across your GitHub profile and wanted to reach out about a mid-level fullstack role at TechCorp. We're building a developer productivity platform in Next.js. Are you open to a brief call this week?",
        sourceType: "gmail",
        itemType: "email",
        status: "new",
        suggestedAction: "reply",
        externalId: "gmail-msg-tc-001",
      },
      {
        title: "Quick capture: improve task filtering UX",
        content:
          "The tasks page needs a filter bar — at minimum filter by status and priority. Would make the demo much cleaner.",
        sourceType: "manual",
        itemType: "capture",
        status: "new",
        suggestedAction: "create_task",
        projectId: portfolio.id,
      },
      {
        title: "Newsletter: AI tools roundup May 2026",
        content:
          "This week's tools: Cursor 2.0 released with multi-file edit support. OpenAI launched Realtime API for voice apps. Vercel announced edge function analytics dashboard.",
        sourceType: "gmail",
        itemType: "newsletter",
        status: "new",
        externalId: "gmail-msg-nl-002",
      },
      {
        title: "GitHub notification: PR approved",
        content:
          "Your pull request 'Add AI daily brief endpoint' was approved and merged by @reviewer into main.",
        sourceType: "automation",
        itemType: "notification",
        status: "archived",
        externalId: "github-pr-approved-001",
      },
      {
        title: "Reminder: submit competition project",
        content:
          "Competition submission deadline is in 5 days. Make sure the repo is public, README is polished, and demo video is uploaded.",
        sourceType: "manual",
        itemType: "capture",
        status: "new",
        suggestedAction: "create_task",
      },
    ],
  });

  // ── Events ────────────────────────────────────────────────────────────────
  await prisma.event.createMany({
    data: [
      {
        title: "Portfolio review with mentor",
        description: "Review current state of portfolio redesign, get feedback on case studies.",
        startsAt: daysFromNow(1),
        endsAt: new Date(daysFromNow(1).getTime() + 60 * 60 * 1000),
        sourceType: "manual",
      },
      {
        title: "ML study session",
        description: "Week 6 optimization methods — block time to finish lectures and assignment.",
        startsAt: daysFromNow(2),
        endsAt: new Date(daysFromNow(2).getTime() + 3 * 60 * 60 * 1000),
        sourceType: "manual",
      },
      {
        title: "Phone screen — TechCorp",
        description: "Initial recruiter call. Have resume and project pitch ready.",
        startsAt: daysFromNow(3),
        endsAt: new Date(daysFromNow(3).getTime() + 30 * 60 * 1000),
        sourceType: "google_calendar",
        externalId: "gcal-event-tc-001",
      },
      {
        title: "Competition submission deadline",
        description: "Final deadline to submit project. Repo must be public with demo video link.",
        startsAt: daysFromNow(5),
        endsAt: new Date(daysFromNow(5).getTime() + 60 * 60 * 1000),
        isAllDay: true,
        sourceType: "manual",
      },
      {
        title: "Weekly review",
        description: "Review completed tasks, update project statuses, plan next week.",
        startsAt: daysFromNow(7),
        endsAt: new Date(daysFromNow(7).getTime() + 45 * 60 * 1000),
        sourceType: "manual",
      },
    ],
  });

  // ── File records ──────────────────────────────────────────────────────────
  await prisma.fileRecord.createMany({
    data: [
      {
        name: "Portfolio Case Studies Draft v2.docx",
        fileType: "document",
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        externalUrl: "https://drive.google.com/file/placeholder-portfolio-case-studies",
        summary: "Draft case studies for three projects. AI Work Hub section is complete; others need outcome metrics.",
        projectId: portfolio.id,
      },
      {
        name: "ML Course Notes — Weeks 1–5.pdf",
        fileType: "document",
        mimeType: "application/pdf",
        externalUrl: "https://drive.google.com/file/placeholder-ml-notes",
        summary: "Personal notes and annotated slides from the first 5 weeks of the Stanford ML course.",
        projectId: mlCourse.id,
      },
      {
        name: "Q3 Review Slides Final.pptx",
        fileType: "presentation",
        mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        externalUrl: "https://drive.google.com/file/placeholder-q3-slides",
        summary: "Final version of the Q3 presentation delivered to stakeholders. Includes metrics and Q4 roadmap.",
        projectId: q3Review.id,
      },
    ],
  });

  // ── AI output (example daily brief) ──────────────────────────────────────
  await prisma.aiOutput.create({
    data: {
      outputType: "daily_brief",
      title: "Daily Brief",
      content: `Good morning. Here is your work summary for today.

**Top priorities**
You have 2 high-priority tasks due this week: writing the AI Work Hub case study (due in 2 days) and completing the image classifier project (due in 5 days). Both are currently in progress.

**Overdue**
One task is overdue: "Review pull request from teammate" — this should be addressed first.

**Today's schedule**
You have a portfolio review with your mentor tomorrow. Make sure the hero section redesign is at a shareable state before then.

**Inbox**
3 new inbox items need attention. A recruiter message from TechCorp and a competition submission reminder both have suggested actions.

**Recommendation**
Start with the overdue PR review, then focus on the case study draft since the portfolio review is tomorrow.`,
      metadata: {
        taskCount: 12,
        overdueCount: 1,
        inboxNewCount: 3,
        eventsToday: 0,
        eventsTomorrow: 1,
        generatedAt: now.toISOString(),
      },
    },
  });

  // ── Automation run (example n8n import) ───────────────────────────────────
  await prisma.automationRun.createMany({
    data: [
      {
        workflow: "gmail-inbox-import",
        source: "n8n",
        status: "completed",
        externalId: "n8n-run-gmail-001",
        message: "Imported 2 inbox items from Gmail",
        result: { imported: 2, skipped: 0 },
      },
      {
        workflow: "google-calendar-sync",
        source: "n8n",
        status: "completed",
        externalId: "n8n-run-gcal-001",
        message: "Upserted 1 calendar event",
        result: { upserted: 1 },
      },
    ],
  });

  console.log("Seed complete.");
  console.log(`  Projects: 3`);
  console.log(`  Tasks: 12`);
  console.log(`  Notes: 4`);
  console.log(`  Inbox items: 5`);
  console.log(`  Events: 5`);
  console.log(`  File records: 3`);
  console.log(`  AI outputs: 1`);
  console.log(`  Automation runs: 2`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
