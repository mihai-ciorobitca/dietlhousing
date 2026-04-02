import { DateTime } from "luxon";

/** Booking uses Europe/London; DB stores that wall clock as `timestamp without time zone` (YYYY-MM-DD HH:mm:ss). */
export const LONDON_TIMEZONE = "Europe/London" as const;

/** Parse DB or API string into a DateTime in Europe/London (handles legacy UTC ISO rows). */
function parseStoredCallDate(raw: string): DateTime | null {
  const s = raw.trim();
  const hasOffset = /([zZ]|[+-]\d{2}:?\d{2})$/.test(s.replace(/\.\d+/, ""));
  if (hasOffset) {
    const dt = DateTime.fromISO(s, { setZone: true });
    if (!dt.isValid) return null;
    return dt.setZone(LONDON_TIMEZONE);
  }
  const normalized = s.replace("T", " ").replace(/\.\d+/, "").slice(0, 19);
  const sql = DateTime.fromFormat(normalized, "yyyy-MM-dd HH:mm:ss", {
    zone: LONDON_TIMEZONE,
  });
  if (sql.isValid) return sql;
  return null;
}

/** London local date + time from booking inputs → value saved in Supabase (London wall clock, no UTC). */
export function partsToLondonSqlTimestamp(
  date: string,
  time: string,
  timeZone: string
): string | null {
  if (!date?.trim() || !time?.trim() || !timeZone) return null;
  const dt = DateTime.fromISO(`${date.trim()}T${time.trim()}`, {
    zone: timeZone,
  });
  if (!dt.isValid) return null;
  return dt.setZone(timeZone).toFormat("yyyy-MM-dd HH:mm:ss");
}

/** Normalize any supported call_date input to canonical London SQL storage. */
export function normalizeCallDateForStorage(input: string): string | null {
  const dt = parseStoredCallDate(input);
  if (!dt) return null;
  return dt.toFormat("yyyy-MM-dd HH:mm:ss");
}

/** Date + time inputs for forms (London). Supports legacy timestamptz/ISO rows. */
export function storedCallDateToParts(
  raw: string | null | undefined,
  timeZone: string
): { date: string; time: string } {
  if (!raw?.trim()) return { date: "", time: "" };
  const dt = parseStoredCallDate(raw);
  if (!dt) return { date: "", time: "" };
  const local = dt.setZone(timeZone);
  return { date: local.toFormat("yyyy-MM-dd"), time: local.toFormat("HH:mm") };
}

/** Table / summary display (London zone label). */
export function formatCallDateLondon(raw: string | null | undefined): string {
  if (!raw) return "—";
  const dt = parseStoredCallDate(raw);
  if (!dt) return "—";
  return dt.toFormat("MMM d, yyyy, HH:mm ZZZZ");
}

/** n8n payload: London-offset ISO + same instant as UTC ISO. */
export function n8nCallDateFieldsFromStored(stored: string): {
  call_date: string;
  call_date_utc: string;
} | null {
  const dt = parseStoredCallDate(stored);
  if (!dt) return null;
  const londonIso = dt.toISO();
  const utcIso = dt.toUTC().toISO();
  if (!londonIso || !utcIso) return null;
  return { call_date: londonIso, call_date_utc: utcIso };
}

/** @deprecated Prefer partsToLondonSqlTimestamp — kept for any external callers expecting UTC ISO. */
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

/** @deprecated Use storedCallDateToParts */
export function utcIsoToParts(
  iso: string | null | undefined,
  timeZone: string
): { date: string; time: string } {
  return storedCallDateToParts(iso, timeZone);
}

/** Format stored value in UTC (rare; legacy display). */
export function formatCallDate(raw: string | null | undefined): string {
  if (!raw) return "—";
  const dt = parseStoredCallDate(raw);
  if (!dt) return "—";
  return dt.toUTC().toFormat("MMM d, yyyy, HH:mm ZZZZ");
}
