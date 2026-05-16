"use client";

import React, { useMemo, useState } from "react";
import type { PageId, SearchResult } from "@/lib/types";
import { navItems, subtitle } from "@/lib/constants";
import { useWorkspaceData } from "@/hooks/useWorkspaceData";
import { useModals } from "@/hooks/useModals";
import { useAnnounce } from "@/components/shared/Announcer";
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
import { SkeletonStat } from "@/components/shared/Skeleton";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";

export default function AIWorkHubApp() {
  const [page, setPage] = useState<PageId>("home");
  const [searchQuery, setSearchQuery] = useState("");

  const { announce } = useAnnounce();
  const data = useWorkspaceData(setPage);
  const modals = useModals();

  const searchResults = useMemo<SearchResult[]>(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    const results: SearchResult[] = [];
    data.projects
      .filter((p) => p.title.toLowerCase().includes(q) || (p.goal ?? "").toLowerCase().includes(q))
      .slice(0, 3)
      .forEach((p) => results.push({ type: "project", id: p.id, title: p.title, subtitle: `Project · ${p.status}` }));
    data.tasks
      .filter((t) => t.title.toLowerCase().includes(q))
      .slice(0, 3)
      .forEach((t) => results.push({ type: "task", id: t.id, title: t.title, subtitle: `Task · ${t.status}` }));
    data.notes
      .filter((n) => n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q))
      .slice(0, 3)
      .forEach((n) => results.push({ type: "note", id: n.id, title: n.title, subtitle: "Note" }));
    return results;
  }, [searchQuery, data.projects, data.tasks, data.notes]);

  function handleSearchResultClick(result: SearchResult) {
    setSearchQuery("");
    if (result.type === "project") {
      data.loadProjectContext(result.id);
    } else if (result.type === "task") {
      setPage("tasks");
    } else if (result.type === "note") {
      data.setSelectedNoteId(result.id);
      setPage("notes");
    }
  }

  const stats = data.dashboard?.stats ?? {
    openTasks: data.tasks.filter((t) => t.status !== "done").length,
    activeProjects: data.projects.filter((p) => p.status === "active").length,
    newInbox: data.inboxItems.filter((i) => i.status === "new").length,
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
            onOpenPage={setPage}
          />
        );
      case "inbox":
        return (
          <InboxPage
            inboxItems={data.inboxItems}
            onConvertInbox={data.handleConvertInbox}
            onArchiveInbox={data.handleArchiveInbox}
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
            onCreateTask={modals.openCreateTask}
            onEditTask={modals.openEditTask}
          />
        );
      case "calendar":
        return <CalendarPage events={data.events} onCreateEvent={modals.openCreateEvent} />;
      case "notes":
        return (
          <NotesPage
            notes={data.notes}
            projects={data.projects}
            selectedNoteId={data.selectedNoteId}
            onSelectNote={data.setSelectedNoteId}
            onCreateNote={modals.openCreateNote}
            onEditNote={modals.openEditNote}
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
            onCreateFile={data.handleCreateFile}
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
            onSubmit={data.handleAskCopilot}
          />
        );
      case "settings":
        return <SettingsPage automationRuns={data.automationRuns} />;
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
            onQuickAdd={modals.openCaptureModal}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchResults={searchResults}
            onSearchResultClick={handleSearchResultClick}
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

          <div className="flex-1 px-6 py-6">
            <ErrorBoundary key={page}>{renderPage()}</ErrorBoundary>
          </div>
        </main>
      </div>

      <CaptureModal
        open={modals.captureModalOpen}
        projects={data.projects}
        onClose={modals.closeCaptureModal}
        onSaved={() => { modals.closeCaptureModal(); data.loadWorkspaceData(); announce("Item captured to inbox."); }}
      />
      <ProjectFormModal
        open={modals.projectModalOpen}
        project={modals.editingProject}
        onClose={modals.closeProjectModal}
        onSaved={() => { modals.closeProjectModal(); data.loadWorkspaceData(); announce(modals.editingProject ? "Project updated." : "Project created."); }}
      />
      <TaskFormModal
        open={modals.taskModalOpen}
        task={modals.editingTask}
        projects={data.projects}
        onClose={modals.closeTaskModal}
        onSaved={() => { modals.closeTaskModal(); data.loadWorkspaceData(); announce(modals.editingTask ? "Task updated." : "Task created."); }}
      />
      <NoteFormModal
        open={modals.noteModalOpen}
        note={modals.editingNote}
        projects={data.projects}
        onClose={modals.closeNoteModal}
        onSaved={() => { modals.closeNoteModal(); data.loadWorkspaceData(); announce(modals.editingNote ? "Note updated." : "Note created."); }}
      />
      <EventFormModal
        open={modals.eventModalOpen}
        onClose={modals.closeEventModal}
        onSaved={() => { modals.closeEventModal(); data.loadWorkspaceData(); announce("Event created."); }}
      />
    </div>
  );
}
