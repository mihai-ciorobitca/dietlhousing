"use client";

import type { Contact } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

type Props = {
  contact: Contact;
  label?: string;
  className?: string;
};

export default function SendN8nButton({
  contact,
  label = "Send to n8n",
  className = "",
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState<"none" | "missing" | "confirm" | "error">("none");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const close = useCallback(() => {
    if (!loading) {
      setOpen("none");
      setErrorMsg("");
    }
  }, [loading]);

  const onClick = useCallback(() => {
    const hasMeeting =
      contact.call_meeting_type != null &&
      String(contact.call_meeting_type).trim() !== "";
    const hasDate =
      contact.call_date != null && String(contact.call_date).trim() !== "";
    const hasWa =
      contact.whatsapp_phone_number != null &&
      String(contact.whatsapp_phone_number).trim() !== "";

    if (!hasMeeting || !hasDate) {
      setOpen("missing");
      return;
    }
    if (!hasWa) {
      setErrorMsg("This contact has no WhatsApp number.");
      setOpen("error");
      return;
    }
    setOpen("confirm");
  }, [contact]);

  const send = useCallback(async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/contacts/n8n-webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: contact.email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(typeof data.error === "string" ? data.error : "Request failed");
        setOpen("error");
        return;
      }
      setOpen("none");
      router.refresh();
    } catch {
      setErrorMsg("Something went wrong");
      setOpen("error");
    } finally {
      setLoading(false);
    }
  }, [contact.email, router]);

  const title = `${contact.first_name} ${contact.last_name}`.trim() || contact.email;

  return (
    <>
      <button
        type="button"
        onClick={onClick}
        className={`inline-flex items-center justify-center gap-1 rounded-lg border-2 border-emerald-600 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-900 hover:bg-emerald-100 dark:border-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-100 dark:hover:bg-emerald-900/50 min-h-[38px] ${className}`}
        aria-label={`Send ${title} to n8n`}
      >
        {label}
      </button>

      {open === "missing" && (
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
            aria-labelledby="n8n-missing-title"
            className="relative z-10 w-full max-w-md rounded-xl border-2 border-slate-300 bg-white p-6 shadow-xl dark:border-slate-600 dark:bg-slate-900"
          >
            <h3
              id="n8n-missing-title"
              className="text-lg font-semibold text-slate-900 dark:text-slate-50"
            >
              Cannot send yet
            </h3>
            <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">
              Set both <strong className="text-slate-900 dark:text-slate-100">call_meeting_type</strong>{" "}
              and <strong className="text-slate-900 dark:text-slate-100">call_date</strong> before sending
              to n8n.
            </p>
            <ul className="mt-2 list-disc pl-5 text-sm text-slate-600 dark:text-slate-400">
              <li className={contact.call_meeting_type ? "line-through opacity-60" : ""}>
                Meeting type
                {contact.call_meeting_type
                  ? ` (${contact.call_meeting_type})`
                  : " — missing"}
              </li>
              <li className={contact.call_date ? "line-through opacity-60" : ""}>
                Call date
                {contact.call_date ? " — set" : " — missing"}
              </li>
            </ul>
            <button
              type="button"
              onClick={close}
              className="mt-6 w-full rounded-lg border-2 border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 dark:border-slate-500 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {open === "confirm" && (
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
            aria-labelledby="n8n-confirm-title"
            className="relative z-10 w-full max-w-md rounded-xl border-2 border-slate-300 bg-white p-6 shadow-xl dark:border-slate-600 dark:bg-slate-900"
          >
            <h3
              id="n8n-confirm-title"
              className="text-lg font-semibold text-slate-900 dark:text-slate-50"
            >
              Send to n8n?
            </h3>
            <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">
              This will POST the WhatsApp number and related fields to your n8n workflow for{" "}
              <strong className="text-slate-900 dark:text-slate-100">{title}</strong>.
            </p>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 break-all">
              {contact.whatsapp_phone_number}
            </p>
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={close}
                disabled={loading}
                className="rounded-lg border-2 border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-500 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={send}
                disabled={loading}
                className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 dark:bg-emerald-600 dark:hover:bg-emerald-500"
              >
                {loading ? "Sending…" : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}

      {open === "error" && (
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
            className="relative z-10 w-full max-w-md rounded-xl border-2 border-red-300 bg-white p-6 shadow-xl dark:border-red-800 dark:bg-slate-900"
          >
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Error</h3>
            <p className="mt-3 text-sm text-red-800 dark:text-red-200">{errorMsg}</p>
            <button
              type="button"
              onClick={close}
              className="mt-6 w-full rounded-lg border-2 border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 dark:border-slate-500 dark:bg-slate-800 dark:text-slate-100"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </>
  );
}
