"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-red-200 bg-white px-8 py-12 text-center shadow-sm">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-500">
          <AlertTriangle className="h-7 w-7" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <p className="text-lg font-semibold text-slate-900">Something went wrong</p>
          <p className="text-sm text-slate-500">{error.message ?? "An unexpected error occurred."}</p>
        </div>
        <button
          onClick={reset}
          className="rounded-2xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-700"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
