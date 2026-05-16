"use client";

import React, { useMemo, useState } from "react";
import { CheckCircle2, CheckSquare } from "lucide-react";
import { Badge } from "@/components/shared/Badge";
import { SectionCard } from "@/components/shared/SectionCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { FilterBar } from "@/components/shared/FilterBar";
import { SkeletonRow } from "@/components/shared/Skeleton";
import type { TasksPageProps } from "@/lib/types";

export function TasksPage({ tasks, projects, loading, onCompleteTask, onCreateTask, onEditTask }: TasksPageProps) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

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
        return matchStatus && matchPriority;
      }),
    [tasks, statusFilter, priorityFilter],
  );

  return (
    <SectionCard
      title="Tasks"
      subtitle="Execution view across your workspace"
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
          filtered.map((task) => (
            <div
              key={task.id}
              className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 md:flex-row md:items-center md:justify-between"
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => onCompleteTask(task.id)}
                  className="mt-0.5 rounded-full border border-slate-300 p-1 text-slate-500 hover:bg-slate-100"
                  aria-label="Mark task complete"
                >
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                </button>
                <div>
                  <p className="font-medium text-slate-900">{task.title}</p>
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
                <Badge tone={task.status === "done" ? "success" : "default"}>
                  {task.status}
                </Badge>
                <span className="text-sm text-slate-500">{task.dueDate}</span>
                <button
                  onClick={() => onEditTask(task)}
                  className="rounded-xl border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Edit
                </button>
              </div>
            </div>
          ))
        )}
          </>
        )}
      </div>
    </SectionCard>
  );
}
