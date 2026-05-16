"use client";

import React from "react";
import { Badge } from "@/components/shared/Badge";
import { SectionCard } from "@/components/shared/SectionCard";
import type { AutomationRun } from "@/lib/types";

export function SettingsPage({ automationRuns }: { automationRuns: AutomationRun[] }) {
  const integrations = [
    { name: "Google Calendar", status: "Automation-ready" },
    { name: "Gmail", status: "Automation-ready" },
    { name: "Google Drive", status: "Automation-ready" },
  ];

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <div className="space-y-6">
        <SectionCard
          title="Account"
          subtitle="Workspace profile and preferences"
        >
          <div className="space-y-4 text-sm text-slate-700">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-slate-500">Workspace</p>
              <p className="mt-1 font-medium text-slate-900">AI Work Hub</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-slate-500">Timezone</p>
              <p className="mt-1 font-medium text-slate-900">Asia/Jakarta</p>
            </div>
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
                  <p className="font-medium text-slate-900">
                    {integration.name}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {integration.status}
                  </p>
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
              <div
                key={run.id}
                className="rounded-2xl border border-slate-200 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-900">{run.workflow}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      Source: {run.source}
                    </p>
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
