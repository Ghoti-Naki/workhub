"use client";

import React, { useMemo } from "react";
import { Calendar } from "lucide-react";
import { SectionCard } from "@/components/shared/SectionCard";
import { EmptyState } from "@/components/shared/EmptyState";
import type { CalendarPageProps, WorkspaceEvent } from "@/lib/types";

function formatDateHeading(dateStr: string): string {
  const d = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (sameDay(d, today)) return "Today";
  if (sameDay(d, tomorrow)) return "Tomorrow";
  return d.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
}

export function CalendarPage({ events, onCreateEvent, onEditEvent, onDeleteEvent }: CalendarPageProps) {
  const grouped = useMemo(() => {
    const sorted = [...events].sort((a, b) => {
      const aTime = a.startsAt ? new Date(a.startsAt).getTime() : Infinity;
      const bTime = b.startsAt ? new Date(b.startsAt).getTime() : Infinity;
      return aTime - bTime;
    });

    const groups: { heading: string; events: WorkspaceEvent[] }[] = [];
    const seen = new Map<string, number>();

    for (const event of sorted) {
      const key = event.startsAt
        ? new Date(event.startsAt).toDateString()
        : "No date";
      const heading = event.startsAt ? formatDateHeading(event.startsAt) : "No date";

      if (seen.has(key)) {
        groups[seen.get(key)!].events.push(event);
      } else {
        seen.set(key, groups.length);
        groups.push({ heading, events: [event] });
      }
    }
    return groups;
  }, [events]);

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
      {events.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No events yet"
          description="Add events manually or sync your Google Calendar via n8n automation."
          action={{ label: "+ New Event", onClick: onCreateEvent }}
        />
      ) : (
        <div className="space-y-6">
          {grouped.map(({ heading, events: groupEvents }) => (
            <div key={heading}>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                {heading}
              </p>
              <div className="space-y-3">
                {groupEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 p-4"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Calendar className="h-4 w-4 shrink-0" />
                        <span>{event.time}</span>
                      </div>
                      <p className="mt-2 font-medium text-slate-900">{event.title}</p>
                      {event.location ? (
                        <p className="mt-1 text-xs text-slate-500">{event.location}</p>
                      ) : null}
                      {event.description ? (
                        <p className="mt-1 text-sm text-slate-600">{event.description}</p>
                      ) : null}
                      <p className="mt-1 text-xs text-slate-400">Source: {event.source}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        onClick={() => onEditEvent(event)}
                        className="rounded-xl border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDeleteEvent(event.id)}
                        className="rounded-xl border border-rose-200 px-3 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}
