"use client";

import React, { useState } from "react";
import { Sparkles, Inbox } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { Badge } from "@/components/shared/Badge";
import { SectionCard } from "@/components/shared/SectionCard";
import { cn } from "@/lib/types";
import type { InboxPageProps } from "@/lib/types";

export function InboxPage({ inboxItems, onConvertInbox, onArchiveInbox }: InboxPageProps) {
  const [selectedId, setSelectedId] = useState<string | null>(
    inboxItems[0]?.id ?? null,
  );
  const selectedItem =
    inboxItems.find((item) => item.id === selectedId) ?? inboxItems[0] ?? null;

  return (
    <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
      <SectionCard
        title="Inbox"
        subtitle="Capture first, organize second"
        className="overflow-hidden p-0"
      >
        <div className="space-y-2 p-2">
          {inboxItems.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="Inbox is clear"
              description="Captured ideas and automation imports will appear here."
            />
          ) : null}
          {inboxItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedId(item.id)}
              className={cn(
                "w-full rounded-2xl border p-4 text-left transition",
                selectedItem?.id === item.id
                  ? "border-slate-900 bg-slate-50"
                  : "border-slate-200 hover:bg-slate-50",
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-slate-900">{item.title}</p>
                <Badge tone={item.status === "new" ? "info" : "default"}>
                  {item.status}
                </Badge>
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                {item.content}
              </p>
              <p className="mt-3 text-xs text-slate-400">
                Source: {item.source}
              </p>
            </button>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title={selectedItem?.title ?? "Inbox item"}
        subtitle="Review the item and decide what it becomes"
      >
        {selectedItem ? (
          <div className="space-y-6">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm leading-6 text-slate-700">
                {selectedItem.content}
              </p>
            </div>

            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-700" />
                <p className="text-sm font-semibold text-blue-900">
                  AI Triage Suggestion
                </p>
              </div>
              <p className="mt-3 text-sm text-blue-800">
                {selectedItem.suggestion}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => onConvertInbox(selectedItem.id, "task")}
                className="rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white"
              >
                Convert to Task
              </button>
              <button
                onClick={() => onConvertInbox(selectedItem.id, "note")}
                className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700"
              >
                Convert to Note
              </button>
              <button
                onClick={() => onArchiveInbox(selectedItem.id)}
                className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700"
              >
                Archive
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-sm text-slate-500">
            No inbox item selected.
          </div>
        )}
      </SectionCard>
    </div>
  );
}
