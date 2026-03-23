"use client";

import type { Contact } from "@/lib/supabase";

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ContactsTable({ contacts }: { contacts: Contact[] }) {
  if (contacts.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center">
        <p className="text-slate-500 dark:text-slate-400">No contacts found</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                Phone
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                Call Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                Interested
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                Meeting Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                Created
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {contacts.map((contact) => (
              <tr
                key={contact.email}
                className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
              >
                <td className="px-4 py-3">
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {contact.first_name} {contact.last_name}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <a
                    href={`mailto:${contact.email}`}
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {contact.email}
                  </a>
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400 text-sm">
                  {contact.whatsapp_phone_number || contact.phone_number || "—"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      contact.call_status
                        ? "bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200"
                        : "text-slate-400"
                    }`}
                  >
                    {contact.call_status || "—"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {contact.interested ? (
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        contact.interested === "BOOKED" || contact.interested === "CALL_LATER"
                          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                          : "bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200"
                      }`}
                    >
                      {contact.interested}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400 text-sm">
                  {contact.call_meeting_type || "—"}
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400 text-sm">
                  {formatDate(contact.create_date)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {contacts.some((c) => c.call_summary || c.call_recording) ? (
        <details className="border-t border-slate-200 dark:border-slate-700">
          <summary className="px-4 py-2 text-sm text-slate-500 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/30">
            Show call summaries & recordings
          </summary>
          <div className="px-4 pb-4 space-y-3">
            {contacts
              .filter((c) => c.call_summary || c.call_recording)
              .map((contact) => (
                <div
                  key={contact.email}
                  className="text-sm p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
                >
                  <div className="font-medium text-slate-700 dark:text-slate-200 mb-1">
                    {contact.first_name} {contact.last_name}
                  </div>
                  {contact.call_summary && (
                    <p className="text-slate-600 dark:text-slate-400 mb-1">
                      {contact.call_summary}
                    </p>
                  )}
                  {contact.call_recording && (
                    <a
                      href={contact.call_recording}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Listen to recording
                    </a>
                  )}
                </div>
              ))}
          </div>
        </details>
      ) : null}
    </div>
  );
}
