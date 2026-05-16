"use client";

import React, { useEffect, useMemo, useState } from "react";
import type {
  PageId,
  Project,
  Task,
  Note,
  InboxItem,
  WorkspaceEvent,
  DashboardData,
  FileRecord,
  ProjectContextData,
  AiOutput,
  AiExtraction,
  CopilotOutput,
  AutomationRun,
  SearchResult,
  ApiResponse,
} from "@/lib/types";
import { initialEvents, navItems, subtitle } from "@/lib/constants";
import { AppHeader } from "@/components/app-shell/AppHeader";
import { Sidebar } from "@/components/app-shell/Sidebar";
import { HomePage } from "@/components/pages/HomePage";
import { InboxPage } from "@/components/pages/InboxPage";
import { ProjectsPage } from "@/components/pages/ProjectsPage";
import { TasksPage } from "@/components/pages/TasksPage";
import { NotesPage } from "@/components/pages/NotesPage";
import { CalendarPage } from "@/components/pages/CalendarPage";
import { FilesPage } from "@/components/pages/FilesPage";
import { CopilotPage } from "@/components/pages/CopilotPage";
import { SettingsPage } from "@/components/pages/SettingsPage";
import { CaptureModal } from "@/components/modals/CaptureModal";
import { ProjectFormModal } from "@/components/modals/ProjectFormModal";
import { TaskFormModal } from "@/components/modals/TaskFormModal";
import { NoteFormModal } from "@/components/modals/NoteFormModal";
import { EventFormModal } from "@/components/modals/EventFormModal";

