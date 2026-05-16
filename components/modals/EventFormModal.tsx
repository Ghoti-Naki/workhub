"use client";

import React, { useEffect, useState } from "react";
import { ModalShell } from "@/components/modals/ModalShell";
import { cn } from "@/lib/types";
import { inputCls, inputErrorCls, labelCls } from "@/components/shared/styles";
import type { WorkspaceEvent } from "@/lib/types";

type Errors = {
  title?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  saveError?: string;
};

function toLocalDateStr(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-CA"); // YYYY-MM-DD
}

function toLocalTimeStr(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toTimeString().slice(0, 5); // HH:MM
}

export function EventFormModal({
  open,
  editing,
  onClose,
  onSaved,
}: {
  open: boolean;
  editing?: WorkspaceEvent | null;
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
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    if (open) {
      setTitle(editing?.title ?? "");
      setDate(toLocalDateStr(editing?.startsAt));
      setStartTime(toLocalTimeStr(editing?.startsAt));
      setEndTime(toLocalTimeStr(editing?.endsAt));
      setDescription(editing?.description ?? "");
      setLocation(editing?.location ?? "");
      setErrors({});
    }
  }, [open, editing]);

  function validate(): boolean {
    const errs: Errors = {};
    if (!title.trim()) errs.title = "Title is required.";
    if (!date) errs.date = "Date is required.";
    if (!startTime) errs.startTime = "Start time is required.";
    if (!endTime) {
      errs.endTime = "End time is required.";
    } else if (startTime && endTime <= startTime) {
      errs.endTime = "End time must be after start time.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    const startsAt = new Date(`${date}T${startTime}`).toISOString();
    const endsAt = new Date(`${date}T${endTime}`).toISOString();
    setSaving(true);
    setErrors({});
    try {
      const url = editing ? `/api/events/${editing.id}` : "/api/events";
      const method = editing ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
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
      setErrors({ saveError: "Failed to save event. Please try again." });
    } finally {
      setSaving(false);
    }
  }

  const isEdit = !!editing;

  return (
    <ModalShell title={isEdit ? "Edit Event" : "New Event"} open={open} onClose={onClose}>
      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <label className={labelCls}>Title *</label>
          <input
            value={title}
            onChange={(e) => { setTitle(e.target.value); setErrors((p) => ({ ...p, title: undefined })); }}
            className={errors.title ? inputErrorCls : inputCls}
            placeholder="Event title"
            aria-describedby={errors.title ? "ev-title-error" : undefined}
          />
          {errors.title ? <p id="ev-title-error" role="alert" className="mt-1 text-xs text-rose-600">{errors.title}</p> : null}
        </div>
        <div>
          <label className={labelCls}>Date *</label>
          <input
            type="date"
            value={date}
            onChange={(e) => { setDate(e.target.value); setErrors((p) => ({ ...p, date: undefined })); }}
            className={errors.date ? inputErrorCls : inputCls}
            aria-describedby={errors.date ? "ev-date-error" : undefined}
          />
          {errors.date ? <p id="ev-date-error" role="alert" className="mt-1 text-xs text-rose-600">{errors.date}</p> : null}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Start Time *</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => { setStartTime(e.target.value); setErrors((p) => ({ ...p, startTime: undefined, endTime: undefined })); }}
              className={errors.startTime ? inputErrorCls : inputCls}
              aria-describedby={errors.startTime ? "ev-start-error" : undefined}
            />
            {errors.startTime ? <p id="ev-start-error" role="alert" className="mt-1 text-xs text-rose-600">{errors.startTime}</p> : null}
          </div>
          <div>
            <label className={labelCls}>End Time *</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => { setEndTime(e.target.value); setErrors((p) => ({ ...p, endTime: undefined })); }}
              className={errors.endTime ? inputErrorCls : inputCls}
              aria-describedby={errors.endTime ? "ev-end-error" : undefined}
            />
            {errors.endTime ? <p id="ev-end-error" role="alert" className="mt-1 text-xs text-rose-600">{errors.endTime}</p> : null}
          </div>
        </div>
        <div>
          <label className={labelCls}>Location</label>
          <input value={location} onChange={(e) => setLocation(e.target.value)} className={inputCls} placeholder="Optional location" />
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
        {errors.saveError ? <p role="alert" className="text-sm text-rose-600">{errors.saveError}</p> : null}
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
            {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Event"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
