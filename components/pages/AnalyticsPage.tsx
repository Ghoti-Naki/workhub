"use client";

import React, { useMemo } from "react";
import { SectionCard } from "@/components/shared/SectionCard";
import type { Task, Project, InboxItem } from "@/lib/types";

interface AnalyticsPageProps {
  tasks: Task[];
  projects: Project[];
  inboxItems: InboxItem[];
}

interface BarProps {
  label: string;
  value: number;
  max: number;
  color: string;
}

function Bar({ label, value, max, color }: BarProps) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-slate-600">
        <span>{label}</span>
        <span className="font-medium">{value}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemax={max}
          aria-label={label}
        />
      </div>
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
      {sub ? <p className="mt-1 text-xs text-slate-500">{sub}</p> : null}
    </div>
  );
}

export function AnalyticsPage({ tasks, projects, inboxItems }: AnalyticsPageProps) {
  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.status === "done").length;
    const inProgress = tasks.filter((t) => t.status === "in_progress").length;
    const todo = tasks.filter((t) => t.status === "todo").length;
    const blocked = tasks.filter((t) => t.status === "blocked").length;
    const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

    const now = new Date();
    const overdue = tasks.filter((t) => {
      if (!t.dueDate || t.status === "done") return false;
      return new Date(t.dueDate) < now;
    }).length;

    const urgent = tasks.filter((t) => t.priority === "urgent" && t.status !== "done").length;
    const high = tasks.filter((t) => t.priority === "high" && t.status !== "done").length;
    const medium = tasks.filter((t) => t.priority === "medium" && t.status !== "done").length;
    const low = tasks.filter((t) => t.priority === "low" && t.status !== "done").length;

    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const completedThisWeek = tasks.filter((t) => t.status === "done" && new Date(t.updatedAt) >= weekAgo).length;
    const completedLastWeek = tasks.filter((t) => {
      const d = new Date(t.updatedAt);
      return t.status === "done" && d >= twoWeeksAgo && d < weekAgo;
    }).length;

    const inboxNew = inboxItems.filter((i) => i.status === "new").length;
    const inboxProcessed = inboxItems.filter((i) => i.status !== "new").length;
    const inboxRate = inboxItems.length > 0 ? Math.round((inboxProcessed / inboxItems.length) * 100) : 0;

    const activeProjects = projects.filter((p) => p.status === "active").length;

    // Per-project task completion
    const projectHealth = projects.map((p) => {
      const pTasks = tasks.filter((t) => t.projectId === p.id);
      const pDone = pTasks.filter((t) => t.status === "done").length;
      return { name: p.title, total: pTasks.length, done: pDone };
    }).filter((p) => p.total > 0);

    return {
      total, done, inProgress, todo, blocked, completionRate,
      overdue, urgent, high, medium, low,
      completedThisWeek, completedLastWeek,
      inboxNew, inboxProcessed, inboxRate,
      activeProjects, projectHealth,
    };
  }, [tasks, projects, inboxItems]);

  const weekTrend = stats.completedLastWeek === 0
    ? null
    : stats.completedThisWeek >= stats.completedLastWeek
      ? `+${stats.completedThisWeek - stats.completedLastWeek} vs last week`
      : `${stats.completedThisWeek - stats.completedLastWeek} vs last week`;

  const maxPriority = Math.max(stats.urgent, stats.high, stats.medium, stats.low, 1);
  const maxStatus = Math.max(stats.done, stats.inProgress, stats.todo, stats.blocked, 1);

  return (
    <div className="space-y-6">
      {/* Top stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Completion rate" value={`${stats.completionRate}%`} sub={`${stats.done} of ${stats.total} tasks`} />
        <StatCard label="This week" value={stats.completedThisWeek} sub={weekTrend ?? "no prior data"} />
        <StatCard label="Overdue" value={stats.overdue} sub="open tasks past due date" />
        <StatCard label="Active projects" value={stats.activeProjects} sub={`of ${projects.length} total`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Task status breakdown */}
        <SectionCard title="Tasks by status" subtitle="Current distribution across all tasks">
          <div className="space-y-3">
            <Bar label="Done" value={stats.done} max={maxStatus} color="bg-emerald-500" />
            <Bar label="In Progress" value={stats.inProgress} max={maxStatus} color="bg-blue-500" />
            <Bar label="To Do" value={stats.todo} max={maxStatus} color="bg-slate-400" />
            <Bar label="Blocked" value={stats.blocked} max={maxStatus} color="bg-rose-400" />
          </div>
        </SectionCard>

        {/* Open tasks by priority */}
        <SectionCard title="Open tasks by priority" subtitle="Excludes completed tasks">
          <div className="space-y-3">
            <Bar label="Urgent" value={stats.urgent} max={maxPriority} color="bg-rose-500" />
            <Bar label="High" value={stats.high} max={maxPriority} color="bg-amber-500" />
            <Bar label="Medium" value={stats.medium} max={maxPriority} color="bg-sky-500" />
            <Bar label="Low" value={stats.low} max={maxPriority} color="bg-slate-300" />
          </div>
        </SectionCard>

        {/* Inbox health */}
        <SectionCard title="Inbox health" subtitle="Processing rate for captured items">
          <div className="space-y-4">
            <div className="flex items-end gap-4">
              <div>
                <p className="text-4xl font-bold text-slate-900">{stats.inboxRate}%</p>
                <p className="mt-1 text-sm text-slate-500">processed</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-sm font-medium text-slate-700">{stats.inboxNew} unreviewed</p>
                <p className="text-xs text-slate-400">{stats.inboxProcessed} processed</p>
              </div>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{ width: `${stats.inboxRate}%` }}
                role="progressbar"
                aria-valuenow={stats.inboxRate}
                aria-valuemax={100}
                aria-label="Inbox processing rate"
              />
            </div>
          </div>
        </SectionCard>

        {/* Project health */}
        <SectionCard title="Project health" subtitle="Task completion per active project">
          {stats.projectHealth.length === 0 ? (
            <p className="text-sm text-slate-500">No project tasks yet.</p>
          ) : (
            <div className="space-y-3">
              {stats.projectHealth.map((p) => (
                <Bar
                  key={p.name}
                  label={`${p.name} (${p.done}/${p.total})`}
                  value={p.done}
                  max={p.total}
                  color="bg-violet-500"
                />
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
