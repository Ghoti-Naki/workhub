import { prisma } from "@/lib/prisma";

export async function GET() {
  const notes = await prisma.note.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      project: true,
    },
  });

  return Response.json({
    data: notes,
    meta: {},
    error: null,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const title = typeof body.title === "string" ? body.title.trim() : "";
    const bodyText = typeof body.body === "string" ? body.body.trim() : "";
    const projectId =
      typeof body.projectId === "string" ? body.projectId : null;

    if (!title || !bodyText) {
      return Response.json(
        {
          data: null,
          meta: {},
          error: {
            code: "VALIDATION_ERROR",
            message: "Note title and body are required.",
          },
        },
        { status: 422 },
      );
    }

    const note = await prisma.note.create({
      data: {
        title,
        body: bodyText,
        projectId,
      },
      include: {
        project: true,
      },
    });

    return Response.json(
      {
        data: note,
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
          message: "Failed to create note.",
        },
      },
      { status: 500 },
    );
  }
}
