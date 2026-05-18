"use client";

import { useEffect, useState } from "react";
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
  WorkspaceSettings,
  ApiResponse,
  ProjectStatus,
  EventSource,
} from "@/lib/types";
import { initialEvents } from "@/lib/constants";

export function useWorkspaceData(setPage: (page: PageId) => void) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksHasMore, setTasksHasMore] = useState(false);
  const [tasksPage, setTasksPage] = useState(1);
  const [loadingMoreTasks, setLoadingMoreTasks] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [inboxItems, setInboxItems] = useState<InboxItem[]>([]);
  const [inboxHasMore, setInboxHasMore] = useState(false);
  const [inboxPage, setInboxPage] = useState(1);
  const [loadingMoreInbox, setLoadingMoreInbox] = useState(false);
  const [events, setEvents] = useState<WorkspaceEvent[]>(initialEvents);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [projectContext, setProjectContext] = useState<ProjectContextData | null>(null);
  const [loadingProjectContext, setLoadingProjectContext] = useState(false);
  const [dailyBrief, setDailyBrief] = useState<AiOutput | null>(null);
  const [loadingDailyBrief, setLoadingDailyBrief] = useState(false);
  const [dailyBriefError, setDailyBriefError] = useState<string | null>(null);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [noteExtraction, setNoteExtraction] = useState<AiExtraction | null>(null);
  const [selectedExtractionItems, setSelectedExtractionItems] = useState<number[]>([]);
  const [loadingExtraction, setLoadingExtraction] = useState(false);
  const [generatingExtraction, setGeneratingExtraction] = useState(false);
  const [acceptingExtraction, setAcceptingExtraction] = useState(false);
  const [copilotPrompt, setCopilotPrompt] = useState("");
  const [copilotHistory, setCopilotHistory] = useState<CopilotOutput[]>([]);
  const [loadingCopilot, setLoadingCopilot] = useState(false);
  const [copilotError, setCopilotError] = useState<string | null>(null);
  const [streamingText, setStreamingText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [automationRuns, setAutomationRuns] = useState<AutomationRun[]>([]);
  const [workspaceSettings, setWorkspaceSettings] = useState<WorkspaceSettings | null>(null);

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
        workspaceRes,
      ] = await Promise.all([
        fetch("/api/projects", { cache: "no-store" }),
        fetch("/api/tasks?page=1&pageSize=25", { cache: "no-store" }),
        fetch("/api/notes", { cache: "no-store" }),
        fetch("/api/inbox?page=1&pageSize=25", { cache: "no-store" }),
        fetch("/api/events", { cache: "no-store" }),
        fetch("/api/files", { cache: "no-store" }),
        fetch("/api/dashboard/home", { cache: "no-store" }),
        fetch("/api/ai/outputs?outputType=daily_brief&targetType=workspace", { cache: "no-store" }),
        fetch("/api/automation/runs", { cache: "no-store" }),
        fetch("/api/workspace", { cache: "no-store" }),
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
      type RawEvent = { id: string; title: string; startsAt: string | null; endsAt: string | null; sourceType: EventSource; description: string | null; location: string | null };
      const eventsJson: ApiResponse<RawEvent[]> = await eventsRes.json();
      const dashboardJson: ApiResponse<DashboardData> = await dashboardRes.json();
      const mappedEvents: WorkspaceEvent[] = (eventsJson.data ?? []).map((e) => {
        const start = e.startsAt
          ? new Date(e.startsAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          : "TBD";
        const end = e.endsAt
          ? new Date(e.endsAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          : "TBD";
        return { id: e.id, title: e.title, time: `${start} - ${end}`, source: e.sourceType, startsAt: e.startsAt ?? null, endsAt: e.endsAt ?? null, description: e.description ?? null, location: e.location ?? null };
      });
      const filesJson: ApiResponse<FileRecord[]> = await filesRes.json();
      const dailyBriefJson: ApiResponse<AiOutput[]> = await dailyBriefRes.json();
      const automationRunsJson: ApiResponse<AutomationRun[]> = await automationRunsRes.json();
      const workspaceJson: ApiResponse<WorkspaceSettings> = await workspaceRes.json();

      setDailyBrief(dailyBriefJson.data?.[0] ?? null);
      setFiles(filesJson.data ?? []);
      setProjects(projectsJson.data ?? []);
      setTasks(tasksJson.data ?? []);
      setTasksHasMore(!!(tasksJson.meta as Record<string, unknown>)?.hasMore);
      setTasksPage(1);
      setNotes(notesJson.data ?? []);
      setInboxItems(inboxJson.data ?? []);
      setInboxHasMore(!!(inboxJson.meta as Record<string, unknown>)?.hasMore);
      setInboxPage(1);
      setDashboard(dashboardJson.data ?? null);
      setEvents(mappedEvents);
      setAutomationRuns(automationRunsJson.data ?? []);
      setWorkspaceSettings(workspaceJson.data ?? null);
    } catch (error) {
      console.error("Failed to load workspace data", error);
      setLoadError("Could not load dashboard data from the database yet.");
      setProjects([]);
      setTasks([]);
      setTasksHasMore(false);
      setTasksPage(1);
      setNotes([]);
      setInboxItems([]);
      setInboxHasMore(false);
      setInboxPage(1);
      setDashboard(null);
      setFiles([]);
      setDailyBrief(null);
      setAutomationRuns([]);
    } finally {
      setLoadingData(false);
    }
  }

  async function loadProjectContext(projectId: string) {
    try {
      setLoadingProjectContext(true);
      const [contextRes, summaryRes] = await Promise.all([
        fetch(`/api/projects/${projectId}/context`, { cache: "no-store" }),
        fetch(
          `/api/ai/outputs?outputType=project_summary&targetType=project&targetId=${projectId}`,
          { cache: "no-store" },
        ),
      ]);
      if (!contextRes.ok || !summaryRes.ok) throw new Error("Failed to load project context.");
      const contextJson: ApiResponse<ProjectContextData> = await contextRes.json();
      const summaryJson: ApiResponse<AiOutput[]> = await summaryRes.json();
      setProjectContext({ ...contextJson.data, latestSummary: summaryJson.data?.[0] ?? null });
      setSelectedProjectId(projectId);
      setPage("projects");
    } catch (error) {
      console.error("Failed to load project context", error);
      setProjectContext(null);
    } finally {
      setLoadingProjectContext(false);
    }
  }

  async function loadLatestNoteExtraction(noteId: string) {
    try {
      setLoadingExtraction(true);
      const response = await fetch(
        `/api/ai/extractions?sourceType=note&sourceId=${noteId}&outputType=note_task_extraction`,
        { cache: "no-store" },
      );
      if (!response.ok) throw new Error("Failed to load note extraction.");
      const json: ApiResponse<AiExtraction[]> = await response.json();
      const latest = json.data?.[0] ?? null;
      setNoteExtraction(latest);
      setSelectedExtractionItems(latest?.payload?.suggestions?.map((_: unknown, i: number) => i) ?? []);
    } catch (error) {
      console.error("Failed to load note extraction", error);
      setNoteExtraction(null);
      setSelectedExtractionItems([]);
    } finally {
      setLoadingExtraction(false);
    }
  }

  async function loadCopilotHistory() {
    try {
      const response = await fetch("/api/ai/copilot/history", { cache: "no-store" });
      if (!response.ok) throw new Error("Failed to load copilot history.");
      const json: ApiResponse<CopilotOutput[]> = await response.json();
      setCopilotHistory(json.data ?? []);
    } catch (error) {
      console.error("Failed to load copilot history", error);
      setCopilotHistory([]);
    }
  }

  function nextRecurrenceDueDate(dueDate: string, recurrence: string): string {
    const base = dueDate ? new Date(dueDate) : new Date();
    if (recurrence === "daily") base.setDate(base.getDate() + 1);
    else if (recurrence === "weekly") base.setDate(base.getDate() + 7);
    else if (recurrence === "monthly") base.setMonth(base.getMonth() + 1);
    return base.toISOString().slice(0, 10);
  }

  async function handleCompleteTask(taskId: string) {
    const existingTask = tasks.find((t) => t.id === taskId);
    if (!existingTask) return;
    const nextStatus = existingTask.status === "done" ? "todo" : "done";
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!response.ok) throw new Error("Failed to update task.");

      // Spawn next occurrence when a recurring task is marked done
      if (nextStatus === "done" && existingTask.recurrence) {
        const nextDue = nextRecurrenceDueDate(existingTask.dueDate, existingTask.recurrence);
        await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: existingTask.title,
            description: existingTask.description ?? null,
            priority: existingTask.priority,
            status: "todo",
            projectId: existingTask.projectId ?? null,
            dueDate: nextDue,
            recurrence: existingTask.recurrence,
          }),
        });
      }

      await loadWorkspaceData();
    } catch (error) {
      console.error("Failed to toggle task completion", error);
    }
  }

  async function handleCreateInboxItem() {
    try {
      const response = await fetch("/api/inbox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `Inbox Capture ${inboxItems.length + 1}`,
          content: "A new raw idea or reminder captured into the workspace.",
          sourceType: "manual",
          itemType: "capture",
        }),
      });
      if (!response.ok) throw new Error("Failed to create inbox item.");
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `New File ${files.length + 1}`,
          fileType: "Document",
          summary: "A new file record linked into the workspace.",
          projectId: fallbackProjectId,
          externalUrl: "https://example.com/file",
        }),
      });
      if (!response.ok) throw new Error("Failed to create file record.");
      await loadWorkspaceData();
      setPage("files");
    } catch (error) {
      console.error("Failed to create file record", error);
    }
  }

  async function handleDeleteFile(fileId: string) {
    try {
      const response = await fetch(`/api/files/${fileId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete file record.");
      await loadWorkspaceData();
    } catch (error) {
      console.error("Failed to delete file record", error);
    }
  }

  async function handleCycleTaskStatus(taskId: string, currentStatus: string) {
    const next = currentStatus === "todo" ? "in_progress" : currentStatus === "in_progress" ? "done" : "todo";
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!response.ok) throw new Error("Failed to update task status.");
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: next } : t)));
    } catch (error) {
      console.error("Failed to cycle task status", error);
      throw error;
    }
  }

  async function handleDeleteTask(taskId: string) {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete task.");
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (error) {
      console.error("Failed to delete task", error);
      throw error;
    }
  }

  function softRemoveTask(taskId: string): () => void {
    const removed = tasks.find((t) => t.id === taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    return () => {
      if (removed) setTasks((prev) => [...prev, removed].sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1)));
    };
  }

  async function commitDeleteTask(taskId: string) {
    const response = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
    if (!response.ok) throw new Error("Failed to delete task.");
  }

  async function handleCycleProjectStatus(projectId: string, currentStatus: string) {
    const cycle: Record<string, ProjectStatus> = { active: "on_hold", on_hold: "completed", completed: "active", paused: "active" };
    const nextStatus: ProjectStatus = cycle[currentStatus] ?? "active";
    setProjects((prev) => prev.map((p) => p.id === projectId ? { ...p, status: nextStatus } : p));
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) throw new Error("Failed to update project status.");
    } catch (error) {
      setProjects((prev) => prev.map((p) => p.id === projectId ? { ...p, status: currentStatus as ProjectStatus } : p));
      console.error("Failed to cycle project status", error);
      throw error;
    }
  }

  async function handleDeleteProject(projectId: string) {
    try {
      const response = await fetch(`/api/projects/${projectId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete project.");
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
    } catch (error) {
      console.error("Failed to delete project", error);
      throw error;
    }
  }

  async function handleDeleteEvent(eventId: string) {
    try {
      const response = await fetch(`/api/events/${eventId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete event.");
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
    } catch (error) {
      console.error("Failed to delete event", error);
      throw error;
    }
  }

  async function handleDeleteNote(noteId: string) {
    try {
      const response = await fetch(`/api/notes/${noteId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete note.");
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
    } catch (error) {
      console.error("Failed to delete note", error);
      throw error;
    }
  }

  async function handleConvertInbox(inboxId: string, targetType: "task" | "note") {
    try {
      const response = await fetch(`/api/inbox/${inboxId}/convert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetType }),
      });
      if (!response.ok) throw new Error("Failed to convert inbox item.");
      await loadWorkspaceData();
      setPage(targetType === "task" ? "tasks" : "notes");
    } catch (error) {
      console.error("Failed to convert inbox item", error);
    }
  }

  async function handleDeleteInbox(inboxId: string) {
    try {
      const response = await fetch(`/api/inbox/${inboxId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete inbox item.");
      setInboxItems((prev) => prev.filter((i) => i.id !== inboxId));
    } catch (error) {
      console.error("Failed to delete inbox item", error);
      throw error;
    }
  }

  async function handleArchiveInbox(inboxId: string) {
    try {
      const response = await fetch(`/api/inbox/${inboxId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "archived" }),
      });
      if (!response.ok) throw new Error("Failed to archive inbox item.");
      await loadWorkspaceData();
    } catch (error) {
      console.error("Failed to archive inbox item", error);
    }
  }

  async function handleGenerateProjectSummary(projectId: string) {
    try {
      const response = await fetch(`/api/ai/projects/${projectId}/summary`, { method: "POST" });
      if (!response.ok) throw new Error("Failed to generate project summary.");
      await loadProjectContext(projectId);
    } catch (error) {
      console.error("Failed to generate project summary", error);
    }
  }

  async function handleGenerateDailyBrief() {
    try {
      setLoadingDailyBrief(true);
      setDailyBriefError(null);
      const response = await fetch("/api/ai/daily-brief", { method: "POST" });
      const json = await response.json();
      if (!response.ok || json.error) {
        const msg =
          json.error?.code === "AI_NOT_CONFIGURED"
            ? "AI is not configured. Add OPENAI_API_KEY to your .env file to enable this feature."
            : "Failed to generate the daily brief. Please try again.";
        setDailyBriefError(msg);
        return;
      }
      await loadWorkspaceData();
    } catch {
      setDailyBriefError("Failed to generate the daily brief. Please try again.");
    } finally {
      setLoadingDailyBrief(false);
    }
  }

  async function handleExtractTasksFromNote(noteId: string) {
    try {
      setGeneratingExtraction(true);
      const response = await fetch(`/api/ai/notes/${noteId}/extract-tasks`, { method: "POST" });
      if (!response.ok) throw new Error("Failed to extract tasks from note.");
      const json: ApiResponse<AiExtraction> = await response.json();
      const extraction = json.data;
      setNoteExtraction(extraction);
      setSelectedExtractionItems(extraction?.payload?.suggestions?.map((_: unknown, i: number) => i) ?? []);
    } catch (error) {
      console.error("Failed to extract tasks from note", error);
    } finally {
      setGeneratingExtraction(false);
    }
  }

  async function handleAskCopilot(promptText?: string) {
    const finalPrompt = (promptText ?? copilotPrompt).trim();
    if (!finalPrompt) return;
    try {
      setIsStreaming(true);
      setStreamingText("");
      setCopilotError(null);
      setPage("copilot");

      const response = await fetch("/api/ai/copilot/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: finalPrompt }),
      });

      if (!response.ok || !response.body) {
        setCopilotError("Failed to get a Copilot answer. Please try again.");
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6).trim();
          try {
            const event = JSON.parse(raw);
            if (typeof event.delta === "string") {
              setStreamingText((prev) => prev + event.delta);
            } else if (event.done) {
              await loadCopilotHistory();
              setCopilotPrompt("");
            }
          } catch {
            // skip unparseable
          }
        }
      }
    } catch {
      setCopilotError("Failed to get a Copilot answer. Please try again.");
    } finally {
      setIsStreaming(false);
    }
  }

  async function handleAcceptExtraction(extractionId: string) {
    try {
      setAcceptingExtraction(true);
      const response = await fetch(`/api/ai/extractions/${extractionId}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedIndices: selectedExtractionItems }),
      });
      if (!response.ok) throw new Error("Failed to accept extraction.");
      await loadWorkspaceData();
      if (selectedNoteId) await loadLatestNoteExtraction(selectedNoteId);
      setPage("tasks");
    } catch (error) {
      console.error("Failed to accept extraction", error);
    } finally {
      setAcceptingExtraction(false);
    }
  }

  async function handleClearCopilotHistory() {
    try {
      await fetch("/api/ai/copilot/history", { method: "DELETE" });
      setCopilotHistory([]);
    } catch (error) {
      console.error("Failed to clear copilot history", error);
    }
  }

  function toggleExtractionItem(index: number) {
    setSelectedExtractionItems((current) =>
      current.includes(index) ? current.filter((i) => i !== index) : [...current, index],
    );
  }

  async function loadMoreTasks() {
    if (!tasksHasMore || loadingMoreTasks) return;
    try {
      setLoadingMoreTasks(true);
      const nextPage = tasksPage + 1;
      const res = await fetch(`/api/tasks?page=${nextPage}&pageSize=25`, { cache: "no-store" });
      if (!res.ok) return;
      const json: ApiResponse<Task[]> = await res.json();
      setTasks((prev) => [...prev, ...(json.data ?? [])]);
      setTasksHasMore(!!(json.meta as Record<string, unknown>)?.hasMore);
      setTasksPage(nextPage);
    } catch (error) {
      console.error("Failed to load more tasks", error);
    } finally {
      setLoadingMoreTasks(false);
    }
  }

  async function loadMoreInbox() {
    if (!inboxHasMore || loadingMoreInbox) return;
    try {
      setLoadingMoreInbox(true);
      const nextPage = inboxPage + 1;
      const res = await fetch(`/api/inbox?page=${nextPage}&pageSize=25`, { cache: "no-store" });
      if (!res.ok) return;
      const json: ApiResponse<InboxItem[]> = await res.json();
      setInboxItems((prev) => [...prev, ...(json.data ?? [])]);
      setInboxHasMore(!!(json.meta as Record<string, unknown>)?.hasMore);
      setInboxPage(nextPage);
    } catch (error) {
      console.error("Failed to load more inbox items", error);
    } finally {
      setLoadingMoreInbox(false);
    }
  }

  async function handleUpdateWorkspace(patch: { workspaceName?: string; timezone?: string }) {
    try {
      const res = await fetch("/api/workspace", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const json: ApiResponse<WorkspaceSettings> = await res.json();
      if (!res.ok) throw new Error(json.error?.message ?? "Failed to update workspace");
      setWorkspaceSettings(json.data);
    } catch (error) {
      console.error("Failed to update workspace settings", error);
      throw error;
    }
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    loadWorkspaceData();
    loadCopilotHistory();
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    if (!notes.length) {
      setSelectedNoteId(null);
      setNoteExtraction(null);
      setSelectedExtractionItems([]);
      return;
    }
    if (!selectedNoteId) setSelectedNoteId(notes[0].id);
  }, [notes, selectedNoteId]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    if (selectedNoteId) loadLatestNoteExtraction(selectedNoteId);
  }, [selectedNoteId]);

  return {
    projects,
    tasks,
    notes,
    inboxItems,
    events,
    dashboard,
    files,
    selectedProjectId,
    projectContext,
    loadingProjectContext,
    dailyBrief,
    loadingDailyBrief,
    dailyBriefError,
    selectedNoteId,
    setSelectedNoteId,
    noteExtraction,
    selectedExtractionItems,
    loadingExtraction,
    generatingExtraction,
    acceptingExtraction,
    copilotPrompt,
    setCopilotPrompt,
    copilotHistory,
    loadingCopilot,
    copilotError,
    streamingText,
    isStreaming,
    automationRuns,
    workspaceSettings,
    handleUpdateWorkspace,
    loadingData,
    loadError,
    loadWorkspaceData,
    loadProjectContext,
    loadMoreTasks,
    tasksHasMore,
    loadingMoreTasks,
    loadMoreInbox,
    inboxHasMore,
    loadingMoreInbox,
    handleCompleteTask,
    handleCreateInboxItem,
    handleCreateFile,
    handleDeleteFile,
    handleCycleTaskStatus,
    handleDeleteTask,
    softRemoveTask,
    commitDeleteTask,
    handleCycleProjectStatus,
    handleDeleteProject,
    handleDeleteEvent,
    handleDeleteNote,
    handleDeleteInbox,
    handleConvertInbox,
    handleArchiveInbox,
    handleGenerateProjectSummary,
    handleGenerateDailyBrief,
    handleExtractTasksFromNote,
    handleAskCopilot,
    handleClearCopilotHistory,
    handleAcceptExtraction,
    toggleExtractionItem,
  };
}
