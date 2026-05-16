"use client";

import React, { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { ModalShell } from "@/components/modals/ModalShell";
import { labelCls, selectCls, inputCls } from "@/components/shared/styles";
import type { Project } from "@/lib/types";

export function UploadFileModal({
  open,
  onClose,
  onSaved,
  projects,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  projects: Project[];
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [projectId, setProjectId] = useState("");
  const [summary, setSummary] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  function reset() {
    setFile(null);
    setProjectId("");
    setSummary("");
    setError(null);
    setProgress(0);
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) { setError("Please select a file."); return; }
    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      const fd = new FormData();
      fd.append("file", file);
      if (projectId) fd.append("projectId", projectId);
      if (summary.trim()) fd.append("summary", summary.trim());

      const res = await fetch("/api/files/upload", { method: "POST", body: fd });
      const json = await res.json();

      if (!res.ok || json.error) {
        setError(json.error?.message ?? "Upload failed. Please try again.");
        return;
      }

      setProgress(100);
      reset();
      onSaved();
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <ModalShell title="Upload File" open={open} onClose={handleClose}>
      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        {/* Drop zone / file picker */}
        <div
          onClick={() => inputRef.current?.click()}
          className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-300 p-8 text-center transition hover:border-slate-400 hover:bg-slate-50"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
          aria-label="Select file to upload"
        >
          <Upload className="h-8 w-8 text-slate-400" aria-hidden="true" />
          {file ? (
            <div>
              <p className="text-sm font-medium text-slate-900">{file.name}</p>
              <p className="mt-0.5 text-xs text-slate-400">{(file.size / 1024).toFixed(0)} KB · {file.type || "unknown type"}</p>
            </div>
          ) : (
            <div>
              <p className="text-sm font-medium text-slate-700">Click to choose a file</p>
              <p className="mt-0.5 text-xs text-slate-400">Max 10 MB · Images, PDFs, documents, text</p>
            </div>
          )}
          <input
            ref={inputRef}
            type="file"
            className="sr-only"
            onChange={(e) => { setFile(e.target.files?.[0] ?? null); setError(null); }}
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.md,.json,.zip,.csv"
          />
        </div>

        <div>
          <label className={labelCls}>Project (optional)</label>
          <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className={selectCls}>
            <option value="">No linked project</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelCls}>Description (optional)</label>
          <input
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Brief description of the file"
            className={inputCls}
          />
        </div>

        {progress > 0 && progress < 100 && (
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-slate-900 transition-all" style={{ width: `${progress}%` }} />
          </div>
        )}

        {error ? <p role="alert" className="text-sm text-rose-600">{error}</p> : null}

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={handleClose} className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700">
            Cancel
          </button>
          <button type="submit" disabled={uploading || !file} className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
            {uploading ? "Uploading…" : "Upload"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
