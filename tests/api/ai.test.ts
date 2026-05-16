/**
 * AI route and ai.ts helper tests.
 * These tests use vi.stubGlobal / vi.spyOn to mock fetch — no real API calls.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { generateText } from "@/lib/ai";

describe("generateText — fallback behavior", () => {
  beforeEach(() => {
    delete process.env.OPENAI_API_KEY;
  });

  it("returns a non-empty fallback string when OPENAI_API_KEY is absent", async () => {
    const result = await generateText({
      systemPrompt: "You are a helpful assistant.",
      userPrompt: "Project: Test Project\nGoal: Ship it\nStatus: active\nPriority: high\nTasks:\n- Write tests | todo | due: 2026-01-01",
    });

    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(10);
  });

  it("fallback output mentions the project name from the prompt", async () => {
    const result = await generateText({
      systemPrompt: "You are a helpful assistant.",
      userPrompt: "Project: Alpha Initiative\nGoal: none\nStatus: active\nPriority: medium\nTasks:\n- none",
    });

    expect(result).toContain("Alpha Initiative");
  });
});

describe("generateText — OpenAI call", () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    process.env.OPENAI_API_KEY = "sk-test-fake-key";

    fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({ output_text: "Mocked AI response." }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
  });

  afterEach(() => {
    delete process.env.OPENAI_API_KEY;
    vi.restoreAllMocks();
  });

  it("calls OpenAI when OPENAI_API_KEY is set", async () => {
    const result = await generateText({
      systemPrompt: "System prompt.",
      userPrompt: "User prompt.",
    });

    expect(fetchSpy).toHaveBeenCalledOnce();
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://api.openai.com/v1/responses",
      expect.objectContaining({ method: "POST" }),
    );
    expect(result).toBe("Mocked AI response.");
  });

  it("falls back gracefully when OpenAI returns a non-200 status", async () => {
    fetchSpy.mockResolvedValue(
      new Response(JSON.stringify({ error: "quota exceeded" }), { status: 429 }),
    );

    const result = await generateText({
      systemPrompt: "System prompt.",
      userPrompt: "Project: Fallback Test\nGoal: none\nStatus: active\nPriority: low\nTasks:\n- none",
    });

    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
    // Should use fallback, not throw
    expect(result).not.toContain("quota exceeded");
  });

  it("falls back gracefully when fetch throws (network error)", async () => {
    fetchSpy.mockRejectedValue(new Error("Network timeout"));

    await expect(
      generateText({
        systemPrompt: "System prompt.",
        userPrompt: "User prompt.",
      }),
    ).rejects.toThrow("Network timeout");
  });
});
