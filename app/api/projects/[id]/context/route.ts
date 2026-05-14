import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        tasks: {
          orderBy: [
            { status: "asc" },
            { dueDate: "asc" },
            { updatedAt: "desc" },
          ],
        },
        notes: {
          orderBy: { updatedAt: "desc" },
        },
        inboxItems: {
          orderBy: { updatedAt: "desc" },
        },
      },
    });

    if (!project) {
      return Response.json(
        {
          data: null,
          meta: {},
          error: {
            code: "NOT_FOUND",
            message: "Project not found.",
          },
        },
        { status: 404 },
      );
    }

    const files = await prisma.fileRecord.findMany({
      where: {
        projectId: id,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    const upcomingEvents = await prisma.event.findMany({
      where: {
        startsAt: {
          gte: new Date(),
        },
      },
      orderBy: {
        startsAt: "asc",
      },
      take: 5,
    });

    const openTasks = project.tasks.filter((task) => task.status !== "done");
    const overdueTasks = project.tasks.filter(
      (task) =>
        task.status !== "done" &&
        task.dueDate &&
        new Date(task.dueDate) < new Date(),
    );

    return Response.json({
      data: {
        project,
        files,
        upcomingEvents,
        stats: {
          openTasks: openTasks.length,
          completedTasks: project.tasks.length - openTasks.length,
          notes: project.notes.length,
          inboxItems: project.inboxItems.length,
          files: files.length,
          overdueTasks: overdueTasks.length,
        },
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
          message: "Failed to load project context.",
        },
      },
      { status: 500 },
    );
  }
}