export default function AIWorkHubApp() {
  const [page, setPage] = useState<PageId>("home");
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [inboxItems, setInboxItems] = useState<InboxItem[]>([]);
  const [events, setEvents] = useState<WorkspaceEvent[]>(initialEvents);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  );
  const [projectContext, setProjectContext] =
    useState<ProjectContextData | null>(null);
  const [loadingProjectContext, setLoadingProjectContext] = useState(false);
  const [dailyBrief, setDailyBrief] = useState<AiOutput | null>(null);
  const [loadingDailyBrief, setLoadingDailyBrief] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [noteExtraction, setNoteExtraction] = useState<AiExtraction | null>(
    null,
  );
  const [selectedExtractionItems, setSelectedExtractionItems] = useState<
    number[]
  >([]);
  const [loadingExtraction, setLoadingExtraction] = useState(false);
  const [generatingExtraction, setGeneratingExtraction] = useState(false);
  const [acceptingExtraction, setAcceptingExtraction] = useState(false);
  const [copilotPrompt, setCopilotPrompt] = useState("");
  const [copilotHistory, setCopilotHistory] = useState<CopilotOutput[]>([]);
  const [loadingCopilot, setLoadingCopilot] = useState(false);
  const [automationRuns, setAutomationRuns] = useState<AutomationRun[]>([]);

  // Modal state
  const [captureModalOpen, setCaptureModalOpen] = useState(false);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [eventModalOpen, setEventModalOpen] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");


  const searchResults = useMemo<SearchResult[]>(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    const results: SearchResult[] = [];
    projects
      .filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.goal ?? "").toLowerCase().includes(q),
      )
      .slice(0, 3)
      .forEach((p) =>
        results.push({
          type: "project",
          id: p.id,
          title: p.title,
          subtitle: `Project · ${p.status}`,
        }),
      );
    tasks
      .filter((t) => t.title.toLowerCase().includes(q))
      .slice(0, 3)
      .forEach((t) =>
        results.push({
          type: "task",
          id: t.id,
          title: t.title,
          subtitle: `Task · ${t.status}`,
        }),
      );
    notes
      .filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.body.toLowerCase().includes(q),
      )
      .slice(0, 3)
      .forEach((n) =>
        results.push({ type: "note", id: n.id, title: n.title, subtitle: "Note" }),
      );
    return results;
  }, [searchQuery, projects, tasks, notes]);

  async function loadWorkspaceData() {
    try {
      setLoadingData(true);
      setLoadError(null);

      const [
        projectsRes,
        tasksRes,
        notesRes,
        inboxRes,
        eventsRes,
        filesRes,
        dashboardRes,
        dailyBriefRes,
        automationRunsRes,
      ] = await Promise.all([
        fetch("/api/projects", { cache: "no-store" }),
        fetch("/api/tasks", { cache: "no-store" }),
        fetch("/api/notes", { cache: "no-store" }),
        fetch("/api/inbox", { cache: "no-store" }),
        fetch("/api/events", { cache: "no-store" }),
        fetch("/api/files", { cache: "no-store" }),
        fetch("/api/dashboard/home", { cache: "no-store" }),
        fetch("/api/ai/outputs?outputType=daily_brief&targetType=workspace", {
          cache: "no-store",
        }),
        fetch("/api/automation/runs", { cache: "no-store" }),
      ]);

      if (
        !projectsRes.ok ||
        !tasksRes.ok ||
        !notesRes.ok ||
        !inboxRes.ok ||
        !eventsRes.ok ||
        !filesRes.ok ||
        !dashboardRes.ok ||
        !dailyBriefRes.ok ||
        !automationRunsRes.ok
      ) {
        throw new Error("Failed to load workspace data from the API.");
      }

      const projectsJson: ApiResponse<Project[]> = await projectsRes.json();
      const tasksJson: ApiResponse<Task[]> = await tasksRes.json();
      const notesJson: ApiResponse<Note[]> = await notesRes.json();
      const inboxJson: ApiResponse<InboxItem[]> = await inboxRes.json();
      const eventsJson: ApiResponse<any[]> = await eventsRes.json();
      const dashboardJson: ApiResponse<DashboardData> =
        await dashboardRes.json();
      const mappedEvents: WorkspaceEvent[] = (eventsJson.data ?? []).map(
        (e) => {
          const start = e.startsAt
            ? new Date(e.startsAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "TBD";
          const end = e.endsAt
            ? new Date(e.endsAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "TBD";

          return {
            id: e.id,
            title: e.title,
            time: `${start} - ${end}`,
            source: e.sourceType,
          };
        },
      );
      const filesJson: ApiResponse<FileRecord[]> = await filesRes.json();
      const dailyBriefJson: ApiResponse<AiOutput[]> =
        await dailyBriefRes.json();
      const automationRunsJson: ApiResponse<AutomationRun[]> =
        await automationRunsRes.json();

      setDailyBrief(dailyBriefJson.data?.[0] ?? null);
      setFiles(filesJson.data ?? []);
      setProjects(projectsJson.data ?? []);
      setTasks(tasksJson.data ?? []);
      setNotes(notesJson.data ?? []);
      setInboxItems(inboxJson.data ?? []);
      setDashboard(dashboardJson.data ?? null);
      setEvents(mappedEvents);
      setAutomationRuns(automationRunsJson.data ?? []);
    } catch (error) {
      console.error("Failed to load workspace data", error);
      setLoadError("Could not load dashboard data from the database yet.");
      setProjects([]);
      setTasks([]);
      setNotes([]);
      setInboxItems([]);
      setDashboard(null);
      setFiles([]);
      setDailyBrief(null);
      setAutomationRuns([]);
    } finally {
      setLoadingData(false);
    }
  }

  useEffect(() => {
    loadWorkspaceData();
  }, []);

  useEffect(() => {
    if (!notes.length) {
      setSelectedNoteId(null);
      setNoteExtraction(null);
      setSelectedExtractionItems([]);
      return;
    }

    if (!selectedNoteId) {
      setSelectedNoteId(notes[0].id);
    }
  }, [notes, selectedNoteId]);

  useEffect(() => {
    if (selectedNoteId) {
      loadLatestNoteExtraction(selectedNoteId);
    }
  }, [selectedNoteId]);

  useEffect(() => {
    loadCopilotHistory();
  }, []);

  async function handleCompleteTask(taskId: string) {
    const existingTask = tasks.find((task) => task.id === taskId);

    if (!existingTask) {
      return;
    }

    const nextStatus = existingTask.status === "done" ? "todo" : "done";

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: nextStatus,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update task.");
      }

      await loadWorkspaceData();
    } catch (error) {
      console.error("Failed to toggle task completion", error);
    }
  }

  function handleOpenCreateProject() {
    setEditingProject(null);
    setProjectModalOpen(true);
  }

  function handleOpenEditProject(project: Project) {
    setEditingProject(project);
    setProjectModalOpen(true);
  }

  function handleCloseProjectModal() {
    setProjectModalOpen(false);
    setEditingProject(null);
  }

  function handleOpenCreateTask() {
    setEditingTask(null);
    setTaskModalOpen(true);
  }

  function handleOpenEditTask(task: Task) {
    setEditingTask(task);
    setTaskModalOpen(true);
  }

  function handleCloseTaskModal() {
    setTaskModalOpen(false);
    setEditingTask(null);
  }

  function handleOpenCreateNote() {
    setEditingNote(null);
    setNoteModalOpen(true);
  }

  function handleOpenEditNote(note: Note) {
    setEditingNote(note);
    setNoteModalOpen(true);
  }

  function handleCloseNoteModal() {
    setNoteModalOpen(false);
    setEditingNote(null);
  }

  function handleOpenCreateEvent() {
    setEventModalOpen(true);
  }

  function handleCloseEventModal() {
    setEventModalOpen(false);
  }

  function handleSearchResultClick(result: SearchResult) {
    setSearchQuery("");
    if (result.type === "project") {
      loadProjectContext(result.id);
    } else if (result.type === "task") {
      setPage("tasks");
    } else if (result.type === "note") {
      setSelectedNoteId(result.id);
      setPage("notes");
    }
  }

  async function handleCreateInboxItem() {
    try {
      const response = await fetch("/api/inbox", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: `Inbox Capture ${inboxItems.length + 1}`,
          content: "A new raw idea or reminder captured into the workspace.",
          sourceType: "manual",
          itemType: "capture",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create inbox item.");
      }

      await loadWorkspaceData();
      setPage("inbox");
    } catch (error) {
      console.error("Failed to create inbox item", error);
    }
  }

  async function handleCreateFile() {
    try {
      const fallbackProjectId = projects[0]?.id ?? null;

      const response = await fetch("/api/files", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: `New File ${files.length + 1}`,
          fileType: "Document",
          summary: "A new file record linked into the workspace.",
          projectId: fallbackProjectId,
          externalUrl: "https://example.com/file",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create file record.");
      }

      await loadWorkspaceData();
      setPage("files");
    } catch (error) {
      console.error("Failed to create file record", error);
    }
  }

  async function handleDeleteFile(fileId: string) {
    try {
      const response = await fetch(`/api/files/${fileId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete file record.");
      }

      await loadWorkspaceData();
    } catch (error) {
      console.error("Failed to delete file record", error);
    }
  }

  async function handleConvertInbox(
    inboxId: string,
    targetType: "task" | "note",
  ) {
    try {
      const response = await fetch(`/api/inbox/${inboxId}/convert`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ targetType }),
      });

      if (!response.ok) {
        throw new Error("Failed to convert inbox item.");
      }

      await loadWorkspaceData();
      setPage(targetType === "task" ? "tasks" : "notes");
    } catch (error) {
      console.error("Failed to convert inbox item", error);
    }
  }

  async function handleArchiveInbox(inboxId: string) {
    try {
      const response = await fetch(`/api/inbox/${inboxId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "archived" }),
      });

      if (!response.ok) {
        throw new Error("Failed to archive inbox item.");
      }

      await loadWorkspaceData();
    } catch (error) {
      console.error("Failed to archive inbox item", error);
    }
  }

  async function loadProjectContext(projectId: string) {
    try {
      setLoadingProjectContext(true);

      const [contextRes, summaryRes] = await Promise.all([
        fetch(`/api/projects/${projectId}/context`, {
          cache: "no-store",
        }),
        fetch(
          `/api/ai/outputs?outputType=project_summary&targetType=project&targetId=${projectId}`,
          {
            cache: "no-store",
          },
        ),
      ]);

      if (!contextRes.ok || !summaryRes.ok) {
        throw new Error("Failed to load project context.");
      }

      const contextJson: ApiResponse<ProjectContextData> =
        await contextRes.json();
      const summaryJson: ApiResponse<AiOutput[]> = await summaryRes.json();

      const latestSummary = summaryJson.data?.[0] ?? null;

      setProjectContext({
        ...contextJson.data,
        latestSummary,
      });

      setSelectedProjectId(projectId);
      setPage("projects");
    } catch (error) {
      console.error("Failed to load project context", error);
      setProjectContext(null);
    } finally {
      setLoadingProjectContext(false);
    }
  }

  async function handleGenerateProjectSummary(projectId: string) {
    try {
      const response = await fetch(`/api/ai/projects/${projectId}/summary`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to generate project summary.");
      }

      await loadProjectContext(projectId);
    } catch (error) {
      console.error("Failed to generate project summary", error);
    }
  }

  async function handleGenerateDailyBrief() {
    try {
      setLoadingDailyBrief(true);

      const response = await fetch("/api/ai/daily-brief", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to generate daily brief.");
      }

      await loadWorkspaceData();
    } catch (error) {
      console.error("Failed to generate daily brief", error);
    } finally {
      setLoadingDailyBrief(false);
    }
  }

  async function loadLatestNoteExtraction(noteId: string) {
    try {
      setLoadingExtraction(true);

      const response = await fetch(
        `/api/ai/extractions?sourceType=note&sourceId=${noteId}&outputType=note_task_extraction`,
        { cache: "no-store" },
      );

      if (!response.ok) {
        throw new Error("Failed to load note extraction.");
      }

      const json: ApiResponse<AiExtraction[]> = await response.json();
      const latest = json.data?.[0] ?? null;

      setNoteExtraction(latest);
      setSelectedExtractionItems(
        latest?.payload?.suggestions?.map((_, index) => index) ?? [],
      );
    } catch (error) {
      console.error("Failed to load note extraction", error);
      setNoteExtraction(null);
      setSelectedExtractionItems([]);
    } finally {
      setLoadingExtraction(false);
    }
  }

  async function handleExtractTasksFromNote(noteId: string) {
    try {
      setGeneratingExtraction(true);

      const response = await fetch(`/api/ai/notes/${noteId}/extract-tasks`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to extract tasks from note.");
      }

      const json: ApiResponse<AiExtraction> = await response.json();
      const extraction = json.data;

      setNoteExtraction(extraction);
      setSelectedExtractionItems(
        extraction?.payload?.suggestions?.map((_, index) => index) ?? [],
      );
    } catch (error) {
      console.error("Failed to extract tasks from note", error);
    } finally {
      setGeneratingExtraction(false);
    }
  }

  async function handleAskCopilot(promptText?: string) {
    const finalPrompt = (promptText ?? copilotPrompt).trim();

    if (!finalPrompt) {
      return;
    }

    try {
      setLoadingCopilot(true);

      const response = await fetch("/api/ai/copilot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: finalPrompt,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate copilot answer.");
      }

      const json: ApiResponse<CopilotOutput> = await response.json();
      const output = json.data;

      if (output) {
        await loadCopilotHistory();
      }

      setCopilotPrompt("");
      setPage("copilot");
    } catch (error) {
      console.error("Failed to ask copilot", error);
    } finally {
      setLoadingCopilot(false);
    }
  }

  async function loadCopilotHistory() {
    try {
      const response = await fetch("/api/ai/copilot/history", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to load copilot history.");
      }

      const json: ApiResponse<CopilotOutput[]> = await response.json();
      setCopilotHistory(json.data ?? []);
    } catch (error) {
      console.error("Failed to load copilot history", error);
      setCopilotHistory([]);
    }
  }

  function toggleExtractionItem(index: number) {
    setSelectedExtractionItems((current) =>
      current.includes(index)
        ? current.filter((item) => item !== index)
        : [...current, index],
    );
  }

  async function handleAcceptExtraction(extractionId: string) {
    try {
      setAcceptingExtraction(true);

      const response = await fetch(
        `/api/ai/extractions/${extractionId}/accept`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            selectedIndices: selectedExtractionItems,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to accept extraction.");
      }

      await loadWorkspaceData();

      if (selectedNoteId) {
        await loadLatestNoteExtraction(selectedNoteId);
      }

      setPage("tasks");
    } catch (error) {
      console.error("Failed to accept extraction", error);
    } finally {
      setAcceptingExtraction(false);
    }
  }

  const stats = dashboard?.stats ?? {
    openTasks: tasks.filter((task) => task.status !== "done").length,
    activeProjects: projects.filter((project) => project.status === "active")
      .length,
    newInbox: inboxItems.filter((item) => item.status === "new").length,
  };

  function renderPage(): React.ReactNode {
    switch (page) {
      case "home":
        return (
          <HomePage
            tasks={tasks}
            projects={projects}
            inboxItems={inboxItems}
            events={events}
            dashboard={dashboard}
            dailyBrief={dailyBrief}
            loadingDailyBrief={loadingDailyBrief}
            onGenerateDailyBrief={handleGenerateDailyBrief}
            onCompleteTask={handleCompleteTask}
            onOpenPage={setPage}
          />
        );
      case "inbox":
        return (
          <InboxPage
            inboxItems={inboxItems}
            onConvertInbox={handleConvertInbox}
            onArchiveInbox={handleArchiveInbox}
          />
        );
      case "projects":
        return (
          <ProjectsPage
            projects={projects}
            tasks={tasks}
            notes={notes}
            onOpenProject={loadProjectContext}
            projectContext={projectContext}
            loadingProjectContext={loadingProjectContext}
            onGenerateSummary={handleGenerateProjectSummary}
            onCreateProject={handleOpenCreateProject}
            onEditProject={handleOpenEditProject}
          />
        );
      case "tasks":
        return (
          <TasksPage
            tasks={tasks}
            projects={projects}
            onCompleteTask={handleCompleteTask}
            onCreateTask={handleOpenCreateTask}
            onEditTask={handleOpenEditTask}
          />
        );
      case "calendar":
        return <CalendarPage events={events} onCreateEvent={handleOpenCreateEvent} />;
      case "notes":
        return (
          <NotesPage
            notes={notes}
            projects={projects}
            selectedNoteId={selectedNoteId}
            onSelectNote={setSelectedNoteId}
            onCreateNote={handleOpenCreateNote}
            onEditNote={handleOpenEditNote}
            noteExtraction={noteExtraction}
            loadingExtraction={loadingExtraction}
            generatingExtraction={generatingExtraction}
            acceptingExtraction={acceptingExtraction}
            onExtractTasks={handleExtractTasksFromNote}
            onAcceptExtraction={handleAcceptExtraction}
            selectedExtractionItems={selectedExtractionItems}
            onToggleExtractionItem={toggleExtractionItem}
          />
        );
      case "files":
        return (
          <FilesPage
            files={files}
            projects={projects}
            onCreateFile={handleCreateFile}
            onDeleteFile={handleDeleteFile}
          />
        );
      case "copilot":
        return (
          <CopilotPage
            prompt={copilotPrompt}
            setPrompt={setCopilotPrompt}
            history={copilotHistory}
            loading={loadingCopilot}
            onSubmit={handleAskCopilot}
          />
        );
      case "settings":
        return <SettingsPage automationRuns={automationRuns} />;
      default:
        return (
          <HomePage
            tasks={tasks}
            projects={projects}
            inboxItems={inboxItems}
            events={events}
            dashboard={dashboard}
            dailyBrief={dailyBrief}
            loadingDailyBrief={loadingDailyBrief}
            onGenerateDailyBrief={handleGenerateDailyBrief}
            onCompleteTask={handleCompleteTask}
            onOpenPage={setPage}
          />
        );
    }
  }

  const currentNav = navItems.find((item) => item.id === page);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen">
        <Sidebar page={page} setPage={setPage} />

        <main className="flex min-w-0 flex-1 flex-col">
          <AppHeader
            title={currentNav?.label || "Home"}
            subtitle={subtitle[page]}
            onQuickAdd={() => setCaptureModalOpen(true)}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchResults={searchResults}
            onSearchResultClick={handleSearchResultClick}
          />

          <div className="border-b border-slate-200 bg-white px-6 py-4">
            <div className="grid gap-3 sm:grid-cols-3 xl:max-w-3xl">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Open Tasks
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {stats.openTasks}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Active Projects
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {stats.activeProjects}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  New Inbox
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {stats.newInbox}
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 px-6 py-6">{renderPage()}</div>
        </main>
      </div>

      <CaptureModal
        open={captureModalOpen}
        projects={projects}
        onClose={() => setCaptureModalOpen(false)}
        onSaved={() => { setCaptureModalOpen(false); loadWorkspaceData(); }}
      />
      <ProjectFormModal
        open={projectModalOpen}
        project={editingProject}
        onClose={handleCloseProjectModal}
        onSaved={() => { handleCloseProjectModal(); loadWorkspaceData(); }}
      />
      <TaskFormModal
        open={taskModalOpen}
        task={editingTask}
        projects={projects}
        onClose={handleCloseTaskModal}
        onSaved={() => { handleCloseTaskModal(); loadWorkspaceData(); }}
      />
      <NoteFormModal
        open={noteModalOpen}
        note={editingNote}
        projects={projects}
        onClose={handleCloseNoteModal}
        onSaved={() => { handleCloseNoteModal(); loadWorkspaceData(); }}
      />
      <EventFormModal
        open={eventModalOpen}
        onClose={handleCloseEventModal}
        onSaved={() => { handleCloseEventModal(); loadWorkspaceData(); }}
      />
    </div>
  );
}
