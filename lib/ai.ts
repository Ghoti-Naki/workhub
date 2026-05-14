export interface GenerateTextInput {
  systemPrompt: string;
  userPrompt: string;
}

function buildFallbackSummary(userPrompt: string): string {
  const lines = userPrompt
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const projectLine = lines.find((line) => line.startsWith("Project:"));
  const goalLine = lines.find((line) => line.startsWith("Goal:"));
  const statusLine = lines.find((line) => line.startsWith("Status:"));
  const priorityLine = lines.find((line) => line.startsWith("Priority:"));

  const taskLines = lines.filter(
    (line) => line.startsWith("-") && line.includes("|"),
  );
  const noteLines = lines
    .filter((line) => line.startsWith("-") && !line.includes("|"))
    .slice(0, 3);

  const openTaskCount = taskLines.filter(
    (line) => !line.includes("| done |"),
  ).length;
  const highSignalTask = taskLines[0] ?? null;

  return [
    projectLine
      ? `${projectLine.replace("Project: ", "")} is currently ${statusLine?.replace("Status: ", "").toLowerCase() || "active"} with ${priorityLine?.replace("Priority: ", "").toLowerCase() || "medium"} priority.`
      : "This project summary was generated from your current workspace data.",
    goalLine ? `Main goal: ${goalLine.replace("Goal: ", "")}.` : null,
    `There are ${openTaskCount} tracked task(s) in the current context.`,
    highSignalTask
      ? `A likely next focus is: ${highSignalTask.replace(/^- /, "").split("|")[0].trim()}.`
      : null,
    noteLines.length > 0
      ? `Recent notes suggest the project is actively evolving and still has planning context attached.`
      : null,
    `This is a fallback summary. You can replace it later with a real model provider in lib/ai.ts.`,
  ]
    .filter(Boolean)
    .join(" ");
}

export async function generateText(input: GenerateTextInput): Promise<string> {
  const openAiKey = process.env.OPENAI_API_KEY;

  if (!openAiKey) {
    return buildFallbackSummary(input.userPrompt);
  }

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
          content: input.systemPrompt,
        },
        {
          role: "user",
          content: input.userPrompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    return buildFallbackSummary(input.userPrompt);
  }

  const json = await response.json();

  const text =
    json.output_text ||
    json.output?.[0]?.content?.[0]?.text ||
    buildFallbackSummary(input.userPrompt);

  return typeof text === "string"
    ? text
    : buildFallbackSummary(input.userPrompt);
}
