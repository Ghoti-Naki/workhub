import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: Promise<{ id: string }>;
}

interface ExtractionPayload {
  noteId?: string;
  noteTitle?: string;
  suggestions?: Array<{
    title: string;
    description?: string;
    priority?: string;
  }>;
}

export async function POST(req: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    const selectedIndices: number[] = Array.isArray(body.selectedIndices)
      ? body.selectedIndices.filter((value: unknown) => typeof value === "number")
      : [];

    const extraction = await prisma.aiExtraction.findUnique({
      where: { id },
    });

    if (!extraction) {
      return Response.json(
        {
          data: null,
          meta: {},
          error: {
            code: "NOT_FOUND",
            message: "Extraction not found.",
          },
        },
        { status: 404 },
      );
    }

    const payload = extraction.payload as unknown as ExtractionPayload;
    const suggestions = Array.isArray(payload?.suggestions)
      ? payload.suggestions
      : [];

    if (!suggestions.length) {
      return Response.json(
        {
          data: null,
          meta: {},
          error: {
            code: "VALIDATION_ERROR",
            message: "No suggestions found in extraction payload.",
          },
        },
        { status: 422 },
      );
    }

    const picked =
      selectedIndices.length > 0
        ? selectedIndices.map((index) => suggestions[index]).filter(Boolean)
        : suggestions;

    const sourceNote =
      extraction.sourceType === "note"
        ? await prisma.note.findUnique({
            where: { id: extraction.sourceId },
          })
        : null;

    const createdTasks = await prisma.$transaction(
      picked.map((suggestion) =>
        prisma.task.create({
          data: {
            title: suggestion.title,
            description:
              suggestion.description ||
              `Created from AI extraction of note: ${sourceNote?.title ?? "Untitled note"}`,
            priority:
              suggestion.priority === "low" ||
              suggestion.priority === "medium" ||
              suggestion.priority === "high" ||
              suggestion.priority === "urgent"
                ? suggestion.priority
                : "medium",
            status: "todo",
            projectId: sourceNote?.projectId ?? null,
          },
        }),
      ),
    );

    const updatedExtraction = await prisma.aiExtraction.update({
      where: { id },
      data: {
        status: "accepted",
      },
    });

    return Response.json({
      data: {
        extraction: updatedExtraction,
        createdTasks,
      },
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
          message: "Failed to accept extraction.",
        },
      },
      { status: 500 },
    );
  }
}
