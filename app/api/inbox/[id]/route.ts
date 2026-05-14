import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    const inboxItem = await prisma.inboxItem.findUnique({
      where: { id },
      include: {
        project: true,
      },
    });

    return Response.json({
      data: inboxItem,
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
          message: "Failed to fetch inbox item.",
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
      title?: string | null;
      content?: string;
      sourceType?: string;
      itemType?: string;
      status?: string;
      suggestedAction?: string | null;
      projectId?: string | null;
    } = {};

    if (typeof body.title === "string") data.title = body.title.trim();
    if (body.title === null) data.title = null;
    if (typeof body.content === "string") data.content = body.content.trim();
    if (typeof body.sourceType === "string") data.sourceType = body.sourceType;
    if (typeof body.itemType === "string") data.itemType = body.itemType;
    if (typeof body.status === "string") data.status = body.status;
    if (typeof body.suggestedAction === "string") {
      data.suggestedAction = body.suggestedAction.trim();
    }
    if (body.suggestedAction === null) data.suggestedAction = null;
    if (typeof body.projectId === "string") data.projectId = body.projectId;
    if (body.projectId === null) data.projectId = null;

    const inboxItem = await prisma.inboxItem.update({
      where: { id },
      data,
      include: {
        project: true,
      },
    });

    return Response.json({
      data: inboxItem,
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
          message: "Failed to update inbox item.",
        },
      },
      { status: 500 },
    );
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    await prisma.inboxItem.delete({
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
          message: "Failed to delete inbox item.",
        },
      },
      { status: 500 },
    );
  }
}
