"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";

interface AIErrorCalloutProps {
  message?: string | null;
}

export function AIErrorCallout({ message }: AIErrorCalloutProps) {
  if (!message) return null;

  return (
    <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" aria-hidden="true" />
      <p className="text-sm text-amber-800">{message}</p>
    </div>
  );
}
