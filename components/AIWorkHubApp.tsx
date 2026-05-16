"use client";

import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { PageId, SearchResult } from "@/lib/types";
import { navItems, subtitle } from "@/lib/constants";
import { useWorkspaceData } from "@/hooks/useWorkspaceData";
import { useModals } from "@/hooks/useModals";
import { useAnnounce } from "@/components/shared/Announcer";
import { useToast } from "@/components/shared/Toast";
import { AppHeader } from "@/components/app-shell/AppHeader";
import { Sidebar } from "@/components/app-shell/Sidebar";
import { BottomNav } from "@/components/app-shell/BottomNav";
import { HomePage } from "@/components/pages/HomePage";
import { InboxPage } from "@/components/pages/InboxPage";
import { ProjectsPage } from "@/components/pages/ProjectsPage";
import { TasksPage } from "@/components/pages/TasksPage";
import { NotesPage } from "@/components/pages/NotesPage";
import { CalendarPage } from "@/components/pages/CalendarPage";
import { FilesPage } from "@/components/pages/FilesPage";
import { CopilotPage } from "@/components/pages/CopilotPage";
import { AnalyticsPage } from "@/components/pages/AnalyticsPage";
import { SettingsPage } from "@/components/pages/SettingsPage";
import { CaptureModal } from "@/components/modals/CaptureModal";
import { ProjectFormModal } from "@/components/modals/ProjectFormModal";
import { TaskFormModal } from "@/components/modals/TaskFormModal";
import { NoteFormModal } from "@/components/modals/NoteFormModal";
import { EventFormModal } from "@/components/modals/EventFormModal";
import { UploadFileModal } from "@/components/modals/UploadFileModal";
import { ShortcutsModal } from "@/components/modals/ShortcutsModal";
import { SkeletonStat } from "@/components/shared/Skeleton";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";

const VALID_PAGES = new Set<PageId>(["home","inbox","projects","tasks","calendar","notes","files","copilot","analytics","settings"]);

function resolvePageId(raw: string | null): PageId {
  return (raw && VALID_PAGES.has(raw as PageId)) ? (raw as PageId) : "home";
}

