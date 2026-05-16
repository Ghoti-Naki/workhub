"use client";

import React from "react";
import { cn } from "@/lib/types";
import type { BadgeProps, BadgeTone } from "@/lib/types";

export function Badge({ children, tone = "default" }: BadgeProps) {
  const tones: Record<BadgeTone, string> = {
    default: "bg-slate-100 text-slate-700 border-slate-200",
    high: "bg-amber-50 text-amber-800 border-amber-200",
    urgent: "bg-rose-50 text-rose-800 border-rose-200",
    success: "bg-emerald-50 text-emerald-800 border-emerald-200",
    info: "bg-blue-50 text-blue-800 border-blue-200",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}
