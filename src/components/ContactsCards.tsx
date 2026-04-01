"use client";

import type { Contact } from "@/lib/supabase";
import { formatCallDate } from "@/lib/callDate";
import CallRecordingPlayer from "./CallRecordingPlayer";
import ContactScheduleFields from "./ContactScheduleFields";
import DeleteContactButton from "./DeleteContactButton";
import MeetingTypeSelect from "./MeetingTypeSelect";
import SendN8nButton from "./SendN8nButton";

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
              <span className="text-slate-500 dark:text-slate-400 min-w-[90px]">Preferred contact</span>
              {contact.prefered_contact ? (
                <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-800 dark:text-violet-300 capitalize">
                  {contact.prefered_contact}
                </span>
              ) : (
                <span className="text-slate-400">—</span>
              )}
            </div>
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
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
              <span className="text-slate-500 dark:text-slate-400 min-w-[90px] shrink-0">Meeting Type</span>
              <MeetingTypeSelect email={contact.email} value={contact.call_meeting_type} />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-slate-500 dark:text-slate-400 min-w-[90px]">call_date</span>
              <p className="text-xs text-slate-500 dark:text-slate-400">{formatCallDate(contact.call_date)}</p>
              <ContactScheduleFields contact={contact} compact />
            </div>
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
              <span className="text-slate-500 dark:text-slate-400 min-w-[90px] shrink-0">call_recording</span>
              {contact.call_recording ? (
                <CallRecordingPlayer
                  src={contact.call_recording}
                  title={`${contact.first_name} ${contact.last_name}`.trim() || contact.email}
                  buttonClassName="w-full sm:w-auto justify-center"
                />
              ) : (
                <span className="text-slate-400">—</span>
              )}
            </div>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-3">
            {formatDate(contact.create_date)}
          </p>
          {contact.call_summary && (
            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                {contact.call_summary}
              </p>
            </div>
          )}
          <div className="mt-4 flex flex-col sm:flex-row sm:justify-end gap-2 border-t border-slate-200 dark:border-slate-700 pt-4">
            <SendN8nButton contact={contact} className="w-full sm:w-auto justify-center" />
            <DeleteContactButton
              email={contact.email}
              label={`${contact.first_name} ${contact.last_name}`.trim() || contact.email}
              className="w-full sm:w-auto"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
