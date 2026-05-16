"use client";

import React, { useEffect, useState } from "react";
import { ModalShell } from "@/components/modals/ModalShell";
import { cn } from "@/lib/types";
import { inputCls, labelCls } from "@/components/shared/styles";

export function EventFormModal({
  open,
  onClose,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setTitle("");
      setDate("");
      setStartTime("");
      setEndTime("");
      setDescription("");
      setLocation("");
      setError(null);
    }
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !date || !startTime || !endTime) {
      setError("Title, date, start time, and end time are required.");
      return;
    }
    const startsAt = new Date(`${date}T${startTime}`).toISOString();
    const endsAt = new Date(`${date}T${endTime}`).toISOString();
    if (endsAt <= startsAt) {
      setError("End time must be after start time.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          location: location.trim() || null,
          sourceType: "manual",
          startsAt,
          endsAt,
        }),
      });
      if (!res.ok) throw new Error();
      onClose();
      onSaved();
    } catch {
      setError("Failed to save event. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalShell title="New Event" open={open} onClose={onClose}>
      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <label className={labelCls}>Title *</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputCls}
            placeholder="Event title"
          />
        </div>
        <div>
          <label className={labelCls}>Date *</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={inputCls}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Start Time *</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>End Time *</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className={inputCls}
            />
          </div>
        </div>
        <div>
          <label className={labelCls}>Location</label>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className={inputCls}
            placeholder="Optional location"
          />
        </div>
        <div>
          <label className={labelCls}>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className={cn(inputCls, "resize-none")}
            placeholder="Optional notes"
          />
        </div>
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {saving ? "Saving..." : "Create Event"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
