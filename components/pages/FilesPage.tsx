"use client";

import React, { useMemo, useState } from "react";
import { File, FileText, FileImage, FileVideo, FileAudio, FileCode, FileArchive, FileSpreadsheet, Files } from "lucide-react";
import { SectionCard } from "@/components/shared/SectionCard";
import { EmptyState } from "@/components/shared/EmptyState";
import type { FileRecord, Project } from "@/lib/types";

function getFileIcon(file: FileRecord): { icon: React.ElementType; bg: string; text: string } {
  const mime = (file.mimeType ?? "").toLowerCase();
  const ext = (file.name ?? "").split(".").pop()?.toLowerCase() ?? "";
  const type = (file.fileType ?? "").toLowerCase();

  if (mime.startsWith("image/") || ["jpg","jpeg","png","gif","svg","webp","heic"].includes(ext))
    return { icon: FileImage, bg: "bg-purple-50", text: "text-purple-700" };
  if (mime.startsWith("video/") || ["mp4","mov","avi","mkv","webm"].includes(ext))
    return { icon: FileVideo, bg: "bg-pink-50", text: "text-pink-700" };
  if (mime.startsWith("audio/") || ["mp3","wav","aac","flac","ogg"].includes(ext))
    return { icon: FileAudio, bg: "bg-amber-50", text: "text-amber-700" };
  if (mime === "application/pdf" || ext === "pdf" || type === "pdf")
    return { icon: FileText, bg: "bg-rose-50", text: "text-rose-700" };
  if (["application/vnd.ms-excel","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"].includes(mime) || ["xls","xlsx","csv"].includes(ext))
    return { icon: FileSpreadsheet, bg: "bg-emerald-50", text: "text-emerald-700" };
  if (["application/zip","application/x-tar","application/x-7z-compressed","application/x-rar-compressed"].includes(mime) || ["zip","tar","gz","7z","rar"].includes(ext))
    return { icon: FileArchive, bg: "bg-orange-50", text: "text-orange-700" };
  if (mime.startsWith("text/") || ["js","ts","tsx","jsx","py","rb","go","java","c","cpp","cs","sh","json","yaml","yml","toml","html","css","md"].includes(ext))
    return { icon: FileCode, bg: "bg-sky-50", text: "text-sky-700" };
  if (["application/msword","application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(mime) || ["doc","docx","txt","rtf"].includes(ext))
    return { icon: FileText, bg: "bg-blue-50", text: "text-blue-700" };
  return { icon: File, bg: "bg-slate-100", text: "text-slate-700" };
}

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
  const [search, setSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");

  const projectMap: Record<string, string> = Object.fromEntries(
    projects.map((project) => [project.id, project.title]),
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return files.filter((f) => {
      const matchProject = projectFilter === "all"
        ? true
        : projectFilter === "none"
          ? !f.projectId
          : f.projectId === projectFilter;
      const matchSearch = !q || (f.name ?? "").toLowerCase().includes(q);
      return matchProject && matchSearch;
    });
  }, [files, search, projectFilter]);

  return (
    <SectionCard
      title="Files"
      subtitle="Documents tied to active work"
      action={
        <button
          onClick={onCreateFile}
          className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
        >
          Upload File
        </button>
      }
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search files…"
          aria-label="Search files"
          className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-slate-400"
        />
        {projects.length > 0 && (
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            aria-label="Filter by project"
            className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none"
          >
            <option value="all">All projects</option>
            <option value="none">Unassigned</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
        )}
      </div>
      {files.length === 0 ? (
        <EmptyState
          icon={Files}
          title="No file records yet"
          description="Link documents, slides, or assets manually or ingest them from automation."
          action={{ label: "Upload File", onClick: onCreateFile }}
        />
      ) : filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
          No files match this filter.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((file) => (
            <div
              key={file.id}
              className="rounded-2xl border border-slate-200 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                {(() => { const { icon: Icon, bg, text } = getFileIcon(file); return (
                  <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${bg} ${text}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                ); })()}
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

