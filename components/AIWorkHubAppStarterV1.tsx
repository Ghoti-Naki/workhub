"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  FolderKanban,
  Home,
  Inbox,
  LayoutGrid,
  Plus,
  Search,
  Settings,
  Sparkles,
  StickyNote,
  User,
  X,
} from "lucide-react";

type PageId =
  | "home"
  | "inbox"
  | "projects"
  | "tasks"
  | "calendar"
  | "notes"
  | "files"
  | "copilot"
  | "settings";

type ProjectPriority = "low" | "medium" | "high" | "urgent";
type ProjectStatus = "active" | "paused" | "completed" | "archived";
type TaskStatus = "todo" | "in_progress" | "done" | "blocked";
type InboxStatus = "new" | "reviewed" | "converted" | "archived";
type InboxSource = "gmail" | "manual" | "calendar";
type EventSource = "manual" | "google_calendar";
type BadgeTone = "default" | "high" | "urgent" | "success" | "info";
type ConvertTargetType = "task" | "note";

interface ApiResponse<T> {
  data: T;
  meta: Record<string, unknown>;
  error: { code: string; message: string } | null;
}

interface DashboardData {
  topTasks: Task[];
  overdueTasks: Task[];
  upcomingDeadlines: Task[];
  todayEvents: Array<{
    id: string;
    title: string;
    startsAt: string;
    endsAt: string;
    sourceType: string;
  }>;
  latestInboxItems: InboxItem[];
  activeProjects: Project[];
  stats: {
    openTasks: number;
    activeProjects: number;
    newInbox: number;
  };
  dailyBrief: {
    summary: string;
    highlights: string[];
  };
}

