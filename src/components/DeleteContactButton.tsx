"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" x2="10" y1="11" y2="17" />
      <line x1="14" x2="14" y1="11" y2="17" />
    </svg>
  );
}

type Props = {
  email: string;
  label: string;
  className?: string;
};

export default function DeleteContactButton({ email, label, className = "" }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const close = useCallback(() => {
    if (!loading) {
      setOpen(false);
      setError("");
    }
  }, [loading]);

  async function handleDelete() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/contacts/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Delete failed");
        return;
      }
      setOpen(false);
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex items-center justify-center gap-1.5 rounded-lg bg-red-700 px-3 py-2 text-xs font-semibold text-white shadow-sm ring-2 ring-red-900/40 ring-inset hover:bg-red-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 active:bg-red-900 dark:bg-red-600 dark:text-white dark:ring-red-950/80 dark:hover:bg-red-500 dark:active:bg-red-700 min-h-[38px] min-w-[88px] ${className}`}
        aria-label={`Delete contact ${label}`}
      >
        <TrashIcon className="shrink-0 opacity-95" />
        Delete
      </button>

      {open && (
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
            aria-labelledby="delete-dialog-title"
            className="relative z-10 w-full max-w-md rounded-xl border-2 border-slate-300 bg-white p-6 shadow-xl dark:border-slate-600 dark:bg-slate-900"
          >
            <h3 id="delete-dialog-title" className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              Delete this contact?
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              You are about to permanently remove{" "}
              <strong className="text-slate-900 dark:text-slate-100">{label}</strong> (
              <span className="break-all">{email}</span>). This cannot be undone.
            </p>
            {error && (
              <p className="mt-3 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm font-medium text-red-900 dark:border-red-800 dark:bg-red-950/80 dark:text-red-100">
                {error}
              </p>
            )}
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
                onClick={handleDelete}
                disabled={loading}
                className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-lg bg-red-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm ring-2 ring-red-900/35 ring-inset hover:bg-red-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:opacity-50 dark:bg-red-600 dark:text-white dark:ring-red-950 dark:hover:bg-red-500"
              >
                {loading ? "Deleting…" : "Yes, delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
