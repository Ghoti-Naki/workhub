"use client";

import React from "react";
import { cn } from "@/lib/types";

interface FilterOption {
  value: string;
  label: string;
}

interface SelectControl {
  key: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
}

interface FilterBarProps {
  filters: {
    key: string;
    label: string;
    options: FilterOption[];
    value: string;
    onChange: (value: string) => void;
  }[];
  selects?: SelectControl[];
  resultCount: number;
  totalCount: number;
}

export function FilterBar({ filters, selects, resultCount, totalCount }: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      {filters.map((filter) => (
        <div key={filter.key} className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500">{filter.label}:</span>
          <div className="flex gap-1">
            {filter.options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => filter.onChange(opt.value)}
                className={cn(
                  "rounded-xl px-3 py-1 text-xs font-medium transition",
                  filter.value === opt.value
                    ? "bg-slate-900 text-white"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100",
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      ))}
      {selects?.map((sel) => (
        <div key={sel.key} className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500">{sel.label}:</span>
          <select
            value={sel.value}
            onChange={(e) => sel.onChange(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            {sel.options.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      ))}
      {resultCount < totalCount ? (
        <span className="ml-auto text-xs text-slate-400">
          {resultCount} of {totalCount}
        </span>
      ) : (
        <span className="ml-auto text-xs text-slate-400">{totalCount} total</span>
      )}
    </div>
  );
}
