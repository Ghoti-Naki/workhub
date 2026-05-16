"use client";

import React from "react";
import { FileText } from "lucide-react";
import { SectionCard } from "@/components/shared/SectionCard";
import type { FileRecord, Project } from "@/lib/types";

export function FilesPage({
  files,
  projects,
  onCreateFile,
  onDeleteFile,
}: {
  files: FileRecord[];
  projects: Project[];
  onCreateFile: () => void;
  onDeleteFile: (fileId: string) => void;
}) {
  const projectMap: Record<string, string> = Object.fromEntries(
    projects.map((project) => [project.id, project.title]),
  );

  return (
    <SectionCard
      title="Files"
      subtitle="Documents tied to active work"
      action={
        <button
          onClick={onCreateFile}
          className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
        >
          Add File Record
        </button>
      }
    >
      {files.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
          No file records yet. Add one manually or ingest from automation.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {files.map((file) => (
            <div
              key={file.id}
              className="rounded-2xl border border-slate-200 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                  <FileText className="h-5 w-5" />
                </div>
                <button
                  onClick={() => onDeleteFile(file.id)}
                  className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Delete
                </button>
              </div>

              <p className="mt-4 font-medium text-slate-900">{file.name}</p>
              <p className="mt-1 text-sm text-slate-500">
                {file.fileType || file.mimeType || "Unknown type"}
              </p>

              <p className="mt-3 text-xs text-slate-400">
                {file.projectId
                  ? projectMap[file.projectId] || "Linked project"
                  : "No linked project"}
              </p>

              {file.summary ? (
                <p className="mt-3 text-sm text-slate-600">{file.summary}</p>
              ) : null}

              {file.externalUrl ? (
                <a
                  href={file.externalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-block text-sm font-medium text-slate-700 underline"
                >
                  Open file
                </a>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}
