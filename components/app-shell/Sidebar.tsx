"use client";

import React from "react";
import { LayoutGrid, User } from "lucide-react";
import { cn } from "@/lib/types";
import type { SidebarProps } from "@/lib/types";
import { navItems } from "@/lib/constants";

export function Sidebar({ page, setPage }: SidebarProps) {
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
