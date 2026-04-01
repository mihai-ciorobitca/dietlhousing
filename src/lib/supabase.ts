import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder-key-for-build";

/**
 * Server-side Supabase client using service role key.
 * Required for tables with RLS – the service key bypasses RLS policies.
 * Never expose SUPABASE_SERVICE_ROLE_KEY to the client.
 */
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});

export type Contact = {
  id?: string;
  first_name: string;
  last_name: string;
  email: string;
  whatsapp_phone_number: string | null;
  phone_number: string | null;
  call_status: string | null;
  interested: string | null;
  call_summary: string | null;
  create_date: string | null;
  call_meeting_type: string | null;
  /** ISO 8601 UTC from Supabase timestamptz */
  call_date: string | null;
  call_recording: string | null;
  prefered_contact: string | null;
};
