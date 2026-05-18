"use client";

import React, { useState } from "react";
import { Sparkles, Inbox } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { Badge } from "@/components/shared/Badge";
import { SectionCard } from "@/components/shared/SectionCard";
import { cn } from "@/lib/types";
import type { InboxPageProps } from "@/lib/types";

export function InboxPage({ inboxItems, onConvertInbox, onArchiveInbox, onDeleteInbox, hasMore, loadingMore, onLoadMore }: InboxPageProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedId, setSelectedId] = useState<string | null>(inboxItems[0]?.id ?? null);
  const [bulkSelected, setBulkSelected] = useState<Set<string>>(new Set());
  const [bulkArchiving, setBulkArchiving] = useState(false);

  const filteredItems = statusFilter === "all"
    ? inboxItems
    : inboxItems.filter((item) => item.status === statusFilter);

  const selectedItem =
    filteredItems.find((item) => item.id === selectedId) ?? filteredItems[0] ?? null;

  const allBulkSelected = filteredItems.length > 0 && filteredItems.every((i) => bulkSelected.has(i.id));

  function toggleBulk(id: string) {
    setBulkSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  }

  function toggleAllBulk() {
    if (allBulkSelected) {
      setBulkSelected(new Set());
    } else {
      setBulkSelected(new Set(filteredItems.map((i) => i.id)));
    }
  }

  async function handleBulkArchive() {
    if (bulkSelected.size === 0) return;
    setBulkArchiving(true);
    try {
      await Promise.all([...bulkSelected].map((id) => onArchiveInbox(id)));
      setBulkSelected(new Set());
    } finally {
      setBulkArchiving(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
      <SectionCard
        title="Inbox"
        subtitle="Capture first, organize second"
        className="overflow-hidden p-0"
      >
        <div className="space-y-2 p-2">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setBulkSelected(new Set()); }}
            aria-label="Filter by status"
            className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none"
          >
            <option value="all">All statuses</option>
            <option value="new">New</option>
            <option value="processed">Processed</option>
            <option value="archived">Archived</option>
          </select>

          {/* Bulk action bar */}
          {bulkSelected.size > 0 && (
            <div className="flex items-center justify-between rounded-2xl border border-sky-200 bg-sky-50 px-3 py-2">
              <span className="text-xs font-medium text-sky-800">
                {bulkSelected.size} selected
              </span>
              <button
                onClick={handleBulkArchive}
                disabled={bulkArchiving}
                className="rounded-xl bg-sky-700 px-3 py-1 text-xs font-medium text-white disabled:opacity-60"
              >
                {bulkArchiving ? "Archiving…" : "Archive selected"}
              </button>
            </div>
          )}

          {filteredItems.length > 0 && (
            <label className="flex cursor-pointer items-center gap-2 px-3 py-1 text-xs text-slate-500">
              <input
                type="checkbox"
                checked={allBulkSelected}
                onChange={toggleAllBulk}
                className="rounded"
                aria-label="Select all"
              />
              Select all
            </label>
          )}

          {filteredItems.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title={inboxItems.length === 0 ? "Inbox is clear" : "No items match this filter"}
              description={inboxItems.length === 0 ? "Captured ideas and automation imports will appear here." : "Try a different status filter."}
            />
          ) : null}

          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={cn(
                "flex items-start gap-2 rounded-2xl border transition",
                selectedItem?.id === item.id
                  ? "border-slate-900 bg-slate-50"
                  : "border-slate-200 hover:bg-slate-50",
              )}
            >
              <div className="flex items-center pl-3 pt-4">
                <input
                  type="checkbox"
                  checked={bulkSelected.has(item.id)}
                  onChange={() => toggleBulk(item.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="rounded"
                  aria-label={`Select ${item.title}`}
                />
              </div>
              <button
                onClick={() => setSelectedId(item.id)}
                className="min-w-0 flex-1 p-4 pl-2 text-left"
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
            </div>
          ))}

          {hasMore && statusFilter === "all" ? (
            <div className="px-2 pb-2 text-center">
              <button
                onClick={onLoadMore}
                disabled={loadingMore}
                className="w-full rounded-2xl border border-slate-200 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                {loadingMore ? "Loading…" : "Load more"}
              </button>
            </div>
          ) : filteredItems.length > 0 ? (
            <p className="pb-2 text-center text-xs text-slate-400">
              {statusFilter === "all" ? `All ${inboxItems.length} items shown` : `${filteredItems.length} of ${inboxItems.length} items`}
            </p>
          ) : null}
        </div>
      </SectionCard>

      <SectionCard
        title={selectedItem?.title ?? "Inbox item"}
        subtitle="Review the item and decide what it becomes"
      >
        {selectedItem ? (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-3 text-xs text-slate-500">
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1">
                Source: {selectedItem.source}
              </span>
              <span className={`rounded-full border px-2.5 py-1 ${selectedItem.status === "new" ? "border-sky-200 bg-sky-50 text-sky-700" : "border-slate-200 bg-slate-50"}`}>
                {selectedItem.status}
              </span>
              {selectedItem.createdAt ? (
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1">
                  {new Date(selectedItem.createdAt).toLocaleString()}
                </span>
              ) : null}
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
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
              <button
                onClick={() => onDeleteInbox(selectedItem.id)}
                className="rounded-2xl border border-rose-200 px-4 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50"
              >
                Delete
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
