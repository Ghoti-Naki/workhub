import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    const note = await prisma.note.findUnique({
      where: { id },
      include: {
        project: true,
      },
    });

    return Response.json({
      data: note,
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
          message: "Failed to fetch note.",
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
      body?: string;
      summary?: string | null;
      projectId?: string | null;
    } = {};

    if (typeof body.title === "string") data.title = body.title.trim();
    if (typeof body.body === "string") data.body = body.body.trim();
    if (typeof body.summary === "string") data.summary = body.summary.trim();
    if (body.summary === null) data.summary = null;
    if (typeof body.projectId === "string") data.projectId = body.projectId;
    if (body.projectId === null) data.projectId = null;

    const note = await prisma.note.update({
      where: { id },
      data,
      include: {
        project: true,
      },
    });

    return Response.json({
      data: note,
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
          message: "Failed to update note.",
        },
      },
      { status: 500 },
    );
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    await prisma.note.delete({
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
          message: "Failed to delete note.",
        },
      },
      { status: 500 },
    );
  }
}
