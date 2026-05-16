"use client";

import React from "react";
import { ModalShell } from "@/components/modals/ModalShell";

const SHORTCUTS: { keys: string[]; description: string }[] = [
  { keys: ["n"], description: "New task" },
  { keys: ["m"], description: "New note" },
  { keys: ["c"], description: "Quick capture to inbox" },
  { keys: ["/"], description: "Focus search" },
  { keys: ["Esc"], description: "Close modal or clear search" },
  { keys: ["?"], description: "Show this help" },
];

export function ShortcutsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <ModalShell title="Keyboard Shortcuts" open={open} onClose={onClose}>
      <div className="mt-4 space-y-2">
        {SHORTCUTS.map(({ keys, description }) => (
          <div key={description} className="flex items-center justify-between gap-4 rounded-2xl px-3 py-2.5 hover:bg-slate-50">
            <span className="text-sm text-slate-700">{description}</span>
            <div className="flex items-center gap-1">
              {keys.map((k) => (
                <kbd
                  key={k}
                  className="rounded-lg border border-slate-200 bg-slate-100 px-2 py-0.5 font-mono text-xs font-semibold text-slate-700 shadow-sm"
                >
                  {k}
                </kbd>
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-slate-400">
        Shortcuts fire when focus is outside any text input.
      </p>
    </ModalShell>
  );
}
