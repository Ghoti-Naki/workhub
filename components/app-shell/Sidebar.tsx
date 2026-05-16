"use client";

import React, { useState } from "react";
import { LayoutGrid, User, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/types";
import type { SidebarProps } from "@/lib/types";
import { navItems } from "@/lib/constants";

export function Sidebar({ page, setPage, badges = {} }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={cn(
      "hidden shrink-0 border-r border-slate-200 bg-white transition-all duration-200 lg:flex lg:flex-col",
      collapsed ? "w-16" : "w-72",
    )}>
      <div className={cn("border-b border-slate-200 py-6", collapsed ? "px-3" : "px-6")}>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
            <LayoutGrid className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-lg font-semibold text-slate-900">AI Work Hub</p>
              <p className="text-sm text-slate-500">Personal operating system</p>
            </div>
          )}
        </div>
      </div>

      <nav className={cn("flex-1 py-5", collapsed ? "px-2" : "px-4")}>
        <div className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = page === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setPage(item.id)}
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "relative flex w-full items-center rounded-2xl text-left text-sm font-medium transition",
                  collapsed ? "justify-center px-0 py-3" : "gap-3 px-4 py-3",
                  active
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span className="flex-1">{item.label}</span>}
                {!collapsed && badges[item.id] ? (
                  <span className={cn(
                    "rounded-full px-1.5 py-0.5 text-xs font-semibold tabular-nums",
                    active ? "bg-white/20 text-white" : "bg-rose-100 text-rose-700",
                  )}>
                    {badges[item.id]}
                  </span>
                ) : null}
                {collapsed && badges[item.id] ? (
                  <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                    {(badges[item.id] ?? 0) > 9 ? "9+" : badges[item.id]}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </nav>

      <div className={cn("border-t border-slate-200 py-4", collapsed ? "px-2" : "px-4")}>
        <button
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="mb-3 flex w-full items-center justify-center rounded-2xl border border-slate-200 py-2 text-slate-500 hover:bg-slate-50"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          {!collapsed && <span className="ml-2 text-xs font-medium">Collapse</span>}
        </button>

        {!collapsed && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white">
                <User className="h-4 w-4 text-slate-700" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900">Workspace Owner</p>
                <p className="text-xs text-slate-500">Focused build mode</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