export default function AIWorkHubApp() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = resolvePageId(searchParams.get("page"));

  const setPage = useCallback((next: PageId) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", next);
    router.replace(`?${params.toString()}`);
  }, [router, searchParams]);

  const [searchQuery, setSearchQuery] = React.useState("");
  const [debouncedQuery, setDebouncedQuery] = React.useState("");
  const [shortcutsOpen, setShortcutsOpen] = React.useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery), 250);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const { announce } = useAnnounce();
  const { toast } = useToast();
  const data = useWorkspaceData(setPage);
  const modals = useModals();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const inInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;

      if (e.key === "Escape") {
        if (modals.isAnyModalOpen) modals.closeAllModals();
        else if (searchQuery) setSearchQuery("");
        return;
      }

      if (e.key === "?" && !inInput) {
        e.preventDefault();
        setShortcutsOpen(true);
        return;
      }

      if (inInput) return;

      if (e.key === "n") {
        e.preventDefault();
        modals.openCreateTask();
        return;
      }
      if (e.key === "c") {
        e.preventDefault();
        modals.openCaptureModal();
        return;
      }
      if (e.key === "m") {
        e.preventDefault();
        modals.openCreateNote();
        return;
      }
      if (e.key === "/") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [modals, searchQuery]);

  const searchResults = useMemo<SearchResult[]>(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (q.length < 2) return [];

    function scoreText(text: string): number {
      const t = text.toLowerCase();
      if (t === q) return 100;
      if (t.startsWith(q)) return 80;
      if (t.includes(` ${q}`)) return 70;
      if (t.includes(q)) return 60;
      return 0;
    }

    function snippet(body: string): string {
      const idx = body.toLowerCase().indexOf(q);
      if (idx === -1) return body.slice(0, 80).trim();
      const start = Math.max(0, idx - 30);
      const end = Math.min(body.length, idx + q.length + 50);
      return (start > 0 ? "…" : "") + body.slice(start, end).trim() + (end < body.length ? "…" : "");
    }

    const results: SearchResult[] = [];

    data.projects.forEach((p) => {
      const s = Math.max(scoreText(p.title) + 10, scoreText(p.goal ?? "") * 0.7);
      if (s > 0) results.push({ type: "project", id: p.id, title: p.title, subtitle: `Project · ${p.status}`, score: s });
    });
    data.tasks.forEach((t) => {
      const s = Math.max(scoreText(t.title) + 5, scoreText(t.description ?? "") * 0.6);
      if (s > 0) results.push({ type: "task", id: t.id, title: t.title, subtitle: `Task · ${t.status} · ${t.priority}`, score: s });
    });
    data.notes.forEach((n) => {
      const titleScore = scoreText(n.title);
      const bodyScore = scoreText(n.body) * 0.6;
      const s = Math.max(titleScore, bodyScore);
      if (s > 0) results.push({ type: "note", id: n.id, title: n.title, subtitle: "Note", snippet: bodyScore > titleScore ? snippet(n.body) : undefined, score: s });
    });
    data.inboxItems.forEach((i) => {
      const s = Math.max(scoreText(i.title ?? "") + 5, scoreText(i.content) * 0.6);
      if (s > 0) results.push({ type: "inbox", id: i.id, title: i.title ?? "Untitled", subtitle: `Inbox · ${i.status}`, snippet: snippet(i.content), score: s });
    });
    data.files.forEach((f) => {
      const s = scoreText(f.name) + 5;
      if (s > 0) results.push({ type: "file", id: f.id, title: f.name, subtitle: `File · ${f.fileType ?? "unknown"}`, score: s });
    });

    return results.sort((a, b) => b.score - a.score).slice(0, 8);
  }, [debouncedQuery, data.projects, data.tasks, data.notes, data.inboxItems, data.files]);

  function handleSearchResultClick(result: SearchResult) {
    setSearchQuery("");
    if (result.type === "project") {
      data.loadProjectContext(result.id);
    } else if (result.type === "task") {
      setPage("tasks");
    } else if (result.type === "note") {
      data.setSelectedNoteId(result.id);
      setPage("notes");
    } else if (result.type === "inbox") {
      setPage("inbox");
    } else if (result.type === "file") {
      setPage("files");
    }
  }

  const stats = data.dashboard?.stats ?? {
    openTasks: data.tasks.filter((t) => t.status !== "done").length,
    activeProjects: data.projects.filter((p) => p.status === "active").length,
    newInbox: data.inboxItems.filter((i) => i.status === "new").length,
  };

  const overdueCount = (data.dashboard?.overdueTasks ?? data.tasks.filter((t) => {
    if (t.status === "done") return false;
    if (!t.dueDate) return false;
    return new Date(t.dueDate) < new Date(new Date().toDateString());
  })).length;
  const newInboxCount = data.inboxItems.filter((i) => i.status === "new").length;
  const sidebarBadges = {
    ...(overdueCount > 0 ? { tasks: overdueCount } : {}),
    ...(newInboxCount > 0 ? { inbox: newInboxCount } : {}),
  };

  function renderPage(): React.ReactNode {
    switch (page) {
      case "home":
        return (
          <HomePage
            tasks={data.tasks}
            projects={data.projects}
            inboxItems={data.inboxItems}
            events={data.events}
            dashboard={data.dashboard}
            dailyBrief={data.dailyBrief}
            loadingDailyBrief={data.loadingDailyBrief}
            dailyBriefError={data.dailyBriefError}
            onGenerateDailyBrief={data.handleGenerateDailyBrief}
            onCompleteTask={data.handleCompleteTask}
            onEditTask={modals.openEditTask}
            onOpenPage={setPage}
            onOpenProject={(id) => { setPage("projects"); data.loadProjectContext(id); }}
          />
        );
      case "inbox":
        return (
          <InboxPage
            inboxItems={data.inboxItems}
            onConvertInbox={data.handleConvertInbox}
            onArchiveInbox={data.handleArchiveInbox}
            onDeleteInbox={async (id) => {
              if (!window.confirm("Permanently delete this inbox item?")) return;
              try {
                await data.handleDeleteInbox(id);
                toast("Inbox item deleted.");
              } catch {
                toast("Failed to delete inbox item.", "error");
              }
            }}
            hasMore={data.inboxHasMore}
            loadingMore={data.loadingMoreInbox}
            onLoadMore={data.loadMoreInbox}
          />
        );
      case "projects":
        return (
          <ProjectsPage
            projects={data.projects}
            tasks={data.tasks}
            notes={data.notes}
            onOpenProject={data.loadProjectContext}
            projectContext={data.projectContext}
            loadingProjectContext={data.loadingProjectContext}
            onGenerateSummary={data.handleGenerateProjectSummary}
            onCreateProject={modals.openCreateProject}
            onEditProject={modals.openEditProject}
            onDeleteProject={async (id) => {
              if (!window.confirm("Delete this project? This cannot be undone.")) return;
              try { await data.handleDeleteProject(id); toast("Project deleted."); }
              catch { toast("Failed to delete project.", "error"); }
            }}
            onCycleStatus={async (id, status) => {
              try { await data.handleCycleProjectStatus(id, status); }
              catch { toast("Failed to update project status.", "error"); }
            }}
          />
        );
      case "tasks":
        return (
          <TasksPage
            tasks={data.tasks}
            projects={data.projects}
            loading={data.loadingData}
            hasMore={data.tasksHasMore}
            loadingMore={data.loadingMoreTasks}
            onLoadMore={data.loadMoreTasks}
            onCompleteTask={data.handleCompleteTask}
            onCycleStatus={async (id, status) => {
              try { await data.handleCycleTaskStatus(id, status); }
              catch { toast("Failed to update task status.", "error"); }
            }}
            onCreateTask={modals.openCreateTask}
            onEditTask={modals.openEditTask}
            onDeleteTask={(id) => {
              const restore = data.softRemoveTask(id);
              const timer = setTimeout(async () => {
                try { await data.commitDeleteTask(id); }
                catch { restore(); toast("Failed to delete task.", "error"); }
              }, 5000);
              toast("Task deleted.", { tone: "success", onUndo: () => { clearTimeout(timer); restore(); } });
            }}
          />
        );
      case "calendar":
        return (
          <CalendarPage
            events={data.events}
            onCreateEvent={modals.openCreateEvent}
            onEditEvent={modals.openEditEvent}
            onDeleteEvent={async (id) => {
              if (!window.confirm("Delete this event? This cannot be undone.")) return;
              try { await data.handleDeleteEvent(id); toast("Event deleted."); }
              catch { toast("Failed to delete event.", "error"); }
            }}
          />
        );
      case "notes":
        return (
          <NotesPage
            notes={data.notes}
            projects={data.projects}
            selectedNoteId={data.selectedNoteId}
            onSelectNote={data.setSelectedNoteId}
            onCreateNote={modals.openCreateNote}
            onEditNote={modals.openEditNote}
            onDeleteNote={async (id) => {
              if (!window.confirm("Delete this note? This cannot be undone.")) return;
              try { await data.handleDeleteNote(id); toast("Note deleted."); }
              catch { toast("Failed to delete note.", "error"); }
            }}
            noteExtraction={data.noteExtraction}
            loadingExtraction={data.loadingExtraction}
            generatingExtraction={data.generatingExtraction}
            acceptingExtraction={data.acceptingExtraction}
            onExtractTasks={data.handleExtractTasksFromNote}
            onAcceptExtraction={data.handleAcceptExtraction}
            selectedExtractionItems={data.selectedExtractionItems}
            onToggleExtractionItem={data.toggleExtractionItem}
          />
        );
      case "files":
        return (
          <FilesPage
            files={data.files}
            projects={data.projects}
            onCreateFile={modals.openUploadModal}
            onDeleteFile={data.handleDeleteFile}
          />
        );
      case "copilot":
        return (
          <CopilotPage
            prompt={data.copilotPrompt}
            setPrompt={data.setCopilotPrompt}
            history={data.copilotHistory}
            loading={data.loadingCopilot}
            error={data.copilotError}
            streamingText={data.streamingText}
            isStreaming={data.isStreaming}
            onSubmit={data.handleAskCopilot}
            onClearHistory={data.handleClearCopilotHistory}
          />
        );
      case "analytics":
        return (
          <AnalyticsPage
            tasks={data.tasks}
            projects={data.projects}
            inboxItems={data.inboxItems}
          />
        );
      case "settings":
        return <SettingsPage
          automationRuns={data.automationRuns}
          workspaceSettings={data.workspaceSettings}
          onUpdateWorkspace={data.handleUpdateWorkspace}
          counts={{
            tasks: data.tasks.length,
            projects: data.projects.length,
            notes: data.notes.length,
            inbox: data.inboxItems.length,
            events: data.events.length,
            files: data.files.length,
          }}
        />;
      default:
        return (
          <HomePage
            tasks={data.tasks}
            projects={data.projects}
            inboxItems={data.inboxItems}
            events={data.events}
            dashboard={data.dashboard}
            dailyBrief={data.dailyBrief}
            loadingDailyBrief={data.loadingDailyBrief}
            dailyBriefError={data.dailyBriefError}
            onGenerateDailyBrief={data.handleGenerateDailyBrief}
            onCompleteTask={data.handleCompleteTask}
            onEditTask={modals.openEditTask}
            onOpenPage={setPage}
            onOpenProject={(id) => { setPage("projects"); data.loadProjectContext(id); }}
          />
        );
    }
  }

  const currentNav = navItems.find((item) => item.id === page);

  const dynamicSubtitle = React.useMemo(() => {
    const totalTasks = data.tasks.filter((t) => t.status !== "done").length;
    const now = new Date();
    const overdueCount = data.tasks.filter((t) => t.status !== "done" && t.dueDate && new Date(t.dueDate) < now).length;
    const newInbox = data.inboxItems.filter((i) => i.status === "new").length;
    const parts: string[] = [];
    if (totalTasks > 0) parts.push(`${totalTasks} open task${totalTasks !== 1 ? "s" : ""}`);
    if (overdueCount > 0) parts.push(`${overdueCount} overdue`);
    if (newInbox > 0) parts.push(`${newInbox} new in inbox`);
    return parts.length > 0 ? parts.join(" · ") : subtitle[page];
  }, [data.tasks, data.inboxItems, page]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen">
        <Sidebar page={page} setPage={setPage} badges={sidebarBadges} />

        <main className="flex min-w-0 flex-1 flex-col">
          <AppHeader
            title={currentNav?.label || "Home"}
            subtitle={page === "home" ? dynamicSubtitle : subtitle[page]}
            onQuickAdd={modals.openCaptureModal}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchResults={searchResults}
            onSearchResultClick={handleSearchResultClick}
            searchInputRef={searchInputRef}
          />

          <div className="border-b border-slate-200 bg-white px-6 py-4">
            <div className="grid gap-3 sm:grid-cols-3 xl:max-w-3xl">
              {data.loadingData ? (
                <>
                  <SkeletonStat />
                  <SkeletonStat />
                  <SkeletonStat />
                </>
              ) : (
                <>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Open Tasks</p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">{stats.openTasks}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Active Projects</p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">{stats.activeProjects}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs uppercase tracking-wide text-slate-500">New Inbox</p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">{stats.newInbox}</p>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex-1 px-4 py-4 pb-24 lg:px-6 lg:py-6 lg:pb-6">
            <ErrorBoundary key={page}>{renderPage()}</ErrorBoundary>
          </div>
        </main>
      </div>

      <BottomNav page={page} setPage={setPage} badges={sidebarBadges} />

      <CaptureModal
        open={modals.captureModalOpen}
        projects={data.projects}
        onClose={modals.closeCaptureModal}
        onSaved={() => { modals.closeCaptureModal(); data.loadWorkspaceData(); toast("Item captured to inbox."); }}
      />
      <ProjectFormModal
        open={modals.projectModalOpen}
        project={modals.editingProject}
        onClose={modals.closeProjectModal}
        onSaved={() => { modals.closeProjectModal(); data.loadWorkspaceData(); toast(modals.editingProject ? "Project updated." : "Project created."); }}
      />
      <TaskFormModal
        open={modals.taskModalOpen}
        task={modals.editingTask}
        projects={data.projects}
        onClose={modals.closeTaskModal}
        onSaved={() => { modals.closeTaskModal(); data.loadWorkspaceData(); toast(modals.editingTask ? "Task updated." : "Task created."); }}
      />
      <NoteFormModal
        open={modals.noteModalOpen}
        note={modals.editingNote}
        projects={data.projects}
        onClose={modals.closeNoteModal}
        onSaved={() => { modals.closeNoteModal(); data.loadWorkspaceData(); toast(modals.editingNote ? "Note updated." : "Note created."); }}
      />
      <EventFormModal
        open={modals.eventModalOpen}
        editing={modals.editingEvent}
        onClose={modals.closeEventModal}
        onSaved={() => { modals.closeEventModal(); data.loadWorkspaceData(); toast(modals.editingEvent ? "Event updated." : "Event created."); }}
      />
      <UploadFileModal
        open={modals.uploadModalOpen}
        projects={data.projects}
        onClose={modals.closeUploadModal}
        onSaved={() => { modals.closeUploadModal(); data.loadWorkspaceData(); toast("File uploaded."); }}
      />
      <ShortcutsModal open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
    </div>
  );
}