interface FileRecord {
  id: string;
  name: string;
  fileType?: string | null;
  mimeType?: string | null;
  externalUrl?: string | null;
  summary?: string | null;
  projectId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface Project {
  id: string;
  title: string;
  goal: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  dueDate: string;
  progress: number;
}

interface ProjectContextData {
  project: Project & {
    description?: string | null;
    tasks: Task[];
    notes: Note[];
    inboxItems: InboxItem[];
  };
  files: FileRecord[];
  upcomingEvents: Array<{
    id: string;
    title: string;
    startsAt: string;
    endsAt: string;
    sourceType: string;
  }>;
  stats: {
    openTasks: number;
    completedTasks: number;
    notes: number;
    inboxItems: number;
    files: number;
    overdueTasks: number;
  };
  latestSummary?: AiOutput | null;
}

interface AiOutput {
  id: string;
  outputType: string;
  targetType?: string | null;
  targetId?: string | null;
  title?: string | null;
  content: string;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt?: string;
}

interface SuggestedTask {
  title: string;
  description?: string;
  priority: "low" | "medium" | "high" | "urgent";
}

interface AiExtraction {
  id: string;
  sourceType: string;
  sourceId: string;
  outputType: string;
  payload: {
    noteId?: string;
    noteTitle?: string;
    suggestions?: SuggestedTask[];
  };
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface Task {
  id: string;
  title: string;
  description?: string | null;
  projectId: string;
  priority: ProjectPriority;
  status: TaskStatus;
  dueDate: string;
}

interface CopilotSource {
  type: string;
  id: string;
  title: string;
}

interface CopilotOutput extends AiOutput {
  metadata?: {
    sources?: CopilotSource[];
    [key: string]: unknown;
  } | null;
}

interface AutomationRun {
  id: string;
  workflow: string;
  source: string;
  status: string;
  externalId?: string | null;
  idempotencyKey?: string | null;
  message?: string | null;
  payload?: Record<string, unknown> | null;
  result?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

interface InboxItem {
  id: string;
  source: InboxSource;
  title: string;
  content: string;
  status: InboxStatus;
  suggestion: string;
}

interface Note {
  id: string;
  title: string;
  projectId: string;
  updatedAt: string;
  body: string;
}

interface WorkspaceEvent {
  id: string;
  title: string;
  time: string;
  source: EventSource;
}

interface NavItem {
  id: PageId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface BadgeProps {
  children: React.ReactNode;
  tone?: BadgeTone;
}

interface SectionCardProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

interface SearchResult {
  type: "project" | "task" | "note";
  id: string;
  title: string;
  subtitle: string;
}

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  onQuickAdd: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchResults: SearchResult[];
  onSearchResultClick: (result: SearchResult) => void;
}

interface SidebarProps {
  page: PageId;
  setPage: React.Dispatch<React.SetStateAction<PageId>>;
}

interface HomePageProps {
  tasks: Task[];
  projects: Project[];
  inboxItems: InboxItem[];
  events: WorkspaceEvent[];
  dashboard: DashboardData | null;
  dailyBrief: AiOutput | null;
  loadingDailyBrief: boolean;
  onGenerateDailyBrief: () => void;
  onCompleteTask: (taskId: string) => void;
  onOpenPage: (page: PageId) => void;
}

interface InboxPageProps {
  inboxItems: InboxItem[];
  onConvertInbox: (inboxId: string, targetType: ConvertTargetType) => void;
  onArchiveInbox: (inboxId: string) => void;
}

interface ProjectsPageProps {
  projects: Project[];
  tasks: Task[];
  notes: Note[];
}

interface TasksPageProps {
  tasks: Task[];
  projects: Project[];
  onCompleteTask: (taskId: string) => void;
  onCreateTask: () => void;
  onEditTask: (task: Task) => void;
}

interface NotesPageProps {
  notes: Note[];
  projects: Project[];
}

interface CalendarPageProps {
  events: WorkspaceEvent[];
  onCreateEvent: () => void;
}

const initialProjects: Project[] = [
  {
    id: "p1",
    title: "AI Work Hub MVP",
    goal: "Ship the first usable version of the app",
    status: "active",
    priority: "high",
    dueDate: "2026-05-15",
    progress: 42,
  },
  {
    id: "p2",
    title: "GEMASTIK 2026",
    goal: "Finalize proposal and submission assets",
    status: "active",
    priority: "high",
    dueDate: "2026-04-28",
    progress: 68,
  },
  {
    id: "p3",
    title: "Career Applications",
    goal: "Follow up with recruiters and improve application quality",
    status: "active",
    priority: "medium",
    dueDate: "2026-05-04",
    progress: 54,
  },
];

const initialTasks: Task[] = [
  {
    id: "t1",
    title: "Build app shell and routing",
    projectId: "p1",
    priority: "high",
    status: "in_progress",
    dueDate: "2026-04-24",
  },
  {
    id: "t2",
    title: "Create project and task schema",
    projectId: "p1",
    priority: "high",
    status: "todo",
    dueDate: "2026-04-25",
  },
  {
    id: "t3",
    title: "Revise GEMASTIK proposal scope section",
    projectId: "p2",
    priority: "urgent",
    status: "todo",
    dueDate: "2026-04-23",
  },
  {
    id: "t4",
    title: "Reply to recruiter follow-up",
    projectId: "p3",
    priority: "high",
    status: "todo",
    dueDate: "2026-04-23",
  },
  {
    id: "t5",
    title: "Outline dashboard endpoint needs",
    projectId: "p1",
    priority: "medium",
    status: "todo",
    dueDate: "2026-04-27",
  },
];

const initialInbox: InboxItem[] = [
  {
    id: "i1",
    source: "gmail",
    title: "Recruiter follow-up",
    content:
      "Can you confirm your availability and whether you meet the internship requirement?",
    status: "new",
    suggestion: "Convert to task and respond today",
  },
  {
    id: "i2",
    source: "manual",
    title: "Idea",
    content: "Make AI suggestions always explain why something is prioritized.",
    status: "reviewed",
    suggestion: "Convert to note under AI Work Hub MVP",
  },
  {
    id: "i3",
    source: "calendar",
    title: "Competition deadline reminder",
    content: "GEMASTIK documents should be finalized before submission day.",
    status: "new",
    suggestion: "Link to GEMASTIK 2026 and create checklist task",
  },
];

const initialNotes: Note[] = [
  {
    id: "n1",
    title: "AI feature principles",
    projectId: "p1",
    updatedAt: "2026-04-22",
    body: "AI should assist, explain, and require confirmation for important changes.",
  },
  {
    id: "n2",
    title: "Event theme exploration",
    projectId: "p2",
    updatedAt: "2026-04-21",
    body: "Potential theme directions should balance innovation, competition, and digital ecosystem impact.",
  },
];

const initialEvents: WorkspaceEvent[] = [
  {
    id: "e1",
    title: "Deep work: product architecture",
    time: "09:00 - 10:30",
    source: "manual",
  },
  {
    id: "e2",
    title: "Team sync",
    time: "13:00 - 14:00",
    source: "google_calendar",
  },
  {
    id: "e3",
    title: "Proposal review block",
    time: "16:00 - 17:00",
    source: "manual",
  },
];

const navItems: NavItem[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "inbox", label: "Inbox", icon: Inbox },
  { id: "projects", label: "Projects", icon: FolderKanban },
  { id: "tasks", label: "Tasks", icon: CheckCircle2 },
  { id: "calendar", label: "Calendar", icon: Calendar },
  { id: "notes", label: "Notes", icon: StickyNote },
  { id: "files", label: "Files", icon: FileText },
  { id: "copilot", label: "AI Copilot", icon: Sparkles },
  { id: "settings", label: "Settings", icon: Settings },
];

function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

function Badge({ children, tone = "default" }: BadgeProps) {
  const tones: Record<BadgeTone, string> = {
    default: "bg-slate-100 text-slate-700 border-slate-200",
    high: "bg-amber-50 text-amber-700 border-amber-200",
    urgent: "bg-rose-50 text-rose-700 border-rose-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    info: "bg-blue-50 text-blue-700 border-blue-200",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}

function SectionCard({
  title,
  subtitle,
  action,
  children,
  className = "",
}: SectionCardProps) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-slate-200 bg-white shadow-sm",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          {subtitle ? (
            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          ) : null}
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function AppHeader({
  title,
  subtitle,
  onQuickAdd,
  searchQuery,
  onSearchChange,
  searchResults,
  onSearchResultClick,
}: AppHeaderProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-slate-200 bg-white px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500">AI Work Hub</p>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative">
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm shadow-sm">
            <Search className="h-4 w-4 shrink-0 text-slate-400" />
            <input
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search workspace"
              className="min-w-0 w-48 bg-transparent text-slate-700 outline-none placeholder:text-slate-400"
            />
          </div>
          {searchQuery.trim() ? (
            <div className="absolute left-0 right-0 top-full z-40 mt-1 rounded-2xl border border-slate-200 bg-white shadow-lg overflow-hidden">
              {searchResults.length > 0 ? (
                searchResults.map((result) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => onSearchResultClick(result)}
                    className="flex w-full flex-col gap-0.5 px-4 py-3 text-left hover:bg-slate-50"
                  >
                    <span className="text-sm font-medium text-slate-900">{result.title}</span>
                    <span className="text-xs text-slate-500">{result.subtitle}</span>
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-slate-500">
                  No results for &ldquo;{searchQuery}&rdquo;
                </div>
              )}
            </div>
          ) : null}
        </div>
        <button
          onClick={onQuickAdd}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Quick Capture
        </button>
      </div>
    </div>
  );
}

function Sidebar({ page, setPage }: SidebarProps) {
  return (
    <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col">
      <div className="border-b border-slate-200 px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
            <LayoutGrid className="h-5 w-5" />
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-900">AI Work Hub</p>
            <p className="text-sm text-slate-500">Personal operating system</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-5">
        <div className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = page === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setPage(item.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition",
                  active
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <div className="border-t border-slate-200 px-4 py-4">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white">
              <User className="h-4 w-4 text-slate-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">
                Workspace Owner
              </p>
              <p className="text-xs text-slate-500">Focused build mode</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function HomePage({
  tasks,
  projects,
  inboxItems,
  events,
  dashboard,
  dailyBrief,
  loadingDailyBrief,
  onGenerateDailyBrief,
  onCompleteTask,
  onOpenPage,
}: HomePageProps) {
  const overdue = dashboard?.overdueTasks ?? [];
  const topTasks = dashboard?.topTasks ?? [];

  const dailyHighlights = Array.isArray(dailyBrief?.metadata?.highlights)
    ? (dailyBrief?.metadata?.highlights as string[])
    : dashboard?.dailyBrief?.highlights?.length
      ? dashboard.dailyBrief.highlights
      : [
          "Top focus will appear here",
          "Risk summary will appear here",
          "Inbox summary will appear here",
        ];

  const scheduleItems: WorkspaceEvent[] = dashboard?.todayEvents?.length
    ? dashboard.todayEvents.map((event) => {
        const start = event.startsAt
          ? new Date(event.startsAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "TBD";
        const end = event.endsAt
          ? new Date(event.endsAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "TBD";

        return {
          id: event.id,
          title: event.title,
          time: `${start} - ${end}`,
          source: event.sourceType as EventSource,
        };
      })
    : events;

  return (
    <div className="space-y-6">
      <SectionCard
        title="AI Daily Brief"
        subtitle="A grounded summary of what deserves your attention today"
        action={
          <button
            onClick={onGenerateDailyBrief}
            disabled={loadingDailyBrief}
            className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {loadingDailyBrief ? "Generating..." : "Generate Brief"}
          </button>
        }
      >
        <div className="space-y-4">
          <p className="text-sm leading-6 text-slate-700">
            {dailyBrief?.content ??
              dashboard?.dailyBrief?.summary ??
              "Your daily brief will appear here once it has been generated."}
          </p>

          <div className="grid gap-3 md:grid-cols-3">
            {dailyHighlights.map((item) => (
              <div key={item} className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">{item}</p>
              </div>
            ))}
          </div>

          {dailyBrief ? (
            <p className="text-xs text-slate-400">
              Generated {new Date(dailyBrief.createdAt).toLocaleString()}
            </p>
          ) : null}
        </div>
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <SectionCard
            title="Top Tasks"
            subtitle="The most important work in front of you"
          >
            <div className="space-y-3">
              {topTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => onOpenPage("tasks")}
                  className="flex w-full items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4 text-left transition hover:bg-slate-50"
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onCompleteTask(task.id);
                      }}
                      className="mt-0.5 rounded-full border border-slate-300 p-1 text-slate-500 hover:bg-slate-100"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </button>
                    <div>
                      <p className="font-medium text-slate-900">{task.title}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        Due {task.dueDate}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      tone={
                        task.priority === "urgent"
                          ? "urgent"
                          : task.priority === "high"
                            ? "high"
                            : "default"
                      }
                    >
                      {task.priority}
                    </Badge>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="Overdue and Near-Due"
            subtitle="Items that need fast attention"
          >
            <div className="space-y-3">
              {overdue.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
                  No overdue tasks right now. Good shape.
                </div>
              ) : (
                overdue.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between gap-4 rounded-2xl bg-rose-50 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <AlertCircle className="mt-0.5 h-4 w-4 text-rose-600" />
                      <div>
                        <p className="font-medium text-rose-900">
                          {task.title}
                        </p>
                        <p className="mt-1 text-sm text-rose-700">
                          Due {task.dueDate}
                        </p>
                      </div>
                    </div>
                    <Badge tone="urgent">act now</Badge>
                  </div>
                ))
              )}
            </div>
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard
            title="Today’s Schedule"
            subtitle="Time-based commitments and blocks"
          >
            <div className="space-y-3">
              {scheduleItems.map((event) => (
                <div
                  key={event.id}
                  className="rounded-2xl border border-slate-200 p-4"
                >
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Clock3 className="h-4 w-4" />
                    <span>{event.time}</span>
                  </div>
                  <p className="mt-2 font-medium text-slate-900">
                    {event.title}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Source: {event.source}
                  </p>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="Inbox Review"
            subtitle="Raw items that still need sorting"
            action={
              <button
                onClick={() => onOpenPage("inbox")}
                className="text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                Open Inbox
              </button>
            }
          >
            <div className="space-y-3">
              {inboxItems.slice(0, 3).map((item) => (
                <div key={item.id} className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-slate-900">{item.title}</p>
                    <Badge tone={item.status === "new" ? "info" : "default"}>
                      {item.status}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    {item.suggestion}
                  </p>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="Project Snapshot"
            subtitle="The health of your active work areas"
          >
            <div className="space-y-3">
              {projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => onOpenPage("projects")}
                  className="block w-full rounded-2xl border border-slate-200 p-4 text-left transition hover:bg-slate-50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-900">
                        {project.title}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {project.goal}
                      </p>
                    </div>
                    <Badge
                      tone={project.priority === "high" ? "high" : "default"}
                    >
                      {project.priority}
                    </Badge>
                  </div>
                  <div className="mt-4 h-2 w-full rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-slate-900"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </button>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

function InboxPage({ inboxItems, onConvertInbox, onArchiveInbox }: InboxPageProps) {
  const [selectedId, setSelectedId] = useState<string | null>(
    inboxItems[0]?.id ?? null,
  );
  const selectedItem =
    inboxItems.find((item) => item.id === selectedId) ?? inboxItems[0] ?? null;

  return (
    <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
      <SectionCard
        title="Inbox"
        subtitle="Capture first, organize second"
        className="overflow-hidden p-0"
      >
        <div className="space-y-2 p-2">
          {inboxItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedId(item.id)}
              className={cn(
                "w-full rounded-2xl border p-4 text-left transition",
                selectedItem?.id === item.id
                  ? "border-slate-900 bg-slate-50"
                  : "border-slate-200 hover:bg-slate-50",
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-slate-900">{item.title}</p>
                <Badge tone={item.status === "new" ? "info" : "default"}>
                  {item.status}
                </Badge>
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                {item.content}
              </p>
              <p className="mt-3 text-xs text-slate-400">
                Source: {item.source}
              </p>
            </button>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title={selectedItem?.title ?? "Inbox item"}
        subtitle="Review the item and decide what it becomes"
      >
        {selectedItem ? (
          <div className="space-y-6">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm leading-6 text-slate-700">
                {selectedItem.content}
              </p>
            </div>

            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-700" />
                <p className="text-sm font-semibold text-blue-900">
                  AI Triage Suggestion
                </p>
              </div>
              <p className="mt-3 text-sm text-blue-800">
                {selectedItem.suggestion}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => onConvertInbox(selectedItem.id, "task")}
                className="rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white"
              >
                Convert to Task
              </button>
              <button
                onClick={() => onConvertInbox(selectedItem.id, "note")}
                className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700"
              >
                Convert to Note
              </button>
              <button
                onClick={() => onArchiveInbox(selectedItem.id)}
                className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700"
              >
                Archive
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-sm text-slate-500">
            No inbox item selected.
          </div>
        )}
      </SectionCard>
    </div>
  );
}

function ProjectsPage({
  projects,
  tasks,
  notes,
  onOpenProject,
  projectContext,
  loadingProjectContext,
  onGenerateSummary,
  onCreateProject,
  onEditProject,
}: {
  projects: Project[];
  tasks: Task[];
  notes: Note[];
  onOpenProject: (projectId: string) => void;
  projectContext: ProjectContextData | null;
  loadingProjectContext: boolean;
  onGenerateSummary: (projectId: string) => void;
  onCreateProject: () => void;
  onEditProject: (project: Project) => void;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-slate-500">
            {projects.length} project{projects.length !== 1 ? "s" : ""}
          </p>
          <button
            onClick={onCreateProject}
            className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
          >
            + New Project
          </button>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-1">
          {projects.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
              No projects yet. Create one to get started.
            </div>
          ) : (
          projects.map((project) => {
            const projectTasks = tasks.filter(
              (task) => task.projectId === project.id && task.status !== "done",
            );
            const projectNotes = notes.filter(
              (note) => note.projectId === project.id,
            );

            return (
              <SectionCard
                key={project.id}
                title={project.title}
                subtitle={project.goal}
                action={
                  <div className="flex items-center gap-2">
                    <Badge
                      tone={project.priority === "high" ? "high" : "default"}
                    >
                      {project.priority}
                    </Badge>
                    <button
                      onClick={() => onEditProject(project)}
                      className="rounded-xl border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                    >
                      Edit
                    </button>
                  </div>
                }
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <span>Status: {project.status}</span>
                    <span>Due {project.dueDate}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <p className="text-slate-500">Open Tasks</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">
                        {projectTasks.length}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <p className="text-slate-500">Notes</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">
                        {projectNotes.length}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onOpenProject(project.id)}
                    className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white"
                  >
                    Open Project
                  </button>
                </div>
              </SectionCard>
            );
          })
          )}
        </div>
      </div>

      <ProjectDetailPanel
        projectContext={projectContext}
        loading={loadingProjectContext}
        onGenerateSummary={onGenerateSummary}
      />
    </div>
  );
}

function ProjectDetailPanel({
  projectContext,
  loading,
  onGenerateSummary,
}: {
  projectContext: ProjectContextData | null;
  loading: boolean;
  onGenerateSummary: (projectId: string) => void;
}) {
  if (loading) {
    return (
      <SectionCard title="Project Detail" subtitle="Loading project context">
        <p className="text-sm text-slate-500">Loading project details...</p>
      </SectionCard>
    );
  }

  if (!projectContext) {
    return (
      <SectionCard title="Project Detail" subtitle="Select a project">
        <p className="text-sm text-slate-500">
          Choose a project to see its tasks, notes, inbox items, files, and
          stats.
        </p>
      </SectionCard>
    );
  }

  const { project, stats, files, latestSummary } = projectContext;

  return (
    <div className="space-y-6">
      <SectionCard
        title={project.title}
        subtitle={project.goal || "Project context and progress"}
        action={
          <Badge tone={project.priority === "high" ? "high" : "default"}>
            {project.priority}
          </Badge>
        }
      >
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Open Tasks
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {stats.openTasks}
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Overdue
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {stats.overdueTasks}
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Files
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {stats.files}
            </p>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="AI Project Summary"
        subtitle="Grounded summary from current project data"
        action={
          <button
            onClick={() => onGenerateSummary(project.id)}
            className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
          >
            Generate Summary
          </button>
        }
      >
        {latestSummary ? (
          <div className="space-y-3">
            <p className="text-sm leading-6 text-slate-700">
              {latestSummary.content}
            </p>
            <p className="text-xs text-slate-400">
              Generated {new Date(latestSummary.createdAt).toLocaleString()}
            </p>
          </div>
        ) : (
          <p className="text-sm text-slate-500">
            No summary yet. Generate one from the current project context.
          </p>
        )}
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <SectionCard title="Open Tasks" subtitle="Tasks tied to this project">
            <div className="space-y-3">
              {project.tasks.length === 0 ? (
                <p className="text-sm text-slate-500">No tasks linked yet.</p>
              ) : (
                project.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="rounded-2xl border border-slate-200 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-slate-900">{task.title}</p>
                      <Badge
                        tone={
                          task.priority === "urgent"
                            ? "urgent"
                            : task.priority === "high"
                              ? "high"
                              : "default"
                        }
                      >
                        {task.priority}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-slate-500">
                      Status: {task.status}
                    </p>
                  </div>
                ))
              )}
            </div>
          </SectionCard>

          <SectionCard title="Notes" subtitle="Latest project notes">
            <div className="space-y-3">
              {project.notes.length === 0 ? (
                <p className="text-sm text-slate-500">No notes linked yet.</p>
              ) : (
                project.notes.map((note) => (
                  <div
                    key={note.id}
                    className="rounded-2xl border border-slate-200 p-4"
                  >
                    <p className="font-medium text-slate-900">{note.title}</p>
                    <p className="mt-2 text-sm text-slate-600">{note.body}</p>
                  </div>
                ))
              )}
            </div>
          </SectionCard>

          <SectionCard
            title="Inbox Items"
            subtitle="Unprocessed project captures"
          >
            <div className="space-y-3">
              {project.inboxItems.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No inbox items linked yet.
                </p>
              ) : (
                project.inboxItems.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-slate-200 p-4"
                  >
                    <p className="font-medium text-slate-900">
                      {item.title || "Untitled inbox item"}
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                      {item.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard title="Files" subtitle="Project-linked documents">
            <div className="space-y-3">
              {files.length === 0 ? (
                <p className="text-sm text-slate-500">No files linked yet.</p>
              ) : (
                files.map((file) => (
                  <div
                    key={file.id}
                    className="rounded-2xl border border-slate-200 p-4"
                  >
                    <p className="font-medium text-slate-900">{file.name}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {file.fileType || file.mimeType || "Unknown type"}
                    </p>
                  </div>
                ))
              )}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

function TasksPage({ tasks, projects, onCompleteTask, onCreateTask, onEditTask }: TasksPageProps) {
  const projectMap = useMemo<Record<string, string>>(
    () =>
      Object.fromEntries(
        projects.map((project) => [project.id, project.title]),
      ),
    [projects],
  );

  return (
    <SectionCard
      title="Tasks"
      subtitle="Execution view across your workspace"
      action={
        <button
          onClick={onCreateTask}
          className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
        >
          + New Task
        </button>
      }
    >
      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
            No tasks yet. Create one to get started.
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 md:flex-row md:items-center md:justify-between"
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => onCompleteTask(task.id)}
                  className="mt-0.5 rounded-full border border-slate-300 p-1 text-slate-500 hover:bg-slate-100"
                >
                  <CheckCircle2 className="h-4 w-4" />
                </button>
                <div>
                  <p className="font-medium text-slate-900">{task.title}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {projectMap[task.projectId] || "Unassigned"}
                  </p>
                  {task.description ? (
                    <p className="mt-1 text-xs text-slate-400">{task.description}</p>
                  ) : null}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  tone={
                    task.priority === "urgent"
                      ? "urgent"
                      : task.priority === "high"
                        ? "high"
                        : "default"
                  }
                >
                  {task.priority}
                </Badge>
                <Badge tone={task.status === "done" ? "success" : "default"}>
                  {task.status}
                </Badge>
                <span className="text-sm text-slate-500">{task.dueDate}</span>
                <button
                  onClick={() => onEditTask(task)}
                  className="rounded-xl border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Edit
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </SectionCard>
  );
}

function NotesPage({
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

function CalendarPage({ events, onCreateEvent }: CalendarPageProps) {
  return (
    <SectionCard
      title="Calendar"
      subtitle="Time-based commitments and focus blocks"
      action={
        <button
          onClick={onCreateEvent}
          className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
        >
          + New Event
        </button>
      }
    >
      <div className="space-y-3">
        {events.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
            No events yet. Create one or sync via automation.
          </div>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className="rounded-2xl border border-slate-200 p-4"
            >
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Calendar className="h-4 w-4" />
                <span>{event.time}</span>
              </div>
              <p className="mt-2 font-medium text-slate-900">{event.title}</p>
              <p className="mt-1 text-xs text-slate-500">{event.source}</p>
            </div>
          ))
        )}
      </div>
    </SectionCard>
  );
}

function FilesPage({
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
  const projectMap: Record<string, string> = Object.fromEntries(
    projects.map((project) => [project.id, project.title]),
  );

  return (
    <SectionCard
      title="Files"
      subtitle="Documents tied to active work"
      action={
        <button
          onClick={onCreateFile}
          className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
        >
          Add File Record
        </button>
      }
    >
      {files.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
          No file records yet. Add one manually or ingest from automation.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {files.map((file) => (
            <div
              key={file.id}
              className="rounded-2xl border border-slate-200 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                  <FileText className="h-5 w-5" />
                </div>
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

function CopilotPage({
  prompt,
  setPrompt,
  history,
  loading,
  onSubmit,
}: {
  prompt: string;
  setPrompt: (value: string) => void;
  history: CopilotOutput[];
  loading: boolean;
  onSubmit: (promptText?: string) => void;
}) {
  const latestAnswer = history[0] ?? null;
  const latestSources = Array.isArray(latestAnswer?.metadata?.sources)
    ? latestAnswer.metadata.sources
    : [];

  const promptSuggestions = [
    "What should I focus on today?",
    "What am I behind on?",
    "Summarize my most active project.",
    "Which deadlines are risky this week?",
    "What inbox items should I process first?",
  ];

  return (
    <div className="grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
      <div className="space-y-6">
        <SectionCard
          title="AI Copilot"
          subtitle="Ask grounded questions about your workspace"
        >
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ask a grounded workspace question..."
                className="min-h-[120px] w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none focus:border-slate-400"
              />
              <div className="mt-3 flex justify-end">
                <button
                  onClick={() => onSubmit()}
                  disabled={loading || !prompt.trim()}
                  className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                >
                  {loading ? "Thinking..." : "Ask Copilot"}
                </button>
              </div>
            </div>

            {latestAnswer ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-blue-700" />
                    <p className="text-sm font-medium text-blue-900">
                      Latest Answer
                    </p>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-blue-900">
                    {latestAnswer.content}
                  </p>
                  <p className="mt-3 text-xs text-blue-700">
                    Saved {new Date(latestAnswer.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-sm font-semibold text-slate-900">
                    Sources
                  </p>
                  {latestSources.length === 0 ? (
                    <p className="mt-2 text-sm text-slate-500">
                      No source metadata attached.
                    </p>
                  ) : (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {latestSources.map((source) => (
                        <span
                          key={`${source.type}-${source.id}`}
                          className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700"
                        >
                          {source.type}: {source.title}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
                Ask a question to get a grounded answer from your workspace.
              </div>
            )}
          </div>
        </SectionCard>
      </div>

      <div className="space-y-6">
        <SectionCard
          title="Suggested prompts"
          subtitle="Fast ways to use AI inside the workspace"
        >
          <div className="space-y-3">
            {promptSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => onSubmit(suggestion)}
                className="w-full rounded-2xl border border-slate-200 p-4 text-left text-sm text-slate-700 transition hover:bg-slate-50"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Recent Copilot History"
          subtitle="Previously saved workspace answers"
        >
          {history.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
              No saved Copilot answers yet.
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200 p-4"
                >
                  <p className="font-medium text-slate-900">
                    {item.title || "Untitled question"}
                  </p>
                  <p className="mt-2 line-clamp-4 text-sm leading-6 text-slate-600">
                    {item.content}
                  </p>
                  <p className="mt-3 text-xs text-slate-400">
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}

function SettingsPage({ automationRuns }: { automationRuns: AutomationRun[] }) {
  const integrations = [
    { name: "Google Calendar", status: "Automation-ready" },
    { name: "Gmail", status: "Automation-ready" },
    { name: "Google Drive", status: "Automation-ready" },
  ];

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <div className="space-y-6">
        <SectionCard
          title="Account"
          subtitle="Workspace profile and preferences"
        >
          <div className="space-y-4 text-sm text-slate-700">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-slate-500">Workspace</p>
              <p className="mt-1 font-medium text-slate-900">AI Work Hub</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-slate-500">Timezone</p>
              <p className="mt-1 font-medium text-slate-900">Asia/Jakarta</p>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Integrations"
          subtitle="External tools connected through automation"
        >
          <div className="space-y-3">
            {integrations.map((integration) => (
              <div
                key={integration.name}
                className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4"
              >
                <div>
                  <p className="font-medium text-slate-900">
                    {integration.name}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {integration.status}
                  </p>
                </div>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700">
                  via n8n
                </span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="Automation Runs"
        subtitle="Recent ingestion and sync activity"
      >
        {automationRuns.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
            No automation runs yet. Once n8n starts calling your ingestion
            routes, activity will show here.
          </div>
        ) : (
          <div className="space-y-3">
            {automationRuns.map((run) => (
              <div
                key={run.id}
                className="rounded-2xl border border-slate-200 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-900">{run.workflow}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      Source: {run.source}
                    </p>
                  </div>
                  <Badge
                    tone={
                      run.status === "success"
                        ? "success"
                        : run.status === "failed"
                          ? "urgent"
                          : "info"
                    }
                  >
                    {run.status}
                  </Badge>
                </div>

                {run.message ? (
                  <p className="mt-3 text-sm text-slate-700">{run.message}</p>
                ) : null}

                <p className="mt-3 text-xs text-slate-400">
                  {new Date(run.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}

// ─── Modal shared style helpers ──────────────────────────────────────────────

const inputCls =
  "mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400";

const selectCls =
  "mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400 bg-white";

const labelCls = "block text-sm font-medium text-slate-700";

function ModalShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1 text-slate-400 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── CaptureModal ─────────────────────────────────────────────────────────────

function CaptureModal({
  open,
  onClose,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setTitle("");
      setContent("");
      setError(null);
    }
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) {
      setError("Content is required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/inbox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim() || null,
          content: content.trim(),
          sourceType: "manual",
          itemType: "capture",
        }),
      });
      if (!res.ok) throw new Error();
      onClose();
      onSaved();
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <ModalShell title="Quick Capture" onClose={onClose}>
      <p className="mt-1 text-sm text-slate-500">Add anything to your inbox instantly.</p>
      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <label className={labelCls}>
            Title <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputCls}
            placeholder="Brief label"
          />
        </div>
        <div>
          <label className={labelCls}>Content *</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            className={cn(inputCls, "resize-none")}
            placeholder="What's on your mind?"
          />
        </div>
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {saving ? "Saving..." : "Capture"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

// ─── ProjectFormModal ─────────────────────────────────────────────────────────

function ProjectFormModal({
  open,
  onClose,
  onSaved,
  project,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  project: Project | null;
}) {
  const [title, setTitle] = useState("");
  const [goal, setGoal] = useState("");
  const [priority, setPriority] = useState<ProjectPriority>("medium");
  const [status, setStatus] = useState<ProjectStatus>("active");
  const [dueDate, setDueDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setTitle(project?.title ?? "");
      setGoal(project?.goal ?? "");
      setPriority(project?.priority ?? "medium");
      setStatus(project?.status ?? "active");
      setDueDate(project?.dueDate ? project.dueDate.slice(0, 10) : "");
      setError(null);
    }
  }, [open, project]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const url = project ? `/api/projects/${project.id}` : "/api/projects";
      const method = project ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          goal: goal.trim() || null,
          priority,
          status,
          dueDate: dueDate || null,
        }),
      });
      if (!res.ok) throw new Error();
      onClose();
      onSaved();
    } catch {
      setError("Failed to save project. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <ModalShell title={project ? "Edit Project" : "New Project"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <label className={labelCls}>Title *</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputCls}
            placeholder="Project title"
          />
        </div>
        <div>
          <label className={labelCls}>Goal</label>
          <input
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className={inputCls}
            placeholder="What does success look like?"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as ProjectPriority)}
              className={selectCls}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ProjectStatus)}
              className={selectCls}
            >
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
        <div>
          <label className={labelCls}>Due Date</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className={inputCls}
          />
        </div>
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {saving ? "Saving..." : project ? "Save Changes" : "Create Project"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

// ─── TaskFormModal ────────────────────────────────────────────────────────────

function TaskFormModal({
  open,
  onClose,
  onSaved,
  task,
  projects,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  task: Task | null;
  projects: Project[];
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState("");
  const [priority, setPriority] = useState<ProjectPriority>("medium");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [dueDate, setDueDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setTitle(task?.title ?? "");
      setDescription(task?.description ?? "");
      setProjectId(task?.projectId ?? "");
      setPriority(task?.priority ?? "medium");
      setStatus(task?.status ?? "todo");
      setDueDate(task?.dueDate ? task.dueDate.slice(0, 10) : "");
      setError(null);
    }
  }, [open, task]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const url = task ? `/api/tasks/${task.id}` : "/api/tasks";
      const method = task ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          projectId: projectId || null,
          priority,
          status,
          dueDate: dueDate || null,
        }),
      });
      if (!res.ok) throw new Error();
      onClose();
      onSaved();
    } catch {
      setError("Failed to save task. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <ModalShell title={task ? "Edit Task" : "New Task"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <label className={labelCls}>Title *</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputCls}
            placeholder="Task title"
          />
        </div>
        <div>
          <label className={labelCls}>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className={cn(inputCls, "resize-none")}
            placeholder="Optional details"
          />
        </div>
        <div>
          <label className={labelCls}>Project</label>
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className={selectCls}
          >
            <option value="">Unassigned</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as ProjectPriority)}
              className={selectCls}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className={selectCls}
            >
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
        </div>
        <div>
          <label className={labelCls}>Due Date</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className={inputCls}
          />
        </div>
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {saving ? "Saving..." : task ? "Save Changes" : "Create Task"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

// ─── NoteFormModal ────────────────────────────────────────────────────────────

function NoteFormModal({
  open,
  onClose,
  onSaved,
  note,
  projects,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  note: Note | null;
  projects: Project[];
}) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [projectId, setProjectId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setTitle(note?.title ?? "");
      setBody(note?.body ?? "");
      setProjectId(note?.projectId ?? "");
      setError(null);
    }
  }, [open, note]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      setError("Title and body are required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const url = note ? `/api/notes/${note.id}` : "/api/notes";
      const method = note ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          body: body.trim(),
          projectId: projectId || null,
        }),
      });
      if (!res.ok) throw new Error();
      onClose();
      onSaved();
    } catch {
      setError("Failed to save note. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <ModalShell title={note ? "Edit Note" : "New Note"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <label className={labelCls}>Title *</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputCls}
            placeholder="Note title"
          />
        </div>
        <div>
          <label className={labelCls}>Body *</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={5}
            className={cn(inputCls, "resize-none")}
            placeholder="Write your note here..."
          />
        </div>
        <div>
          <label className={labelCls}>Project</label>
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className={selectCls}
          >
            <option value="">Unassigned</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {saving ? "Saving..." : note ? "Save Changes" : "Create Note"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

// ─── EventFormModal ───────────────────────────────────────────────────────────

function EventFormModal({
  open,
  onClose,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setTitle("");
      setDate("");
      setStartTime("");
      setEndTime("");
      setDescription("");
      setLocation("");
      setError(null);
    }
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !date || !startTime || !endTime) {
      setError("Title, date, start time, and end time are required.");
      return;
    }
    const startsAt = new Date(`${date}T${startTime}`).toISOString();
    const endsAt = new Date(`${date}T${endTime}`).toISOString();
    if (endsAt <= startsAt) {
      setError("End time must be after start time.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          location: location.trim() || null,
          sourceType: "manual",
          startsAt,
          endsAt,
        }),
      });
      if (!res.ok) throw new Error();
      onClose();
      onSaved();
    } catch {
      setError("Failed to save event. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <ModalShell title="New Event" onClose={onClose}>
      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <label className={labelCls}>Title *</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputCls}
            placeholder="Event title"
          />
        </div>
        <div>
          <label className={labelCls}>Date *</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={inputCls}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Start Time *</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>End Time *</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className={inputCls}
            />
          </div>
        </div>
        <div>
          <label className={labelCls}>Location</label>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className={inputCls}
            placeholder="Optional location"
          />
        </div>
        <div>
          <label className={labelCls}>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className={cn(inputCls, "resize-none")}
            placeholder="Optional notes"
          />
        </div>
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {saving ? "Saving..." : "Create Event"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

// ─── Root component ───────────────────────────────────────────────────────────

export default function AIWorkHubAppStarterV1() {
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

  const subtitle: Record<PageId, string> = {
    home: "See what matters, decide faster, and move with clearer context.",
    inbox: "Review unprocessed items and turn them into structured work.",
    projects: "Track outcomes, progress, and next actions across your work.",
    tasks: "Focus on actionable work, not scattered mental reminders.",
    calendar: "Align commitments, deadlines, and deep work time.",
    notes: "Keep ideas, research, and meeting thinking connected to real work.",
    files: "Store the documents that matter inside project context.",
    copilot: "Use AI as a grounded assistant over your actual workspace.",
    settings: "Manage account preferences and external connections.",
  };

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
