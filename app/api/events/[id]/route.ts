import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    const data: {
      title?: string;
      description?: string | null;
      location?: string | null;
      sourceType?: string;
      externalId?: string | null;
      isAllDay?: boolean;
      startsAt?: Date;
      endsAt?: Date;
    } = {};

    if (typeof body.title === "string") data.title = body.title.trim();
    if (typeof body.description === "string")
      data.description = body.description.trim();
    if (body.description === null) data.description = null;
    if (typeof body.location === "string") data.location = body.location.trim();
    if (body.location === null) data.location = null;
    if (typeof body.sourceType === "string") data.sourceType = body.sourceType;
    if (typeof body.externalId === "string") data.externalId = body.externalId;
    if (body.externalId === null) data.externalId = null;
    if (typeof body.isAllDay === "boolean") data.isAllDay = body.isAllDay;
    if (typeof body.startsAt === "string")
      data.startsAt = new Date(body.startsAt);
    if (typeof body.endsAt === "string") data.endsAt = new Date(body.endsAt);

    const event = await prisma.event.update({
      where: { id },
      data,
    });

    return Response.json({
      data: event,
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
          message: "Failed to update event.",
        },
      },
      { status: 500 },
    );
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    await prisma.event.delete({
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
          message: "Failed to delete event.",
        },
      },
      { status: 500 },
    );
  }
}
