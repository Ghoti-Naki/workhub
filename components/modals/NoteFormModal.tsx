"use client";

import React, { useEffect, useState } from "react";
import { ModalShell } from "@/components/modals/ModalShell";
import { MarkdownEditor } from "@/components/shared/MarkdownEditor";
import { inputCls, inputErrorCls, selectCls, labelCls } from "@/components/shared/styles";
import type { Note, Project } from "@/lib/types";

type Errors = { title?: string; body?: string; saveError?: string };

export function NoteFormModal({
  open,
  onClose,
  onSaved,
  note,
  projects,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  note: Note | null;
  projects: Project[];
}) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [projectId, setProjectId] = useState("");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    if (open) {
      setTitle(note?.title ?? "");
      setBody(note?.body ?? "");
      setProjectId(note?.projectId ?? "");
      setErrors({});
    }
  }, [open, note]);

  function validate(): boolean {
    const errs: Errors = {};
    if (!title.trim()) errs.title = "Title is required.";
    if (!body.trim()) errs.body = "Body is required.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setErrors({});
    try {
      const url = note ? `/api/notes/${note.id}` : "/api/notes";
      const method = note ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          body: body.trim(),
          projectId: projectId || null,
        }),
      });
      if (!res.ok) throw new Error();
      onClose();
      onSaved();
    } catch {
      setErrors({ saveError: "Failed to save note. Please try again." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalShell title={note ? "Edit Note" : "New Note"} open={open} onClose={onClose} size="lg">
      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <label className={labelCls}>Title *</label>
          <input
            value={title}
            onChange={(e) => { setTitle(e.target.value); setErrors((prev) => ({ ...prev, title: undefined })); }}
            className={errors.title ? inputErrorCls : inputCls}
            placeholder="Note title"
            aria-describedby={errors.title ? "note-title-error" : undefined}
          />
          {errors.title ? <p id="note-title-error" role="alert" className="mt-1 text-xs text-rose-600">{errors.title}</p> : null}
        </div>
        <div>
          <label className={labelCls}>Body *</label>
          <MarkdownEditor
            value={body}
            onChange={(v) => { setBody(v); setErrors((prev) => ({ ...prev, body: undefined })); }}
            minHeight={220}
          />
          {errors.body ? <p id="note-body-error" role="alert" className="mt-1 text-xs text-rose-600">{errors.body}</p> : null}
        </div>
        <div>
          <label className={labelCls}>Project</label>
          <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className={selectCls}>
            <option value="">Unassigned</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
        </div>
        {errors.saveError ? <p role="alert" className="text-sm text-rose-600">{errors.saveError}</p> : null}
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
            {saving ? "Saving..." : note ? "Save Changes" : "Create Note"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
