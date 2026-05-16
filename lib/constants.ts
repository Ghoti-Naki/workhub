// Shared constants for AI Work Hub

import type { Project, Task, InboxItem, Note, WorkspaceEvent, NavItem, PageId } from "@/lib/types";
import {
  Calendar,
  CheckCircle2,
  FileText,
  FolderKanban,
  Home,
  Inbox,
  Settings,
  Sparkles,
  StickyNote,
} from "lucide-react";

export const initialProjects: Project[] = [
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

export const initialTasks: Task[] = [
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

export const initialInbox: InboxItem[] = [
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

export const initialNotes: Note[] = [
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

export const initialEvents: WorkspaceEvent[] = [
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

export const navItems: NavItem[] = [
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

export const subtitle: Record<PageId, string> = {
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
