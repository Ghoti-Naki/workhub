import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    const targetType =
      typeof body.targetType === "string" ? body.targetType : "";

    const inboxItem = await prisma.inboxItem.findUnique({
      where: { id },
    });

    if (!inboxItem) {
      return Response.json(
        {
          data: null,
          meta: {},
          error: {
            code: "NOT_FOUND",
            message: "Inbox item not found.",
          },
        },
        { status: 404 },
      );
    }

    if (targetType === "task") {
      const task = await prisma.task.create({
        data: {
          title: inboxItem.title || "Inbox task",
          description: inboxItem.content,
          projectId: inboxItem.projectId,
          status: "todo",
          priority: "medium",
        },
      });

      await prisma.inboxItem.update({
        where: { id },
        data: {
          status: "converted",
          suggestedAction: "Converted into task",
        },
      });

      return Response.json({
        data: {
          createdEntityType: "task",
          createdEntity: task,
        },
        meta: {},
        error: null,
      });
    }

    if (targetType === "note") {
      const note = await prisma.note.create({
        data: {
          title: inboxItem.title || "Inbox note",
          body: inboxItem.content,
          projectId: inboxItem.projectId,
        },
      });

      await prisma.inboxItem.update({
        where: { id },
        data: {
          status: "converted",
          suggestedAction: "Converted into note",
        },
      });

      return Response.json({
        data: {
          createdEntityType: "note",
          createdEntity: note,
        },
        meta: {},
        error: null,
      });
    }

    return Response.json(
      {
        data: null,
        meta: {},
        error: {
          code: "VALIDATION_ERROR",
          message: "targetType must be 'task' or 'note'.",
        },
      },
      { status: 422 },
    );
  } catch {
    return Response.json(
      {
        data: null,
        meta: {},
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to convert inbox item.",
        },
      },
      { status: 500 },
    );
  }
}
