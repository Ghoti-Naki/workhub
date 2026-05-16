"use client";

import React from "react";
import { AnnouncerProvider } from "@/components/shared/Announcer";

export function Providers({ children }: { children: React.ReactNode }) {
  return <AnnouncerProvider>{children}</AnnouncerProvider>;
}
