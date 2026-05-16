export function stripMarkdown(text: string, maxLength = 120): string {
  return text
    .replace(/!\[.*?\]\(.*?\)/g, "")   // images
    .replace(/\[([^\]]+)\]\(.*?\)/g, "$1") // links → label
    .replace(/#{1,6}\s+/g, "")         // headings
    .replace(/[*_~`]+/g, "")           // bold/italic/code
    .replace(/^\s*[-*+>]\s+/gm, "")    // list/blockquote markers
    .replace(/\n+/g, " ")              // newlines → space
    .trim()
    .slice(0, maxLength);
}

export interface DueDateInfo {
  label: string;
  isOverdue: boolean;
  isToday: boolean;
  isTomorrow: boolean;
  isEmpty: boolean;
}

export function formatDueDate(dueDate: string | null | undefined): DueDateInfo {
  if (!dueDate) {
    return { label: "", isOverdue: false, isToday: false, isTomorrow: false, isEmpty: true };
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const due = new Date(dueDate);
  // Normalise to midnight local time so time-of-day doesn't affect the diff
  const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  const diffDays = Math.round((dueDay.getTime() - today.getTime()) / 86_400_000);

  const formatted = due.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  if (diffDays === 0) return { label: "Today", isOverdue: false, isToday: true, isTomorrow: false, isEmpty: false };
  if (diffDays === 1) return { label: "Tomorrow", isOverdue: false, isToday: false, isTomorrow: true, isEmpty: false };
  if (diffDays > 1 && diffDays <= 6) return { label: `In ${diffDays} days`, isOverdue: false, isToday: false, isTomorrow: false, isEmpty: false };
  if (diffDays > 6) return { label: formatted, isOverdue: false, isToday: false, isTomorrow: false, isEmpty: false };
  // overdue
  if (diffDays === -1) return { label: "Overdue · Yesterday", isOverdue: true, isToday: false, isTomorrow: false, isEmpty: false };
  return { label: `Overdue · ${formatted}`, isOverdue: true, isToday: false, isTomorrow: false, isEmpty: false };
}
