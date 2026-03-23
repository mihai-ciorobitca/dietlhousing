"use client";

import type { Contact } from "@/lib/supabase";

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function ContactsCards({ contacts }: { contacts: Contact[] }) {
  if (contacts.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center">
        <p className="text-slate-500 dark:text-slate-400">No contacts found</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {contacts.map((contact) => (
        <div
          key={contact.email}
          className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm"
        >
          <div className="font-semibold text-slate-900 dark:text-slate-100 text-lg">
            {contact.first_name} {contact.last_name}
          </div>
          <a
            href={`mailto:${contact.email}`}
            className="text-blue-600 dark:text-blue-400 text-sm mt-1 block truncate"
          >
            {contact.email}
          </a>
          {(contact.whatsapp_phone_number || contact.phone_number) && (
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
              {contact.whatsapp_phone_number || contact.phone_number}
            </p>
          )}
          <div className="flex flex-col gap-2 mt-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 dark:text-slate-400 min-w-[90px]">Call Status</span>
              {contact.call_status ? (
                <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200">
                  {contact.call_status}
                </span>
              ) : (
                <span className="text-slate-400">—</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500 dark:text-slate-400 min-w-[90px]">Interested</span>
              {contact.interested ? (
                <span
                  className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                    contact.interested === "BOOKED" || contact.interested === "CALL_LATER"
                      ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                      : "bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200"
                  }`}
                >
                  {contact.interested}
                </span>
              ) : (
                <span className="text-slate-400">—</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500 dark:text-slate-400 min-w-[90px]">Meeting Type</span>
              {contact.call_meeting_type ? (
                <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                  {contact.call_meeting_type}
                </span>
              ) : (
                <span className="text-slate-400">—</span>
              )}
            </div>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-3">
            {formatDate(contact.create_date)}
          </p>
          {(contact.call_summary || contact.call_recording) && (
            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
              {contact.call_summary && (
                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                  {contact.call_summary}
                </p>
              )}
              {contact.call_recording && (
                <a
                  href={contact.call_recording}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline mt-1 inline-block"
                >
                  Listen to recording
                </a>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
