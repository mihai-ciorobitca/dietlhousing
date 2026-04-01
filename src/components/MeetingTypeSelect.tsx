"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

const MEETING_TYPES = ["meeting", "whatsapp"] as const;

type Props = {
  email: string;
  value: string | null;
  className?: string;
};

export default function MeetingTypeSelect({ email, value, className = "" }: Props) {
  const router = useRouter();
  const [error, setError] = useState("");

  const onChange = useCallback(
    async (v: string) => {
      setError("");
      try {
        const res = await fetch("/api/contacts/update", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            call_meeting_type: v === "" ? null : v,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(typeof data.error === "string" ? data.error : "Update failed");
          return;
        }
        router.refresh();
      } catch {
        setError("Something went wrong");
      }
    },
    [email, router]
  );

  return (
    <div className={className}>
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full max-w-[10rem] px-2 py-1.5 rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
        aria-label="Meeting type"
      >
        <option value="">—</option>
        {value && !MEETING_TYPES.includes(value as (typeof MEETING_TYPES)[number]) ? (
          <option value={value}>{value}</option>
        ) : null}
        {MEETING_TYPES.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
      {error ? (
        <p className="text-[10px] text-red-600 dark:text-red-400 mt-0.5">{error}</p>
      ) : null}
    </div>
  );
}
