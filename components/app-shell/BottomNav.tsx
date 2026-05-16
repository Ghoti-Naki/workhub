"use client";

import React from "react";
import { Home, Inbox, FolderKanban, CheckCircle2, Sparkles } from "lucide-react";
import { cn } from "@/lib/types";
import type { PageId } from "@/lib/types";

const BOTTOM_NAV_ITEMS: { id: PageId; label: string; icon: React.ElementType }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "inbox", label: "Inbox", icon: Inbox },
  { id: "projects", label: "Projects", icon: FolderKanban },
  { id: "tasks", label: "Tasks", icon: CheckCircle2 },
  { id: "copilot", label: "Copilot", icon: Sparkles },
];

export function BottomNav({
  page,
  setPage,
  badges = {},
}: {
  page: PageId;
  setPage: (p: PageId) => void;
  badges?: Partial<Record<PageId, number>>;
}) {
  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-30 border-t border-slate-200 bg-white pb-safe lg:hidden"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around px-2 py-2">
        {BOTTOM_NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const active = page === id;
          const count = badges[id];
          return (
            <button
              key={id}
              onClick={() => setPage(id)}
              aria-label={count ? `${label} (${count})` : label}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 rounded-xl py-2 text-xs font-medium transition",
                active ? "text-slate-900" : "text-slate-400 hover:text-slate-600",
              )}
            >
              <div className="relative">
                <Icon className={cn("h-5 w-5", active && "text-slate-900")} aria-hidden="true" />
                {active && (
                  <span className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-slate-900" />
                )}
                {count ? (
                  <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-0.5 text-[10px] font-bold text-white">
                    {count > 99 ? "99+" : count}
                  </span>
                ) : null}
              </div>
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
