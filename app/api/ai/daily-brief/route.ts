/**
 * POST /api/ai/daily-brief
 *
 * Generates a concise daily brief using the workspace's current tasks, events,
 * and inbox. The brief is persisted as an AiOutput record so it can be
 * retrieved later without re-generating. Falls back gracefully when
 * OPENAI_API_KEY is absent — the AI layer returns a heuristic summary instead
 * of throwing. Callers should check `json.error.code === "AI_NOT_CONFIGURED"`.
 */
import { prisma } from "@/lib/prisma";
import { generateText } from "@/lib/ai";

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function endOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
}

export async function POST() {
  try {
    const todayStart = startOfToday();
    const todayEnd = endOfToday();

    const [
      topTasks,
      overdueTasks,
      todayEvents,
      latestInboxItems,
      activeProjects,
    ] = await Promise.all([
      prisma.task.findMany({
        where: {
          status: {
            not: "done",
          },
        },
        orderBy: [{ priority: "desc" }, { dueDate: "asc" }],
        take: 5,
      }),
      prisma.task.findMany({
        where: {
          status: {
            not: "done",
          },
          dueDate: {
            lt: todayStart,
          },
        },
        orderBy: {
          dueDate: "asc",
        },
        take: 5,
      }),
      prisma.event.findMany({
        where: {
          startsAt: {
            gte: todayStart,
            lt: todayEnd,
          },
        },
        orderBy: {
          startsAt: "asc",
        },
        take: 8,
      }),
      prisma.inboxItem.findMany({
        orderBy: {
          updatedAt: "desc",
        },
        take: 5,
      }),
      prisma.project.findMany({
        where: {
          status: "active",
        },
        orderBy: {
          updatedAt: "desc",
        },
        take: 5,
      }),
    ]);

    const prompt = `
Today context:

Top Tasks:
${topTasks.map((t) => `- ${t.title} | ${t.status} | due: ${t.dueDate ?? "none"} | priority: ${t.priority}`).join("\n") || "- none"}

Overdue Tasks:
${overdueTasks.map((t) => `- ${t.title} | due: ${t.dueDate ?? "none"}`).join("\n") || "- none"}

Today's Events:
${todayEvents.map((e) => `- ${e.title} | starts: ${e.startsAt} | ends: ${e.endsAt}`).join("\n") || "- none"}

Inbox:
${latestInboxItems.map((i) => `- ${i.title ?? "Untitled"}: ${i.content}`).join("\n") || "- none"}

Active Projects:
${activeProjects.map((p) => `- ${p.title} | ${p.status} | priority: ${p.priority}`).join("\n") || "- none"}
`;

    const content = await generateText({
      systemPrompt:
        "You write a concise, grounded daily brief for a personal productivity workspace. Use only the provided data. Keep it practical and short.",
      userPrompt: prompt,
    });

    const highlights = [
      topTasks[0] ? `Top focus: ${topTasks[0].title}` : null,
      overdueTasks.length > 0
        ? `${overdueTasks.length} overdue task(s)`
        : "No overdue tasks",
      latestInboxItems.length > 0
        ? `${latestInboxItems.length} inbox item(s) need review`
        : "Inbox is clear",
    ].filter(Boolean);

    const output = await prisma.aiOutput.create({
      data: {
        outputType: "daily_brief",
        targetType: "workspace",
        title: "Daily Brief",
        content,
        metadata: {
          highlights,
          topTaskCount: topTasks.length,
          overdueCount: overdueTasks.length,
          eventCount: todayEvents.length,
          inboxCount: latestInboxItems.length,
          activeProjectCount: activeProjects.length,
        },
      },
    });

    return Response.json({
      data: output,
      meta: {},
      error: null,
    });
  } catch {
    return Response.json(
      {
        data: null,
        meta: {},
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate daily brief.",
        },
      },
      { status: 500 },
    );
  }
}
