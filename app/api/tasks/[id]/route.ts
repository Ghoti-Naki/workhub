import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    const data: {
      title?: string;
      description?: string | null;
      status?: string;
      priority?: string;
      projectId?: string | null;
      dueDate?: Date | null;
      startDate?: Date | null;
      estimatedMinutes?: number | null;
      aiNextAction?: string | null;
    } = {};

    if (typeof body.title === "string") data.title = body.title.trim();
    if (typeof body.description === "string")
      data.description = body.description.trim();
    if (body.description === null) data.description = null;
    if (typeof body.status === "string") data.status = body.status;
    if (typeof body.priority === "string") data.priority = body.priority;
    if (typeof body.projectId === "string") data.projectId = body.projectId;
    if (body.projectId === null) data.projectId = null;
    if (typeof body.aiNextAction === "string")
      data.aiNextAction = body.aiNextAction.trim();
    if (body.aiNextAction === null) data.aiNextAction = null;
    if (typeof body.estimatedMinutes === "number")
      data.estimatedMinutes = body.estimatedMinutes;
    if (body.estimatedMinutes === null) data.estimatedMinutes = null;
    if (typeof body.dueDate === "string") data.dueDate = new Date(body.dueDate);
    if (body.dueDate === null) data.dueDate = null;
    if (typeof body.startDate === "string")
      data.startDate = new Date(body.startDate);
    if (body.startDate === null) data.startDate = null;

    const task = await prisma.task.update({
      where: { id },
      data,
      include: {
        project: true,
      },
    });

    return Response.json({
      data: task,
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
          message: "Failed to update task.",
        },
      },
      { status: 500 },
    );
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    await prisma.task.delete({
      where: { id },
    });

    return Response.json({
      data: { success: true },
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
          message: "Failed to delete task.",
        },
      },
      { status: 500 },
    );
  }
}
