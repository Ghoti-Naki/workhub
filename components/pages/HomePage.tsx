"use client";

import React from "react";
import { AlertCircle, CheckCircle2, ChevronRight, Clock3 } from "lucide-react";
import { Badge } from "@/components/shared/Badge";
import { SectionCard } from "@/components/shared/SectionCard";
import { AIErrorCallout } from "@/components/shared/AIErrorCallout";
import type { HomePageProps, WorkspaceEvent, EventSource } from "@/lib/types";

export function HomePage({
  tasks,
  projects,
  inboxItems,
  events,
  dashboard,
  dailyBrief,
  loadingDailyBrief,
  dailyBriefError,
  onGenerateDailyBrief,
  onCompleteTask,
  onOpenPage,
}: HomePageProps) {
  const overdue = dashboard?.overdueTasks ?? [];
  const topTasks = dashboard?.topTasks ?? [];

  const dailyHighlights = Array.isArray(dailyBrief?.metadata?.highlights)
    ? (dailyBrief?.metadata?.highlights as string[])
    : dashboard?.dailyBrief?.highlights?.length
      ? dashboard.dailyBrief.highlights
      : [
          "Top focus will appear here",
          "Risk summary will appear here",
          "Inbox summary will appear here",
        ];

  const scheduleItems: WorkspaceEvent[] = dashboard?.todayEvents?.length
    ? dashboard.todayEvents.map((event) => {
        const start = event.startsAt
          ? new Date(event.startsAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "TBD";
        const end = event.endsAt
          ? new Date(event.endsAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "TBD";

        return {
          id: event.id,
          title: event.title,
          time: `${start} - ${end}`,
          source: event.sourceType as EventSource,
        };
      })
    : events;

  return (
    <div className="space-y-6">
      <SectionCard
        title="AI Daily Brief"
        subtitle="A grounded summary of what deserves your attention today"
        action={
          <button
            onClick={onGenerateDailyBrief}
            disabled={loadingDailyBrief}
            className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {loadingDailyBrief ? "Generating..." : "Generate Brief"}
          </button>
        }
      >
        <div className="space-y-4">
          <AIErrorCallout message={dailyBriefError} />
          <p className="text-sm leading-6 text-slate-700">
            {dailyBrief?.content ??
              dashboard?.dailyBrief?.summary ??
              "Your daily brief will appear here once it has been generated."}
          </p>

          <div className="grid gap-3 md:grid-cols-3">
            {dailyHighlights.map((item) => (
              <div key={item} className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">{item}</p>
              </div>
            ))}
          </div>

          {dailyBrief ? (
            <p className="text-xs text-slate-400">
              Generated {new Date(dailyBrief.createdAt).toLocaleString()}
            </p>
          ) : null}
        </div>
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <SectionCard
            title="Top Tasks"
            subtitle="The most important work in front of you"
          >
            <div className="space-y-3">
              {topTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => onOpenPage("tasks")}
                  className="flex w-full items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4 text-left transition hover:bg-slate-50"
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onCompleteTask(task.id);
                      }}
                      aria-label="Mark task complete"
                      className="mt-0.5 rounded-full border border-slate-300 p-1 text-slate-500 hover:bg-slate-100"
                    >
                      <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <div>
                      <p className="font-medium text-slate-900">{task.title}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        Due {task.dueDate}
                      </p>
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
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="Overdue and Near-Due"
            subtitle="Items that need fast attention"
          >
            <div className="space-y-3">
              {overdue.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
                  No overdue tasks right now. Good shape.
                </div>
              ) : (
                overdue.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between gap-4 rounded-2xl bg-rose-50 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <AlertCircle className="mt-0.5 h-4 w-4 text-rose-600" />
                      <div>
                        <p className="font-medium text-rose-900">
                          {task.title}
                        </p>
                        <p className="mt-1 text-sm text-rose-700">
                          Due {task.dueDate}
                        </p>
                      </div>
                    </div>
                    <Badge tone="urgent">act now</Badge>
                  </div>
                ))
              )}
            </div>
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard
            title="Today's Schedule"
            subtitle="Time-based commitments and blocks"
          >
            <div className="space-y-3">
              {scheduleItems.map((event) => (
                <div
                  key={event.id}
                  className="rounded-2xl border border-slate-200 p-4"
                >
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Clock3 className="h-4 w-4" />
                    <span>{event.time}</span>
                  </div>
                  <p className="mt-2 font-medium text-slate-900">
                    {event.title}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Source: {event.source}
                  </p>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="Inbox Review"
            subtitle="Raw items that still need sorting"
            action={
              <button
                onClick={() => onOpenPage("inbox")}
                className="text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                Open Inbox
              </button>
            }
          >
            <div className="space-y-3">
              {inboxItems.slice(0, 3).map((item) => (
                <div key={item.id} className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-slate-900">{item.title}</p>
                    <Badge tone={item.status === "new" ? "info" : "default"}>
                      {item.status}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    {item.suggestion}
                  </p>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="Project Snapshot"
            subtitle="The health of your active work areas"
          >
            <div className="space-y-3">
              {projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => onOpenPage("projects")}
                  className="block w-full rounded-2xl border border-slate-200 p-4 text-left transition hover:bg-slate-50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-900">
                        {project.title}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {project.goal}
                      </p>
                    </div>
                    <Badge
                      tone={project.priority === "high" ? "high" : "default"}
                    >
                      {project.priority}
                    </Badge>
                  </div>
                  <div className="mt-4 h-2 w-full rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-slate-900"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </button>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
