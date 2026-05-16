// Shared TypeScript interfaces and type aliases for AI Work Hub

export type PageId =
  | "home"
  | "inbox"
  | "projects"
  | "tasks"
  | "calendar"
  | "notes"
  | "files"
  | "copilot"
  | "analytics"
  | "settings";

export type ProjectPriority = "low" | "medium" | "high" | "urgent";
export type ProjectStatus = "active" | "paused" | "completed" | "archived" | "on_hold";
export type TaskStatus = "todo" | "in_progress" | "done" | "blocked";
export type InboxStatus = "new" | "reviewed" | "converted" | "archived";
export type InboxSource = "gmail" | "manual" | "calendar";
export type EventSource = "manual" | "google_calendar";
export type BadgeTone = "default" | "high" | "urgent" | "success" | "info";
export type ConvertTargetType = "task" | "note";

export interface ApiResponse<T> {
  data: T;
  meta: Record<string, unknown>;
  error: { code: string; message: string } | null;
}

export interface DashboardData {
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

export interface FileRecord {
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

export interface Project {
  id: string;
  title: string;
  goal: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  dueDate: string;
  progress: number;
}

export interface ProjectContextData {
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

export interface AiOutput {
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

export interface SuggestedTask {
  title: string;
  description?: string;
  priority: "low" | "medium" | "high" | "urgent";
}

export interface AiExtraction {
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

export type RecurrenceInterval = "daily" | "weekly" | "monthly";

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  projectId: string;
  priority: ProjectPriority;
  status: TaskStatus;
  dueDate: string;
  recurrence?: RecurrenceInterval | null;
  createdAt: string;
  updatedAt: string;
}

export interface CopilotSource {
  type: string;
  id: string;
  title: string;
}

export interface CopilotOutput extends AiOutput {
  metadata?: {
    sources?: CopilotSource[];
    [key: string]: unknown;
  } | null;
}

export interface WorkspaceSettings {
  id: string;
  workspaceName: string;
  timezone: string;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AutomationRun {
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

export interface InboxItem {
  id: string;
  source: InboxSource;
  title: string;
  content: string;
  status: InboxStatus;
  suggestion: string;
  createdAt?: string;
  externalId?: string | null;
}

export interface Note {
  id: string;
  title: string;
  projectId: string;
  updatedAt: string;
  body: string;
}

export interface WorkspaceEvent {
  id: string;
  title: string;
  time: string;
  source: EventSource;
  startsAt?: string | null;
  endsAt?: string | null;
  description?: string | null;
  location?: string | null;
}

export interface NavItem {
  id: PageId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface BadgeProps {
  children: React.ReactNode;
  tone?: BadgeTone;
}

export interface SectionCardProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export interface SearchResult {
  type: "project" | "task" | "note" | "inbox" | "file";
  id: string;
  title: string;
  subtitle: string;
  snippet?: string;
  score: number;
}

export interface AppHeaderProps {
  title: string;
  subtitle?: string;
  onQuickAdd: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchResults: SearchResult[];
  onSearchResultClick: (result: SearchResult) => void;
  searchInputRef?: React.RefObject<HTMLInputElement | null>;
}

export interface SidebarProps {
  page: PageId;
  setPage: (page: PageId) => void;
  badges?: Partial<Record<PageId, number>>;
}

export interface HomePageProps {
  tasks: Task[];
  projects: Project[];
  inboxItems: InboxItem[];
  events: WorkspaceEvent[];
  dashboard: DashboardData | null;
  dailyBrief: AiOutput | null;
  loadingDailyBrief: boolean;
  dailyBriefError?: string | null;
  onGenerateDailyBrief: () => void;
  onCompleteTask: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  onOpenPage: (page: PageId) => void;
  onOpenProject: (projectId: string) => void;
}

export interface InboxPageProps {
  inboxItems: InboxItem[];
  onConvertInbox: (inboxId: string, targetType: ConvertTargetType) => void;
  onArchiveInbox: (inboxId: string) => void;
  onDeleteInbox: (inboxId: string) => Promise<void>;
  hasMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
}

export interface ProjectsPageProps {
  projects: Project[];
  tasks: Task[];
  notes: Note[];
  onDeleteProject: (id: string) => Promise<void>;
}

export interface TasksPageProps {
  tasks: Task[];
  projects: Project[];
  loading?: boolean;
  hasMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
  onCompleteTask: (taskId: string) => void;
  onCycleStatus: (taskId: string, currentStatus: string) => void;
  onCreateTask: () => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void | Promise<void>;
}

export interface NotesPageProps {
  notes: Note[];
  projects: Project[];
  onDeleteNote: (noteId: string) => Promise<void>;
}

export interface CalendarPageProps {
  events: WorkspaceEvent[];
  onCreateEvent: () => void;
  onEditEvent: (event: WorkspaceEvent) => void;
  onDeleteEvent: (eventId: string) => Promise<void>;
}

// Utility: class name joiner
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
