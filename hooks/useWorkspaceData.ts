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
  ApiResponse,
} from "@/lib/types";
import { initialEvents } from "@/lib/constants";

export function useWorkspaceData(setPage: (page: PageId) => void) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [inboxItems, setInboxItems] = useState<InboxItem[]>([]);
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
  const [automationRuns, setAutomationRuns] = useState<AutomationRun[]>([]);

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
        fetch("/api/ai/outputs?outputType=daily_brief&targetType=workspace", { cache: "no-store" }),
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
      const dashboardJson: ApiResponse<DashboardData> = await dashboardRes.json();
      const mappedEvents: WorkspaceEvent[] = (eventsJson.data ?? []).map((e) => {
        const start = e.startsAt
          ? new Date(e.startsAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          : "TBD";
        const end = e.endsAt
          ? new Date(e.endsAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          : "TBD";
        return { id: e.id, title: e.title, time: `${start} - ${end}`, source: e.sourceType };
      });
      const filesJson: ApiResponse<FileRecord[]> = await filesRes.json();
      const dailyBriefJson: ApiResponse<AiOutput[]> = await dailyBriefRes.json();
      const automationRunsJson: ApiResponse<AutomationRun[]> = await automationRunsRes.json();

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
      setLoadingCopilot(true);
      setCopilotError(null);
      const response = await fetch("/api/ai/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: finalPrompt }),
      });
      const json: ApiResponse<CopilotOutput> = await response.json();
      if (!response.ok || json.error) {
        const msg =
          json.error?.code === "AI_NOT_CONFIGURED"
            ? "AI Copilot is not configured. Add OPENAI_API_KEY to your .env file to enable this feature."
            : "Failed to get a Copilot answer. Please try again.";
        setCopilotError(msg);
        return;
      }
      if (json.data) await loadCopilotHistory();
      setCopilotPrompt("");
      setPage("copilot");
    } catch {
      setCopilotError("Failed to get a Copilot answer. Please try again.");
    } finally {
      setLoadingCopilot(false);
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

  function toggleExtractionItem(index: number) {
    setSelectedExtractionItems((current) =>
      current.includes(index) ? current.filter((i) => i !== index) : [...current, index],
    );
  }

  useEffect(() => {
    loadWorkspaceData();
    loadCopilotHistory();
  }, []);

  useEffect(() => {
    if (!notes.length) {
      setSelectedNoteId(null);
      setNoteExtraction(null);
      setSelectedExtractionItems([]);
      return;
    }
    if (!selectedNoteId) setSelectedNoteId(notes[0].id);
  }, [notes, selectedNoteId]);

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
    automationRuns,
    loadingData,
    loadError,
    loadWorkspaceData,
    loadProjectContext,
    handleCompleteTask,
    handleCreateInboxItem,
    handleCreateFile,
    handleDeleteFile,
    handleConvertInbox,
    handleArchiveInbox,
    handleGenerateProjectSummary,
    handleGenerateDailyBrief,
    handleExtractTasksFromNote,
    handleAskCopilot,
    handleAcceptExtraction,
    toggleExtractionItem,
  };
}
