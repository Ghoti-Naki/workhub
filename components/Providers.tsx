"use client";

import React from "react";
import { AnnouncerProvider } from "@/components/shared/Announcer";
import { ToastProvider } from "@/components/shared/Toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AnnouncerProvider>
      <ToastProvider>{children}</ToastProvider>
    </AnnouncerProvider>
  );
}
