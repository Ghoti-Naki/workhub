/**
 * GET /api/ai/extractions
 *
 * Returns AI extraction records (suggested tasks derived from notes).
 * Accepts optional query params: sourceType, sourceId, outputType.
 * Results are ordered newest-first and capped at 20.
 */
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const sourceType = searchParams.get("sourceType");
    const sourceId = searchParams.get("sourceId");
    const outputType = searchParams.get("outputType");

    const extractions = await prisma.aiExtraction.findMany({
      where: {
        ...(sourceType ? { sourceType } : {}),
        ...(sourceId ? { sourceId } : {}),
        ...(outputType ? { outputType } : {}),
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
    });

    return Response.json({
      data: extractions,
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
          message: "Failed to load AI extractions.",
        },
      },
      { status: 500 },
    );
  }
}
