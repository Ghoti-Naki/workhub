"use client";

// Dynamically imported to avoid SSR issues with @uiw/react-md-editor
import dynamic from "next/dynamic";
import React from "react";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), {
  ssr: false,
  loading: () => (
    <div className="min-h-[180px] animate-pulse rounded-2xl border border-slate-200 bg-slate-50" />
  ),
});

const MDPreview = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default.Markdown as React.ComponentType<{ source?: string; className?: string }>),
  {
    ssr: false,
    loading: () => <div className="animate-pulse rounded-xl bg-slate-50 p-4 text-sm text-slate-400">Loading…</div>,
  },
);

export function MarkdownEditor({
  value,
  onChange,
  minHeight = 200,
}: {
  value: string;
  onChange: (v: string) => void;
  minHeight?: number;
}) {
  return (
    <div data-color-mode="light">
      <MDEditor
        value={value}
        onChange={(v) => onChange(v ?? "")}
        height={minHeight}
        preview="live"
      />
    </div>
  );
}

export function MarkdownPreview({ source, className }: { source: string; className?: string }) {
  return (
    <div data-color-mode="light" className={className}>
      <MDPreview source={source} />
    </div>
  );
}
