import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { normalizeCallDateForStorage } from "@/lib/callDate";
import { supabase } from "@/lib/supabase";

export async function PATCH(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim() : "";
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const patch: Record<string, string | null> = {};

    if ("call_date" in body) {
      const v = body.call_date;
      if (v === null || v === "") {
        patch.call_date = null;
      } else if (typeof v === "string") {
        const normalized = normalizeCallDateForStorage(v);
        if (!normalized) {
          return NextResponse.json({ error: "Invalid call_date" }, { status: 400 });
        }
        patch.call_date = normalized;
      } else {
        return NextResponse.json({ error: "Invalid call_date" }, { status: 400 });
      }
    }

    if ("meeting_type" in body) {
      const v = body.meeting_type;
      if (v === null || v === "") {
        patch.meeting_type = null;
      } else if (typeof v === "string") {
        patch.meeting_type = v.trim();
      } else {
        return NextResponse.json({ error: "Invalid meeting_type" }, { status: 400 });
      }
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const { error } = await supabase.from("Contacts").update(patch).eq("email", email);

    if (error) {
      console.error("Update contact:", error);
      return NextResponse.json(
        { error: error.message || "Failed to update contact" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
