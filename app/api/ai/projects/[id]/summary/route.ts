import { prisma } from "@/lib/prisma";
import { generateText } from "@/lib/ai";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(_req: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        tasks: {
          orderBy: [
            { status: "asc" },
            { dueDate: "asc" },
            { updatedAt: "desc" },
          ],
        },
        notes: {
          orderBy: { updatedAt: "desc" },
        },
        inboxItems: {
          orderBy: { updatedAt: "desc" },
        },
      },
    });

    if (!project) {
      return Response.json(
        {
          data: null,
          meta: {},
          error: {
            code: "NOT_FOUND",
            message: "Project not found.",
          },
        },
        { status: 404 },
      );
    }

    const files = await prisma.fileRecord.findMany({
      where: { projectId: id },
      orderBy: { updatedAt: "desc" },
    });

    const prompt = `
Project: ${project.title}
Goal: ${project.goal ?? "None"}
Status: ${project.status}
Priority: ${project.priority}

Tasks:
${project.tasks.map((t) => `- ${t.title} | ${t.status} | due: ${t.dueDate ?? "none"}`).join("\n") || "- none"}

Notes:
${project.notes.map((n) => `- ${n.title}: ${n.body}`).join("\n") || "- none"}

Inbox:
${project.inboxItems.map((i) => `- ${i.title ?? "Untitled"}: ${i.content}`).join("\n") || "- none"}

Files:
${files.map((f) => `- ${f.name} | ${f.fileType ?? f.mimeType ?? "unknown"}`).join("\n") || "- none"}
`;

    const content = await generateText({
      systemPrompt:
        "You are an assistant that writes concise, grounded project summaries. Only use the provided project data. Be practical, short, and action-oriented.",
      userPrompt: prompt,
    });

    const output = await prisma.aiOutput.create({
      data: {
        outputType: "project_summary",
        targetType: "project",
        targetId: id,
        title: `${project.title} Summary`,
        content,
        metadata: {
          taskCount: project.tasks.length,
          noteCount: project.notes.length,
          inboxCount: project.inboxItems.length,
          fileCount: files.length,
        },
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
          message: "Failed to generate project summary.",
        },
      },
      { status: 500 },
    );
  }
}
