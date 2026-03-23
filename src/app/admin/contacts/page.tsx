import { supabase, type Contact } from "@/lib/supabase";
import ContactsTable from "@/components/ContactsTable";
import ContactsCards from "@/components/ContactsCards";
import SearchFilters from "@/components/SearchFilters";
import { Suspense } from "react";

type SearchParams = Record<string, string | string[] | undefined>;

async function getContacts(searchParams: SearchParams): Promise<Contact[]> {
  try {
    const search = typeof searchParams.search === "string" ? searchParams.search.trim() : "";
    const callStatus = typeof searchParams.call_status === "string" ? searchParams.call_status : "";
    const interested = searchParams.interested;
    const meetingType = typeof searchParams.call_meeting_type === "string" ? searchParams.call_meeting_type : "";

    let query = supabase.from("Contacts").select("*").order("create_date", { ascending: false });

    if (search) {
      query = query.or(
        `email.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`
      );
    }
    if (callStatus) query = query.eq("call_status", callStatus);
    if (interested) query = query.eq("interested", interested);
    if (meetingType) query = query.eq("call_meeting_type", meetingType);

    const { data, error } = await query;

    if (error) {
      console.error("Supabase error:", {
        message: (error as { message?: string }).message,
        code: (error as { code?: string }).code,
        details: (error as { details?: string }).details,
        hint: (error as { hint?: string }).hint,
      });
      return [];
    }

    return (data as Contact[]) || [];
  } catch (e) {
    console.error("getContacts failed:", e instanceof Error ? e.message : e);
    return [];
  }
}

const CALL_STATUS_OPTIONS = ["BOOKED", "CALL_LATER", "NOT_ANSWERED", "NOT_INTERESTED", "WRONG_PERSON"] as const;
const MEETING_TYPE_OPTIONS = ["meeting", "whatsapp"] as const;
const INTERESTED_OPTIONS = ["BOOKED", "CALL_LATER", "COULD_NOT_CALL", "NOT_ANSWERED", "NOT_INTERESTED", "WRONG_PERSON"] as const;

async function getFilterOptions(): Promise<{
  callStatuses: string[];
  meetingTypes: string[];
  interestedOptions: string[];
}> {
  try {
    const { data } = await supabase
      .from("Contacts")
      .select("call_status, call_meeting_type, interested");

    const dbCallStatuses = [...new Set(
      (data || []).map((r) => r.call_status).filter((v): v is string => v != null && v !== "")
    )];
    const dbMeetingTypes = [...new Set(
      (data || []).map((r) => r.call_meeting_type).filter((v): v is string => v != null && v !== "")
    )];
    const dbInterested = [...new Set(
      (data || [])
        .map((r) => (typeof r.interested === "string" ? r.interested : null))
        .filter((v): v is string => v != null && v !== "")
    )];

    const callStatuses = [...new Set([...CALL_STATUS_OPTIONS, ...dbCallStatuses])];
    const meetingTypes = [...new Set([...MEETING_TYPE_OPTIONS, ...dbMeetingTypes])];
    const interestedOptions = [...new Set([...INTERESTED_OPTIONS, ...dbInterested])];

    return { callStatuses, meetingTypes, interestedOptions };
  } catch (e) {
    console.error("getFilterOptions failed:", e instanceof Error ? e.message : e);
    return { callStatuses: [...CALL_STATUS_OPTIONS], meetingTypes: [...MEETING_TYPE_OPTIONS], interestedOptions: [...INTERESTED_OPTIONS] };
  }
}

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const [contacts, { callStatuses, meetingTypes, interestedOptions }] = await Promise.all([
    getContacts(params),
    getFilterOptions(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          Contacts
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          {contacts.length} contact{contacts.length !== 1 ? "s" : ""} found
        </p>
      </div>

      <Suspense fallback={<div className="h-24 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />}>
        <SearchFilters
        search={typeof params.search === "string" ? params.search : ""}
        callStatus={typeof params.call_status === "string" ? params.call_status : ""}
        interested={typeof params.interested === "string" ? params.interested : ""}
        meetingType={typeof params.call_meeting_type === "string" ? params.call_meeting_type : ""}
        callStatuses={callStatuses}
        meetingTypes={meetingTypes}
        interestedOptions={interestedOptions}
      />
      </Suspense>

      <Suspense fallback={<ContactsLoading />}>
        <div className="hidden md:block">
          <ContactsTable contacts={contacts} />
        </div>
        <div className="md:hidden">
          <ContactsCards contacts={contacts} />
        </div>
      </Suspense>
    </div>
  );
}

function ContactsLoading() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded" />
      <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded" />
    </div>
  );
}
