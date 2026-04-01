import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

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
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const { data: row, error: fetchError } = await supabase
      .from("Contacts")
      .select(
        "email, first_name, last_name, whatsapp_phone_number, phone_number, call_meeting_type, call_date"
      )
      .eq("email", email)
      .maybeSingle();

    if (fetchError || !row) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    const whatsapp =
      typeof row.whatsapp_phone_number === "string" && row.whatsapp_phone_number.trim() !== ""
        ? row.whatsapp_phone_number.trim()
        : null;

    if (!whatsapp) {
      return NextResponse.json(
        { error: "WhatsApp number is missing for this contact" },
        { status: 400 }
      );
    }

    if (
      row.call_meeting_type == null ||
      String(row.call_meeting_type).trim() === ""
    ) {
      return NextResponse.json(
        { error: "Meeting type (call_meeting_type) must be set before sending" },
        { status: 400 }
      );
    }

    if (row.call_date == null || String(row.call_date).trim() === "") {
      return NextResponse.json(
        { error: "Call date must be set before sending" },
        { status: 400 }
      );
    }

    const payload = {
      whatsapp_phone_number: whatsapp,
      email: row.email,
      first_name: row.first_name,
      last_name: row.last_name,
      phone_number: row.phone_number,
      call_meeting_type: row.call_meeting_type,
      call_date: row.call_date,
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
        { error: `n8n webhook failed (${res.status})` },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("n8n webhook:", e);
    return NextResponse.json({ error: "Request failed" }, { status: 500 });
  }
}
