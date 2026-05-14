import { prisma } from "@/lib/prisma";
import { extractTasksFromNote } from "@/lib/ai-task-extraction";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(_req: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    const note = await prisma.note.findUnique({
      where: { id },
    });

    if (!note) {
      return Response.json(
        {
          data: null,
          meta: {},
          error: {
            code: "NOT_FOUND",
            message: "Note not found.",
          },
        },
        { status: 404 },
      );
    }

    const suggestions = await extractTasksFromNote(note.title, note.body);

    const extraction = await prisma.aiExtraction.create({
      data: {
        sourceType: "note",
        sourceId: id,
        outputType: "note_task_extraction",
        payload: {
          noteId: note.id,
          noteTitle: note.title,
          suggestions,
        } as any,
        status: "pending",
      },
    });

    return Response.json({
      data: extraction,
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
          message: "Failed to extract tasks from note.",
        },
      },
      { status: 500 },
    );
  }
}
