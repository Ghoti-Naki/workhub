"use client";

import React, { useEffect, useState } from "react";
import { ModalShell } from "@/components/modals/ModalShell";
import { cn } from "@/lib/types";
import { inputCls, selectCls, labelCls } from "@/components/shared/styles";
import type { Task, Project, ProjectPriority, TaskStatus } from "@/lib/types";

export function TaskFormModal({
  open,
  onClose,
  onSaved,
  task,
  projects,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  task: Task | null;
  projects: Project[];
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState("");
  const [priority, setPriority] = useState<ProjectPriority>("medium");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [dueDate, setDueDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setTitle(task?.title ?? "");
      setDescription(task?.description ?? "");
      setProjectId(task?.projectId ?? "");
      setPriority(task?.priority ?? "medium");
      setStatus(task?.status ?? "todo");
      setDueDate(task?.dueDate ? task.dueDate.slice(0, 10) : "");
      setError(null);
    }
  }, [open, task]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const url = task ? `/api/tasks/${task.id}` : "/api/tasks";
      const method = task ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          projectId: projectId || null,
          priority,
          status,
          dueDate: dueDate || null,
        }),
      });
      if (!res.ok) throw new Error();
      onClose();
      onSaved();
    } catch {
      setError("Failed to save task. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalShell title={task ? "Edit Task" : "New Task"} open={open} onClose={onClose}>
      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <label className={labelCls}>Title *</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputCls}
            placeholder="Task title"
          />
        </div>
        <div>
          <label className={labelCls}>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className={cn(inputCls, "resize-none")}
            placeholder="Optional details"
          />
        </div>
        <div>
          <label className={labelCls}>Project</label>
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className={selectCls}
          >
            <option value="">Unassigned</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as ProjectPriority)}
              className={selectCls}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className={selectCls}
            >
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
        </div>
        <div>
          <label className={labelCls}>Due Date</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className={inputCls}
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
            {saving ? "Saving..." : task ? "Save Changes" : "Create Task"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
