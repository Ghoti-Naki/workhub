import { prisma } from "@/lib/prisma";

export async function GET() {
  const files = await prisma.fileRecord.findMany({
    orderBy: {
      updatedAt: "desc",
    },
  });

  return Response.json({
    data: files,
    meta: {},
    error: null,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const fileType =
      typeof body.fileType === "string" ? body.fileType.trim() : null;
    const mimeType =
      typeof body.mimeType === "string" ? body.mimeType.trim() : null;
    const externalUrl =
      typeof body.externalUrl === "string" ? body.externalUrl.trim() : null;
    const summary =
      typeof body.summary === "string" ? body.summary.trim() : null;
    const projectId =
      typeof body.projectId === "string" ? body.projectId : null;

    if (!name) {
      return Response.json(
        {
          data: null,
          meta: {},
          error: {
            code: "VALIDATION_ERROR",
            message: "File name is required.",
          },
        },
        { status: 422 },
      );
    }

    const file = await prisma.fileRecord.create({
      data: {
        name,
        fileType,
        mimeType,
        externalUrl,
        summary,
        projectId,
      },
    });

    return Response.json(
      {
        data: file,
        meta: {},
        error: null,
      },
      { status: 201 },
    );
  } catch {
    return Response.json(
      {
        data: null,
        meta: {},
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create file record.",
        },
      },
      { status: 500 },
    );
  }
}
