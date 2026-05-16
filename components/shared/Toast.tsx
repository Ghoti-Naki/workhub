"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/types";

type ToastTone = "success" | "error" | "info";

interface ToastOptions {
  tone?: ToastTone;
  onUndo?: () => void;
}

interface ToastItem {
  id: string;
  message: string;
  tone: ToastTone;
  onUndo?: () => void;
  expiresAt: number;
}

interface ToastContextValue {
  toast: (message: string, toneOrOptions?: ToastTone | ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

const ICONS: Record<ToastTone, React.ElementType> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

const STYLES: Record<ToastTone, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  error: "border-rose-200 bg-rose-50 text-rose-900",
  info: "border-slate-200 bg-white text-slate-900",
};

const ICON_STYLES: Record<ToastTone, string> = {
  success: "text-emerald-600",
  error: "text-rose-600",
  info: "text-slate-500",
};

function UndoBar({ expiresAt }: { expiresAt: number }) {
  const [remaining, setRemaining] = useState(Math.ceil((expiresAt - Date.now()) / 1000));

  useEffect(() => {
    const interval = setInterval(() => {
      const r = Math.ceil((expiresAt - Date.now()) / 1000);
      setRemaining(r);
      if (r <= 0) clearInterval(interval);
    }, 250);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const pct = Math.max(0, ((expiresAt - Date.now()) / 5000) * 100);

  return (
    <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-black/10">
      <div
        className="h-full rounded-full bg-emerald-600 transition-none"
        style={{ width: `${pct}%` }}
        aria-hidden="true"
      />
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const scheduleRemove = useCallback((id: string, delay: number) => {
    const t = setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), delay);
    timers.current.set(id, t);
  }, []);

  const toast = useCallback((message: string, toneOrOptions?: ToastTone | ToastOptions) => {
    const opts: ToastOptions = typeof toneOrOptions === "string"
      ? { tone: toneOrOptions }
      : (toneOrOptions ?? {});
    const tone = opts.tone ?? "success";
    const hasUndo = !!opts.onUndo;
    const delay = hasUndo ? 5000 : 3500;

    const id = Math.random().toString(36).slice(2);
    const expiresAt = Date.now() + delay;
    setToasts((prev) => [...prev, { id, message, tone, onUndo: opts.onUndo, expiresAt }]);
    scheduleRemove(id, delay);
  }, [scheduleRemove]);

  function dismiss(id: string) {
    const t = timers.current.get(id);
    if (t) { clearTimeout(t); timers.current.delete(id); }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  function handleUndo(id: string, onUndo: () => void) {
    dismiss(id);
    onUndo();
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed bottom-20 left-0 right-0 z-50 flex flex-col items-center gap-2 px-4 lg:bottom-6 lg:items-end lg:pr-6"
      >
        {toasts.map((t) => {
          const Icon = ICONS[t.tone];
          return (
            <div
              key={t.id}
              role="status"
              className={cn(
                "pointer-events-auto flex w-full max-w-sm flex-col rounded-2xl border px-4 py-3 shadow-lg transition-all",
                STYLES[t.tone],
              )}
            >
              <div className="flex items-start gap-3">
                <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", ICON_STYLES[t.tone])} aria-hidden="true" />
                <p className="flex-1 text-sm font-medium">{t.message}</p>
                {t.onUndo && (
                  <button
                    onClick={() => handleUndo(t.id, t.onUndo!)}
                    className="shrink-0 rounded-lg border border-current px-2 py-0.5 text-xs font-semibold opacity-80 hover:opacity-100"
                  >
                    Undo
                  </button>
                )}
                <button
                  onClick={() => dismiss(t.id)}
                  aria-label="Dismiss notification"
                  className="shrink-0 rounded-lg p-0.5 opacity-60 hover:opacity-100"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              {t.onUndo && <UndoBar expiresAt={t.expiresAt} />}
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
