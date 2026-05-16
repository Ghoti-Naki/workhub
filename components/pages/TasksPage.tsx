"use client";

import React, { useMemo } from "react";
import { CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/shared/Badge";
import { SectionCard } from "@/components/shared/SectionCard";
import type { TasksPageProps } from "@/lib/types";

export function TasksPage({ tasks, projects, onCompleteTask, onCreateTask, onEditTask }: TasksPageProps) {
  const projectMap = useMemo<Record<string, string>>(
    () =>
      Object.fromEntries(
        projects.map((project) => [project.id, project.title]),
      ),
    [projects],
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
        {tasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
            No tasks yet. Create one to get started.
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 md:flex-row md:items-center md:justify-between"
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => onCompleteTask(task.id)}
                  className="mt-0.5 rounded-full border border-slate-300 p-1 text-slate-500 hover:bg-slate-100"
                >
                  <CheckCircle2 className="h-4 w-4" />
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
      </div>
    </SectionCard>
  );
}
