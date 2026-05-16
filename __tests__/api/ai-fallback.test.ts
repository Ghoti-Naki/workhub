import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { generateText } from "@/lib/ai";

describe("AI fallback (no OPENAI_API_KEY)", () => {
  const originalKey = process.env.OPENAI_API_KEY;

  beforeAll(() => {
    delete process.env.OPENAI_API_KEY;
  });

  afterAll(() => {
    if (originalKey !== undefined) {
      process.env.OPENAI_API_KEY = originalKey;
    }
  });

  it("returns a non-empty fallback string without calling OpenAI", async () => {
    const result = await generateText({
      systemPrompt: "You are a helpful assistant.",
      userPrompt:
        "Project: Test\nGoal: Make it work\nStatus: active\nPriority: high\n- Task one | todo | high",
    });
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(10);
  });

  it("fallback mentions the project name from the prompt", async () => {
    const result = await generateText({
      systemPrompt: "Summarise this project.",
      userPrompt: "Project: MySpecialProject\nGoal: Test goal\nStatus: active\nPriority: medium",
    });
    expect(result).toContain("MySpecialProject");
  });

  it("fallback includes the disclaimer text", async () => {
    const result = await generateText({
      systemPrompt: "Summarise.",
      userPrompt: "Project: X\nStatus: active",
    });
    expect(result).toContain("fallback summary");
  });
});
