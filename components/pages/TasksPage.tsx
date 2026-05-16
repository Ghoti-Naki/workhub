"use client";

import React, { useMemo, useState } from "react";
import { CheckCircle2, CheckSquare } from "lucide-react";
import { Badge } from "@/components/shared/Badge";
import { SectionCard } from "@/components/shared/SectionCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { FilterBar } from "@/components/shared/FilterBar";
import { SkeletonRow } from "@/components/shared/Skeleton";
import { formatDueDate } from "@/lib/date";
import { cn } from "@/lib/types";
import type { TasksPageProps } from "@/lib/types";

const PRIORITY_WEIGHT: Record<string, number> = { urgent: 4, high: 3, medium: 2, low: 1 };

export function TasksPage({ tasks, projects, loading, hasMore, loadingMore, onLoadMore, onCompleteTask, onCycleStatus, onCreateTask, onEditTask, onDeleteTask }: TasksPageProps) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [sortBy, setSortBy] = useState("priority_high");

  const projectMap = useMemo<Record<string, string>>(
    () =>
      Object.fromEntries(
        projects.map((project) => [project.id, project.title]),
      ),
    [projects],
  );

  const filtered = useMemo(
    () =>
      tasks.filter((task) => {
        const matchStatus = statusFilter === "all" || task.status === statusFilter;
        const matchPriority = priorityFilter === "all" || task.priority === priorityFilter;
        const matchProject = projectFilter === "all" || task.projectId === projectFilter || (projectFilter === "none" && !task.projectId);
        return matchStatus && matchPriority && matchProject;
      }),
    [tasks, statusFilter, priorityFilter, projectFilter],
  );

  const sorted = useMemo(() => {
    const copy = [...filtered];
    switch (sortBy) {
      case "priority_high":
        return copy.sort((a, b) => (PRIORITY_WEIGHT[b.priority] ?? 0) - (PRIORITY_WEIGHT[a.priority] ?? 0));
      case "priority_low":
        return copy.sort((a, b) => (PRIORITY_WEIGHT[a.priority] ?? 0) - (PRIORITY_WEIGHT[b.priority] ?? 0));
      case "due_asc":
        return copy.sort((a, b) => {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return a.dueDate < b.dueDate ? -1 : 1;
        });
      case "due_desc":
        return copy.sort((a, b) => {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return a.dueDate > b.dueDate ? -1 : 1;
        });
      case "newest":
        return copy.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));
      case "oldest":
        return copy.sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1));
      default:
        return copy;
    }
  }, [filtered, sortBy]);

  const overdueCount = tasks.filter(
    (t) => t.status !== "done" && formatDueDate(t.dueDate).isOverdue
  ).length;

  return (
    <SectionCard
      title="Tasks"
      subtitle={overdueCount > 0 ? `${overdueCount} overdue · Execution view across your workspace` : "Execution view across your workspace"}
      action={
        <button
          onClick={onCreateTask}
          className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
        >
          + New Task
        </button>
      }
    >
      <div className="space-y-3">
        {loading ? (
          [...Array(4)].map((_, i) => <SkeletonRow key={i} />)
        ) : (
          <>
            <FilterBar
              resultCount={filtered.length}
              totalCount={tasks.length}
              filters={[
                {
                  key: "status",
                  label: "Status",
                  value: statusFilter,
                  onChange: setStatusFilter,
                  options: [
                    { value: "all", label: "All" },
                    { value: "todo", label: "To do" },
                    { value: "in_progress", label: "In progress" },
                    { value: "done", label: "Done" },
                  ],
                },
                {
                  key: "priority",
                  label: "Priority",
                  value: priorityFilter,
                  onChange: setPriorityFilter,
                  options: [
                    { value: "all", label: "All" },
                    { value: "urgent", label: "Urgent" },
                    { value: "high", label: "High" },
                    { value: "medium", label: "Medium" },
                    { value: "low", label: "Low" },
                  ],
                },
              ]}
              selects={[
                {
                  key: "project",
                  label: "Project",
                  value: projectFilter,
                  onChange: setProjectFilter,
                  options: [
                    { value: "all", label: "All projects" },
                    { value: "none", label: "Unassigned" },
                    ...projects.map((p) => ({ value: p.id, label: p.title })),
                  ],
                },
                {
                  key: "sort",
                  label: "Sort",
                  value: sortBy,
                  onChange: setSortBy,
                  options: [
                    { value: "priority_high", label: "Priority: High → Low" },
                    { value: "priority_low", label: "Priority: Low → High" },
                    { value: "due_asc", label: "Due date: Earliest first" },
                    { value: "due_desc", label: "Due date: Latest first" },
                    { value: "newest", label: "Newest first" },
                    { value: "oldest", label: "Oldest first" },
                  ],
                },
              ]}
            />

        {filtered.length === 0 && tasks.length === 0 ? (
          <EmptyState
            icon={CheckSquare}
            title="No tasks yet"
            description="Create a task to start tracking your work across projects."
            action={{ label: "+ New Task", onClick: onCreateTask }}
          />
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 px-6 py-8 text-center text-sm text-slate-500">
            No tasks match the current filters.
          </div>
        ) : (
          sorted.map((task) => {
            const due = formatDueDate(task.dueDate);
            const overdue = due.isOverdue && task.status !== "done";
            return (
            <div
              key={task.id}
              className={cn(
                "flex flex-col gap-3 rounded-2xl border p-4 md:flex-row md:items-center md:justify-between transition",
                overdue ? "border-rose-200 bg-rose-50/40"
                  : task.status === "done" ? "border-slate-100 bg-slate-50/60 opacity-70"
                  : "border-slate-200",
              )}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => onCompleteTask(task.id)}
                  className={cn(
                    "mt-0.5 rounded-full border p-1 transition",
                    task.status === "done"
                      ? "border-emerald-400 bg-emerald-50 text-emerald-600"
                      : "border-slate-300 text-slate-500 hover:bg-slate-100",
                  )}
                  aria-label={task.status === "done" ? "Mark task incomplete" : "Mark task complete"}
                >
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                </button>
                <div>
                  <p className={cn(
                    "font-medium",
                    task.status === "done" ? "text-slate-400 line-through" : "text-slate-900",
                  )}>
                    {task.title}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {projectMap[task.projectId] || "Unassigned"}
                  </p>
                  {task.description ? (
                    <p className="mt-1 text-xs text-slate-400">{task.description}</p>
                  ) : null}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  tone={
                    task.priority === "urgent"
                      ? "urgent"
                      : task.priority === "high"
                        ? "high"
                        : "default"
                  }
                >
                  {task.priority}
                </Badge>
                <button
                  onClick={() => onCycleStatus(task.id, task.status)}
                  title="Click to advance status"
                  className={cn(
                    "rounded-full border px-2.5 py-0.5 text-xs font-medium transition hover:opacity-80",
                    task.status === "done"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : task.status === "in_progress"
                        ? "border-sky-200 bg-sky-50 text-sky-700"
                        : "border-slate-200 bg-white text-slate-600",
                  )}
                >
                  {task.status === "in_progress" ? "in progress" : task.status}
                </button>
                {task.recurrence ? (
                  <span className="rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-xs text-violet-700">
                    ↻ {task.recurrence}
                  </span>
                ) : null}
                {!due.isEmpty && (
                  <span className={cn(
                    "text-xs font-medium",
                    overdue ? "text-rose-600" :
                    due.isToday ? "text-amber-600" :
                    due.isTomorrow ? "text-sky-600" :
                    "text-slate-500",
                  )}>
                    {due.label}
                  </span>
                )}
                <button
                  onClick={() => onEditTask(task)}
                  className="rounded-xl border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDeleteTask(task.id)}
                  className="rounded-xl border border-rose-200 px-3 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50"
                >
                  Delete
                </button>
              </div>
            </div>
            );
          })
        )}
            {hasMore ? (
              <div className="pt-2 text-center">
                <button
                  onClick={onLoadMore}
                  disabled={loadingMore}
                  className="rounded-2xl border border-slate-200 px-6 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  {loadingMore ? "Loading…" : "Load more tasks"}
                </button>
              </div>
            ) : tasks.length > 0 ? (
              <p className="pt-2 text-center text-xs text-slate-400">
                All {tasks.length} tasks shown
              </p>
            ) : null}
          </>
        )}
      </div>
    </SectionCard>
  );
}
