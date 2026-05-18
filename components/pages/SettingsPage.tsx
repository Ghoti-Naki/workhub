"use client";

import React, { useEffect, useState } from "react";
import { LogOut, Download, Save } from "lucide-react";
import { Badge } from "@/components/shared/Badge";
import { SectionCard } from "@/components/shared/SectionCard";
import { useToast } from "@/components/shared/Toast";
import type { AutomationRun, WorkspaceSettings } from "@/lib/types";

const COMMON_TIMEZONES = [
  "Asia/Jakarta",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Asia/Seoul",
  "Asia/Kolkata",
  "Asia/Dubai",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Sao_Paulo",
  "Pacific/Auckland",
  "Australia/Sydney",
  "UTC",
];

export function SettingsPage({
  automationRuns,
  workspaceSettings,
  onUpdateWorkspace,
  counts,
}: {
  automationRuns: AutomationRun[];
  workspaceSettings: WorkspaceSettings | null;
  onUpdateWorkspace: (patch: { workspaceName?: string; timezone?: string }) => Promise<void>;
  counts?: { tasks: number; projects: number; notes: number; inbox: number; events: number; files: number };
}) {
  const { toast } = useToast();
  const [loggingOut, setLoggingOut] = useState(false);
  const [saving, setSaving] = useState(false);

  const [workspaceName, setWorkspaceName] = useState(workspaceSettings?.workspaceName ?? "AI Work Hub");
  const [timezone, setTimezone] = useState(workspaceSettings?.timezone ?? "Asia/Jakarta");

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    if (workspaceSettings) {
      setWorkspaceName(workspaceSettings.workspaceName);
      setTimezone(workspaceSettings.timezone);
    }
  }, [workspaceSettings]);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      window.location.href = "/login";
    }
  }

  async function handleSave() {
    if (!workspaceName.trim()) {
      toast("Workspace name cannot be empty.", "error");
      return;
    }
    setSaving(true);
    try {
      await onUpdateWorkspace({ workspaceName: workspaceName.trim(), timezone });
      toast("Workspace settings saved.");
    } catch {
      toast("Failed to save settings.", "error");
    } finally {
      setSaving(false);
    }
  }

  const isDirty =
    workspaceName !== (workspaceSettings?.workspaceName ?? "AI Work Hub") ||
    timezone !== (workspaceSettings?.timezone ?? "Asia/Jakarta");

  const integrations = [
    { name: "Google Calendar", status: "Automation-ready" },
    { name: "Gmail", status: "Automation-ready" },
    { name: "Google Drive", status: "Automation-ready" },
  ];

  const exports: { label: string; hint: string; url: string }[] = [
    { label: "All data (JSON)", hint: "Projects, tasks, notes, inbox, events in one file", url: "/api/export?entity=all&format=json" },
    { label: "Tasks (CSV)", hint: "Title, status, priority, due date, project", url: "/api/export?entity=tasks&format=csv" },
    { label: "Projects (CSV)", hint: "Title, goal, status, priority, due date", url: "/api/export?entity=projects&format=csv" },
    { label: "Notes (CSV)", hint: "Title, body, project", url: "/api/export?entity=notes&format=csv" },
  ];

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <div className="space-y-6">
        <SectionCard
          title="Workspace"
          subtitle="Edit your workspace name and timezone"
          action={
            isDirty ? (
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              >
                <Save className="h-3.5 w-3.5" />
                {saving ? "Saving…" : "Save"}
              </button>
            ) : undefined
          }
        >
          <div className="space-y-4">
            <div>
              <label htmlFor="workspace-name" className="mb-1.5 block text-xs font-medium text-slate-500">
                Workspace name
              </label>
              <input
                id="workspace-name"
                type="text"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="workspace-timezone" className="mb-1.5 block text-xs font-medium text-slate-500">
                Timezone
              </label>
              <select
                id="workspace-timezone"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
              >
                {COMMON_TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
            >
              <LogOut className="h-4 w-4" />
              {loggingOut ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </SectionCard>

        <SectionCard
          title="Export Data"
          subtitle="Download your workspace data as JSON or CSV"
        >
          {counts && (
            <div className="mb-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
              {[
                { label: "Tasks", value: counts.tasks },
                { label: "Projects", value: counts.projects },
                { label: "Notes", value: counts.notes },
                { label: "Inbox", value: counts.inbox },
                { label: "Events", value: counts.events },
                { label: "Files", value: counts.files },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-2xl bg-slate-50 p-3 text-center">
                  <p className="text-lg font-bold text-slate-900">{value}</p>
                  <p className="text-xs text-slate-500">{label}</p>
                </div>
              ))}
            </div>
          )}
          <div className="space-y-3">
            {exports.map((exp) => (
              <a
                key={exp.url}
                href={exp.url}
                download
                className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4 transition hover:bg-slate-50"
              >
                <div>
                  <p className="font-medium text-slate-900">{exp.label}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{exp.hint}</p>
                </div>
                <Download className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
              </a>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Integrations"
          subtitle="External tools connected through automation"
        >
          <div className="space-y-3">
            {integrations.map((integration) => (
              <div
                key={integration.name}
                className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4"
              >
                <div>
                  <p className="font-medium text-slate-900">{integration.name}</p>
                  <p className="mt-1 text-sm text-slate-500">{integration.status}</p>
                </div>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700">
                  via n8n
                </span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="Automation Runs"
        subtitle="Recent ingestion and sync activity"
      >
        {automationRuns.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
            No automation runs yet. Once n8n starts calling your ingestion
            routes, activity will show here.
          </div>
        ) : (
          <div className="space-y-3">
            {automationRuns.map((run) => (
              <div key={run.id} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-900">{run.workflow}</p>
                    <p className="mt-1 text-sm text-slate-500">Source: {run.source}</p>
                  </div>
                  <Badge
                    tone={
                      run.status === "success"
                        ? "success"
                        : run.status === "failed"
                          ? "urgent"
                          : "info"
                    }
                  >
                    {run.status}
                  </Badge>
                </div>
                {run.message ? (
                  <p className="mt-3 text-sm text-slate-700">{run.message}</p>
                ) : null}
                <p className="mt-3 text-xs text-slate-400">
                  {new Date(run.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
