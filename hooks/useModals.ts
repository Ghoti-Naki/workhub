"use client";

import { useState } from "react";
import type { Project, Note, Task } from "@/lib/types";

export function useModals() {
  const [captureModalOpen, setCaptureModalOpen] = useState(false);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [eventModalOpen, setEventModalOpen] = useState(false);

  function openCaptureModal() { setCaptureModalOpen(true); }
  function closeCaptureModal() { setCaptureModalOpen(false); }

  function openCreateProject() { setEditingProject(null); setProjectModalOpen(true); }
  function openEditProject(project: Project) { setEditingProject(project); setProjectModalOpen(true); }
  function closeProjectModal() { setProjectModalOpen(false); setEditingProject(null); }

  function openCreateTask() { setEditingTask(null); setTaskModalOpen(true); }
  function openEditTask(task: Task) { setEditingTask(task); setTaskModalOpen(true); }
  function closeTaskModal() { setTaskModalOpen(false); setEditingTask(null); }

  function openCreateNote() { setEditingNote(null); setNoteModalOpen(true); }
  function openEditNote(note: Note) { setEditingNote(note); setNoteModalOpen(true); }
  function closeNoteModal() { setNoteModalOpen(false); setEditingNote(null); }

  function openCreateEvent() { setEventModalOpen(true); }
  function closeEventModal() { setEventModalOpen(false); }

  return {
    captureModalOpen, openCaptureModal, closeCaptureModal,
    projectModalOpen, editingProject, openCreateProject, openEditProject, closeProjectModal,
    taskModalOpen, editingTask, openCreateTask, openEditTask, closeTaskModal,
    noteModalOpen, editingNote, openCreateNote, openEditNote, closeNoteModal,
    eventModalOpen, openCreateEvent, closeEventModal,
  };
}
