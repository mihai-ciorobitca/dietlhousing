"use client";

import type { Contact } from "@/lib/supabase";
import {
  formatCallDateLondon,
  LONDON_TIMEZONE,
  partsToLondonSqlTimestamp,
  storedCallDateToParts,
} from "@/lib/callDate";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

const MEETING_TYPES = ["meeting", "whatsapp"] as const;

type Props = {
  contact: Contact;
  /** Wider button on cards */
  fullWidth?: boolean;
};

type Phase = "closed" | "form" | "confirm";

export default function BookingButton({ contact, fullWidth }: Props) {
  const router = useRouter();
  const email = contact.email;
  const title = `${contact.first_name} ${contact.last_name}`.trim() || contact.email;

  const [phase, setPhase] = useState<Phase>("closed");
  const [meetingType, setMeetingType] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  /** Only load contact into the form when opening from closed (not when Back from confirm). */
  const formInitialized = useRef(false);

  useEffect(() => {
    if (phase === "closed") {
      formInitialized.current = false;
      return;
    }
    if (phase !== "form") return;
    if (formInitialized.current) return;
    formInitialized.current = true;
    setMeetingType(contact.meeting_type ?? "");
    const parts = storedCallDateToParts(contact.call_date, LONDON_TIMEZONE);
    setDate(parts.date);
    setTime(parts.time);
    setError("");
  }, [phase, contact.email, contact.call_date, contact.meeting_type]);

  useEffect(() => {
    if (phase !== "form" && phase !== "confirm") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) {
        if (phase === "confirm") setPhase("form");
        else setPhase("closed");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, loading]);

  const close = useCallback(() => {
    if (!loading) {
      setPhase("closed");
      setError("");
    }
  }, [loading]);

  const onSendClick = useCallback(async () => {
    setError("");
    if (!meetingType.trim()) {
      setError("Select a meeting type.");
      return;
    }
    const sql = partsToLondonSqlTimestamp(date, time, LONDON_TIMEZONE);
    if (!sql) {
      setError("Enter a valid date and time.");
      return;
    }
    if (!contact.whatsapp_number || !String(contact.whatsapp_number).trim()) {
      setError("This contact has no WhatsApp number.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/contacts/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          meeting_type: meetingType.trim(),
          call_date: sql,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Could not save to Supabase");
        return;
      }
      await router.refresh();
      setPhase("confirm");
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [contact.whatsapp_number, date, email, meetingType, router, time]);

  const onConfirmSend = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/contacts/n8n-webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Request failed");
        return;
      }
      setPhase("closed");
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [email, router]);

  const summaryBits = [
    contact.meeting_type?.trim() || null,
    contact.call_date ? formatCallDateLondon(contact.call_date) : null,
  ].filter(Boolean) as string[];

  return (
    <>
      <div className="flex flex-col gap-1.5 items-start max-w-[14rem]">
        {summaryBits.length > 0 ? (
          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug line-clamp-2">
            {summaryBits.join(" · ")}
          </p>
        ) : null}
        <button
          type="button"
          onClick={() => setPhase("form")}
          className={
            fullWidth
              ? "w-full px-3 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shadow-sm"
              : "inline-flex px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shadow-sm"
          }
          aria-label={`Open booking for ${title}`}
        >
          Booking
        </button>
      </div>

      {(phase === "form" || phase === "confirm") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/65"
            aria-label="Close dialog"
            onClick={close}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-title"
            className="relative z-10 w-full max-w-md max-h-[90vh] overflow-y-auto rounded-xl border-2 border-slate-300 bg-white p-6 shadow-xl dark:border-slate-600 dark:bg-slate-900"
          >
            {phase === "form" ? (
              <>
                <h3
                  id="booking-title"
                  className="text-lg font-semibold text-slate-900 dark:text-slate-50"
                >
                  Booking — {title}
                </h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Choose meeting type and call date (times are{" "}
                  <strong className="text-slate-600 dark:text-slate-300">London, UK</strong>
                  , {LONDON_TIMEZONE}), then send to your n8n workflow.
                </p>

                <div className="mt-4 space-y-3">
                  <label className="block">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                      Meeting type
                    </span>
                    <select
                      value={meetingType}
                      onChange={(e) => setMeetingType(e.target.value)}
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm"
                    >
                      <option value="">Select…</option>
                      {contact.meeting_type &&
                      !MEETING_TYPES.includes(
                        contact.meeting_type as (typeof MEETING_TYPES)[number]
                      ) ? (
                        <option value={contact.meeting_type}>{contact.meeting_type}</option>
                      ) : null}
                      {MEETING_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div>
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                      Call date &amp; time ({LONDON_TIMEZONE})
                    </span>
                    <div className="mt-1 flex flex-wrap gap-2">
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm max-w-[11rem]"
                      />
                      <input
                        type="time"
                        step={60}
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm max-w-[8rem]"
                      />
                    </div>
                  </div>
                </div>

                {error ? (
                  <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>
                ) : null}

                <div className="mt-6 flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    onClick={close}
                    className="rounded-lg border-2 border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 dark:border-slate-500 dark:text-slate-100 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={onSendClick}
                    disabled={loading}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? "Saving…" : "Send"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3
                  id="booking-confirm-title"
                  className="text-lg font-semibold text-slate-900 dark:text-slate-50"
                >
                  Confirm booking
                </h3>
                <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">
                  You are about to save this booking and send it to your n8n workflow using the
                  WhatsApp number on file.
                </p>
                <ul className="mt-3 text-sm text-slate-600 dark:text-slate-400 space-y-1 list-disc pl-5">
                  <li>
                    <strong className="text-slate-800 dark:text-slate-200">Meeting:</strong>{" "}
                    {meetingType || "—"}
                  </li>
                  <li>
                    <strong className="text-slate-800 dark:text-slate-200">Call date (London):</strong>{" "}
                    {(() => {
                      const sql = partsToLondonSqlTimestamp(date, time, LONDON_TIMEZONE);
                      return sql ? formatCallDateLondon(sql) : "—";
                    })()}
                  </li>
                  <li className="break-all">
                    <strong className="text-slate-800 dark:text-slate-200">WhatsApp:</strong>{" "}
                    {contact.whatsapp_number}
                  </li>
                </ul>
                <p className="mt-4 text-sm font-medium text-slate-800 dark:text-slate-200">
                  I agree to send this booking to the workflow with the details above.
                </p>

                {error ? (
                  <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>
                ) : null}

                <div className="mt-6 flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setError("");
                      setPhase("form");
                    }}
                    disabled={loading}
                    className="rounded-lg border-2 border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-500 dark:text-slate-100 dark:hover:bg-slate-800"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={onConfirmSend}
                    disabled={loading}
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {loading ? "Sending…" : "I agree — send"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
