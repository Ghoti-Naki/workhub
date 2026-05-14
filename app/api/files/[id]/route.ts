import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    const file = await prisma.fileRecord.findUnique({
      where: { id },
    });

    return Response.json({
      data: file,
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
          message: "Failed to fetch file record.",
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
      name?: string;
      fileType?: string | null;
      mimeType?: string | null;
      externalUrl?: string | null;
      summary?: string | null;
      projectId?: string | null;
    } = {};

    if (typeof body.name === "string") data.name = body.name.trim();
    if (typeof body.fileType === "string") data.fileType = body.fileType.trim();
    if (body.fileType === null) data.fileType = null;
    if (typeof body.mimeType === "string") data.mimeType = body.mimeType.trim();
    if (body.mimeType === null) data.mimeType = null;
    if (typeof body.externalUrl === "string")
      data.externalUrl = body.externalUrl.trim();
    if (body.externalUrl === null) data.externalUrl = null;
    if (typeof body.summary === "string") data.summary = body.summary.trim();
    if (body.summary === null) data.summary = null;
    if (typeof body.projectId === "string") data.projectId = body.projectId;
    if (body.projectId === null) data.projectId = null;

    const file = await prisma.fileRecord.update({
      where: { id },
      data,
    });

    return Response.json({
      data: file,
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
          message: "Failed to update file record.",
        },
      },
      { status: 500 },
    );
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    await prisma.fileRecord.delete({
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
          message: "Failed to delete file record.",
        },
      },
      { status: 500 },
    );
  }
}
