"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import { SectionCard } from "@/components/shared/SectionCard";
import { AIErrorCallout } from "@/components/shared/AIErrorCallout";
import type { CopilotOutput, CopilotSource } from "@/lib/types";

export function CopilotPage({
  prompt,
  setPrompt,
  history,
  loading,
  error,
  streamingText,
  isStreaming,
  onSubmit,
  onClearHistory,
}: {
  prompt: string;
  setPrompt: (value: string) => void;
  history: CopilotOutput[];
  loading: boolean;
  error?: string | null;
  streamingText?: string;
  isStreaming?: boolean;
  onSubmit: (promptText?: string) => void;
  onClearHistory: () => void;
}) {
  const latestAnswer = history[0] ?? null;
  const latestSources: CopilotSource[] = Array.isArray(latestAnswer?.metadata?.sources)
    ? latestAnswer.metadata.sources as CopilotSource[]
    : [];

  const followUpSuggestions: string[] = Array.isArray(latestAnswer?.metadata?.followUps)
    ? (latestAnswer.metadata.followUps as string[]).slice(0, 3)
    : latestAnswer
      ? [
          "Can you give me more detail on that?",
          "What should I do first based on this?",
          "Are there any risks I should know about?",
        ]
      : [];

  const promptSuggestions = [
    "What should I focus on today?",
    "What am I behind on?",
    "Summarize my most active project.",
    "Which deadlines are risky this week?",
    "What inbox items should I process first?",
  ];

  return (
    <div className="grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
      <div className="space-y-6">
        <SectionCard
          title="AI Copilot"
          subtitle="Ask grounded questions about your workspace"
        >
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (!loading && !isStreaming && prompt.trim()) onSubmit();
                  }
                }}
                placeholder="Ask a grounded workspace question…  (Enter to submit, Shift+Enter for newline)"
                className="min-h-[120px] w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none focus:border-slate-400"
              />
              <div className="mt-3 flex justify-end">
                <button
                  onClick={() => onSubmit()}
                  disabled={loading || isStreaming || !prompt.trim()}
                  className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {(loading || isStreaming) && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden="true" />}
                  {isStreaming ? "Streaming…" : loading ? "Thinking…" : "Ask Copilot"}
                </button>
              </div>
            </div>

            <AIErrorCallout message={error} />

            {(isStreaming && streamingText) || latestAnswer ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className={`h-4 w-4 text-blue-700 ${isStreaming ? "animate-pulse" : ""}`} />
                    <p className="text-sm font-medium text-blue-900">
                      {isStreaming ? "Streaming answer…" : "Latest Answer"}
                    </p>
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-blue-900">
                    {isStreaming ? streamingText : latestAnswer!.content}
                    {isStreaming && (
                      <span className="ml-0.5 inline-block h-3.5 w-0.5 animate-pulse bg-blue-700" aria-hidden="true" />
                    )}
                  </p>
                  {!isStreaming && latestAnswer && (
                    <p className="mt-3 text-xs text-blue-700">
                      Saved {new Date(latestAnswer.createdAt).toLocaleString()}
                    </p>
                  )}
                </div>

                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-sm font-semibold text-slate-900">
                    Sources
                  </p>
                  {latestSources.length === 0 ? (
                    <p className="mt-2 text-sm text-slate-500">
                      No source metadata attached.
                    </p>
                  ) : (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {latestSources.map((source) => (
                        <span
                          key={`${source.type}-${source.id}`}
                          className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700"
                        >
                          {source.type}: {source.title}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {!isStreaming && followUpSuggestions.length > 0 && (
                  <div className="rounded-2xl border border-slate-200 p-4">
                    <p className="text-sm font-semibold text-slate-900">Follow-up questions</p>
                    <div className="mt-3 space-y-2">
                      {followUpSuggestions.map((q) => (
                        <button
                          key={q}
                          onClick={() => onSubmit(q)}
                          disabled={loading || isStreaming}
                          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
                Ask a question to get a grounded answer from your workspace.
              </div>
            )}
          </div>
        </SectionCard>
      </div>

      <div className="space-y-6">
        <SectionCard
          title="Suggested prompts"
          subtitle="Fast ways to use AI inside the workspace"
        >
          <div className="space-y-3">
            {promptSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => onSubmit(suggestion)}
                className="w-full rounded-2xl border border-slate-200 p-4 text-left text-sm text-slate-700 transition hover:bg-slate-50"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Recent Copilot History"
          subtitle="Previously saved workspace answers"
          action={
            history.length > 0 ? (
              <button
                onClick={onClearHistory}
                className="rounded-2xl border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50"
              >
                Clear All
              </button>
            ) : undefined
          }
        >
          {history.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
              No saved Copilot answers yet.
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200 p-4"
                >
                  <p className="font-medium text-slate-900">
                    {item.title || "Untitled question"}
                  </p>
                  <p className="mt-2 line-clamp-4 text-sm leading-6 text-slate-600">
                    {item.content}
                  </p>
                  <p className="mt-3 text-xs text-slate-400">
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
