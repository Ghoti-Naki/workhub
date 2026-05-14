import { prisma } from "@/lib/prisma";

export async function GET() {
  const inboxItems = await prisma.inboxItem.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      project: true,
    },
  });

  return Response.json({
    data: inboxItems,
    meta: {},
    error: null,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const title = typeof body.title === "string" ? body.title.trim() : null;
    const content = typeof body.content === "string" ? body.content.trim() : "";
    const sourceType =
      typeof body.sourceType === "string" ? body.sourceType : "manual";
    const itemType =
      typeof body.itemType === "string" ? body.itemType : "capture";
    const projectId =
      typeof body.projectId === "string" ? body.projectId : null;

    if (!content) {
      return Response.json(
        {
          data: null,
          meta: {},
          error: {
            code: "VALIDATION_ERROR",
            message: "Inbox item content is required.",
          },
        },
        { status: 422 },
      );
    }

    const inboxItem = await prisma.inboxItem.create({
      data: {
        title,
        content,
        sourceType,
        itemType,
        projectId,
      },
      include: {
        project: true,
      },
    });

    return Response.json(
      {
        data: inboxItem,
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
          message: "Failed to create inbox item.",
        },
      },
      { status: 500 },
    );
  }
}
