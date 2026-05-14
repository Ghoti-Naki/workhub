export interface SuggestedTask {
  title: string;
  description?: string;
  priority: "low" | "medium" | "high" | "urgent";
}

function normalizeTaskTitle(input: string): string {
  return input
    .replace(/^[-*•\d.)\s]+/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function heuristicExtract(
  noteTitle: string,
  noteBody: string,
): SuggestedTask[] {
  const rawLines = noteBody
    .split(/\n+/)
    .map((line) => normalizeTaskTitle(line))
    .filter(Boolean);

  const sentenceChunks = noteBody
    .split(/[.!?]\s+/)
    .map((line) => normalizeTaskTitle(line))
    .filter(Boolean);

  const combined = [...rawLines, ...sentenceChunks];

  const actionHints = [
    "todo",
    "need to",
    "should",
    "must",
    "follow up",
    "create",
    "build",
    "write",
    "revise",
    "update",
    "draft",
    "review",
    "send",
    "prepare",
    "finish",
    "fix",
  ];

  const picked = combined.filter((line) => {
    const lower = line.toLowerCase();
    return (
      (line.length >= 8 && actionHints.some((hint) => lower.includes(hint))) ||
      rawLines.includes(line)
    );
  });

  const unique = Array.from(
    new Set((picked.length ? picked : combined).slice(0, 6)),
  );

  return unique.map((line, index) => ({
    title: line.length > 80 ? line.slice(0, 77).trimEnd() + "..." : line,
    description: `Extracted from note: ${noteTitle}`,
    priority: index === 0 ? "high" : "medium",
  }));
}

export async function extractTasksFromNote(
  noteTitle: string,
  noteBody: string,
): Promise<SuggestedTask[]> {
  const openAiKey = process.env.OPENAI_API_KEY;

  if (!openAiKey) {
    return heuristicExtract(noteTitle, noteBody);
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openAiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: [
          {
            role: "system",
            content:
              "You extract actionable tasks from notes. Return strict JSON only as an array. Each item must have title, description, and priority. Priority must be low, medium, high, or urgent.",
          },
          {
            role: "user",
            content: `Note title: ${noteTitle}\n\nNote body:\n${noteBody}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      return heuristicExtract(noteTitle, noteBody);
    }

    const json = await response.json();
    const rawText =
      json.output_text || json.output?.[0]?.content?.[0]?.text || "[]";

    const parsed = JSON.parse(rawText);

    if (!Array.isArray(parsed)) {
      return heuristicExtract(noteTitle, noteBody);
    }

    const cleaned: SuggestedTask[] = parsed
      .map((item) => ({
        title:
          typeof item?.title === "string" ? normalizeTaskTitle(item.title) : "",
        description:
          typeof item?.description === "string"
            ? item.description.trim()
            : `Extracted from note: ${noteTitle}`,
        priority:
          item?.priority === "low" ||
          item?.priority === "medium" ||
          item?.priority === "high" ||
          item?.priority === "urgent"
            ? item.priority
            : "medium",
      }))
      .filter((item) => item.title);

    return cleaned.length
      ? cleaned.slice(0, 8)
      : heuristicExtract(noteTitle, noteBody);
  } catch {
    return heuristicExtract(noteTitle, noteBody);
  }
}
