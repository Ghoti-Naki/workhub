"use client";

import React, { useState, useMemo } from "react";
import { FolderOpen } from "lucide-react";
import { SkeletonCard } from "@/components/shared/Skeleton";
import { Badge } from "@/components/shared/Badge";
import { FilterBar } from "@/components/shared/FilterBar";
import { SectionCard } from "@/components/shared/SectionCard";
import { EmptyState } from "@/components/shared/EmptyState";
import type { Project, Task, Note, ProjectContextData, AiOutput } from "@/lib/types";

// ─── ProjectDetailPanel ───────────────────────────────────────────────────────

function ProjectDetailPanel({
  projectContext,
  loading,
  onGenerateSummary,
}: {
  projectContext: ProjectContextData | null;
  loading: boolean;
  onGenerateSummary: (projectId: string) => void;
}) {
  if (loading) {
    return (
      <SectionCard title="Project Detail" subtitle="Loading project context">
        <div className="space-y-3">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </SectionCard>
    );
  }

  if (!projectContext) {
    return (
      <SectionCard title="Project Detail" subtitle="Select a project">
        <p className="text-sm text-slate-500">
          Choose a project to see its tasks, notes, inbox items, files, and
          stats.
        </p>
      </SectionCard>
    );
  }

  const { project, stats, files, latestSummary } = projectContext;

  return (
    <div className="space-y-6">
      <SectionCard
        title={project.title}
        subtitle={project.goal || "Project context and progress"}
        action={
          <Badge tone={project.priority === "high" ? "high" : "default"}>
            {project.priority}
          </Badge>
        }
      >
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Open Tasks
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {stats.openTasks}
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Overdue
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {stats.overdueTasks}
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Files
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {stats.files}
            </p>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="AI Project Summary"
        subtitle="Grounded summary from current project data"
        action={
          <button
            onClick={() => onGenerateSummary(project.id)}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            Generate Summary
          </button>
        }
      >
        {latestSummary ? (
          <div className="space-y-3">
            <p className="text-sm leading-6 text-slate-700">
              {latestSummary.content}
            </p>
            <p className="text-xs text-slate-400">
              Generated {new Date(latestSummary.createdAt).toLocaleString()}
            </p>
          </div>
        ) : (
          <p className="text-sm text-slate-500">
            No summary yet. Generate one from the current project context.
          </p>
        )}
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <SectionCard title="Open Tasks" subtitle="Tasks tied to this project">
            <div className="space-y-3">
              {project.tasks.length === 0 ? (
                <p className="text-sm text-slate-500">No tasks linked yet.</p>
              ) : (
                project.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="rounded-2xl border border-slate-200 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-slate-900">{task.title}</p>
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
                    </div>
                    <p className="mt-2 text-sm text-slate-500">
                      Status: {task.status}
                    </p>
                  </div>
                ))
              )}
            </div>
          </SectionCard>

          <SectionCard title="Notes" subtitle="Latest project notes">
            <div className="space-y-3">
              {project.notes.length === 0 ? (
                <p className="text-sm text-slate-500">No notes linked yet.</p>
              ) : (
                project.notes.map((note) => (
                  <div
                    key={note.id}
                    className="rounded-2xl border border-slate-200 p-4"
                  >
                    <p className="font-medium text-slate-900">{note.title}</p>
                    <p className="mt-2 text-sm text-slate-600">{note.body}</p>
                  </div>
                ))
              )}
            </div>
          </SectionCard>

          <SectionCard
            title="Inbox Items"
            subtitle="Unprocessed project captures"
          >
            <div className="space-y-3">
              {project.inboxItems.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No inbox items linked yet.
                </p>
              ) : (
                project.inboxItems.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-slate-200 p-4"
                  >
                    <p className="font-medium text-slate-900">
                      {item.title || "Untitled inbox item"}
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                      {item.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard title="Files" subtitle="Project-linked documents">
            <div className="space-y-3">
              {files.length === 0 ? (
                <p className="text-sm text-slate-500">No files linked yet.</p>
              ) : (
                files.map((file) => (
                  <div
                    key={file.id}
                    className="rounded-2xl border border-slate-200 p-4"
                  >
                    <p className="font-medium text-slate-900">{file.name}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {file.fileType || file.mimeType || "Unknown type"}
                    </p>
                  </div>
                ))
              )}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

// ─── ProjectsPage ─────────────────────────────────────────────────────────────

export function ProjectsPage({
  projects,
  tasks,
  notes,
  onOpenProject,
  projectContext,
  loadingProjectContext,
  onGenerateSummary,
  onCreateProject,
  onEditProject,
  onDeleteProject,
  onCycleStatus,
}: {
  projects: Project[];
  tasks: Task[];
  notes: Note[];
  onOpenProject: (projectId: string) => void;
  projectContext: ProjectContextData | null;
  loadingProjectContext: boolean;
  onGenerateSummary: (projectId: string) => void;
  onCreateProject: () => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (id: string) => Promise<void>;
  onCycleStatus: (id: string, status: string) => Promise<void>;
}) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("priority");

  const PRIORITY_ORDER: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };

  const filtered = useMemo(() => {
    const list = projects.filter((p) => statusFilter === "all" || p.status === statusFilter);
    return [...list].sort((a, b) => {
      if (sortBy === "name") return a.title.localeCompare(b.title);
      if (sortBy === "due") {
        const aD = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        const bD = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        return aD - bD;
      }
      // priority (default)
      return (PRIORITY_ORDER[a.priority] ?? 9) - (PRIORITY_ORDER[b.priority] ?? 9);
    });
  }, [projects, statusFilter, sortBy]);

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-slate-500">
            {projects.length} project{projects.length !== 1 ? "s" : ""}
          </p>
          <button
            onClick={onCreateProject}
            className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
          >
            + New Project
          </button>
        </div>
        <FilterBar
          resultCount={filtered.length}
          totalCount={projects.length}
          filters={[
            {
              key: "status",
              label: "Status",
              value: statusFilter,
              onChange: setStatusFilter,
              options: [
                { value: "all", label: "All" },
                { value: "active", label: "Active" },
                { value: "completed", label: "Completed" },
                { value: "on_hold", label: "On hold" },
                { value: "paused", label: "Paused" },
              ],
            },
            {
              key: "sort",
              label: "Sort",
              value: sortBy,
              onChange: setSortBy,
              options: [
                { value: "priority", label: "Priority" },
                { value: "name", label: "Name" },
                { value: "due", label: "Due date" },
              ],
            },
          ]}
        />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-1">
          {projects.length === 0 ? (
            <EmptyState
              icon={FolderOpen}
              title="No projects yet"
              description="Create your first project to start organizing tasks, notes, and files."
              action={{ label: "+ New Project", onClick: onCreateProject }}
            />
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 px-6 py-8 text-center text-sm text-slate-500">
              No projects match the current filter.
            </div>
          ) : (
          filtered.map((project) => {
            const allProjectTasks = tasks.filter((task) => task.projectId === project.id);
            const doneTasks = allProjectTasks.filter((task) => task.status === "done").length;
            const totalTasks = allProjectTasks.length;
            const openTasks = totalTasks - doneTasks;
            const progressPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
            const projectNotes = notes.filter((note) => note.projectId === project.id);

            return (
              <SectionCard
                key={project.id}
                title={project.title}
                subtitle={project.goal}
                action={
                  <div className="flex items-center gap-2">
                    <Badge
                      tone={project.priority === "high" ? "high" : "default"}
                    >
                      {project.priority}
                    </Badge>
                    <button
                      onClick={() => onEditProject(project)}
                      className="rounded-xl border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDeleteProject(project.id)}
                      className="rounded-xl border border-rose-200 px-3 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50"
                    >
                      Delete
                    </button>
                  </div>
                }
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <button
                      onClick={() => onCycleStatus(project.id, project.status)}
                      title="Click to change status"
                      className={`rounded-full border px-2.5 py-0.5 text-xs font-medium transition hover:opacity-80 ${
                        project.status === "active" ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : project.status === "completed" ? "border-slate-200 bg-slate-100 text-slate-500"
                        : project.status === "on_hold" ? "border-amber-200 bg-amber-50 text-amber-700"
                        : "border-slate-200 bg-white text-slate-600"
                      }`}
                    >
                      {project.status.replace("_", " ")}
                    </button>
                    <span>Due {project.dueDate}</span>
                  </div>

                  {totalTasks > 0 && (
                    <div>
                      <div className="mb-1.5 flex items-center justify-between text-xs text-slate-500">
                        <span>{doneTasks} of {totalTasks} tasks done</span>
                        <span className="font-medium text-slate-700">{progressPct}%</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-2 rounded-full bg-slate-900 transition-all duration-300"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <p className="text-slate-500">Open Tasks</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">
                        {openTasks}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <p className="text-slate-500">Notes</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">
                        {projectNotes.length}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onOpenProject(project.id)}
                    className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white"
                  >
                    Open Project
                  </button>
                </div>
              </SectionCard>
            );
          })
          )}
        </div>
      </div>

      <ProjectDetailPanel
        projectContext={projectContext}
        loading={loadingProjectContext}
        onGenerateSummary={onGenerateSummary}
      />
    </div>
  );
}
