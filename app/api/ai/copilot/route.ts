import { prisma } from "@/lib/prisma";
import { generateText } from "@/lib/ai";

interface CopilotSource {
  type: string;
  id: string;
  title: string;
}

function clip(text: string, max = 220): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 3).trimEnd() + "...";
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";

    if (!prompt) {
      return Response.json(
        {
          data: null,
          meta: {},
          error: {
            code: "VALIDATION_ERROR",
            message: "prompt is required.",
          },
        },
        { status: 422 },
      );
    }

    const [projects, tasks, notes, inboxItems, events, files] =
      await Promise.all([
        prisma.project.findMany({
          orderBy: { updatedAt: "desc" },
          take: 6,
        }),
        prisma.task.findMany({
          orderBy: [{ dueDate: "asc" }, { updatedAt: "desc" }],
          take: 10,
        }),
        prisma.note.findMany({
          orderBy: { updatedAt: "desc" },
          take: 6,
        }),
        prisma.inboxItem.findMany({
          orderBy: { updatedAt: "desc" },
          take: 6,
        }),
        prisma.event.findMany({
          orderBy: { startsAt: "asc" },
          take: 6,
        }),
        prisma.fileRecord.findMany({
          orderBy: { updatedAt: "desc" },
          take: 6,
        }),
      ]);

    const sources: CopilotSource[] = [
      ...projects.map((item) => ({
        type: "project",
        id: item.id,
        title: item.title,
      })),
      ...tasks.map((item) => ({
        type: "task",
        id: item.id,
        title: item.title,
      })),
      ...notes.map((item) => ({
        type: "note",
        id: item.id,
        title: item.title,
      })),
      ...inboxItems.map((item) => ({
        type: "inbox",
        id: item.id,
        title: item.title || "Untitled inbox item",
      })),
      ...events.map((item) => ({
        type: "event",
        id: item.id,
        title: item.title,
      })),
      ...files.map((item) => ({
        type: "file",
        id: item.id,
        title: item.name,
      })),
    ];

    const contextBlock = `
User question:
${prompt}

Projects:
${projects.map((p) => `- ${p.title} | status: ${p.status} | priority: ${p.priority} | goal: ${p.goal ?? "none"}`).join("\n") || "- none"}

Tasks:
${tasks.map((t) => `- ${t.title} | status: ${t.status} | priority: ${t.priority} | due: ${t.dueDate ?? "none"}`).join("\n") || "- none"}

Notes:
${notes.map((n) => `- ${n.title}: ${clip(n.body, 180)}`).join("\n") || "- none"}

Inbox:
${inboxItems.map((i) => `- ${i.title ?? "Untitled"} | status: ${i.status} | ${clip(i.content, 160)}`).join("\n") || "- none"}

Events:
${events.map((e) => `- ${e.title} | starts: ${e.startsAt.toISOString()} | source: ${e.sourceType}`).join("\n") || "- none"}

Files:
${files.map((f) => `- ${f.name} | ${f.fileType ?? f.mimeType ?? "unknown"} | ${f.summary ?? "no summary"}`).join("\n") || "- none"}
`;

    const answer = await generateText({
      systemPrompt:
        "You are a grounded workspace copilot. Use only the provided workspace data. Be concise, practical, and action-oriented. Do not invent records that are not present.",
      userPrompt: contextBlock,
    });

    const output = await prisma.aiOutput.create({
      data: {
        outputType: "copilot_answer",
        targetType: "workspace",
        title: prompt,
        content: answer,
        metadata: {
          sources,
        } as any,
      },
    });

    return Response.json({
      data: output,
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
          message: "Failed to generate copilot answer.",
        },
      },
      { status: 500 },
    );
  }
}
