"use client";

import React, { useEffect, useState } from "react";
import { ModalShell } from "@/components/modals/ModalShell";
import { inputCls, inputErrorCls, selectCls, labelCls } from "@/components/shared/styles";
import type { Project, ProjectPriority, ProjectStatus } from "@/lib/types";

type Errors = { title?: string; saveError?: string };

export function ProjectFormModal({
  open,
  onClose,
  onSaved,
  project,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  project: Project | null;
}) {
  const [title, setTitle] = useState("");
  const [goal, setGoal] = useState("");
  const [priority, setPriority] = useState<ProjectPriority>("medium");
  const [status, setStatus] = useState<ProjectStatus>("active");
  const [dueDate, setDueDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    if (open) {
      setTitle(project?.title ?? "");
      setGoal(project?.goal ?? "");
      setPriority(project?.priority ?? "medium");
      setStatus(project?.status ?? "active");
      setDueDate(project?.dueDate ? project.dueDate.slice(0, 10) : "");
      setErrors({});
    }
  }, [open, project]);

  function validate(): boolean {
    const errs: Errors = {};
    if (!title.trim()) errs.title = "Title is required.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setErrors({});
    try {
      const url = project ? `/api/projects/${project.id}` : "/api/projects";
      const method = project ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          goal: goal.trim() || null,
          priority,
          status,
          dueDate: dueDate || null,
        }),
      });
      if (!res.ok) throw new Error();
      onClose();
      onSaved();
    } catch {
      setErrors({ saveError: "Failed to save project. Please try again." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalShell title={project ? "Edit Project" : "New Project"} open={open} onClose={onClose}>
      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <label className={labelCls}>Title *</label>
          <input
            value={title}
            onChange={(e) => { setTitle(e.target.value); setErrors((prev) => ({ ...prev, title: undefined })); }}
            className={errors.title ? inputErrorCls : inputCls}
            placeholder="Project title"
            aria-describedby={errors.title ? "title-error" : undefined}
          />
          {errors.title ? <p id="title-error" role="alert" className="mt-1 text-xs text-rose-600">{errors.title}</p> : null}
        </div>
        <div>
          <label className={labelCls}>Goal</label>
          <input
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className={inputCls}
            placeholder="What does success look like?"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Priority</label>
            <select value={priority} onChange={(e) => setPriority(e.target.value as ProjectPriority)} className={selectCls}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as ProjectStatus)} className={selectCls}>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
        <div>
          <label className={labelCls}>Due Date</label>
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={inputCls} />
        </div>
        {errors.saveError ? <p role="alert" className="text-sm text-rose-600">{errors.saveError}</p> : null}
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
            {saving ? "Saving..." : project ? "Save Changes" : "Create Project"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
