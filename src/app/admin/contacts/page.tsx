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
    const meetingType = typeof searchParams.meeting_type === "string" ? searchParams.meeting_type : "";

    let query = supabase.from("contacts").select("*").order("create_date", { ascending: false });

    if (search) {
      query = query.or(
        `email.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`
      );
    }
    if (callStatus) query = query.eq("call_status", callStatus);
    if (interested === "true") query = query.eq("interested", true);
    if (interested === "false") query = query.eq("interested", false);
    if (meetingType) query = query.eq("meeting_type", meetingType);

    const { data, error } = await query;

    if (error) {
      console.error("Supabase error:", error);
      return [];
    }

    return (data as Contact[]) || [];
  } catch {
    return [];
  }
}

async function getFilterOptions(): Promise<{
  callStatuses: string[];
  meetingTypes: string[];
}> {
  try {
    const { data } = await supabase
      .from("contacts")
      .select("call_status, meeting_type");

    const callStatuses = [
      ...new Set(
        (data || [])
          .map((r) => r.call_status)
          .filter((v): v is string => v != null && v !== "")
      ),
    ].sort();
    const meetingTypes = [
      ...new Set(
        (data || [])
          .map((r) => r.meeting_type)
          .filter((v): v is string => v != null && v !== "")
      ),
    ].sort();

    return { callStatuses, meetingTypes };
  } catch {
    return { callStatuses: [], meetingTypes: [] };
  }
}

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const [contacts, { callStatuses, meetingTypes }] = await Promise.all([
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
        interested={params.interested}
        meetingType={typeof params.meeting_type === "string" ? params.meeting_type : ""}
        callStatuses={callStatuses}
        meetingTypes={meetingTypes}
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
