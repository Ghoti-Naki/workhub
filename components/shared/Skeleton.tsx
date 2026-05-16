"use client";

import React from "react";
import { cn } from "@/lib/types";

// Base pulse block
export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse rounded-xl bg-slate-200", className)} />
  );
}

// Mimics a project/task card: title bar + two line bars
export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-slate-200 p-4 space-y-3">
      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-3 w-3/4" />
    </div>
  );
}

// Mimics a dashboard stat widget
export function SkeletonStat() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 space-y-2">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-7 w-10" />
    </div>
  );
}

// Mimics a single list row
export function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4">
      <Skeleton className="h-6 w-6 shrink-0 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
      </div>
      <Skeleton className="h-5 w-16 rounded-full" />
    </div>
  );
}
