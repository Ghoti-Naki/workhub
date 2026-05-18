/**
 * POST /api/ai/copilot/stream
 *
 * Streams copilot answer tokens as SSE. Each event is:
 *   data: {"delta": "..."}
 * The final event is:
 *   data: {"done": true, "id": "<AiOutput id>"}
 *
 * Falls back to a single-shot emit when OPENAI_API_KEY is absent.
 * The AiOutput record is saved server-side before the done event is sent,
 * so clients can call GET /api/ai/copilot/history to refresh without
 * a separate save step.
 */
import { prisma } from "@/lib/prisma";

interface CopilotSource {
  type: string;
  id: string;
  title: string;
}

const SSE_HEADERS = {
  "Content-Type": "text/event-stream",
  "Cache-Control": "no-cache",
  Connection: "keep-alive",
};

function sse(payload: unknown): string {
  return `data: ${JSON.stringify(payload)}\n\n`;
}

function clip(text: string, max = 220): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 3).trimEnd() + "...";
}

function buildFallback(prompt: string): string {
  return `[Fallback — no OPENAI_API_KEY configured]\n\nYou asked: "${prompt}"\n\nAdd OPENAI_API_KEY to your .env to enable live AI responses.`;
}

export async function POST(req: Request) {
  let prompt: string;
  try {
    const body = await req.json();
    prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  } catch {
    return new Response(null, { status: 400 });
  }

  if (!prompt) {
    return new Response(null, { status: 422 });
  }

  const [projects, tasks, notes, inboxItems, events, files] = await Promise.all([
    prisma.project.findMany({ orderBy: { updatedAt: "desc" }, take: 6 }),
    prisma.task.findMany({ orderBy: [{ dueDate: "asc" }, { updatedAt: "desc" }], take: 10 }),
    prisma.note.findMany({ orderBy: { updatedAt: "desc" }, take: 6 }),
    prisma.inboxItem.findMany({ orderBy: { updatedAt: "desc" }, take: 6 }),
    prisma.event.findMany({ orderBy: { startsAt: "asc" }, take: 6 }),
    prisma.fileRecord.findMany({ orderBy: { updatedAt: "desc" }, take: 6 }),
  ]);

  const sources: CopilotSource[] = [
    ...projects.map((p) => ({ type: "project", id: p.id, title: p.title })),
    ...tasks.map((t) => ({ type: "task", id: t.id, title: t.title })),
    ...notes.map((n) => ({ type: "note", id: n.id, title: n.title })),
    ...inboxItems.map((i) => ({ type: "inbox", id: i.id, title: i.title || "Untitled" })),
    ...events.map((e) => ({ type: "event", id: e.id, title: e.title })),
    ...files.map((f) => ({ type: "file", id: f.id, title: f.name })),
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

  const openAiKey = process.env.OPENAI_API_KEY;

  if (!openAiKey) {
    const fallbackText = buildFallback(prompt);
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        controller.enqueue(encoder.encode(sse({ delta: fallbackText })));
        try {
          const output = await prisma.aiOutput.create({
            data: {
              outputType: "copilot_answer",
              targetType: "workspace",
              title: prompt,
              content: fallbackText,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              metadata: { sources } as any,
            },
          });
          controller.enqueue(encoder.encode(sse({ done: true, id: output.id })));
        } catch {
          controller.enqueue(encoder.encode(sse({ done: true, id: null })));
        }
        controller.close();
      },
    });

    return new Response(stream, { headers: SSE_HEADERS });
  }

  const openAiRes = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openAiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      stream: true,
      input: [
        { role: "system", content: "You are a grounded workspace copilot. Use only the provided workspace data. Be concise, practical, and action-oriented. Do not invent records that are not present." },
        { role: "user", content: contextBlock },
      ],
    }),
  });

  if (!openAiRes.ok || !openAiRes.body) {
    const fallbackText = buildFallback(prompt);
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        controller.enqueue(encoder.encode(sse({ delta: fallbackText })));
        try {
          const output = await prisma.aiOutput.create({
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            data: { outputType: "copilot_answer", targetType: "workspace", title: prompt, content: fallbackText, metadata: { sources } as any },
          });
          controller.enqueue(encoder.encode(sse({ done: true, id: output.id })));
        } catch {
          controller.enqueue(encoder.encode(sse({ done: true, id: null })));
        }
        controller.close();
      },
    });
    return new Response(stream, { headers: SSE_HEADERS });
  }

  const upstreamReader = openAiRes.body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let fullText = "";
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await upstreamReader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const raw = line.slice(6).trim();
            if (raw === "[DONE]") continue;
            try {
              const event = JSON.parse(raw);
              if (event.type === "response.output_text.delta" && typeof event.delta === "string") {
                fullText += event.delta;
                controller.enqueue(encoder.encode(sse({ delta: event.delta })));
              }
            } catch {
              // skip unparseable lines
            }
          }
        }
      } catch (err) {
        console.error("Copilot stream read error", err);
      }

      if (!fullText) fullText = buildFallback(prompt);

      try {
        const output = await prisma.aiOutput.create({
          data: {
            outputType: "copilot_answer",
            targetType: "workspace",
            title: prompt,
            content: fullText,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            metadata: { sources } as any,
          },
        });
        controller.enqueue(encoder.encode(sse({ done: true, id: output.id })));
      } catch {
        controller.enqueue(encoder.encode(sse({ done: true, id: null })));
      }

      controller.close();
    },
  });

  return new Response(stream, { headers: SSE_HEADERS });
}
