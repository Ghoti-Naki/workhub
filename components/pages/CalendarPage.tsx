"use client";

import React from "react";
import { Calendar } from "lucide-react";
import { SectionCard } from "@/components/shared/SectionCard";
import { EmptyState } from "@/components/shared/EmptyState";
import type { CalendarPageProps } from "@/lib/types";

export function CalendarPage({ events, onCreateEvent }: CalendarPageProps) {
  return (
    <SectionCard
      title="Calendar"
      subtitle="Time-based commitments and focus blocks"
      action={
        <button
          onClick={onCreateEvent}
          className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
        >
          + New Event
        </button>
      }
    >
      <div className="space-y-3">
        {events.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No events yet"
            description="Add events manually or sync your Google Calendar via n8n automation."
            action={{ label: "+ New Event", onClick: onCreateEvent }}
          />
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className="rounded-2xl border border-slate-200 p-4"
            >
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Calendar className="h-4 w-4" />
                <span>{event.time}</span>
              </div>
              <p className="mt-2 font-medium text-slate-900">{event.title}</p>
              <p className="mt-1 text-xs text-slate-500">{event.source}</p>
            </div>
          ))
        )}
      </div>
    </SectionCard>
  );
}
