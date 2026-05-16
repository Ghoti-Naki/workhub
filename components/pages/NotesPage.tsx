"use client";

import React, { useMemo, useState } from "react";
import { FileText } from "lucide-react";
import { SkeletonRow } from "@/components/shared/Skeleton";
import { Badge } from "@/components/shared/Badge";
import { SectionCard } from "@/components/shared/SectionCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { MarkdownPreview } from "@/components/shared/MarkdownEditor";
import { stripMarkdown } from "@/lib/date";
import type { Note, Project, AiExtraction } from "@/lib/types";

export function NotesPage({
  notes,
  projects,
  selectedNoteId,
  onSelectNote,
  onCreateNote,
  onEditNote,
  onDeleteNote,
  noteExtraction,
  loadingExtraction,
  generatingExtraction,
  acceptingExtraction,
  onExtractTasks,
  onAcceptExtraction,
  selectedExtractionItems,
  onToggleExtractionItem,
}: {
  notes: Note[];
  projects: Project[];
  selectedNoteId: string | null;
  onSelectNote: (noteId: string) => void;
  onCreateNote: () => void;
  onEditNote: (note: Note) => void;
  onDeleteNote: (noteId: string) => Promise<void>;
  noteExtraction: AiExtraction | null;
  loadingExtraction: boolean;
  generatingExtraction: boolean;
  acceptingExtraction: boolean;
  onExtractTasks: (noteId: string) => void;
  onAcceptExtraction: (extractionId: string) => void;
  selectedExtractionItems: number[];
  onToggleExtractionItem: (index: number) => void;
}) {
  const [projectFilter, setProjectFilter] = useState("all");
  const [noteSearch, setNoteSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const projectMap: Record<string, string> = Object.fromEntries(
    projects.map((project) => [project.id, project.title]),
  );

  const filteredNotes = useMemo(() => {
    const q = noteSearch.trim().toLowerCase();
    const list = notes.filter((n) => {
      const matchProject =
        projectFilter === "all" ||
        (projectFilter === "none" ? !n.projectId : n.projectId === projectFilter);
      const matchSearch =
        !q || n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q);
      return matchProject && matchSearch;
    });
    return [...list].sort((a, b) => {
      if (sortBy === "oldest") return a.updatedAt < b.updatedAt ? -1 : 1;
      if (sortBy === "title") return a.title.localeCompare(b.title);
      return a.updatedAt > b.updatedAt ? -1 : 1; // newest
    });
  }, [notes, projectFilter, noteSearch, sortBy]);

  const selectedNote =
    filteredNotes.find((note) => note.id === selectedNoteId) ?? filteredNotes[0] ?? null;

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <SectionCard
        title="Notes"
        subtitle="Ideas, references, and project thinking"
        action={
          <button
            onClick={onCreateNote}
            className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
          >
            Create Note
          </button>
        }
      >
        <div className="space-y-3">
          <input
            type="search"
            value={noteSearch}
            onChange={(e) => setNoteSearch(e.target.value)}
            placeholder="Search notes…"
            aria-label="Search notes"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-slate-400"
          />
          <div className="flex gap-2">
            {projects.length > 0 && (
              <select
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
                className="flex-1 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none"
                aria-label="Filter notes by project"
              >
                <option value="all">All projects</option>
                <option value="none">Unassigned</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            )}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort notes"
              className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="title">A–Z</option>
            </select>
          </div>
          {notes.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No notes yet"
              description="Use notes for meeting notes, research, ideas, and planning."
              action={{ label: "Create Note", onClick: onCreateNote }}
            />
          ) : filteredNotes.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-500">
              No notes in this project.
            </p>
          ) : (
            filteredNotes.map((note) => (
              <button
                key={note.id}
                onClick={() => onSelectNote(note.id)}
                className={`w-full rounded-2xl border p-4 text-left transition ${
                  selectedNote?.id === note.id
                    ? "border-slate-900 bg-slate-50"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <p className="font-medium text-slate-900">{note.title}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {projectMap[note.projectId] || "Unassigned"}
                </p>
                <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-500">
                  {stripMarkdown(note.body)}
                </p>
              </button>
            ))
          )}
        </div>
      </SectionCard>

      <div className="space-y-6">
        <SectionCard
          title={selectedNote?.title ?? "Note Detail"}
          subtitle={
            selectedNote
              ? projectMap[selectedNote.projectId] || "Unassigned"
              : "Select a note"
          }
          action={
            selectedNote ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onEditNote(selectedNote)}
                  className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDeleteNote(selectedNote.id)}
                  className="rounded-2xl border border-rose-200 px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50"
                >
                  Delete
                </button>
                <button
                  onClick={() => onExtractTasks(selectedNote.id)}
                  disabled={generatingExtraction}
                  className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {generatingExtraction && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden="true" />}
                  {generatingExtraction ? "Extracting…" : "Extract Tasks"}
                </button>
              </div>
            ) : null
          }
        >
          {selectedNote ? (
            <div className="space-y-3">
              <MarkdownPreview
                source={selectedNote.body}
                className="prose prose-sm max-w-none text-slate-700"
              />
              <p className="text-xs text-slate-400">
                {selectedNote.body.trim().split(/\s+/).filter(Boolean).length} words
              </p>
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              Choose a note to inspect it.
            </p>
          )}
        </SectionCard>

        <SectionCard
          title="AI Task Extraction"
          subtitle="Review suggested tasks before creating them"
          action={
            noteExtraction ? (
              <button
                onClick={() => onAcceptExtraction(noteExtraction.id)}
                disabled={
                  acceptingExtraction || selectedExtractionItems.length === 0
                }
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {acceptingExtraction && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden="true" />}
                {acceptingExtraction ? "Creating Tasks…" : "Create Selected Tasks"}
              </button>
            ) : null
          }
        >
          {loadingExtraction ? (
            <div className="space-y-2">
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </div>
          ) : !noteExtraction ? (
            <p className="text-sm text-slate-500">
              No extraction yet. Select a note and run Extract Tasks.
            </p>
          ) : !noteExtraction.payload?.suggestions?.length ? (
            <p className="text-sm text-slate-500">
              No suggestions were generated for this note.
            </p>
          ) : (
            <div className="space-y-3">
              {noteExtraction.payload.suggestions.map((suggestion, index) => {
                const checked = selectedExtractionItems.includes(index);

                return (
                  <label
                    key={`${noteExtraction.id}-${index}`}
                    className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onToggleExtractionItem(index)}
                      className="mt-1"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium text-slate-900">
                          {suggestion.title}
                        </p>
                        <Badge
                          tone={
                            suggestion.priority === "urgent"
                              ? "urgent"
                              : suggestion.priority === "high"
                                ? "high"
                                : "default"
                          }
                        >
                          {suggestion.priority}
                        </Badge>
                      </div>
                      {suggestion.description ? (
                        <p className="mt-2 text-sm text-slate-600">
                          {suggestion.description}
                        </p>
                      ) : null}
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
