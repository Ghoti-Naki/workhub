"use client";

import React from "react";
import { Badge } from "@/components/shared/Badge";
import { SectionCard } from "@/components/shared/SectionCard";
import type { Note, Project, AiExtraction } from "@/lib/types";

export function NotesPage({
  notes,
  projects,
  selectedNoteId,
  onSelectNote,
  onCreateNote,
  onEditNote,
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
  noteExtraction: AiExtraction | null;
  loadingExtraction: boolean;
  generatingExtraction: boolean;
  acceptingExtraction: boolean;
  onExtractTasks: (noteId: string) => void;
  onAcceptExtraction: (extractionId: string) => void;
  selectedExtractionItems: number[];
  onToggleExtractionItem: (index: number) => void;
}) {
  const projectMap: Record<string, string> = Object.fromEntries(
    projects.map((project) => [project.id, project.title]),
  );

  const selectedNote =
    notes.find((note) => note.id === selectedNoteId) ?? notes[0] ?? null;

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
          {notes.length === 0 ? (
            <p className="text-sm text-slate-500">No notes yet.</p>
          ) : (
            notes.map((note) => (
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
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-700">
                  {note.body}
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
                  onClick={() => onExtractTasks(selectedNote.id)}
                  disabled={generatingExtraction}
                  className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                >
                  {generatingExtraction ? "Extracting..." : "Extract Tasks"}
                </button>
              </div>
            ) : null
          }
        >
          {selectedNote ? (
            <p className="text-sm leading-6 text-slate-700">
              {selectedNote.body}
            </p>
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
                className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              >
                {acceptingExtraction
                  ? "Creating Tasks..."
                  : "Create Selected Tasks"}
              </button>
            ) : null
          }
        >
          {loadingExtraction ? (
            <p className="text-sm text-slate-500">Loading extraction...</p>
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
