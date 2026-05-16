"use client";

import React, { useEffect, useState } from "react";
import { ModalShell } from "@/components/modals/ModalShell";
import { cn } from "@/lib/types";
import { inputCls, labelCls } from "@/components/shared/styles";
import type { Project } from "@/lib/types";

export function CaptureModal({
  open,
  onClose,
  onSaved,
  projects: _projects,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  projects?: Project[];
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setTitle("");
      setContent("");
      setError(null);
    }
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) {
      setError("Content is required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/inbox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim() || null,
          content: content.trim(),
          sourceType: "manual",
          itemType: "capture",
        }),
      });
      if (!res.ok) throw new Error();
      onClose();
      onSaved();
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalShell title="Quick Capture" open={open} onClose={onClose}>
      <p className="mt-1 text-sm text-slate-500">Add anything to your inbox instantly.</p>
      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <label className={labelCls}>
            Title <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputCls}
            placeholder="Brief label"
          />
        </div>
        <div>
          <label className={labelCls}>Content *</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            className={cn(inputCls, "resize-none")}
            placeholder="What's on your mind?"
          />
        </div>
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {saving ? "Saving..." : "Capture"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
