/**
 * POST /api/automation/events-upsert
 *
 * Creates or updates a calendar event from an n8n workflow (e.g. Google
 * Calendar sync). Matches by `externalId` — if a record with that ID already
 * exists it is updated in place; otherwise a new event is created. Requires
 * AUTOMATION_SECRET Bearer token. Logs every run to AutomationRun.
 */
import { prisma } from "@/lib/prisma";
import { isValidAutomationSecret } from "@/lib/automation";
import {
  createAutomationRun,
  completeAutomationRun,
  failAutomationRun,
} from "@/lib/automation-runs";

export async function POST(req: Request) {
  if (!isValidAutomationSecret(req)) {
    return Response.json(
      {
        data: null,
        meta: {},
        error: {
          code: "FORBIDDEN",
          message: "Invalid automation secret.",
        },
      },
      { status: 403 },
    );
  }

  const idempotencyKey = req.headers.get("Idempotency-Key");

  try {
    const body = await req.json();
    const externalId =
      typeof body.externalId === "string" ? body.externalId : null;

    const run = await createAutomationRun({
      workflow: "events_upsert",
      source:
        typeof body.sourceType === "string" ? body.sourceType : "automation",
      externalId,
      idempotencyKey,
      payload: body,
    });

    const title = typeof body.title === "string" ? body.title.trim() : "";
    const description =
      typeof body.description === "string" ? body.description.trim() : null;
    const location =
      typeof body.location === "string" ? body.location.trim() : null;
    const sourceType =
      typeof body.sourceType === "string" ? body.sourceType : "automation";
    const isAllDay = typeof body.isAllDay === "boolean" ? body.isAllDay : false;
    const startsAt =
      typeof body.startsAt === "string" ? new Date(body.startsAt) : null;
    const endsAt =
      typeof body.endsAt === "string" ? new Date(body.endsAt) : null;

    if (!title || !startsAt || !endsAt) {
      await failAutomationRun(run.id, "Missing required event fields.", body);

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

    let event;

    if (externalId) {
      const existing = await prisma.event.findFirst({
        where: { externalId },
      });

      if (existing) {
        event = await prisma.event.update({
          where: { id: existing.id },
          data: {
            title,
            description,
            location,
            sourceType,
            isAllDay,
            startsAt,
            endsAt,
          },
        });
      } else {
        event = await prisma.event.create({
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
      }
    } else {
      event = await prisma.event.create({
        data: {
          title,
          description,
          location,
          sourceType,
          isAllDay,
          startsAt,
          endsAt,
        },
      });
    }

    await completeAutomationRun(run.id, event, "Event upserted successfully.");

    return Response.json({
      data: event,
      meta: {},
      error: null,
    });
  } catch (error) {
    console.error("Failed to upsert event from automation", error);

    return Response.json(
      {
        data: null,
        meta: {},
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to upsert event from automation.",
        },
      },
      { status: 500 },
    );
  }
}
