import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { n8nCallDateFieldsFromStored, normalizeCallDateForStorage } from "@/lib/callDate";
import { supabase } from "@/lib/supabase";

/**
 * Saves meeting_type + call_date (London wall clock), then POSTs to n8n (same payload as /api/contacts/n8n-webhook).
 */
export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  if (!webhookUrl?.trim()) {
    return NextResponse.json(
      { error: "N8N_WEBHOOK_URL is not configured on the server" },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const meeting_type =
      typeof body.meeting_type === "string" && body.meeting_type.trim() !== ""
        ? body.meeting_type.trim()
        : null;
    const call_date_raw =
      typeof body.call_date === "string" && body.call_date.trim() !== ""
        ? body.call_date.trim()
        : null;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    if (!meeting_type) {
      return NextResponse.json({ error: "Meeting type is required" }, { status: 400 });
    }
    if (!call_date_raw) {
      return NextResponse.json({ error: "Call date is required" }, { status: 400 });
    }

    const call_date = normalizeCallDateForStorage(call_date_raw);
    if (!call_date) {
      return NextResponse.json({ error: "Invalid call_date" }, { status: 400 });
    }

    const { data: row, error: fetchError } = await supabase
      .from("Contacts")
      .select(
        "email, first_name, last_name, whatsapp_number, phone_number, meeting_type, call_date"
      )
      .eq("email", email)
      .maybeSingle();

    if (fetchError || !row) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    const whatsapp =
      typeof row.whatsapp_number === "string" && row.whatsapp_number.trim() !== ""
        ? row.whatsapp_number.trim()
        : null;

    if (!whatsapp) {
      return NextResponse.json(
        { error: "WhatsApp number is missing for this contact" },
        { status: 400 }
      );
    }

    const { error: updateError } = await supabase
      .from("Contacts")
      .update({ meeting_type, call_date })
      .eq("email", email);

    if (updateError) {
      console.error("Booking update:", updateError);
      return NextResponse.json(
        { error: updateError.message || "Failed to save booking" },
        { status: 500 }
      );
    }

    const callDateFields = n8nCallDateFieldsFromStored(call_date);
    if (!callDateFields) {
      return NextResponse.json({ error: "Invalid call_date" }, { status: 400 });
    }

    const payload = {
      whatsapp_number: whatsapp,
      email: row.email,
      first_name: row.first_name,
      last_name: row.last_name,
      phone_number: row.phone_number,
      meeting_type,
      call_date: callDateFields.call_date,
      call_date_utc: callDateFields.call_date_utc,
      call_date_timezone: "Europe/London",
    };

    const res = await fetch(webhookUrl.trim(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("n8n webhook error:", res.status, text);
      return NextResponse.json(
        {
          error: `Booking saved but n8n webhook failed (${res.status}). You can retry from the dashboard.`,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Booking:", e);
    return NextResponse.json({ error: "Request failed" }, { status: 500 });
  }
}
