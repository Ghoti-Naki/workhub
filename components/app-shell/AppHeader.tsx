"use client";

import React from "react";
import { Plus, Search } from "lucide-react";
import type { AppHeaderProps } from "@/lib/types";

export function AppHeader({
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
            <Search className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
            <input
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search workspace"
              aria-label="Search workspace"
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
          <Plus className="h-4 w-4" aria-hidden="true" />
          Quick Capture
        </button>
      </div>
    </div>
  );
}
