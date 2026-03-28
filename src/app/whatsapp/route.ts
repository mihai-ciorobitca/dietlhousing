import { redirect } from "next/navigation";

const WHATSAPP_URL = "https://wa.me/491747445334";

export async function GET() {
  redirect(WHATSAPP_URL);
}
