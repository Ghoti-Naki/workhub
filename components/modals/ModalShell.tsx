"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { X } from "lucide-react";

export function ModalShell({
  title,
  open,
  onClose,
  children,
}: {
  title: string;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = `modal-title-${title.replace(/\s+/g, "-").toLowerCase()}`;

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open) {
      if (!el.open) el.showModal();
    } else {
      if (el.open) el.close();
    }
  }, [open]);

  // Close on backdrop click (click lands on <dialog> itself, not its children)
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDialogElement>) => {
      if (e.target === dialogRef.current) onClose();
    },
    [onClose],
  );

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={handleClick}
      aria-labelledby={titleId}
      className="w-full max-w-md bg-white p-6"
    >
      <div className="flex items-center justify-between">
        <h2 id={titleId} className="text-lg font-semibold text-slate-900">
          {title}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="rounded-xl p-1 text-slate-400 hover:bg-slate-100"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
      {children}
    </dialog>
  );
}
