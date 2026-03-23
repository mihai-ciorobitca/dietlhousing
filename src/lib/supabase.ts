import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Contact = {
  id?: string;
  first_name: string;
  last_name: string;
  email: string;
  whatsapp_phone_number: string | null;
  phone_number: string | null;
  call_status: string | null;
  interested: boolean | null;
  call_summary: string | null;
  create_date: string | null;
  meeting_type: string | null;
  call_recording: string | null;
};
