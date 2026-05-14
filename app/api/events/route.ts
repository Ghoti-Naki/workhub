import { prisma } from "@/lib/prisma";

export async function GET() {
  const events = await prisma.event.findMany({
    orderBy: [{ startsAt: "asc" }, { updatedAt: "desc" }],
  });

  return Response.json({
    data: events,
    meta: {},
    error: null,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const title = typeof body.title === "string" ? body.title.trim() : "";
    const description =
      typeof body.description === "string" ? body.description.trim() : null;
    const location =
      typeof body.location === "string" ? body.location.trim() : null;
    const sourceType =
      typeof body.sourceType === "string" ? body.sourceType : "manual";
    const externalId =
      typeof body.externalId === "string" ? body.externalId : null;
    const isAllDay = typeof body.isAllDay === "boolean" ? body.isAllDay : false;
    const startsAt =
      typeof body.startsAt === "string" ? new Date(body.startsAt) : null;
    const endsAt =
      typeof body.endsAt === "string" ? new Date(body.endsAt) : null;

    if (!title || !startsAt || !endsAt) {
      return Response.json(
        {
          data: null,
          meta: {},
          error: {
            code: "VALIDATION_ERROR",
            message: "title, startsAt, and endsAt are required.",
          },
        },
        { status: 422 },
      );
    }

    const event = await prisma.event.create({
      data: {
        title,
        description,
        location,
        sourceType,
        externalId,
        isAllDay,
        startsAt,
        endsAt,
      },
    });

    return Response.json(
      {
        data: event,
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
          message: "Failed to create event.",
        },
      },
      { status: 500 },
    );
  }
}
