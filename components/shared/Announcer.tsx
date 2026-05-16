"use client";

import React, { createContext, useCallback, useContext, useRef, useState } from "react";

type AnnounceLevel = "polite" | "assertive";

interface AnnouncerContextValue {
  announce: (message: string, level?: AnnounceLevel) => void;
}

const AnnouncerContext = createContext<AnnouncerContextValue>({ announce: () => {} });

export function useAnnounce() {
  return useContext(AnnouncerContext);
}

export function AnnouncerProvider({ children }: { children: React.ReactNode }) {
  const [politeMsg, setPoliteMsg] = useState("");
  const [assertiveMsg, setAssertiveMsg] = useState("");
  const politeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const assertiveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const announce = useCallback((message: string, level: AnnounceLevel = "polite") => {
    if (level === "assertive") {
      if (assertiveTimer.current) clearTimeout(assertiveTimer.current);
      setAssertiveMsg(message);
      assertiveTimer.current = setTimeout(() => setAssertiveMsg(""), 3000);
    } else {
      if (politeTimer.current) clearTimeout(politeTimer.current);
      setPoliteMsg(message);
      politeTimer.current = setTimeout(() => setPoliteMsg(""), 3000);
    }
  }, []);

  return (
    <AnnouncerContext.Provider value={{ announce }}>
      {children}
      <div className="sr-only" aria-live="polite" aria-atomic="true">{politeMsg}</div>
      <div className="sr-only" aria-live="assertive" aria-atomic="true">{assertiveMsg}</div>
    </AnnouncerContext.Provider>
  );
}
