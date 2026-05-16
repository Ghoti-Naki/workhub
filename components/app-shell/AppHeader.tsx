"use client";

import React from "react";
import { Plus, Search, X } from "lucide-react";
import type { AppHeaderProps } from "@/lib/types";

export function AppHeader({
  title,
  subtitle,
  onQuickAdd,
  searchQuery,
  onSearchChange,
  searchResults,
  onSearchResultClick,
  searchInputRef,
}: AppHeaderProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-slate-200 bg-white px-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-6 lg:py-5">
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
              ref={searchInputRef}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search workspace  /"
              aria-label="Search workspace"
              className="min-w-0 w-full bg-transparent text-slate-700 outline-none placeholder:text-slate-400 sm:w-48"
            />
            {searchQuery ? (
              <button
                onClick={() => onSearchChange("")}
                aria-label="Clear search"
                className="shrink-0 rounded-lg p-0.5 text-slate-400 hover:text-slate-700"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            ) : null}
          </div>
          {searchQuery.trim().length >= 2 ? (
            <div className="absolute left-0 right-0 top-full z-40 mt-1 max-h-80 overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-lg">
              {searchResults.length > 0 ? (
                searchResults.map((result) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => onSearchResultClick(result)}
                    className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-slate-50"
                  >
                    <span className="mt-0.5 shrink-0 rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500">
                      {result.type}
                    </span>
                    <div className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-slate-900">{result.title}</span>
                      {result.snippet ? (
                        <span className="mt-0.5 block truncate text-xs text-slate-500">{result.snippet}</span>
                      ) : (
                        <span className="mt-0.5 block text-xs text-slate-400">{result.subtitle}</span>
                      )}
                    </div>
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
