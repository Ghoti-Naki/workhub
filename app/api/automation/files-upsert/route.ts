/**
 * POST /api/automation/files-upsert
 *
 * Creates or updates a file record from an n8n workflow (e.g. Google Drive
 * sync). Matches by `externalUrl` — if a record already exists at that URL it
 * is updated in place; otherwise a new FileRecord is created. Requires
 * AUTOMATION_SECRET Bearer token. Logs every run to AutomationRun.
 * Rate-limited to 60 requests per minute per IP.
 */
import { prisma } from "@/lib/prisma";
import { isValidAutomationSecret } from "@/lib/automation";
import {
  createAutomationRun,
  completeAutomationRun,
  failAutomationRun,
} from "@/lib/automation-runs";
import { checkRateLimit, getRequestIp } from "@/lib/rateLimit";

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

  const ip = getRequestIp(req);
  const rl = checkRateLimit(`files-upsert:${ip}`);
  if (!rl.allowed) {
    return Response.json(
      { data: null, meta: {}, error: { code: "RATE_LIMITED", message: "Too many requests. Please slow down." } },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
    );
  }

  const idempotencyKey = req.headers.get("Idempotency-Key");

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
    const sourceType =
      typeof body.sourceType === "string" ? body.sourceType : "automation";

    const run = await createAutomationRun({
      workflow: "files_upsert",
      source: sourceType,
      externalId: externalUrl,
      idempotencyKey,
      payload: body,
    });

    if (!name) {
      await failAutomationRun(run.id, "Missing required file name.", body);

      return Response.json(
        {
          data: null,
          meta: {},
          error: {
            code: "VALIDATION_ERROR",
            message: "name is required.",
          },
        },
        { status: 422 },
      );
    }

    let file;

    if (externalUrl) {
      const existing = await prisma.fileRecord.findFirst({
        where: { externalUrl },
      });

      if (existing) {
        file = await prisma.fileRecord.update({
          where: { id: existing.id },
          data: {
            name,
            fileType,
            mimeType,
            summary,
            projectId,
          },
        });
      } else {
        file = await prisma.fileRecord.create({
          data: {
            name,
            fileType,
            mimeType,
            externalUrl,
            summary,
            projectId,
          },
        });
      }
    } else {
      file = await prisma.fileRecord.create({
        data: {
          name,
          fileType,
          mimeType,
          externalUrl,
          summary,
          projectId,
        },
      });
    }

    await completeAutomationRun(run.id, file, "File upserted successfully.");

    return Response.json({
      data: file,
      meta: {},
      error: null,
    });
  } catch (error) {
    console.error("Failed to upsert file record from automation", error);

    return Response.json(
      {
        data: null,
        meta: {},
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to upsert file record from automation.",
        },
      },
      { status: 500 },
    );
  }
}
