"use client";

import type { Contact } from "@/lib/supabase";
import { partsToUtcIso, utcIsoToParts } from "@/lib/callDate";
import { COMMON_TIMEZONES } from "@/lib/timezones";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type Props = {
  contact: Contact;
  compact?: boolean;
};

export default function ContactScheduleFields({ contact, compact }: Props) {
  const router = useRouter();
  const email = contact.email;

  const [timeZone, setTimeZone] = useState("UTC");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const parts = utcIsoToParts(contact.call_date, timeZone);
    setDate(parts.date);
    setTime(parts.time);
  }, [contact.email, contact.call_date, timeZone]);

  const saveCallDate = useCallback(async () => {
    setError("");
    const iso = partsToUtcIso(date, time, timeZone);
    if (!iso) {
      setError("Enter a valid date and time");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/contacts/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, call_date: iso }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Save failed");
        return;
      }
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setSaving(false);
    }
  }, [date, email, router, time, timeZone]);

  const clearCallDate = useCallback(async () => {
    setError("");
    setSaving(true);
    try {
      const res = await fetch("/api/contacts/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, call_date: null }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Clear failed");
        return;
      }
      setDate("");
      setTime("");
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setSaving(false);
    }
  }, [email, router]);

  const tzOptions = (() => {
    const set = new Set(COMMON_TIMEZONES);
    if (typeof Intl !== "undefined") {
      const local = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (local) set.add(local);
    }
    set.add(timeZone);
    return [...set].sort((a, b) => a.localeCompare(b));
  })();

  const wrap = compact ? "flex flex-col gap-2" : "flex flex-col gap-2 min-w-[200px]";

  return (
    <div className={wrap}>
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
          call_date
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-2 py-1.5 rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-xs max-w-[9.5rem] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
          />
          <input
            type="time"
            step={60}
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="px-2 py-1.5 rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-xs max-w-[7rem] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
          />
        </div>
        <select
          value={timeZone}
          onChange={(e) => setTimeZone(e.target.value)}
          aria-label="Timezone"
          className="w-full max-w-[min(100%,14rem)] px-2 py-1.5 rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
        >
          {tzOptions.map((z) => (
            <option key={z} value={z}>
              {z}
            </option>
          ))}
        </select>
        <div className="flex flex-wrap gap-1.5 mt-0.5">
          <button
            type="button"
            onClick={saveCallDate}
            disabled={saving}
            className="px-2.5 py-1 rounded-md bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-medium"
          >
            {saving ? "…" : "Save date"}
          </button>
          {contact.call_date ? (
            <button
              type="button"
              onClick={clearCallDate}
              disabled={saving}
              className="px-2.5 py-1 rounded-md border border-slate-300 dark:border-slate-500 text-slate-700 dark:text-slate-200 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
            >
              Clear
            </button>
          ) : null}
        </div>
      </div>

      {error ? (
        <p className="text-xs text-red-600 dark:text-red-400 max-w-[14rem]">{error}</p>
      ) : null}
    </div>
  );
}
