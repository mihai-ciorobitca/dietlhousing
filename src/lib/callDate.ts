import { DateTime } from "luxon";

/** Build UTC ISO string from local date, time, and IANA timezone. */
export function partsToUtcIso(
  date: string,
  time: string,
  timeZone: string
): string | null {
  if (!date?.trim() || !time?.trim() || !timeZone) return null;
  const dt = DateTime.fromISO(`${date.trim()}T${time.trim()}`, {
    zone: timeZone,
  });
  if (!dt.isValid) return null;
  return dt.toUTC().toISO();
}

/** Split stored UTC ISO into date + time inputs for a given IANA zone. */
export function utcIsoToParts(
  iso: string | null | undefined,
  timeZone: string
): { date: string; time: string } {
  if (!iso?.trim()) return { date: "", time: "" };
  const dt = DateTime.fromISO(iso, { zone: "utc" }).setZone(timeZone);
  if (!dt.isValid) return { date: "", time: "" };
  return { date: dt.toFormat("yyyy-MM-dd"), time: dt.toFormat("HH:mm") };
}

/** Format for display in table cells (UTC instant shown with zone abbr). */
export function formatCallDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const dt = DateTime.fromISO(iso, { zone: "utc" });
  if (!dt.isValid) return "—";
  return dt.toFormat("MMM d, yyyy, HH:mm ZZZZ");
}
