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

    const title = typeof body.title === "string" ? body.title.trim() : null;
    const content = typeof body.content === "string" ? body.content.trim() : "";
    const sourceType =
      typeof body.sourceType === "string" ? body.sourceType : "automation";
    const itemType =
      typeof body.itemType === "string" ? body.itemType : "capture";
    const suggestedAction =
      typeof body.suggestedAction === "string"
        ? body.suggestedAction.trim()
        : null;
    const externalId =
      typeof body.externalId === "string" ? body.externalId : null;

    const run = await createAutomationRun({
      workflow: "inbox_import",
      source: sourceType,
      externalId,
      idempotencyKey,
      payload: body,
    });

    if (!content) {
      await failAutomationRun(run.id, "Missing required inbox content.", body);

      return Response.json(
        {
          data: null,
          meta: {},
          error: {
            code: "VALIDATION_ERROR",
            message: "content is required.",
          },
        },
        { status: 422 },
      );
    }

    let inboxItem;

    if (externalId) {
      const existing = await prisma.inboxItem.findFirst({
        where: {
          suggestedAction: externalId,
        },
      });

      if (existing) {
        inboxItem = await prisma.inboxItem.update({
          where: { id: existing.id },
          data: {
            title,
            content,
            sourceType,
            itemType,
            status: "new",
          },
        });
      } else {
        inboxItem = await prisma.inboxItem.create({
          data: {
            title,
            content,
            sourceType,
            itemType,
            suggestedAction: externalId,
            status: "new",
          },
        });
      }
    } else {
      inboxItem = await prisma.inboxItem.create({
        data: {
          title,
          content,
          sourceType,
          itemType,
          suggestedAction,
          status: "new",
        },
      });
    }

    await completeAutomationRun(
      run.id,
      inboxItem,
      "Inbox item imported successfully.",
    );

    return Response.json(
      {
        data: inboxItem,
        meta: {},
        error: null,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Failed to import inbox item from automation", error);

    return Response.json(
      {
        data: null,
        meta: {},
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to import inbox item from automation.",
        },
      },
      { status: 500 },
    );
  }
}
