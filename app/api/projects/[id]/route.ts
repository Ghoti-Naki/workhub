import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(_req: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        tasks: true,
        notes: true,
        inboxItems: true,
      },
    });

    return Response.json({
      data: project,
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
          message: "Failed to fetch project.",
        },
      },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    const data: {
      title?: string;
      description?: string | null;
      goal?: string | null;
      status?: string;
      priority?: string;
      color?: string | null;
      dueDate?: Date | null;
      startDate?: Date | null;
    } = {};

    if (typeof body.title === "string") data.title = body.title.trim();
    if (typeof body.description === "string")
      data.description = body.description.trim();
    if (body.description === null) data.description = null;
    if (typeof body.goal === "string") data.goal = body.goal.trim();
    if (body.goal === null) data.goal = null;
    if (typeof body.status === "string") data.status = body.status;
    if (typeof body.priority === "string") data.priority = body.priority;
    if (typeof body.color === "string") data.color = body.color;
    if (body.color === null) data.color = null;
    if (typeof body.dueDate === "string") data.dueDate = new Date(body.dueDate);
    if (body.dueDate === null) data.dueDate = null;
    if (typeof body.startDate === "string")
      data.startDate = new Date(body.startDate);
    if (body.startDate === null) data.startDate = null;

    const project = await prisma.project.update({
      where: { id },
      data,
      include: {
        tasks: true,
        notes: true,
      },
    });

    return Response.json({
      data: project,
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
          message: "Failed to update project.",
        },
      },
      { status: 500 },
    );
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    await prisma.project.delete({
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
          message: "Failed to delete project.",
        },
      },
      { status: 500 },
    );
  }
}
