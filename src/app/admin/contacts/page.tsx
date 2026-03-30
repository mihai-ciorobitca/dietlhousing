import { supabase, type Contact } from "@/lib/supabase";
import ContactsTable from "@/components/ContactsTable";
import ContactsCards from "@/components/ContactsCards";
import SearchFilters from "@/components/SearchFilters";
import { Suspense } from "react";

type SearchParams = Record<string, string | string[] | undefined>;

const SEARCH_BY_VALUES = ["email", "name", "phone"] as const;
type SearchBy = (typeof SEARCH_BY_VALUES)[number];

function parseSearchBy(raw: string | undefined): SearchBy {
  if (raw && (SEARCH_BY_VALUES as readonly string[]).includes(raw)) {
    return raw as SearchBy;
  }
  return "email";
}

async function getContacts(searchParams: SearchParams): Promise<Contact[]> {
  try {
    const search = typeof searchParams.search === "string" ? searchParams.search.trim() : "";
    const searchBy = parseSearchBy(
      typeof searchParams.search_by === "string" ? searchParams.search_by : undefined
    );
    const callStatus = typeof searchParams.call_status === "string" ? searchParams.call_status : "";
    const interested = searchParams.interested;
    const meetingType = typeof searchParams.call_meeting_type === "string" ? searchParams.call_meeting_type : "";
    const preferedContact =
      typeof searchParams.prefered_contact === "string" ? searchParams.prefered_contact : "";

    let query = supabase.from("Contacts").select("*").order("create_date", { ascending: false });

    if (search) {
      if (searchBy === "email") {
        query = query.ilike("email", `%${search}%`);
      } else if (searchBy === "name") {
        query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%`);
      } else {
        query = query.or(`whatsapp_phone_number.ilike.%${search}%,phone_number.ilike.%${search}%`);
      }
    }
    if (callStatus) query = query.eq("call_status", callStatus);
    if (interested) query = query.eq("interested", interested);
    if (meetingType) query = query.eq("call_meeting_type", meetingType);
    if (preferedContact) query = query.eq("prefered_contact", preferedContact);

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
const PREFERRED_CONTACT_OPTIONS = ["email", "phone", "whatsapp"] as const;

async function getFilterOptions(): Promise<{
  callStatuses: string[];
  meetingTypes: string[];
  interestedOptions: string[];
  preferedContactOptions: string[];
}> {
  try {
    const { data } = await supabase
      .from("Contacts")
      .select("call_status, call_meeting_type, interested, prefered_contact");

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
    const dbPrefered = [...new Set(
      (data || [])
        .map((r) => (typeof r.prefered_contact === "string" ? r.prefered_contact : null))
        .filter((v): v is string => v != null && v !== "")
    )];
    const preferedContactOptions = [...new Set([...PREFERRED_CONTACT_OPTIONS, ...dbPrefered])];

    return { callStatuses, meetingTypes, interestedOptions, preferedContactOptions };
  } catch (e) {
    console.error("getFilterOptions failed:", e instanceof Error ? e.message : e);
    return {
      callStatuses: [...CALL_STATUS_OPTIONS],
      meetingTypes: [...MEETING_TYPE_OPTIONS],
      interestedOptions: [...INTERESTED_OPTIONS],
      preferedContactOptions: [...PREFERRED_CONTACT_OPTIONS],
    };
  }
}

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const [contacts, { callStatuses, meetingTypes, interestedOptions, preferedContactOptions }] = await Promise.all([
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
        searchBy={parseSearchBy(
          typeof params.search_by === "string" ? params.search_by : undefined
        )}
        callStatus={typeof params.call_status === "string" ? params.call_status : ""}
        interested={typeof params.interested === "string" ? params.interested : ""}
        meetingType={typeof params.call_meeting_type === "string" ? params.call_meeting_type : ""}
        preferedContact={typeof params.prefered_contact === "string" ? params.prefered_contact : ""}
        callStatuses={callStatuses}
        meetingTypes={meetingTypes}
        interestedOptions={interestedOptions}
        preferedContactOptions={preferedContactOptions}
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
