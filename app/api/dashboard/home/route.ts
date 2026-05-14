import { prisma } from "@/lib/prisma";

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function endOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
}

export async function GET() {
  try {
    const todayStart = startOfToday();
    const todayEnd = endOfToday();

    const [
      topTasks,
      overdueTasks,
      upcomingDeadlines,
      todayEvents,
      latestInboxItems,
      activeProjects,
      openTasksCount,
      newInboxCount,
    ] = await Promise.all([
      prisma.task.findMany({
        where: {
          status: {
            not: "done",
          },
        },
        orderBy: [{ priority: "desc" }, { dueDate: "asc" }],
        take: 4,
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
        take: 6,
      }),
      prisma.task.findMany({
        where: {
          status: {
            not: "done",
          },
          dueDate: {
            gte: todayStart,
          },
        },
        orderBy: {
          dueDate: "asc",
        },
        take: 6,
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
        take: 6,
      }),
      prisma.task.count({
        where: {
          status: {
            not: "done",
          },
        },
      }),
      prisma.inboxItem.count({
        where: {
          status: "new",
        },
      }),
    ]);

    const dailyBrief = {
      summary:
        topTasks.length === 0
          ? "You have no open tasks right now. This is a good time to plan your next priorities or clean up your inbox."
          : `You currently have ${openTasksCount} open tasks, ${overdueTasks.length} overdue items, and ${newInboxCount} new inbox captures. Focus first on the most time-sensitive work, then clear the newest inbox items that need action.`,
      highlights: [
        topTasks[0] ? `Top focus: ${topTasks[0].title}` : null,
        overdueTasks.length > 0
          ? `${overdueTasks.length} task(s) are overdue`
          : "No overdue tasks right now",
        newInboxCount > 0
          ? `${newInboxCount} new inbox item(s) need review`
          : "Inbox is under control",
      ].filter(Boolean),
    };

    return Response.json({
      data: {
        topTasks,
        overdueTasks,
        upcomingDeadlines,
        todayEvents,
        latestInboxItems,
        activeProjects,
        stats: {
          openTasks: openTasksCount,
          activeProjects: activeProjects.length,
          newInbox: newInboxCount,
        },
        dailyBrief,
      },
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
          message: "Failed to load dashboard data.",
        },
      },
      { status: 500 },
    );
  }
}
